const { ArticulosTE, ArticulosTS, Inventarios } = require("../models");

module.exports = {
  findAll: (req, res) => {
    ArticulosTE.find()
    .populate({path: 'articulos', populate:{path: 'familias'}})
    .populate({path: 'articulos', populate:{path: 'lineas'}})
    .populate({path: 'articulos', populate:{path: 'colecciones'}})
    .populate({path: 'articulosTS', populate:{path: 'traspasosSalida'}})
    .populate("traspasosEntrada")
      .then((respDB) => res.status(200).json(respDB))
      .catch((err) => console.log(err));
  },
  findOne: (req, res) => {
    const { id } = req.params;
    ArticulosTE.findById(id)
    .populate({path: 'articulos', populate:{path: 'familias'}})
    .populate({path: 'articulos', populate:{path: 'lineas'}})
    .populate({path: 'articulos', populate:{path: 'colecciones'}})
    .populate({path: 'articulosTS', populate:{path: 'traspasosSalida'}})
    .populate("traspasosEntrada")
      .then((respDB) => res.status(200).json(respDB))
      .catch((err) => console.log(err));
  },
  findOneTraspasoEntrada: (req, res) => {
    const { traspasoEntrada } = req.params;
    ArticulosTE.find({ traspasosEntrada: traspasoEntrada })
    .populate({path: 'articulos', populate:{path: 'familias'}})
    .populate({path: 'articulos', populate:{path: 'lineas'}})
    .populate({path: 'articulos', populate:{path: 'colecciones'}})
    .populate({path: 'articulosTS', populate:{path: 'traspasosSalida'}})
      .populate("traspasosEntrada")
      .then((respDB) => res.status(200).json(respDB))
      .catch((err) => console.log(err));
  },
  create: async (req, res) => {
    const { body } = req;
    try {
      // let inv = await Inventarios.findOneAndUpdate({ areas: [body.areaDestino], articulos: [body.articulos]},{ $inc: { cantidad: body.cantidad }, is_active: "Si", costoUnitario: body.costoUnitario,},{ new: true, upsert: true });

      // let artTS = await ArticulosTS.findByIdAndUpdate( body.articulosTS,  { $inc: { surtido: body.cantidad } }, { new: true } );

      const newArtTe = new ArticulosTE(body);
      const ArtTe = newArtTe.save();

      res.status(200).json({ message: "Se guardo el traspaso" });
    } catch (error) {
      res.status(400).json(error);
    }
  },
  delete: (req, res) => {
    ArticulosTE.findByIdAndDelete(req.params.id)
      .then((resDB) => res.status(204).json(resDB))
      .catch((err) => res.status(400).json(err));
  },
  edit: (req, res) => {
    const { body } = req;
    ArticulosTE.findByIdAndUpdate(req.params.id, body, { new: true })
      .then((resDB) => res.status(201).json(resDB))
      .catch((err) => res.status(400).json(err));
      
  },
};
