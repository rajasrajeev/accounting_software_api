const { Strategy, ExtractJwt } = require('passport-jwt');
const { PrismaClient } = require('@prisma/client');
const { SECRET } = require('../config/index');

const prisma = new PrismaClient();

const optns = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: SECRET
}

module.exports = passport => {
    passport.use(
        new Strategy(optns, async(payload, done) => {
            /* if(payload.role == "VENDOR") {
                prisma.user.findFirst({
                    where: {
                        id: payload.user_id
                    }, 
                    include: {
                        vendor: true
                    }
                })
                .then(user => {
                    if (user) {
                        return done(null, user);
                    }
                    return done(null, false);
                }).catch(err => {
                    console.log(err)
                    return done(null, false);
                });
            } else {
                prisma.user.findFirst({
                    where: {
                        id: payload.user_id
                    }
                })
                .then(user => {
                    if (user) {
                        return done(null, user);
                    }
                    return done(null, false);
                }).catch(err => {
                    return done(null, false);
                });
            } */
                prisma.user.findFirst({
                    where: {
                        id: payload.user_id
                    }, 
                    include: {
                        vendor: true,
                        contractor: true, backend: true, warehouse: true
                    }
                })
                .then(user => {
                    if (user) {
                        return done(null, user);
                    }
                    return done(null, false);
                }).catch(err => {
                    console.log(err)
                    return done(null, false);
                });
        })
    );
};