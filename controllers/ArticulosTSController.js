const { ArticulosTS, Inventarios, TraspasosSalida, ArticulosTSolV2 } = require("../models");

module.exports = {
  findAll: (req, res) => {
    ArticulosTS.find()
    .populate({path: 'articulos', populate:{path: 'familias'}})
    .populate({path: 'articulos', populate:{path: 'lineas'}})
    .populate({path: 'articulos', populate:{path: 'colecciones'}})
      .then((respDB) => res.status(200).json(respDB))
      .catch((err) => console.log(err));
  },
  findOne: (req, res) => {
    const { id } = req.params;
    ArticulosTS.findById(id)
    .populate({path: 'articulos', populate:{path: 'familias'}})
    .populate({path: 'articulos', populate:{path: 'lineas'}})
    .populate({path: 'articulos', populate:{path: 'colecciones'}})
      .then((respDB) => res.status(200).json(respDB))
      .catch((err) => console.log(err));
  },
  findOneTraspasoSalida: (req, res) => {
    const { traspasoSalida } = req.params;
    ArticulosTS.find({ traspasosSalida: traspasoSalida })
    .populate({path: 'articulos', populate:{path: 'familias'}})
    .populate({path: 'articulos', populate:{path: 'lineas'}})
    .populate({path: 'articulos', populate:{path: 'colecciones'}})
      .populate({ path: "traspasosSalida", populate: { path: "areaDestino" } })
      .populate({ path: "traspasosSalida", populate: { path: "areaSalida" } })
      .populate("inventarios")
      .then((respDB) => res.status(200).json(respDB))
      .catch((err) => console.log(err));
  },
  // Reporte de traspasos: todas las líneas (ArticulosTS) cuyo traspaso esté en el
  // rango de fechas. Devuelve modelo, área salida, área entrada (destino),
  // cantidad y si ya está recibido.
  findReporteFechas: async (req, res) => {
    const { inicio, fin } = req.params;
    try {
      const traspasos = await TraspasosSalida.find({ fecha: { $gte: inicio, $lte: fin } })
        .populate("areaSalida")
        .populate("areaDestino");

      const map = {};
      traspasos.forEach((t) => { map[String(t._id)] = t; });
      const ids = traspasos.map((t) => t._id);

      const lineas = await ArticulosTS.find({ traspasosSalida: { $in: ids } })
        .populate("articulos");

      const data = lineas
        .map((a) => {
          const t = map[String(a.traspasosSalida?.[0])];
          if (!t) return null;
          const art = a.articulos?.[0];
          return {
            fecha: t.fecha,
            modelo: art ? `${art.codigo} ${art.nombre}` : "",
            codigo: art?.codigo || "",
            areaSalida: t.areaSalida?.[0]?.name || "",
            idAreaSalida: t.areaSalida?.[0]?._id || "",
            areaEntrada: t.areaDestino?.[0]?.name || "",
            idAreaEntrada: t.areaDestino?.[0]?._id || "",
            cantidad: a.cantidad,
            recibida: t.recibida,
            activo: t.is_active,
          };
        })
        .filter(Boolean)
        .sort((a, b) => (a.fecha < b.fecha ? 1 : -1));

      res.status(200).json(data);
    } catch (error) {
      res.status(400).json(error);
    }
  },
  create: async (req, res) => {
    const { body } = req;
    try {
      let inv = await Inventarios.findByIdAndUpdate( body.inventarios,   { $inc: { cantidad: -body.cantidad }}, { new: true } );

      let invEntrada = await Inventarios.findOneAndUpdate({ areas: [body.areaDestino], articulos: [body.articulos] },{ $inc: { cantidad: body.cantidad }, is_active: "Si", costoUnitario: body.costoUnitario, areas:body.areaDestino },{ new: true, upsert: true });

      const newArtTs = new ArticulosTS(body);
      const ArtTs = newArtTs.save();

      res.status(200).json({ message: "Se guardo el traspaso" });
    } catch (error) {
      res.status(400).json(error);
    }
  },
  delete: (req, res) => {
    ArticulosTS.findByIdAndDelete(req.params.id)
      .then((resDB) => res.status(204).json(resDB))
      .catch((err) => res.status(400).json(err));
  },
  edit: (req, res) => {
    const { body } = req;
    ArticulosTS.findByIdAndUpdate(req.params.id, body, { new: true })
      .then((resDB) => res.status(201).json(resDB))
      .catch((err) => res.status(400).json(err));
  },
  editCantidad: async (req, res) => {
    const { body } = req;
    let aa = await ArticulosTS.findByIdAndUpdate(
      req.params.id,
      { cantidad: body.cantidad, precio: body.precio, total:body.total },
      { new: true }
    );
    let bb = await Inventarios.findByIdAndUpdate(
      body.inventarios,
      { $inc: { cantidad: body.cantidadDiferencia } },
      { new: true }
    )
      .then((resDB) => res.status(201).json(resDB))
      .catch((err) => res.status(400).json(err));
      
  }
};
