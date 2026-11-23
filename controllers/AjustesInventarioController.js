const { AjustesInventario } = require('../models')

module.exports = { 
    findAll: (req, res)=>{
        AjustesInventario.find()
        .populate('areas')
        .populate('user')
        .populate('clientes')
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOne: (req, res)=>{
        const { id } = req.params
        AjustesInventario.findById(id)
        .populate('areas')
        .populate('user')
        .populate('clientes')
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    create: (req, res)=>{
        const { body } = req
        const newAjuste = new AjustesInventario(body)
        const traspaso = newAjuste.save()
            .then((respDB)=> res.status(201).json(respDB))
            .catch((err)=> console.log(err))
    },
    // Cancela un ajuste SOLO si aun no fue autorizado (validado).
    // Un ajuste no autorizado nunca toco el inventario (eso pasa en
    // ArticulosAjustesInvController.autorizado), asi que no hay nada que revertir.
    cancel: async (req, res)=>{
        const { id } = req.params
        try {
            const ajuste = await AjustesInventario.findById(id)
            if (!ajuste) {
                return res.status(404).json({ message: "Ajuste no encontrado" })
            }
            if (ajuste.autorizado === "Si") {
                return res.status(400).json({
                    message: "No se puede cancelar: el ajuste ya fue autorizado."
                })
            }
            if (ajuste.is_active === "No") {
                return res.status(400).json({ message: "El ajuste ya esta cancelado." })
            }
            const cancelado = await AjustesInventario.findByIdAndUpdate(
                id, { is_active: "No" }, { new: true }
            )
            res.status(200).json({ message: "Se cancelo el ajuste", ajuste: cancelado })
        } catch (error) {
            console.log(error)
            res.status(400).json(error)
        }
    },
    delete: (req, res)=>{
        AjustesInventario.findByIdAndDelete(req.params.id)
            .then((resDB)=> res.status(204).json(resDB))
            .catch((err)=> res.status(400).json(err))
    },
    edit: (req, res)=>{
        const { body } = req
        AjustesInventario.findByIdAndUpdate(req.params.id, body, { new: true})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    }
}