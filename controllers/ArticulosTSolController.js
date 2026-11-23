const { ArticulosTSol, Inventarios } = require("../models");

module.exports = {
  findAll: (req, res) => {
    ArticulosTSol.find()
    .populate({path: 'articulos', populate:{path: 'familias'}})
    .populate({path: 'articulos', populate:{path: 'lineas'}})
    .populate({path: 'articulos', populate:{path: 'colecciones'}})
      .then((respDB) => res.status(200).json(respDB))
      .catch((err) => console.log(err));
  },
  findOne: (req, res) => {
    const { id } = req.params;
    ArticulosTSol.findById(id)
    .populate({path: 'articulos', populate:{path: 'familias'}})
    .populate({path: 'articulos', populate:{path: 'lineas'}})
    .populate({path: 'articulos', populate:{path: 'colecciones'}})
      .then((respDB) => res.status(200).json(respDB))
      .catch((err) => console.log(err));
  },
  findOneSolicitud: async (req, res)=>{
    const { id, area } = req.params
    try{
    let AP = await ArticulosTSol.find({ traspasosSolicitud: id})
    .populate({path: 'articulos', populate:{path: 'familias'}})
    .populate({path: 'articulos', populate:{path: 'lineas'}})
    .populate({path: 'articulos', populate:{path: 'colecciones'}})

        let ids = await AP.map((a) => (a.articulos[0]._id))
        

        let AI = await  Inventarios.find({
                // "cantidad": {$gt:0},
                 "articulos" : { $in: ids}, areas: area })
          .populate('compras')
          
          .populate('areas')
          .populate({path: 'articulos', populate:{path: 'familias'}})
          .populate({path: 'articulos', populate:{path: 'lineas'}})
          .populate({path: 'articulos', populate:{path: 'colecciones'}})

          res.status(200).json({AP, AI})
        } catch (error) {
           res.status(400).json(error)
       }
},
  findOneTraspasoSolicitud: (req, res) => {
    const { traspasoSolicitud } = req.params;
    ArticulosTSol.find({ traspasosSolicitud: traspasoSolicitud })
    .populate({path: 'articulos', populate:{path: 'familias'}})
    .populate({path: 'articulos', populate:{path: 'lineas'}})
    .populate({path: 'articulos', populate:{path: 'colecciones'}})
      .populate({ path: "traspasosSolicitud", populate: { path: "areaDestino" } })
      .populate({ path: "traspasosSolicitud", populate: { path: "areaSalida" } })
      .then((respDB) => res.status(200).json(respDB))
      .catch((err) => console.log(err));
  },
  create: async (req, res) => {
    const { body } = req;
    try {
      const newArtTs = new ArticulosTSol(body);
      const ArtTs = newArtTs.save();

      res.status(200).json({ message: "Se guardo la solicitud" });
    } catch (error) {
      res.status(400).json(error);
    }
  },
  delete: (req, res) => {
    ArticulosTSol.findByIdAndDelete(req.params.id)
      .then((resDB) => res.status(204).json(resDB))
      .catch((err) => res.status(400).json(err));
  },
  edit: (req, res) => {
    const { body } = req;
    ArticulosTSol.findByIdAndUpdate(req.params.id, body, { new: true })
      .then((resDB) => res.status(201).json(resDB))
      .catch((err) => res.status(400).json(err));
  },
  editCantidad: async (req, res) => {
    const { body } = req;
    let aa = await ArticulosTSol.findByIdAndUpdate(
      req.params.id,
      { cantidad: body.cantidad},
      { new: true }
    )
      .then((resDB) => res.status(201).json(resDB))
      .catch((err) => res.status(400).json(err));
      
  }
};
