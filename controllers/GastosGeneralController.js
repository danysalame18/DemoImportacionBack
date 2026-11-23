const { GastosGeneral, Bancos, MovimientosBancos } = require('../models')
const mongoose = require("mongoose");

module.exports = { 
    findAll: (req, res)=>{
        GastosGeneral.find()
            .populate('areas')
            .populate('bancos')
            .populate('conceptosGastos')
            .populate('categorias')
            .populate('subCategorias')
            .populate('solicitantes')
            .populate("empresas")
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOne: (req, res)=>{
        const { id } = req.params
        GastosGeneral.findById(id)
            .populate('areas')
            .populate('bancos')
            .populate('conceptosGastos')
            .populate('categorias')
            .populate('subCategorias')
            .populate('solicitantes')
            .populate("empresas")
        .then((respDB)=> res.status(200).json(respDB))
        .catch((err)=> console.log(err))
    },
    findOneArea: (req, res)=>{
        const { area } = req.params
        GastosGeneral.find({areas:area})
            .populate('areas')
            .populate('bancos')
            .populate('conceptosGastos')
            .populate('categorias')
            .populate('subCategorias')
            .populate('solicitantes')
            .populate("empresas")
        .then((respDB)=> res.status(200).json(respDB))
        .catch((err)=> console.log(err))
    },
    findOneGastosDiario: (req, res)=>{
        const { area, inicio, fin } = req.params
        GastosGeneral.find({fecha:{$gte: inicio, $lte: fin}, is_active:"Si"})
        .populate('areas')
        .populate('bancos')
        .populate('conceptosGastos')
        .populate('categorias')
        .populate('subCategorias')
        .populate('solicitantes')
        .populate("empresas")
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOneGastosDiarioGeneral: (req, res)=>{
        const { inicio, fin } = req.params
        GastosGeneral.find({fecha:{$gte: inicio, $lte: fin}})
        .populate('areas')
        .populate('bancos')
        .populate('conceptosGastos')
        .populate('categorias')
        .populate('subCategorias')
        .populate('solicitantes')
        .populate("empresas")
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    create: async (req, res)=>{
        const { body } = req
        const newGastosGeneral = new GastosGeneral(body)
        newGastosGeneral.save()
            .then((respDB)=> res.status(201).json(respDB))
            .catch((err)=> console.log(err))
    },
    delete: (req, res)=>{
        GastosGeneral.findByIdAndDelete(req.params.id)
            .then((resDB)=> res.status(204).json(resDB))
            .catch((err)=> res.status(400).json(err))
    },
    edit: async (req, res)=>{
        const { body } = req

        if(body.bancos){
            const ban = await Bancos.findByIdAndUpdate( body.bancos, { $inc: { cargos: body.total } },{ new: true } );
            const mov = await MovimientosBancos.updateMany( {gastosGeneral: req.params.id}, { $inc: { importe: -body.total } },  { new: true } );            
        }
        if(body.fotoEvidencia){
            const gasto = await GastosGeneral.findByIdAndUpdate(req.params.id, body, { new: true})
            .then((resDB)=> res.status(201).json(resDB))
            .catch((err)=> res.status(400).json(err))
        }
        else{
            const gasto = await GastosGeneral.findByIdAndUpdate(
            req.params.id,
            {
                $inc: { total: body.total, subtotal: body.subtotal, iva: body.iva },
                fecha: body.fecha,
                descripcion: body.descripcion,
                areas: body.areas,
                conceptosGastos: body.conceptosGastos,
                categorias: body.categorias,
                subCategorias: body.subCategorias,
                solicitantes: body.solicitantes,
            },
            { new: true }
            )

            .then((resDB) => res.status(201).json(resDB))
            .catch((err) => res.status(400).json(err));
        }
    },
cancel: async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const gas = await GastosGeneral.findById(req.params.id).session(session);
    if (!gas) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Gasto no encontrado" });
    }

    // Normaliza bancos a arreglo (tu esquema muestra bancos: ["..."])
    const bankIds = Array.isArray(gas.bancos)
      ? gas.bancos
      : gas.bancos
      ? [gas.bancos]
      : [];

    const monto = Number(gas.total || 0);
    if (!Number.isFinite(monto)) {
      throw new Error("Total inválido en el gasto.");
    }

    // Ajusta cargos en cada banco (si sólo hay uno, será un loop de 1)
    for (const bankId of bankIds) {
      if (!bankId) continue;
      await Bancos.findByIdAndUpdate(
        bankId,
        { $inc: { cargos: -monto } },
        { new: false, session }
      );
    }

    // Anula movimientos ligados a este gasto
    await MovimientosBancos.updateMany(
      { gastosGeneral: gas._id },
      { $set: { importe: 0, is_active: "No" } },
      { session }
    );

    // Marca el gasto como cancelado y en ceros
    const updated = await GastosGeneral.findByIdAndUpdate(
      gas._id,
      { $set: { total: 0, subtotal: 0, iva: 0, is_active: "No" } },
      { new: true, session }
    );

    await session.commitTransaction();
    return res.status(200).json(updated);
  } catch (err) {
    try { await session.abortTransaction(); } catch {}
    console.error(err);
    return res.status(500).json({ message: err.message });
  } finally {
    session.endSession();
  }
}
}