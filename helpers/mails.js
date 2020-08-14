const fs = require('fs'),
    path = require('path'),
    Handlebars = require('handlebars'),
    elasticemail = require('elasticemail');

const options = (source, email, locals, $subject) => {
  const template = Handlebars.compile(source);
  return {
    from: process.env.EMAIL,
    from_name: "Narrately",
    to: email,
    subject: $subject,
    body_html: template(locals) 
  };
};

const client = elasticemail.createClient({
  username: process.env.MAIL_USERNAME,
  apiKey: process.env.MAIL_API_KEY
});

const sendMail = (options) => new Promise(function(resolve, reject) {
  client.mailer.send(options, function(err, result) {
    if (err) reject(err);
    else resolve(result);
  });
})

exports.welcome = (user) => {
  let source = fs.readFileSync(path.join(__dirname, '../mails/welcome.hbs'), 'utf8');
  let locals = {
    activationToken: user.activationToken,
    base_url: process.env.FRONT_END_URL,
    user: user
  };
  $subject = "Welcome to Narrately";
  return sendMail(options(source, user.email, locals, $subject));
}

exports.resetPassword = (user) => {
  let source = fs.readFileSync(path.join(__dirname, '../mails/password-reset.hbs'), 'utf8');
  let locals = {
    passwordResetToken: user.passwordResetToken,
    base_url: process.env.FRONT_END_URL,
    user: user
  };
  $subject = "Password Reset Request";
  return sendMail(options(source, user.email, locals, $subject));
}