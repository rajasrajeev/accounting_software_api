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
    if(role === 'VENDOR') {
        const user = await prisma.vendor.findFirst({
            where: {
                phone: phone
            }
        });
        return user ? true : false;
    } else if(role === 'CONTRACTOR') {
        const user = await prisma.contractor.findFirst({
            where: {
                phone: phone
            }
        });
        return user ? true : false;
    }
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

    if (!user) throw ({status: 400, message: "Invalid user credentials!!"});
    if(!user.verified) throw ({status: 400, message: "Email not verified"});
    const isMatch = await bcrypt.compare(password, user.password);

    let userData = {};
    if(isMatch) {
        const data = generateToken(user);
        return {
            token: data,
            user: {
                id: user.id,
                username: user.username,
                role: user.role.title
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
    if (role === 'VENDOR') {
        const user = await prisma.vendor.create({
            data: {
                company_name: body.company_name,
                phone: body.phone,
                email: body.email,
                pin: body.pin,
                address: body.address,
                pan: files.pan[0].path,
                gst: files.gst[0].path,
                licence: files.license[0].path,
                pan_no: body.pan_no,
                gst_no: body.gst_no,
                licence_no: body.license_no,
                city: body.city,
                status: "Pending",
                vendor_id: "VDR"+(1000+userId),
                user: {
                    connect: { id: userId }
                },
                district: {
                    connect: { id: parseInt(body.districtId, 10) }
                },
                state: {
                    connect: { id: parseInt(body.stateId, 10) }
                }
            },
        });
        return user;

    } else if (role === 'CONTRACTOR') {
        const contractor = await prisma.contractor.create({
            data: {
                user: {
                    connect: { id: userId }
                },
                name: body.name,
                company_name: body.company_name,
                status: "Pending",
                phone: body.phone,
                email: body.email,
                licence: files.license[0].path,
                contractor_id: "CTR"+(1000+userId),
                license_no: body.license_no,

            },
        });
        return contractor;

    } else if (role === 'WAREHOUSE') {
        const warehouse = await prisma.warehouse.create({
            data: {
                user: {
                    connect: { id: userId } // Connect to an existing user with ID 7
                    // or if you need to create a new user
                    // create: { /* user data here */ }
                },
                name: body.name,
                location: body.location,
                incharge_name: body.incharge_name
            },
        });
        return warehouse;

    } else {

        throw({status: 400, message: "Cannot create user"})
    }
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
        include: { vendor: true, contractor: true, warehouse: true, backend: true }
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
        if(user.role === 'BACKEND') {
            user.name = user.backend.name || 'Admin'
        } else if(user.role === 'VENDOR') {
            user.name = user.vendor.company_name
        } else if(user.role === 'CONTRACTOR') {
            user.name = user.contractor.name;
        } else {
            user.name = user.wareshouse.name;
        }
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