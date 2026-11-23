const { SendMailAttDobleService } = require('../services')

module.exports = { 
    create: async (req, res)=>{
        const { body } = req
        try{
        SendMailAttDobleService.Mail(body.email, body.subject, body.fileName, body.fileName2, body.att, body.att2, body.text)
        res.status(200).json({message: 'Se realizo el envio'})
         } catch (error) {
            res.status(400).json(error)
        }
    }
}
