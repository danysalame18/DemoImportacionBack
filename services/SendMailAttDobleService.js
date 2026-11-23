const sgMail = require('@sendgrid/mail')

module.exports = { 
  Mail : (receiver, subject, fileName, fileName2, att, att2, text) =>{
sgMail.setApiKey(process.env.MAIL_API_KEY)
const msg = {
  to: receiver, 
  from: 'demoImportacion@lynqro.com', 
  subject: subject,
  text: text,
  html: text,
  attachments: [
    {
      content: att,
      filename: fileName,
      type: "application/pdf",
      disposition: "attachment"
    },
    {
      content: att2,
      filename: fileName2,
      type: "application/pdf",
      disposition: "attachment"
    },
  ],
}
sgMail.send(msg)
      .then(()=>{
        console.log('Email sent')
      })
      .catch((error)=>{
        console.log(error)
      })
}}
