const { ProcesosSalida } = require("../models");

module.exports = {
  findAll: (req, res) => {
    ProcesosSalida.find()
      .populate("proveedores")
      .populate("pedidos")
      .populate("articulos")
      .populate("procesosSalida")
      .then((respDB) => res.status(200).json(respDB))
      .catch((err) => console.log(err));
  },
  findOne: (req, res) => {
    const { id } = req.params;
    ProcesosSalida.findById(id)
      .populate("proveedores")
      .populate("pedidos")
      .populate("articulos")
      .then((respDB) => res.status(200).json(respDB))
      .catch((err) => console.log(err));
  },
  findOneFechasActivos: (req, res) => {
    const { inicio, fin } = req.params;
    ProcesosSalida.find({
      fecha: { $gte: inicio, $lte: fin },
      is_active: "Si",
    })
      .populate("proveedores")
      .populate("pedidos")
      .populate("articulos")
      .then((respDB) => res.status(200).json(respDB))
      .catch((err) => console.log(err));
  },
  create: (req, res) => {
    const { body } = req;
    const newProcesos = new ProcesosSalida(body);
    const color = newProcesos
      .save()
      .then((respDB) => res.status(201).json(respDB))
      .catch((err) => console.log(err));
  },
  delete: (req, res) => {
    ProcesosSalida.findByIdAndDelete(req.params.id)
      .then((resDB) => res.status(204).json(resDB))
      .catch((err) => res.status(400).json(err));
  },
  edit: (req, res) => {
    const { body } = req;
    ProcesosSalida.findByIdAndUpdate(req.params.id, body, { new: true })
      .then((resDB) => res.status(201).json(resDB))
      .catch((err) => res.status(400).json(err));
  },
};
