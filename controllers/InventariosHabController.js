const { InventariosHab, ArticulosDevoluciones, TelasOC, ComprasAcumulados, TelasDevolucionesProveedores, TelasApartados } = require('../models')

module.exports = { 
    findAll: (req, res)=>{
        InventariosHab.find()
        .populate('insumos')
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOne: (req, res)=>{
        const { id } = req.params
        InventariosHab.findById(id)
        .populate('insumos')
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    create: (req, res)=>{
        const { body } = req
        const newInventariosHab = new InventariosHab(body)
        const inventarioTelas = newInventariosHab.save()
            .then((respDB)=> res.status(201).json(respDB))
            .catch((err)=> console.log(err))
    },
    insumosCreate: async(req, res)=>{
      const { body } = req
        try{
          let surt2 = await InventariosHab.findOneAndUpdate( { insumos: body.insumos} ,
            { $inc: { cantidad: body.cantidad }, insumos: body.insumos}, { new: true, upsert: true }  );
            res.status(200).json({ message: "Se guardo" });
        }
        catch (error) {
          res.status(400).json(error);
        }
  },
    delete: (req, res)=>{
        InventariosHab.findByIdAndDelete(req.params.id)
            .then((resDB)=> res.status(204).json(resDB))
            .catch((err)=> res.status(400).json(err))
    },
 
}