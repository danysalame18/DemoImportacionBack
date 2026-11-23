const { AbonosTiendas, Clientes, VentasTiendas, Bancos, MovimientosBancos } = require("../models");

module.exports = {
  findAll: (req, res) => {
    AbonosTiendas.find()
      .populate("areas")
      .populate("bancos")
      .populate("notasCargo")
      .populate({ path: "clientes", populate: { path: "vendedor" } })
      .populate({ path: "ventasTiendas", populate: { path: "colaboradores" } })
      .then((respDB) => res.status(200).json(respDB))
      .catch((err) => console.log(err));
  },
  findOne: (req, res) => {
    const { id } = req.params;
    AbonosTiendas.findById(id)
      .populate("areas")
      .populate("bancos")
      .populate("notasCargo")
      .populate({ path: "clientes", populate: { path: "vendedor" } })
      .populate({ path: "ventasTiendas", populate: { path: "colaboradores" } })
      .then((respDB) => res.status(200).json(respDB))
      .catch((err) => console.log(err));
  },
  findOneCliente: (req, res) => {
    const { cliente } = req.params;
    AbonosTiendas.find({ clientes: cliente })
      .populate("areas")
      .populate("bancos")
      .populate("notasCargo")
      .populate({ path: "clientes", populate: { path: "vendedor" } })
      .populate({ path: "ventasTiendas", populate: { path: "colaboradores" } })
      .then((respDB) => res.status(200).json(respDB))
      .catch((err) => console.log(err));
  },
  findOneAbonosVentasDiario: (req, res) => {
    const { almacen, inicio, fin } = req.params;
    AbonosTiendas.find({ fecha: { $gte: inicio, $lte: fin }, areas: almacen })
      .populate("areas")
      .populate("bancos")
      .populate("notasCargo")
      .populate({ path: "clientes", populate: { path: "vendedor" } })
      .populate({ path: "ventasTiendas", populate: { path: "colaboradores" } })
      .then((respDB) => res.status(200).json(respDB))
      .catch((err) => console.log(err));
  },
  findOneAbonosVentasDiarioK: (req, res) => {
    const { almacen, inicio, fin } = req.params;
    AbonosTiendas.find({
      fecha: { $gte: inicio, $lte: fin },
      $or: [{ tdc: { $gt: 0 } }, { transfer: { $gt: 0 } }],
      areas: almacen,
    })
      .populate("areas")
      .populate("bancos")
      .populate("notasCargo")
      .populate({ path: "clientes", populate: { path: "vendedor" } })
      .populate({ path: "ventasTiendas", populate: { path: "colaboradores" } })
      .then((respDB) => res.status(200).json(respDB))
      .catch((err) => console.log(err));
  },
  findOneAbonosVentasDiarioGeneral: (req, res) => {
    const { inicio, fin } = req.params;
    AbonosTiendas.find({ fecha: { $gte: inicio, $lte: fin } })
      .populate("areas")
      .populate("bancos")
      .populate("notasCargo")
      .populate({ path: "clientes", populate: { path: "vendedor" } })
      .populate({ path: "ventasTiendas", populate: { path: "colaboradores" } })
      .then((respDB) => res.status(200).json(respDB))
      .catch((err) => console.log(err));
  },
  create: async (req, res) => {
    const { body } = req;

    let importe =
      parseFloat(body.efectivo) +
      parseFloat(body.tdc) +
      parseFloat(body.transfer) +
      parseFloat(body.cortesia);

    const saldoCliente = await Clientes.findByIdAndUpdate(
      body.clientes,
      { $inc: { abonos: importe, saldo: -importe } },
      { new: true }
    );

    const newAbonosTiendas = new AbonosTiendas(body);
    newAbonosTiendas
      .save()
      .then((respDB) => res.status(201).json(respDB))
      .catch((err) => console.log(err));
  },
  cancel: async (req, res) => {
    let abns = await AbonosTiendas.findById(req.params.id);

      await Clientes.findByIdAndUpdate(abns.clientes,{ $inc: { abonos: -abns.total, saldo: abns.total } },{ new: true });
      await VentasTiendas.findByIdAndUpdate(abns.ventasTiendas, { $inc: { saldo: abns.total } }, { new: true });
   
      if(abns.bancos !=""){
      await Bancos.findByIdAndUpdate( abns.bancos, { $inc: { abonos: -abns.total } },{ new: true } );
      await MovimientosBancos.updateMany( {abonosTiendas: abns._id}, { importe: 0, is_active: "No"},{ new: true } );
    }

    const abs = await AbonosTiendas.findByIdAndUpdate(
      req.params.id,
      {
        total: 0,
        efectivo: 0,
        tdc: 0,
        transfer: 0,
        cortesia: 0,
        nomina: 0,
        is_active: "No",
      },
      { new: true }
    )
      .then((resDB) => res.status(201).json(resDB))
      .catch((err) => res.status(400).json(err));
  },
  delete: (req, res) => {
    AbonosTiendas.findByIdAndDelete(req.params.id)
      .then((resDB) => res.status(204).json(resDB))
      .catch((err) => res.status(400).json(err));
  },
  edit: (req, res) => {
    const { body } = req;
    AbonosTiendas.findByIdAndUpdate(req.params.id, body, { new: true })
      .then((resDB) => res.status(201).json(resDB))
      .catch((err) => res.status(400).json(err));
  },
};
