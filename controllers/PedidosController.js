const { Pedidos, ProcesosSalida, ArticulosProcesosSalida, ArticulosPedido} = require('../models')

module.exports = { 
    findAll: (req, res)=>{
        Pedidos.find()
        .populate('clientes')
        .populate('colaboradores')
        .populate('areas')
        .populate('creado')
        .populate('autorizoSurtido')
        .populate('autorizoApartado')
        .populate('editPedido')
        .populate('editArticulos')
        .populate('departamentosClientes')
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOne: (req, res)=>{
        const { id } = req.params
        Pedidos.findById(id)
        .populate('clientes')
        .populate('colaboradores')
        .populate('areas')
        .populate('creado')
        .populate('autorizoSurtido')
        .populate('autorizoApartado')
        .populate('editPedido')
        .populate('editArticulos')
        .populate('departamentosClientes')
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOnePedidosFechas: (req, res)=>{
        const { inicio, fin } = req.params
        Pedidos.find({fecha:{$gte: inicio, $lte: fin}})
        .populate('clientes')
        .populate('colaboradores')
        .populate('areas')
        .populate('creado')
        .populate('autorizoSurtido')
        .populate('autorizoApartado')
        .populate('editPedido')
        .populate('editArticulos')
        .populate('departamentosClientes')
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOnePedidosFechasStatus: (req, res)=>{
        const { inicio, fin, status } = req.params
        if(status == "Abierto"){
        Pedidos.find({fecha:{$gte: inicio, $lte: fin}, status:status, is_active:"Si"})
        .populate('clientes')
        .populate({ path: "colaboradores", populate: { path: "areas" } })
        .populate('areas')
        .populate('creado')
        .populate('autorizoSurtido')
        .populate('autorizoApartado')
        .populate('editPedido')
        .populate('editArticulos')
        .populate('departamentosClientes')
        .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
        } else {
            Pedidos.find({fecha:{$gte: inicio, $lte: fin}, status:status})
            .populate('clientes')
            .populate('colaboradores')
            .populate('areas')
            .populate('creado')
            .populate('autorizoSurtido')
            .populate('autorizoApartado')
            .populate('editPedido')
            .populate('editArticulos')
            .populate('departamentosClientes')
                .then((respDB)=> res.status(200).json(respDB))
                .catch((err)=> console.log(err))
        }
    },

    findOnePedidosFechasStatusCliente: (req, res)=>{
        const { inicio, fin, status, cliente } = req.params
        Pedidos.find({fecha:{$gte: inicio, $lte: fin}, status:status, clientes:cliente})
        .populate('clientes')
        .populate({ path: "colaboradores", populate: { path: "areas" } })
        .populate('areas')
        .populate('creado')
        .populate('autorizoSurtido')
        .populate('autorizoApartado')
        .populate('editPedido')
        .populate('editArticulos')
        .populate('departamentosClientes')
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findPendienteSurtir: (req, res)=>{
        Pedidos.find({is_active:"Si", autorizadoSurtido:"Si", status:"Abierto", fechaInicio:{$gte: "2000-01-01"}})
        .populate('clientes')
        .populate({ path: "colaboradores", populate: { path: "areas" } })
        .populate('areas')
        .populate('creado')
        .populate('autorizoSurtido')
        .populate('autorizoApartado')
        .populate('editPedido')
        .populate('editArticulos')
        .populate('departamentosClientes')

            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    create: (req, res)=>{
        const { body } = req
        const newPedidos = new Pedidos(body)
        const pedido = newPedidos.save()
            .then((respDB)=> res.status(201).json(respDB))
            .catch((err)=> console.log(err))
    },
    delete: (req, res)=>{
        Pedidos.findByIdAndDelete(req.params.id)
            .then((resDB)=> res.status(204).json(resDB))
            .catch((err)=> res.status(400).json(err))
    },
    edit: async (req, res)=>{
        const { body } = req
        let ped = await Pedidos.findByIdAndUpdate(req.params.id, body, { new: true})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    },
    editCerrarProcesoSalida: async (req, res)=>{
        const { body } = req

        let PS = await ProcesosSalida.updateMany({pedidos: req.params.id}, {is_active:"No"}, { new: true})
        let APS = await ArticulosProcesosSalida.updateMany({pedidos: req.params.id}, {is_active:"No"}, { new: true})

        let ped = await Pedidos.findByIdAndUpdate(req.params.id, body, { new: true})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    },
    editAbrirProcesoSalida: async (req, res)=>{
        const { body } = req

        let PS = await ProcesosSalida.updateMany({pedidos: req.params.id}, {is_active:"Si"}, { new: true})
        let APS = await ArticulosProcesosSalida.updateMany({pedidos: req.params.id}, {is_active:"Si"}, { new: true})

        let ped = await Pedidos.findByIdAndUpdate(req.params.id, body, { new: true})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    },

    desarrollo: async(req, res)=>{
        try{
       let sur = await Pedidos.find()

        sur.map(async(a)=>{
            await ArticulosPedido.updateMany({pedidos:a._id}, {fecha: a.fecha}, { new: true})
        })
         res.status(200).json("Ya acabe");
    } catch (error) {
        res.status(400).json(error);
    }

    },
}