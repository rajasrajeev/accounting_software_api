require("dotenv").config();


module.exports = {
    SECRET: process.env.APP_SECRET,
    PORT: process.env.APP_PORT,
    BASE_URL: process.env.BASE_URL,
    EMAIL_HOST: process.env.EMAIL_HOST,
    EMAIL_USE_TLS: process.env.EMAIL_USE_TLS,
    EMAIL_USE_SSL: process.env.EMAIL_USE_SSL,
    EMAIL_PORT: process.env.EMAIL_PORT,
    EMAIL_HOST_USER: process.env.EMAIL_HOST_USER,
    EMAIL_PASS: process.env.EMAIL_HOST_PASSWORD,
    ORIGIN_URL: process.env.ORIGIN_URL,
    WHITELIST: process.env.WHITELIST
}