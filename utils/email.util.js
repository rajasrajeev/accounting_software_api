const nodemailer = require('nodemailer');
const pug = require('pug');
const { convert } = require('html-to-text');

const { 
    EMAIL_HOST,
    EMAIL_PORT,
    EMAIL_HOST_USER,
    EMAIL_PASS
} = require('../config/index');


class Email {
    #name;
    #to;
    #from;
    #password;
    #url;

    constructor(user, password, url) {
        this.#name = user.name;
        this.#to = user.username;
        this.#password = password;
        this.#url = url;
        this.#from = EMAIL_HOST_USER;
    }

    #newTransport (){
        return nodemailer.createTransport({
            host: EMAIL_HOST,
            port: EMAIL_PORT,
            auth: {
                user:EMAIL_HOST_USER,
                pass: EMAIL_PASS,
            },
        });
    }

    #send = async (template, subject) => {
        const html = pug.renderFile(`${__dirname}/../views/${template}.pug`, {
            name: this.#name,
            subject,
            email: this.#to,
            password: this.#password,
            url: this.#url
        });
          // Create mailOptions
        const mailOptions = {
            from: this.#from,
            to: this.#to,
            subject,
            text: convert(html),
            html,
        };
      
        const info = await this.#newTransport().sendMail(mailOptions);
        console.log(nodemailer.getTestMessageUrl(info));
    }

    async sendCreds() {
        await this.#send('creds', 'Your authentication credential for Accounting');
    }

    async sendVerificationCode() {
        await this.#send('verificationCode', 'Your account verification code');
    }
    
    async sendPasswordResetToken() {
        await this.#send(
          'resetPassword',
          'Your password reset token (valid for only 10 minutes)'
        );
    }

}

module.exports = {Email};