const { MovimientosBancos, Bancos } = require('../models')

module.exports = { 
    findAll: (req, res)=>{
        MovimientosBancos.find()
            .populate('bancos')
            .populate('abonos')
            .populate('abonosProveedores')
            .populate('gastosGeneral')
            .populate('bancosTraspasos')
            .populate({ path: "gastosTiendas", populate: { path: "areas" } })
            .populate({ path: "anticipos", populate: { path: "clientes" } })
            .populate({ path: "comisiones", populate: { path: "colaboradores" } })
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOne: (req, res)=>{
        const { id } = req.params
        MovimientosBancos.findById(id)
            .populate('bancos')
            .populate('abonos')
            .populate('abonosProveedores')
            .populate('gastosGeneral')
            .populate('bancosTraspasos')
            .populate({ path: "gastosTiendas", populate: { path: "areas" } })
            .populate({ path: "anticipos", populate: { path: "clientes" } })
            .populate({ path: "comisiones", populate: { path: "colaboradores" } })
        .then((respDB)=> res.status(200).json(respDB))
        .catch((err)=> console.log(err))
    },
    findOneBanco: async (req, res)=>{
        const { banco } = req.params
        try {
        let movs = await MovimientosBancos.find({bancos:banco})
            .populate('bancos')
            .populate({ path: "abonos", populate: { path: "clientes" } })
            .populate({ path: "abonosTiendas", populate: { path: "areas" } })
            .populate({ path: "anticipos", populate: { path: "clientes" } })
            .populate({ path: "abonosProveedores", populate: { path: "proveedores" } })
            .populate({ path: "gastosGeneral", populate: { path: "categorias" } })
            .populate({ path: "comisiones", populate: { path: "colaboradores" } })
            .populate({ path: "gastosTiendas", populate: { path: "areas" } })
            .populate('bancosTraspasos')

            let array = movs
            .map((a) => {
              if(a.abonos!=""){
              return {
                fecha: a.fecha,
                abono: a.importe,
                movimiento: "Abono",
                cargo:0,
                numero: a.abonos[0].idAbono,
                observaciones: a.abonos[0].clientes[0].nombre_comercial,
                banco: a.bancos[0].banco + " " + a.bancos[0].cuenta,
                moneda: a.moneda
              }} else  if(a.abonosTiendas!=""){
                return {
                  fecha: a.fecha,
                  abono: a.importe,
                  movimiento: "Abono Tienda",
                  cargo:0,
                  numero: a.abonosTiendas[0].idAbonoTiendas,
                  observaciones: a.abonosTiendas[0].areas[0].name,
                  banco: a.bancos[0].banco + " " + a.bancos[0].cuenta,
                  moneda: a.moneda
                }}else  if(a.abonosTraspasos!=""){
                  return {
                    fecha: a.fecha,
                    abono: a.importe,
                    movimiento: "Abono de Tienda",
                    cargo:0,
                    numero: a.abonosTraspasos[0].idAbonoTraspaso,
                    observaciones: a.abonosTraspasos[0].areas[0].name,
                    banco: a.bancos[0].banco + " " + a.bancos[0].cuenta,
                    moneda: a.moneda
                  }} else if(a.abonosProveedores!=""){
                return {
                    fecha: a.fecha,
                    abono: 0,
                    movimiento: "Pago Proveedor",
                    cargo: - a.importe,
                    numero: a.abonosProveedores[0].idAbonoProveedor,
                    observaciones: a.abonosProveedores[0].proveedores[0].nombre_comercial,
                    banco: a.bancos[0].banco + " " + a.bancos[0].cuenta,
                    moneda: a.moneda
              }} else if(a.comisiones!=""){
                return {
                    fecha: a.fecha,
                    abono: 0,
                    movimiento: "Pago Comision",
                    cargo: - a.importe,
                    numero: a.comisiones[0].idCamision,
                    observaciones: a.comisiones[0].colaboradores[0].nombre,
                    banco: a.bancos[0].banco + " " + a.bancos[0].cuenta,
                    moneda: a.moneda
              }} else if(a.anticipos!=""){
                return {
                    fecha: a.fecha,
                    abono:  a.importe,
                    movimiento: "Anticipo Cliente",
                    cargo: 0,
                    numero: a.anticipos[0].idAnticipo,
                    observaciones: a.anticipos[0].clientes[0].nombre_comercial,
                    banco: a.bancos[0].banco + " " + a.bancos[0].cuenta,
                    moneda: a.moneda
              }} else if(a.gastosGeneral!=""){
                return {
                    fecha: a.fecha,
                    abono: 0,
                    movimiento: "Gasto",
                    cargo: - a.importe,
                    numero: a.gastosGeneral[0].idGastoGeneral,
                    observaciones: a.gastosGeneral[0].categorias[0].name,
                    banco: a.bancos[0].banco + " " + a.bancos[0].cuenta,
                    moneda: a.moneda
              }}  else if(a.gastosTiendas!=""){
                return {
                    fecha: a.fecha,
                    abono: 0,
                    movimiento: "Gasto Tienda",
                    cargo: - a.importe,
                    numero: a.gastosTiendas[0].idGastoTiendas,
                    observaciones: a.gastosTiendas[0].areas[0].name,
                    banco: a.bancos[0].banco + " " + a.bancos[0].cuenta,
                    moneda: a.moneda
              }} else if(a.bancosTraspasos!=""){
                if(a.tipo == "Ingreso"){
                return {
                    fecha: a.fecha,
                    abono: a.importe,
                    movimiento: "Ingreso por Traspaso",
                    cargo: 0,
                    numero: a.bancosTraspasos[0].idBancoTraspaso,
                    observaciones: "NA",
                    banco: a.bancos[0].banco + " " + a.bancos[0].cuenta,
                    moneda: a.moneda
              }} else{
                return {
                    fecha: a.fecha,
                    abono: 0,
                    movimiento: "Egreso por Traspaso",
                    cargo: - a.importe,
                    numero: a.bancosTraspasos[0].idBancoTraspaso,
                    observaciones: "NA",
                    banco: a.bancos[0].banco + " " + a.bancos[0].cuenta,
                    moneda: a.moneda
              }
              }
            }
            })
            .filter(function (el) {
              return el != null;
            })

            let dataFinal = Object.values(array)
            res.status(200).json(dataFinal);
        } catch (error) {
          res.status(400).json(error);
        }
    },
    findOneFechas: async (req, res)=>{
        const { inicio, fin } = req.params
        try {
            let movs = await MovimientosBancos.find({fecha:{$gte: inicio, $lte: fin}})
                .populate('bancos')
                .populate({ path: "abonos", populate: { path: "clientes" } })
                .populate({ path: "abonosTiendas", populate: { path: "areas" } })
                .populate({ path: "abonosProveedores", populate: { path: "proveedores" } })
                .populate({ path: "gastosGeneral", populate: { path: "categorias" } })
                .populate('bancosTraspasos')
                .populate({ path: "anticipos", populate: { path: "clientes" } })
                .populate({ path: "comisiones", populate: { path: "colaboradores" } })
                .populate({ path: "gastosTiendas", populate: { path: "areas" } })
    
                let array = movs
                .map((a) => {
                  if(a.abonos!=""){
                  return {
                    fecha: a.fecha,
                    importe: a.importe,
                    movimiento: "Abono",
                    numero: a.abonos[0].idAbono,
                    observaciones: a.abonos[0].clientes[0].nombre_comercial,
                    banco: a.bancos[0].banco + " " + a.bancos[0].cuenta,
                    moneda: a.moneda
                  }} else if(a.abonosProveedores!=""){
                    return {
                        fecha: a.fecha,
                        movimiento: "Pago Proveedor",
                        importe: - a.importe,
                        numero: a.abonosProveedores[0].idAbonoProveedor,
                        observaciones: a.abonosProveedores[0].proveedores[0].nombre_comercial,
                        banco: a.bancos[0].banco + " " + a.bancos[0].cuenta,
                        moneda: a.moneda
                  }} else if(a.abonosTiendas!=""){
                    return {
                        fecha: a.fecha,
                        movimiento: "Abono Tienda",
                        importe: a.importe,
                        numero: a.abonosTiendas[0].idAbonoTiendas,
                        observaciones: a.abonosTiendas[0].areas[0].name,
                        banco: a.bancos[0].banco + " " + a.bancos[0].cuenta,
                        moneda: a.moneda
                  }} else if(a.abonosTraspasos!=""){
                    return {
                        fecha: a.fecha,
                        movimiento: "Abono de Tienda",
                        importe: a.importe,
                        numero: a.abonosTraspasos[0].idAbonoTraspaso,
                        observaciones: a.abonosTraspasos[0].areas[0].name,
                        banco: a.bancos[0].banco + " " + a.bancos[0].cuenta,
                        moneda: a.moneda
                  }} else if(a.anticipos!=""){
                    return {
                        fecha: a.fecha,
                        movimiento: "Anticipo Cliente",
                        importe: a.importe,
                        numero: a.anticipos[0].idAnticipo,
                        observaciones: a.anticipos[0].clientes[0].nombre_comercial,
                        banco: a.bancos[0].banco + " " + a.bancos[0].cuenta,
                        moneda: a.moneda
                  }}  else if(a.gastosGeneral!=""){
                    return {
                        fecha: a.fecha,
                        movimiento: "Gasto",
                        importe: - a.importe,
                        numero: a.gastosGeneral[0].idGastoGeneral,
                        observaciones: a.gastosGeneral[0].categorias[0].name,
                        banco: a.bancos[0].banco + " " + a.bancos[0].cuenta,
                        moneda: a.moneda
                  }}  else if(a.gastosTiendas!=""){
                    return {
                        fecha: a.fecha,
                        movimiento: "Gasto Tienda",
                        importe: - a.importe,
                        numero: a.gastosTiendas[0].idGastoTiendas,
                        observaciones: a.gastosTiendas[0].areas[0].name,
                        banco: a.bancos[0].banco + " " + a.bancos[0].cuenta,
                        moneda: a.moneda
                  }} else if(a.comisiones!=""){
                    return {
                        fecha: a.fecha,
                        movimiento: "Pago Comision",
                        importe: - a.importe,
                        numero: a.comisiones[0].idComision,
                        observaciones: a.comisiones[0].colaboradores[0].nombre,
                        banco: a.bancos[0].banco + " " + a.bancos[0].cuenta,
                        moneda: a.moneda
                  }}  else if(a.bancosTraspasos!=""){
                    if(a.tipo == "Ingreso"){
                    return {
                        fecha: a.fecha,
                        importe: a.importe,
                        movimiento: "Ingreso por Traspaso",
                        numero: a.bancosTraspasos[0].idBancoTraspaso,
                        observaciones: a.bancos[0].banco + " " + a.bancos[0].cuenta,
                        banco: a.bancos[0].banco + " " + a.bancos[0].cuenta,
                        moneda: a.moneda
                  }}else{
                    return {
                        fecha: a.fecha,
                        movimiento: "Egreso por Traspaso",
                        importe: - a.importe,
                        numero: a.bancosTraspasos[0].idBancoTraspaso,
                        observaciones: a.bancos[0].banco + " " + a.bancos[0].cuenta,
                        banco: a.bancos[0].banco + " " + a.bancos[0].cuenta,
                        moneda: a.moneda
                  }
                  }
                }
                })
                .filter(function (el) {
                  return el != null;
                })
    
                let dataFinal = Object.values(array)
                res.status(200).json(dataFinal);
            } catch (error) {
              res.status(400).json(error);
            }
    },
    create: async (req, res)=>{
        const { body } = req

        if(body.tipo == "Ingreso"){
              const saldoBanco = await Bancos.findByIdAndUpdate(body.bancos, {$inc:{abonos: body.importe}}, {new:true})
          }else{
            const saldoBanco = await Bancos.findByIdAndUpdate(body.bancos, {$inc:{cargos: -body.importe}}, {new:true})
        }

        const newMovimientosBancos = new MovimientosBancos(body)
        newMovimientosBancos.save()
            .then((respDB)=> res.status(201).json(respDB))
            .catch((err)=> console.log(err))
    },
    delete: (req, res)=>{
        MovimientosBancos.findByIdAndDelete(req.params.id)
            .then((resDB)=> res.status(204).json(resDB))
            .catch((err)=> res.status(400).json(err))
    },
    edit: (req, res)=>{
        const { body } = req
        MovimientosBancos.findByIdAndUpdate(req.params.id, body, { new: true})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    },
}