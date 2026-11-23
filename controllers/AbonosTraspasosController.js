const { AbonosTraspasos, Areas,  TraspasosSalida, MovimientosBancos, Bancos } = require("../models");

module.exports = {
  findAll: (req, res) => {
    AbonosTraspasos.find()
      .populate("bancos")
      .populate("areas")
      .populate("traspasosSalida")
      .then((respDB) => res.status(200).json(respDB))
      .catch((err) => console.log(err));
  },

  findOne: (req, res) => {
    const { id } = req.params;
    AbonosTraspasos.findById(id)
      .populate("bancos")
      .populate("areas")
      .populate("traspasosSalida")
      .then((respDB) => res.status(200).json(respDB))
      .catch((err) => console.log(err));
  },
  findOneArea: (req, res) => {
    const { area } = req.params;
    AbonosTraspasos.find({ areas: area })
      .populate("bancos")
      .populate("areas")
      .populate("traspasosSalida")
      .then((respDB) => res.status(200).json(respDB))
      .catch((err) => console.log(err));
  },
  findOneFechas: (req, res) => {
    const { inicio, fin } = req.params;
    AbonosTraspasos.find({ fecha: { $gte: inicio, $lte: fin } })
      .populate("bancos")
      .populate("areas")
      .populate("traspasosSalida")
      .then((respDB) => res.status(200).json(respDB))
      .catch((err) => console.log(err));
  },
  create: async (req, res) => {
    const { body } = req;

    const saldoTienda = await Areas.findByIdAndUpdate(
      body.areas,
      { $inc: { abonos: body.importe, saldo: -body.importe } },
      { new: true }
    );

    const newAbonosTraspasos = await new AbonosTraspasos(body);
    newAbonosTraspasos
      .save()
      .then((respDB) => res.status(201).json(respDB))
      .catch((err) => console.log(err));
  },

  delete: (req, res) => {
    AbonosTraspasos.findByIdAndDelete(req.params.id)
      .then((resDB) => res.status(204).json(resDB))
      .catch((err) => res.status(400).json(err));
  },
  cancel: async (req, res) => {
    let abns = await AbonosTraspasos.findById(req.params.id);

    // let abnsArray = Object.values(abns);

    // abnsArray.map(async (a) => {
      await Areas.findByIdAndUpdate( abns.areas,  { $inc: { abonos: -abns.importe, saldo: abns.importe } }, { new: true } );
      await TraspasosSalida.findByIdAndUpdate( abns.traspasosSalida,  { $inc: {  saldo: abns.importe } }, { new: true } );

      await Bancos.findByIdAndUpdate( abns.bancos, { $inc: { abonos: -abns.importe } },{ new: true } );
      await MovimientosBancos.updateMany( {abonosTraspasos: abns._id}, { importe: 0, is_active: "No"},{ new: true } );
    // });

    const abs = await AbonosTraspasos.findByIdAndUpdate( req.params.id, { importe: 0, is_active: "No" }, { new: true } )
      .then((resDB) => res.status(201).json(resDB))
      .catch((err) => res.status(400).json(err));
  },
  edit: async (req, res) => {
    const { body } = req;
    const saldoTienda = await Areas.findByIdAndUpdate( body.areas,  { $inc: { abonos: body.importe, saldo: -body.importe } },  { new: true } );
    const saldoSurtido = await TraspasosSalida.findByIdAndUpdate( body.traspasosSalida,  { $inc: { saldo: -body.importe } },  { new: true } );

    const ban = await Bancos.findByIdAndUpdate( body.bancos, { $inc: { abonosTraspasos: body.importe } },{ new: true } );
    const mov = await MovimientosBancos.updateMany( {abonosTraspasos: req.params.id}, { $inc: { importe: body.importe } },  { new: true } );

    const abn = await AbonosTraspasos.findByIdAndUpdate(  req.params.id,  {$inc: { importe: body.importe }, fecha: body.fecha,  editado: body.editado, observaciones: body.observaciones, }, { new: true } )

      .then((resDB) => res.status(201).json(resDB))
      .catch((err) => res.status(400).json(err));
  },

};
