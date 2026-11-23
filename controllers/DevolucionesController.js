const { Devoluciones } = require('../models')

module.exports = { 
    findAll: (req, res)=>{
        Devoluciones.find()
        .populate('clientes')
        .populate('surtidos')
        .populate('colaboradores')
        .populate('areas')
        .populate({path: 'surtidos', populate:{path: 'pedidos', populate:{path: 'clientes'}}})
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOne: (req, res)=>{
        const { id } = req.params
        Devoluciones.findById(id)
        .populate('clientes')
        .populate('surtidos')
        .populate('colaboradores')
        .populate('areas')
        .populate({path: 'surtidos', populate:{path: 'pedidos', populate:{path: 'clientes'}}})
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOneCliente: (req, res)=>{
        const { cliente } = req.params
        Devoluciones.find({clientes:cliente})
        .populate('clientes')
        .populate('surtidos')
        .populate('colaboradores')
        .populate('areas')
        .populate({path: 'surtidos', populate:{path: 'pedidos', populate:{path: 'clientes'}}})
        .then((respDB)=> res.status(200).json(respDB))
        .catch((err)=> console.log(err))
    },
    findOneColaborador: (req, res) => {
        const { colaborador } = req.params;
        Devoluciones.find({
          colaboradores: colaborador,
          comisionPagada: "No",
          is_active: "Si",
        })
        .populate('clientes')
        .populate('surtidos')
        .populate('colaboradores')
        .populate('areas')
        .populate({path: 'surtidos', populate:{path: 'pedidos', populate:{path: 'clientes'}}})
          .then((respDB) => res.status(200).json(respDB))
          .catch((err) => console.log(err));
      },
      findOneColaboradorCliente: (req, res) => {
        const { colaborador, cliente } = req.params;
        Devoluciones.find({
          colaboradores: colaborador,
          clientes: cliente,
          comisionPagada: "No",
          is_active: "Si",
        })
        .populate('clientes')
        .populate('surtidos')
        .populate('colaboradores')
        .populate('areas')
        .populate({path: 'surtidos', populate:{path: 'pedidos', populate:{path: 'clientes'}}})
          .then((respDB) => res.status(200).json(respDB))
          .catch((err) => console.log(err));
      },
    findOneFechas: (req, res)=>{
        const { inicio, fin } = req.params
        Devoluciones.find({fecha:{$gte: inicio, $lte: fin}})
        .populate('clientes')
        .populate('surtidos')
        .populate('colaboradores')
        .populate('areas')
        .populate({path: 'surtidos', populate:{path: 'pedidos', populate:{path: 'clientes'}}})
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    create: (req, res)=>{
        const { body } = req
        const newDevoluciones = new Devoluciones(body)
         newDevoluciones.save()
            .then((respDB)=> res.status(201).json(respDB))
            .catch((err)=> console.log(err))
    },
    delete: (req, res)=>{
        Devoluciones.findByIdAndDelete(req.params.id)
            .then((resDB)=> res.status(204).json(resDB))
            .catch((err)=> res.status(400).json(err))
    },
    edit: (req, res)=>{
        const { body } = req
        Devoluciones.findByIdAndUpdate(req.params.id, body, { new: true})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    }
}