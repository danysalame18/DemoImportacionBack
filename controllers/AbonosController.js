const { Abonos, Clientes, Surtidos, NotasCargo, SaldoInicial, MovimientosBancos, Bancos, Devoluciones, Anticipos } = require("../models");

module.exports = {
  findAll: (req, res) => {
    Abonos.find()
      .populate("bancos")
      .populate({ path: "clientes", populate: { path: "vendedor" } })
      .populate({ path: "clientes", populate: { path: "areas" } })
      .populate({ path: "clientes", populate: { path: "departamentosClientes" } })
      .populate({ path: "surtidos", populate: { path: "pedidos"} })
      .populate({ path: "surtidos", populate: { path: "colaboradores"} })
      .populate({ path: "notasCargo"})
      .populate("saldoInicial")
      .then((respDB) => res.status(200).json(respDB))
      .catch((err) => console.log(err));
  },

  findOne: (req, res) => {
    const { id } = req.params;
    Abonos.findById(id)
      .populate("bancos")
      .populate({ path: "clientes", populate: { path: "vendedor" } })
      .populate({ path: "clientes", populate: { path: "areas" } })
      .populate({ path: "clientes", populate: { path: "departamentosClientes" } })
      .populate({ path: "surtidos", populate: { path: "colaboradores"} })
      .populate({
        path: "surtidos",
        populate: { path: "pedidos" },
      })
      .populate({ path: "notasCargo" })
      .populate("saldoInicial")
      .then((respDB) => res.status(200).json(respDB))
      .catch((err) => console.log(err));
  },
  findOneCliente: (req, res) => {
    const { cliente } = req.params;
    Abonos.find({ clientes: cliente })
      .populate("bancos")
      .populate({ path: "clientes", populate: { path: "vendedor" } })
      .populate({ path: "clientes", populate: { path: "areas" } })
      .populate({ path: "clientes", populate: { path: "departamentosClientes" } })
      .populate({ path: "surtidos", populate: { path: "colaboradores"} })
      .populate({
        path: "surtidos",
        populate: { path: "pedidos"},
      })
      .populate({ path: "notasCargo"})
      .populate("saldoInicial")
      .then((respDB) => res.status(200).json(respDB))
      .catch((err) => console.log(err));
  },
  findOneColaborador: (req, res) => {
    const { colaborador } = req.params;
     Abonos.find({
    colaboradores: colaborador,
    comisionPagada: "No",
    is_active: "Si",
    $or: [
      { concepto: "Abono" },
      { concepto: { $regex: "Anticipo", $options: "i" } }
    ]
  })
      .populate({ path: "clientes", populate: { path: "vendedor" } })
      .populate({ path: "clientes", populate: { path: "areas" } })
      .populate({ path: "clientes", populate: { path: "departamentosClientes" } })
      .populate({ path: "surtidos", populate: { path: "colaboradores"} })
      .populate({
        path: "surtidos",
        populate: { path: "pedidos"},
      })
      .populate({ path: "notasCargo"})
      .populate("saldoInicial")
      .then((respDB) => res.status(200).json(respDB))
      .catch((err) => console.log(err));
  },
  findOneColaboradorCliente: (req, res) => {
    const { colaborador, cliente } = req.params;
    Abonos.find({
      colaboradores: colaborador,
      clientes: cliente,
      concepto: "Bonificacion",
      comisionPagada: "No",
      is_active: "Si",
    })
      .populate({ path: "clientes", populate: { path: "vendedor" } })
      .populate({ path: "clientes", populate: { path: "areas" } })
      .populate({ path: "clientes", populate: { path: "departamentosClientes" } })
      .populate({ path: "surtidos", populate: { path: "colaboradores"} })
      .populate({
        path: "surtidos",
        populate: { path: "pedidos"},
      })
      .populate({ path: "notasCargo"})
      .populate("saldoInicial")
      .then((respDB) => res.status(200).json(respDB))
      .catch((err) => console.log(err));
  },
  findOneFechas: (req, res) => {
    const { inicio, fin } = req.params;
    Abonos.find({ fecha: { $gte: inicio, $lte: fin } })
      .populate("bancos")
      .populate({ path: "clientes", populate: { path: "vendedor" } })
      .populate({ path: "clientes", populate: { path: "areas" } })
      .populate({ path: "clientes", populate: { path: "departamentosClientes" } })
      .populate({ path: "surtidos", populate: { path: "colaboradores"} })
      .populate({
        path: "surtidos",
        populate: { path: "pedidos"},
      })
      .populate({ path: "notasCargo"})
      .populate("saldoInicial")
      .then((respDB) => res.status(200).json(respDB))
      .catch((err) => console.log(err));
  },
  create: async (req, res) => {
    const { body } = req;

    const saldoCliente = await Clientes.findByIdAndUpdate(
      body.clientes,
      { $inc: { abonos: body.importe, saldo: -body.importe } },
      { new: true }
    );

    const newAbonos = await new Abonos(body);
    newAbonos
      .save()
      .then((respDB) => res.status(201).json(respDB))
      .catch((err) => console.log(err));
  },
  createAplicarAnticipo: async (req, res) => {
    const { body } = req;

    const newAbonos = await new Abonos(body);
    newAbonos
      .save()
      .then((respDB) => res.status(201).json(respDB))
      .catch((err) => console.log(err));
  },
  delete: (req, res) => {
    Abonos.findByIdAndDelete(req.params.id)
      .then((resDB) => res.status(204).json(resDB))
      .catch((err) => res.status(400).json(err));
  },
  cancel: async (req, res) => {
    let abns = await Abonos.findById(req.params.id);

    // let abnsArray = Object.values(abns);

    // abnsArray.map(async (a) => {
      await Clientes.findByIdAndUpdate( abns.clientes,  { $inc: { abonos: -abns.importe, saldo: abns.importe } }, { new: true } );
      await Surtidos.findByIdAndUpdate( abns.surtidos, { $inc: { saldo: abns.importe } },{ new: true } );
      await NotasCargo.findByIdAndUpdate( abns.notasCargo, { $inc: { saldo: abns.importe } }, { new: true });
      await SaldoInicial.findByIdAndUpdate( abns.saldoInicial, { $inc: { saldo: abns.importe } }, { new: true });

      await Bancos.findByIdAndUpdate( abns.bancos, { $inc: { abonos: -abns.importe } },{ new: true } );
      await MovimientosBancos.updateMany( {abonos: abns._id}, { importe: 0, is_active: "No"},{ new: true } );

      if(abns.devoluciones != ""){
        await Devoluciones.findByIdAndUpdate(abns.devoluciones, {aplicada: "No"}, { new: true})
    }

    if(abns.anticipos != ""){
      await Anticipos.findByIdAndUpdate(abns.anticipos, {$inc:{utilizado: - abns.importe, saldo: abns.importe}}, { new: true})
  }
    // });

    const abs = await Abonos.findByIdAndUpdate( req.params.id, { importe: 0, is_active: "No" }, { new: true } )
      .then((resDB) => res.status(201).json(resDB))
      .catch((err) => res.status(400).json(err));
  },
  edit: async (req, res) => {
    const { body } = req;
    const saldoCliente = await Clientes.findByIdAndUpdate( body.idCliente,  { $inc: { abonos: body.importe, saldo: -body.importe } },  { new: true } );
    const saldoSurtido = await Surtidos.findByIdAndUpdate( body.notaEdit,  { $inc: { saldo: -body.importe } },  { new: true } );
    const saldoNotasCargo = await NotasCargo.findByIdAndUpdate( body.notaEdit,  { $inc: { saldo: -body.importe } },  { new: true } );
    const saldoSaldoInicial = await SaldoInicial.findByIdAndUpdate( body.notaEdit,  { $inc: { saldo: -body.importe } },  { new: true } );

    const ban = await Bancos.findByIdAndUpdate( body.bancos, { $inc: { abonos: body.importe } },{ new: true } );
    const mov = await MovimientosBancos.updateMany( {abonos: req.params.id}, { $inc: { importe: body.importe } },  { new: true } );

    const abn = await Abonos.findByIdAndUpdate(  req.params.id,  {$inc: { importe: body.importe }, fecha: body.fecha,  editado: body.editado, observaciones: body.observaciones, }, { new: true } )

      .then((resDB) => res.status(201).json(resDB))
      .catch((err) => res.status(400).json(err));
  },
  editComision: (req, res)=>{
    const { body } = req
    Abonos.findByIdAndUpdate(req.params.id, body, { new: true})
    .then((resDB)=> res.status(201).json(resDB))
    .catch((err)=> res.status(400).json(err))
}
};
