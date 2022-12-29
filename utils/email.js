const nodemailer = require('nodemailer')
const pug = require('pug')
const htmlToText = require('html-to-text')

module.exports = class Email {
  constructor(user , url){
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url
    this.from = `Hussien Elsanose <${process.env.EMAIL_FROM}>`;
  }

  newTransport(){
    if (process.env.NODE_ENV ==='production') {
      // return nodemailer.createTransport({
      //   service : 'SendGrid',
      //   auth: {
      //     user: process.env.SENDGRID_USERNAME,
      //     pass: process.env.EMAIL_KEY
      //   }
      // });
      return nodemailer.createTransport({
        host: "smtp.sendgrid.net",
        port: parseInt(587, 10),
        requiresAuth: true,
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.EMAIL_KEY
        }
      });
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  async send (template , subject) {
    // Render HTML based on pug template
    const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`,{
      firstName : this.firstName,
      url : this.url,
      subject
    });

    // Define Email Options
    const mailOptions = {
      from : this.from,
      to : this.to,
      subject : subject,
      html,
      text : htmlToText.convert(html)
    }

    // create transporter
    await this.newTransport().sendMail(mailOptions)
  }
  

  async sendWelcome(){
    await this.send('welcome' , 'Welcome To Natours Family')
  }

  async sendPasswordReset(){
    this.send('passwordReset' , 'Reset Your Password (this link vaild for only 10 min')
  }
}


// const sendEmail = async options =>{
//     // 1) Create Transporter
//     const transporter = nodemailer.createTransport({
//         host: process.env.EMAIL_HOST,
//         port: process.env.EMAIL_PORT,
//         auth: {
//           user: process.env.EMAIL_USERNAME,
//           pass: process.env.EMAIL_PASSWORD
//         }
//       });

//     // 2) Define the email options

//     const mailOptions = {
//         from : "Hussien Elsanose <natours@natours.com>",
//         to : options.email,
//         subject : options.subject,
//         text : options.message,
//         // html : 
//     }

//     // 3) Finally send the mail
//     await transporter.sendMail(mailOptions)
// }

// module.exports = sendEmail