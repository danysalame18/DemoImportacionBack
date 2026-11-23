const sgMail = require('@sendgrid/mail')

module.exports = { 
  Mail : (receiver, subject, text) =>{
sgMail.setApiKey(process.env.MAIL_API_KEY)
const msg = {
  to: receiver, 
  from: 'demoImportacion@lynqro.com', 
  subject: subject,
  text: text,
  html: text,
}
sgMail.send(msg)
      .then(()=>{
        console.log('Email sent')
      })
      .catch((error)=>{
        console.log(error)
      })
}}
