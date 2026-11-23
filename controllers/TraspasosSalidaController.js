const { TraspasosSalida, Areas, ArticulosTS, Inventarios } = require('../models')

module.exports = {
    findAll: (req, res)=>{
        TraspasosSalida.find()
        .populate('areaDestino')
        .populate('areaSalida')
        .populate('user')
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOne: (req, res)=>{
        const { id } = req.params
        TraspasosSalida.findById(id)
        .populate('areaDestino')
        .populate('areaSalida')
        .populate('user')
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOneAlmacen: (req, res)=>{
        const { almacen } = req.params
        TraspasosSalida.find({areaDestino:almacen, recibida:"No", is_active:"Si"})
        .populate('areaDestino')
        .populate('areaSalida')
        .populate('user')
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOneAreaPagar: (req, res)=>{
        const { area } = req.params
        TraspasosSalida.find({areaDestino:area, saldo:{$gt:0}, is_active:"Si"})
        .populate('areaDestino')
        .populate('areaSalida')
        .populate('user')
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findFechas: (req, res)=>{
        const { inicio, fin } = req.params
        TraspasosSalida.find({fecha:{$gte: inicio, $lte: fin}})
        .populate('areaDestino')
        .populate('areaSalida')
        .populate('user')
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    create: async (req, res)=>{
        const { body } = req
        const saldoTienda = await Areas.findByIdAndUpdate(body.areaDestino, {$inc:{cargos: body.total_general, saldo: body.total_general}}, {new:true})
      

        const newTraspasos = new TraspasosSalida(body)
        const traspaso = newTraspasos.save()
            .then((respDB)=> res.status(201).json(respDB))
            .catch((err)=> console.log(err))
    },
    delete: (req, res)=>{
        TraspasosSalida.findByIdAndDelete(req.params.id)
            .then((resDB)=> res.status(204).json(resDB))
            .catch((err)=> res.status(400).json(err))
    },
    // Cancela un Traspaso Salida revirtiendo TODO lo que hizo la creación.
    // Solo se permite si NO ha sido recibido (recibida === "No").
    cancelar: async (req, res) => {
        try {
            const { id } = req.params;
            const traspaso = await TraspasosSalida.findById(id);
            if (!traspaso) return res.status(404).json({ message: "Traspaso no encontrado" });
            if (traspaso.recibida === "Si") {
                return res.status(400).json({ message: "No se puede cancelar: el traspaso ya fue recibido." });
            }
            if (traspaso.is_active === "No") {
                return res.status(400).json({ message: "El traspaso ya está cancelado." });
            }

            const areaDestino = Array.isArray(traspaso.areaDestino) ? traspaso.areaDestino[0] : traspaso.areaDestino;
            const lineas = await ArticulosTS.find({ traspasosSalida: id, is_active: "Si" });

            for (const linea of lineas) {
                const invOrigen = Array.isArray(linea.inventarios) ? linea.inventarios[0] : linea.inventarios;
                const articulo = Array.isArray(linea.articulos) ? linea.articulos[0] : linea.articulos;
                const cant = parseFloat(linea.cantidad) || 0;

                // 1) Devolver al inventario ORIGEN lo que había salido
                if (invOrigen) {
                    await Inventarios.findByIdAndUpdate(invOrigen, { $inc: { cantidad: cant } });
                }
                // 2) Quitar del inventario DESTINO lo que la creación había sumado
                if (areaDestino && articulo) {
                    await Inventarios.findOneAndUpdate(
                        { areas: areaDestino, articulos: articulo },
                        { $inc: { cantidad: -cant } }
                    );
                }
                // 3) Desactivar la línea del traspaso
                await ArticulosTS.findByIdAndUpdate(linea._id, { is_active: "No" });
            }

            // 4) Revertir el cargo financiero que la creación sumó al área destino
            if (areaDestino) {
                await Areas.findByIdAndUpdate(areaDestino, {
                    $inc: {
                        cargos: -(traspaso.total_general || 0),
                        saldo: -(traspaso.total_general || 0),
                    },
                });
            }

            // 5) Marcar el traspaso como cancelado (baja lógica) y como recibida="Si"
            //    para que ya no aparezca como pendiente ni permita editar artículos.
            await TraspasosSalida.findByIdAndUpdate(id, { is_active: "No", recibida: "Si" });

            return res.status(200).json({ message: "Traspaso cancelado y revertido correctamente" });
        } catch (error) {
            console.error("Error cancelando traspaso salida:", error);
            return res.status(500).json({ message: "Error al cancelar el traspaso", error: error.message });
        }
    },
edit: async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;

    // 1. Obtener el traspaso original
    const traspasoAnterior = await TraspasosSalida.findById(id);
    if (!traspasoAnterior) return res.status(404).json({ message: "Traspaso no encontrado" });

    // 2. Calcular diferencia del total
    const totalAnterior = parseFloat(traspasoAnterior.total_general || 0);
    const totalNuevo = parseFloat(body.total_general || body.total || 0);
    const diferencia = totalNuevo - totalAnterior;

    // 3. Actualizar el área destino
    if (traspasoAnterior.areaDestino) {
      await Areas.findByIdAndUpdate(
        traspasoAnterior.areaDestino,
        {
          $inc: {
            cargos: diferencia,
            saldo: diferencia
          }
        }
      );
    }

    // 4. Actualizar también el saldo dentro de TraspasosSalida
    const nuevoSaldo = (traspasoAnterior.saldo || 0) + diferencia;
    body.saldo = nuevoSaldo;

    // 5. Actualizar el traspaso
    const actualizado = await TraspasosSalida.findByIdAndUpdate(id, body, { new: true });

    res.status(200).json(actualizado);
  } catch (error) {
    console.error("Error actualizando traspaso:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
}


}