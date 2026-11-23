const { ArticulosAjustesInv, Inventarios, AjustesInventario } = require("../models");

module.exports = {
  findAll: (req, res) => {
    ArticulosAjustesInv.find()
    .populate("articulos")
    .populate({ path: "ajustesInventario", populate: { path: "areas" } })
      .then((respDB) => res.status(200).json(respDB))
      .catch((err) => console.log(err));
  },
  findOne: (req, res) => {
    const { id } = req.params;
    ArticulosAjustesInv.findById(id)
    .populate("articulos")
    .populate({ path: "ajustesInventario", populate: { path: "areas" } })
      .then((respDB) => res.status(200).json(respDB))
      .catch((err) => console.log(err));
  },
  findOneAjuste: (req, res) => {
    const { id } = req.params;
    ArticulosAjustesInv.find({ajustesInventario: id})
    .populate("articulos")
    .populate({ path: "ajustesInventario", populate: { path: "areas" } })
      .then((respDB) => res.status(200).json(respDB))
      .catch((err) => console.log(err));
  },
  create: async (req, res) => {
    const { body } = req;
    try {

      const newArtTs = new ArticulosAjustesInv(body);
      const ArtTs = newArtTs.save();

      res.status(200).json({ message: "Se guardo la entrada" });
    } catch (error) {
      res.status(400).json(error);
    }
  },
  autorizado: async (req, res) => {
    const { id } = req.params;
    try {

      let AAI = await ArticulosAjustesInv.find({ ajustesInventario: id })


     AAI.map(async(a)=>{
         await Inventarios.findByIdAndUpdate( a.inventarios,
          { $inc: { cantidad: a.cantidad } }, { new: true, upsert: true }  );
      })


      // const newArtTs = new ArticulosAjustesInv(body);
      // const ArtTs = newArtTs.save();

      res.status(200).json({ message: "Se guardo la entrada" });
    } catch (error) {
      res.status(400).json(error);
    }
  },
  delete: (req, res) => {
    ArticulosAjustesInv.findByIdAndDelete(req.params.id)
      .then((resDB) => res.status(204).json(resDB))
      .catch((err) => res.status(400).json(err));
  },
  edit: (req, res) => {
    const { body } = req;
    ArticulosAjustesInv.findByIdAndUpdate(req.params.id, body, { new: true })
      .then((resDB) => res.status(201).json(resDB))
      .catch((err) => res.status(400).json(err));
  },
};
