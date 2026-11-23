const { ArticulosME, Inventarios, MuestrasEntrada } = require("../models");

module.exports = {
  findAll: (req, res) => {
    ArticulosME.find()
    .populate("articulos")
    .populate({ path: "muestrasEntrada", populate: { path: "areas" } })
      .then((respDB) => res.status(200).json(respDB))
      .catch((err) => console.log(err));
  },
  findOne: (req, res) => {
    const { id } = req.params;
    ArticulosME.findById(id)
    .populate("articulos")
    .populate({ path: "muestrasEntrada", populate: { path: "areas" } })
      .then((respDB) => res.status(200).json(respDB))
      .catch((err) => console.log(err));
  },
  findOneMuestraEntrada: (req, res) => {
    const { muestraEntrada } = req.params;
    ArticulosME.find({ muestrasEntrada: muestraEntrada })
      .populate("articulos")
      .populate({ path: "muestrasEntrada", populate: { path: "areas" } })
      .then((respDB) => res.status(200).json(respDB))
      .catch((err) => console.log(err));
  },
  create: async (req, res) => {
    const { body } = req;
    try {

      let surt = await Inventarios.findOneAndUpdate( {areas: [body.areas], articulos: [body.articulos]} ,
        { $inc: { cantidad: body.cantidad }, is_active: "Si"}, { new: true, upsert: true }  );

      const newArtTs = new ArticulosME(body);
      const ArtTs = newArtTs.save();

      res.status(200).json({ message: "Se guardo la entrada" });
    } catch (error) {
      res.status(400).json(error);
    }
  },
  delete: (req, res) => {
    ArticulosME.findByIdAndDelete(req.params.id)
      .then((resDB) => res.status(204).json(resDB))
      .catch((err) => res.status(400).json(err));
  },
  edit: (req, res) => {
    const { body } = req;
    ArticulosME.findByIdAndUpdate(req.params.id, body, { new: true })
      .then((resDB) => res.status(201).json(resDB))
      .catch((err) => res.status(400).json(err));
  },
};
