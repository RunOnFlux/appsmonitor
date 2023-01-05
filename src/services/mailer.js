const config = require('config');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: true,
  auth: {
    user: config.email.email,
    pass: config.email.password,
    // type: 'OAuth2',
    // user: config.email.email,
    // serviceClient: config.email.client,
    // privateKey: config.email.key,
  },
});

const mailOptions = {
  from: {
    name: config.email.from,
    address: config.email.email,
  },
  to: 'tadeas@runonflux.io',
  cc: [],
  subject: 'TEST APPS down',
  text: 'Hello',
};

function start() {
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log(`Email sent: ${info.response}`);
    }
  });
}

module.exports = {
  start,
};
