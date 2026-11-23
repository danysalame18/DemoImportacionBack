const { SendMailAttService } = require('../services')

module.exports = { 
    create: async (req, res)=>{
        const { body } = req
        try{
        SendMailAttService.Mail(body.email, body.subject, body.fileName, body.att, body.text)
        res.status(200).json({message: 'Se realizo el envio'})
         } catch (error) {
            res.status(400).json(error)
        }
    }
}
