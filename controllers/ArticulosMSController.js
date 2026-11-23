const { ArticulosMS, Inventarios, MuestrasSalida } = require("../models");

module.exports = {
  findAll: (req, res) => {
    ArticulosMS.find()
    .populate("articulos")
    .populate({ path: "muestrasSalida", populate: { path: "areas" } })
    .populate("inventarios")
      .then((respDB) => res.status(200).json(respDB))
      .catch((err) => console.log(err));
  },
  findOne: (req, res) => {
    const { id } = req.params;
    ArticulosMS.findById(id)
    .populate("articulos")
    .populate({ path: "muestrasSalida", populate: { path: "areas" } })
    .populate("inventarios")
      .then((respDB) => res.status(200).json(respDB))
      .catch((err) => console.log(err));
  },
  findOneMuestraSalida: (req, res) => {
    const { muestraSalida } = req.params;
    ArticulosMS.find({ muestrasSalida: muestraSalida })
      .populate("articulos")
      .populate({ path: "muestrasSalida", populate: { path: "areas" } })
      .populate("inventarios")
      .then((respDB) => res.status(200).json(respDB))
      .catch((err) => console.log(err));
  },
  create: async (req, res) => {
    const { body } = req;
    try {

      let inv = await Inventarios.findByIdAndUpdate( body.inventarios,   { $inc: { cantidad: -body.cantidad }}, { new: true } );

      const newArtTs = new ArticulosMS(body);
      const ArtTs = newArtTs.save();

      res.status(200).json({ message: "Se guardo la salida" });
    } catch (error) {
      res.status(400).json(error);
    }
  },
  delete: (req, res) => {
    ArticulosMS.findByIdAndDelete(req.params.id)
      .then((resDB) => res.status(204).json(resDB))
      .catch((err) => res.status(400).json(err));
  },
  edit: (req, res) => {
    const { body } = req;
    ArticulosMS.findByIdAndUpdate(req.params.id, body, { new: true })
      .then((resDB) => res.status(201).json(resDB))
      .catch((err) => res.status(400).json(err));
  },
};
