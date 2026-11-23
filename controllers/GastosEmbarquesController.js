const { GastosEmbarques, Embarques } = require('../models')

// El total de gastos del embarque se recalcula desde los gastos reales en vez
// de acumularse con $inc: asi editar o borrar un gasto tambien corrige el total.
// (Arcoshop lo resuelve mandando el total desde el front; aqui no dependemos
// de eso ni del orden en que lleguen las peticiones.)
const recalcularTotalEmbarque = async (embarqueId) => {
    if (!embarqueId) return
    const gastos = await GastosEmbarques.find({ embarques: embarqueId })
    const total = gastos.reduce((suma, g) => suma + (Number(g.real) || 0), 0)
    await Embarques.findByIdAndUpdate(embarqueId, { total_gasto: total }, { new: true })
}

module.exports = { 
    findAll: (req, res)=>{
        GastosEmbarques.find()
        .populate('embarques')
        .populate('conceptosGastosEmbarques')
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOne: (req, res)=>{
        const { id } = req.params
        GastosEmbarques.findById(id)
        .populate('embarques')
        .populate('conceptosGastosEmbarques')
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOneEmbarque: (req, res)=>{
        const { embarque } = req.params
        GastosEmbarques.find({embarques:embarque})
        .populate('embarques')
        .populate('conceptosGastosEmbarques')
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    create: async (req, res)=>{
        const { body } = req
        try {
            const newGastosEmbarques = new GastosEmbarques(body)
            const respDB = await newGastosEmbarques.save()
            await recalcularTotalEmbarque(body.embarques)
            res.status(201).json(respDB)
        } catch (err) {
            console.log(err)
            res.status(400).json(err)
        }
    },
    delete: async (req, res)=>{
        try {
            const resDB = await GastosEmbarques.findByIdAndDelete(req.params.id)
            await recalcularTotalEmbarque(resDB && resDB.embarques)
            res.status(204).json(resDB)
        } catch (err) {
            res.status(400).json(err)
        }
    },
    edit: async (req, res)=>{
        const { body } = req
        try {
            const resDB = await GastosEmbarques.findByIdAndUpdate(req.params.id, body, { new: true})
            await recalcularTotalEmbarque(resDB && resDB.embarques)
            res.status(201).json(resDB)
        } catch (err) {
            res.status(400).json(err)
        }
    }
}