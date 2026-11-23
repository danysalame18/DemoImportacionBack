const { MuestrasSalida } = require("../models");

module.exports = {
  findAll: (req, res) => {
    MuestrasSalida.find()
      .populate("areas")
      .populate("clientes")
      .populate("user")
      .then((respDB) => res.status(200).json(respDB))
      .catch((err) => console.log(err));
  },
  findOne: (req, res) => {
    const { id } = req.params;
    MuestrasSalida.findById(id)
      .populate("areas")
      .populate("clientes")
      .populate("user")
      .then((respDB) => res.status(200).json(respDB))
      .catch((err) => console.log(err));
  },
  create: (req, res) => {
    const { body } = req;
    const newMuestras = new MuestrasSalida(body);
    const traspaso = newMuestras
      .save()
      .then((respDB) => res.status(201).json(respDB))
      .catch((err) => console.log(err));
  },
  delete: (req, res) => {
    MuestrasSalida.findByIdAndDelete(req.params.id)
      .then((resDB) => res.status(204).json(resDB))
      .catch((err) => res.status(400).json(err));
  },
  edit: (req, res) => {
    const { body } = req;
    MuestrasSalida.findByIdAndUpdate(req.params.id, body, { new: true })
      .then((resDB) => res.status(201).json(resDB))
      .catch((err) => res.status(400).json(err));
  },
};
