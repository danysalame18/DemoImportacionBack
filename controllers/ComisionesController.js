const { Comisiones, Colaboradores, Devoluciones, Abonos, Surtidos } = require('../models')

module.exports = { 
    findAll: (req, res)=>{
        Comisiones.find()
            .populate('colaboradores')
            .populate('bancos')
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOne: (req, res)=>{
        const { id } = req.params
        Comisiones.findById(id)
            .populate('colaboradores')
            .populate('bancos')
        .then((respDB)=> res.status(200).json(respDB))
        .catch((err)=> console.log(err))
    },
    findOneColaborador: (req, res)=>{
        const { colaborador } = req.params
        Comisiones.find({colaboradores:colaborador, is_active: "Si"})
            .populate('colaboradores')
            .populate('bancos')
        .then((respDB)=> res.status(200).json(respDB))
        .catch((err)=> console.log(err))
    },
    findOneFechas: (req, res)=>{
        const { inicio, fin } = req.params
        Comisiones.find({fecha:{$gte: inicio, $lte: fin}})
            .populate('colaboradores')
            .populate('bancos')
        .then((respDB)=> res.status(200).json(respDB))
        .catch((err)=> console.log(err))
    },
    create: async (req, res)=>{
        const { body } = req

        let col = await Colaboradores.findByIdAndUpdate(body.colaboradores, {$inc:{comisiones:body.importe}}, {new:true})

        const newComisiones = await new Comisiones(body)
        newComisiones.save()
            .then((respDB)=> res.status(201).json(respDB))
            .catch((err)=> console.log(err))
    },
    delete: (req, res)=>{
        Comisiones.findByIdAndDelete(req.params.id)
            .then((resDB)=> res.status(204).json(resDB))
            .catch((err)=> res.status(400).json(err))
    },
    edit: (req, res)=>{
        const { body } = req
        Comisiones.findByIdAndUpdate(req.params.id, body, { new: true})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    },
    editPagar: async(req, res)=>{
        const { body } = req
        try{
            let salCol = await Colaboradores.findByIdAndUpdate(body.colaboradores, {$inc:{abonos:body.importe}}, {new:true})

        let bla = await Comisiones.findByIdAndUpdate(req.params.id, {pagada:body.pagada}, { new: true})

        res.status(200).json({ message: "Se guardo" });
        } catch (error) {
            res.status(400).json(error)
        }
    },
    editImporte: async(req, res)=>{
        const { body } = req
        try{
            let salCol = await Colaboradores.findByIdAndUpdate(body.colaboradores, {$inc:{comisiones:-body.diferenciaImporte}}, {new:true})

        let bla = await Comisiones.findByIdAndUpdate(req.params.id, body, { new: true})

        res.status(200).json({ message: "Se guardo" });
        } catch (error) {
            res.status(400).json(error)
        }
    },
    cancel:async(req, res)=>{
        let temp1 = await Comisiones.findById(req.params.id)

        let temp3 = await Colaboradores.findByIdAndUpdate(temp1.colaboradores, {$inc:{comisiones: -temp1.importe}}, { new: true})
        let temp5 = await Surtidos.updateMany({comisiones:req.params.id}, {comisiones:[], comisionPagada:"No"}, { new: true})
        let temp6 = await Devoluciones.updateMany({comisiones:req.params.id}, {comisiones:[], comisionPagada:"No"}, { new: true})
        let temp7 = await Abonos.updateMany({comisiones:req.params.id}, {comisiones:[], comisionPagada:"No"}, { new: true})

        let temp4 = await Comisiones.findByIdAndUpdate(req.params.id, {is_active:"No", total:0, porcentaje:0, importe:0}, { new: true})
        
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    },
}