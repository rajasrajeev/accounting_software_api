const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { SECRET } = require("../config/index");
const { Email } = require('../utils/email.util');
const { prisma } = require("../utils/prisma");


const alreadyExistingEmail = async (email) => {
    const user = await prisma.user.findFirst({
        where: {
            username: email
        }
    });
    return user ? true : false;
}

const alreadyExistingPhone = async (phone, role) => {
    return false;
}

const generatePasswordHash = async (password) => {
    const salt = await bcrypt.genSaltSync(12);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
}


const generateToken = (user) => {
    const token = jwt.sign({
        user_id: user.id,
        email: user.username,
        role: user.role
    }, SECRET, {expiresIn: "7 days"});

    const result = {
        role: user.role,
        token: token,
        expiresIn: 168
    } 

    return result;
}


const signin = async (username, password) => {
    const user = await prisma.user.findFirst({
        where: {
            username: username
        },
        include: { Role: true }
    });
    console.log(user);

    if (!user) throw ({status: 400, message: "Invalid user credentials!!"});
    if(!user.verified) throw ({status: 400, message: "Email not verified"});
    const isMatch = await bcrypt.compare(password, user.password);

    let userData = {
        permissions: [],
        menu: []
    };
    if(isMatch) {
        const data = generateToken(user);
        return {
            success: true,
            token: data,
            user: {
                id: user.id,
                username: user.username,
                role: user.Role.title
            },
            data: userData
        };
    } else {
        throw ({status: 400, message: "Invalid user credentials"});
    } 
}


const signup = async (body, files) => {
    const { password, role} = body;

    const emailExists = await alreadyExistingEmail(body.email);
    if(emailExists) {
        throw ({status: 400, message: "User with same email id already exists!"});
    }

    const phoneExists = await alreadyExistingPhone(body.phone, role);
    if(phoneExists) {
        throw ({status: 400, message: "User with same mobile number already exists!"});
    }
    
    const hashedPassword = await generatePasswordHash(password);

    const user = await prisma.user.create({
        data: {
            username: body.email,
            password: hashedPassword,
            role: role,
            last_logged_in: null,
            verified: false
        },
    });

    if (user) {
        const profile = await createProfile(body, user.id, files);

        if (profile) {
           return {
            'name': profile.name,
            'username': profile.email,
            'id': profile.id
           };
        } else {
            throw ({status: 400, message: "Can't create profile, please check provided informations"});
        }

    } else {
        throw ({status: 400, message: "Can't signup, please check provided informations"});
    }
}


const createProfile = async (body, userId, files) => {
    const {role} = body;
    return body;
}


const verificationUpdate = async (id) => {
    try {
      const user = await prisma.user.update({
          where: {
              id: id
          },
          data: {
              verified: true,
              verification_code: null
          }
      });
      return user;

    } catch(err) {
        throw ({status: 403, message: "Cannot verify email!"});
    }
}


const forgotPassword = async (email) => {
    const user = await prisma.user.findFirst({
        where: {
            username: email
        },
        include: { Role: true }
    });

    if (!user)
        throw ({ status: 404, message: "No user found with given email" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const passwordResetToken = crypto
        .createHash('sha256')
        .update(otp)
        .digest('hex');

    await prisma.user.update({
        where: {
            id: user.id
        },
        data: {
            passwordResetToken: passwordResetToken,
            passwordResetAt: new Date(Date.now() + 10 * 60 * 1000)
        }
    });

    try {
        await new Email(user, '', otp).sendPasswordResetToken();

    } catch (err) {
        console.log(err);
        await prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                passwordResetToken: null,
                passwordResetAt: null
            }
        });
        throw ({ status: 403, message: "Cannot send email!" });
    }

    return user;
};

const verifyOtp = async(email, otp) => {
    const passwordResetToken = crypto
    .createHash("sha256")
    .update(otp)
    .digest("hex");

  const user = await prisma.user.findFirst({
    where: {
        username: email,
        passwordResetToken: passwordResetToken,
        passwordResetAt: {
            gt: new Date(),
        },
    }, 
    select: {
        id: true,
        username: true
    },
  });

  if (!user)
    throw ({ status: 400, message: "Invalid token or token has expired" });

  return user
}

const resetPassword = async(body) => {
    try {
        const passwordResetToken = crypto
        .createHash("sha256")
        .update(body.otp)
        .digest("hex");

        const user = await prisma.user.findFirst({
            where: {
                id: body.id,
                passwordResetToken: passwordResetToken,
            }
        });

        if(!user) throw({status: 500, message: "cannot find user"});

        const hashedPassword = await generatePasswordHash(body.password);
    
        const updated = await prisma.user.update({
          where: {
            id: body.id,
            
          },
          data: {
            password: hashedPassword,
            passwordResetToken: null,
            passwordResetAt: null,
          },
        });
      
        return updated;
    } catch (err) {
        throw({status: 500, message: "Something went wrong!"});
    }

}

module.exports = {
    signin,
    signup,
    verificationUpdate,
    forgotPassword,
    verifyOtp,
    resetPassword,
    generatePasswordHash
}