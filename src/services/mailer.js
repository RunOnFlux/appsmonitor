const config = require('config');
const nodemailer = require('nodemailer');
const log = require('../lib/log');

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
  cc: [],
  to: '',
  subject: '',
  text: '',
};

async function sendMail(recipient, subject, text) {
  try {
    mailOptions.to = 'tadeas@runonflux.io'; // recipient;
    mailOptions.subject = subject;
    mailOptions.text = text;

    const response = await transporter.sendMail(mailOptions);
    log.info(`Email to ${recipient} about ${subject} sent.`);
    return response;
  } catch (error) {
    log.error(error);
    return null;
  }
}

module.exports = {
  sendMail,
};
