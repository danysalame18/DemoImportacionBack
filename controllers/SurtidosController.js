const { Surtidos, Clientes, ArticulosSurtidos, ArticulosPedido, Inventarios, Abonos, Colaboradores, Pedidos } = require('../models')

const moment = require('moment-timezone'); 
const now = moment().tz('America/Mexico_City');
const fechaLimite = now.clone().subtract(48, 'hours');

module.exports = { 
    findAll: (req, res)=>{
        Surtidos.find()
        .populate('user')
        .populate('colaboradores')
        .populate('areas')
        .populate({path: 'pedidos', populate:{path: 'clientes'}})
        .populate({path: 'pedidos', populate:{path: 'colaboradores'}})
        .populate({path: 'clientes', populate:{path: 'vendedor'}})
        .populate({path: 'clientes', populate:{path: 'departamentosClientes'}})
        .populate("empresas")
        .populate("facturas")
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOne: (req, res)=>{
        const { id } = req.params
        Surtidos.findById(id)
        .populate('user')
        .populate('colaboradores')
        .populate('areas')
        .populate({path: 'pedidos', populate:{path: 'clientes'}})
        .populate({path: 'pedidos', populate:{path: 'colaboradores'}})
        .populate({path: 'clientes', populate:{path: 'vendedor'}})
        .populate({path: 'clientes', populate:{path: 'departamentosClientes'}})
        .populate("empresas")
        .populate("facturas")
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findNoEvidencia: (req, res)=>{

        Surtidos.find({fotoEvidencia:"No", is_active:"Si", createdAt: { $lt: fechaLimite.toDate() }})
        .populate('user')
        .populate('colaboradores')
        .populate('areas')
        .populate({path: 'pedidos', populate:{path: 'clientes'}})
        .populate({path: 'pedidos', populate:{path: 'colaboradores'}})
        .populate({path: 'clientes', populate:{path: 'vendedor'}})
        .populate({path: 'clientes', populate:{path: 'departamentosClientes'}})
        .populate("empresas")
        .populate("facturas")
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOneFechas: (req, res)=>{
        const { inicio, fin } = req.params
        Surtidos.find({fecha:{$gte: inicio, $lte: fin}})
        .populate('user')
        .populate('areas')
        .populate({path: 'pedidos', populate:{path: 'clientes'}})
        .populate({path: 'pedidos', populate:{path: 'colaboradores'}})
        .populate({path: 'clientes', populate:{path: 'departamentosClientes'}})
        .populate("empresas")
        .populate("facturas")
        .lean()
        .then((respDB)=> res.status(200).json(respDB))
        .catch((err)=> console.log(err))
    },
    findOneCliente: (req, res)=>{
        const { cliente } = req.params
        Surtidos.find({clientes:cliente, saldo:{$gt:0}, is_active:"Si"
        //     , $or: [
        //     { impuestos: 0 },
        //     { impuestos: 16, facturado: "NA" }
        //   ]
        })
        .populate('user')
        .populate('colaboradores')
        .populate('areas')
        .populate({path: 'pedidos', populate:{path: 'clientes'}})
        .populate({path: 'pedidos', populate:{path: 'colaboradores'}}) 
        .populate({path: 'clientes', populate:{path: 'vendedor'}})
        .populate({path: 'clientes', populate:{path: 'departamentosClientes'}})
        .populate("empresas")
        .populate("facturas")
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOneColaborador: (req, res) => {
        const { colaborador } = req.params;
        Surtidos.find({
          colaboradores: colaborador,
          comisionPagada: "No",
          saldo:0,
          subTotal:{$gt:0},
          is_active: "Si",
        })
        .populate('user')
        .populate('colaboradores')
        .populate('areas')
        .populate({path: 'pedidos', populate:{path: 'clientes'}})
        .populate({path: 'pedidos', populate:{path: 'colaboradores'}}) 
        .populate({path: 'clientes', populate:{path: 'vendedor'}})
        .populate({path: 'clientes', populate:{path: 'departamentosClientes'}})
        .populate("empresas")
        .populate("facturas")
          .then((respDB) => res.status(200).json(respDB))
          .catch((err) => console.log(err));
      },
      findOneColaboradorCliente: (req, res) => {
        const { colaborador, cliente } = req.params;
        Surtidos.find({
          colaboradores: colaborador,
          clientes: cliente,
          comisionPagada: "No",
          saldo:0,
          subTotal:{$gt:0},
          is_active: "Si",
        })
        .populate('user')
        .populate('colaboradores')
        .populate('areas')
        .populate({path: 'pedidos', populate:{path: 'clientes'}})
        .populate({path: 'pedidos', populate:{path: 'colaboradores'}}) 
        .populate({path: 'clientes', populate:{path: 'vendedor'}})
        .populate({path: 'clientes', populate:{path: 'departamentosClientes'}})
        .populate("empresas")
        .populate("facturas")
          .then((respDB) => res.status(200).json(respDB))
          .catch((err) => console.log(err));
      },
    findOneClienteEdoCta: (req, res)=>{
        const { cliente } = req.params
        Surtidos.find({clientes:cliente, is_active:"Si"})
        .populate('user')
        .populate('colaboradores')
        .populate('areas')
        .populate({path: 'pedidos', populate:{path: 'clientes'}})
        .populate({path: 'pedidos', populate:{path: 'colaboradores'}}) 
        .populate({path: 'clientes', populate:{path: 'vendedor'}})
        .populate({path: 'clientes', populate:{path: 'departamentosClientes'}})
        .populate("empresas")
        .populate("facturas")
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOneClienteDevolucion: (req, res)=>{
        const { cliente } = req.params
        Surtidos.find({clientes:cliente, is_active:"Si"})
        .populate('areas')
        .populate('user')
        .populate('colaboradores')
        .populate('areas')
        .populate({path: 'pedidos', populate:{path: 'clientes'}})
        .populate({path: 'pedidos', populate:{path: 'colaboradores'}})
        .populate({path: 'clientes', populate:{path: 'vendedor'}})
        .populate({path: 'clientes', populate:{path: 'departamentosClientes'}})
        .populate("empresas")
        .populate("facturas")
        .then((respDB)=> res.status(200).json(respDB))
        .catch((err)=> console.log(err))
    },
    findCalificadoraCliente: async (req, res)=>{

        const { cliente } = req.params
        try{
            
    const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    
    // let sur = await Surtidos.find({clientes:cliente, is_active:"Si", total_general:{$gt:0}})
    //     .populate('user')
    //     .populate('colaboradores')
    //     .populate('areas')
    //     .populate({path: 'pedidos', populate:{path: 'clientes'}})
    //     .populate({path: 'pedidos', populate:{path: 'colaboradores'}}) 
    //     .populate({path: 'clientes', populate:{path: 'vendedor'}})
    //     .populate({path: 'clientes', populate:{path: 'departamentosClientes'}})

    //     let arraySur = await sur.map((a) => {
    //         return {
    //           idSurtido: a._id,
    //           nota: a.idSurtido,
    //           idAbono:"",
    //           fechaSurtido: a.fecha,
    //           total_general: a.total_general,
    //           saldo: a.saldo,
    //           fechaAbono: ""
    //         };
    //       });
           
    //     let ids = await sur.map((a) => a._id);
        
        let abo = await Abonos.find({ clientes:cliente})
        .populate('bancos')
        .populate({path: 'clientes', populate:{path: 'vendedor'}})
        .populate({path: 'clientes', populate:{path: 'areas'}})
        .populate({path: 'surtidos', populate:{path: 'pedidos'}})
        .populate({path: 'notasCargo'})


        let arrayAbo = await abo.map((a) => {
            if(a.surtidos!=""){
            let firstDate = new Date(a.surtidos[0].fecha);
            let secondDate = new Date(a.fecha);
            return {
                idAbono: a._id,
                idSurtido: a.surtidos[0]._id,
                total_general: a.surtidos[0].total_general,
                fechaAbono: a.fecha,
                fechaSurtido:a.surtidos[0].fecha,
                nota:a.surtidos[0].idSurtido,
                saldo:a.surtidos[0].saldo,
                concepto: a.concepto,
                plazo: a.clientes[0].plazo,
                diffDays: Math.round(Math.ceil((secondDate - firstDate) / oneDay)),
                importe:a.importe
            }}else{
                let firstDate = new Date(a.notasCargo[0].fecha);
                let secondDate = new Date(a.fecha);
                return {
                    idAbono: a._id,
                    idSurtido: a.notasCargo[0]._id,
                    total_general: a.notasCargo[0].importe,
                    fechaAbono: a.fecha,
                    fechaSurtido:a.notasCargo[0].fecha,
                    nota:a.notasCargo[0].idNotaCargo,
                    saldo:a.notasCargo[0].saldo,
                    concepto: a.concepto,
                    plazo: a.clientes[0].plazo,
                    diffDays: Math.round(Math.ceil((secondDate - firstDate) / oneDay)),
                    importe:a.importe
                }

            }
          })
          .filter(function (el) {
            return el != null;
          })
        
          let temp4 = Object.values(arrayAbo);

        // let temp = arraySur.concat(arrayAbo)

        // let agrupado = temp.reduce(function (groups, item) {
        //     const val = item["idSurtido"]
        //     groups[val] = groups[val] || {
        //       idSurtido: item.idSurtido,
        //       total_general: 0,
        //       fechaSurtido:"",
        //       nota:"",
        //       saldo:0
        //     };
        //     groups[val].idSurtido = item.idSurtido;
        //     groups[val].idAbono = item.idAbono;
        //     groups[val].nota += item.nota;
        //     groups[val].saldo += item.saldo;
        //     groups[val].fechaSurtido += item.fechaSurtido;
        //     groups[val].fechaAbono = item.fechaAbono;
        //     groups[val].total_general += item.total_general;
        //     return groups;
        //   }, []);
    
        //   let temp2 = Object.values(agrupado);


        //   let array = await temp2.map((a) => {
        //     let firstDate = new Date(a.fechaSurtido);
        //     let secondDate = new Date(a.fechaAbono);
        //     return {
        //         idAbono:a.idAbono,
        //         idSurtido:a.idSurtido,
        //         nota:a.nota,
        //         total_general:a.total_general,
        //         saldo: a.saldo,
        //         fechaAbono:a.fechaAbono,
        //         fechaSurtido:a.fechaSurtido,
        //         diffDays: Math.round(Math.ceil((secondDate - firstDate) / oneDay))
        //     };
        //   });

        //   let temp3 = Object.values(array);

            res.status(200).json(temp4);
        } catch (error) {
        res.status(400).json(error);
        }
    },
    create: async (req, res)=>{
        const { body } = req

        // if(body.iva == 0){
        const saldoCliente = await Clientes.findByIdAndUpdate(body.clientes, {$inc:{cargos: body.total_general, saldo: body.total_general}}, {new:true})
        // }
        
        const ped = await Pedidos.findByIdAndUpdate(body.pedidos, {$inc:{piezasEntregadas: body.total_cantidad, piezasPendientes: -body.total_cantidad}}, {new:true})

        const newSurtidos = new Surtidos(body)
        newSurtidos.save()
            .then((respDB)=> res.status(201).json(respDB))
            .catch((err)=> { console.log(err); res.status(400).json(err) })
    },
    // Crea la nota Y sus articulos en UNA sola peticion, todo o nada.
    // Antes el front creaba el surtido y despues mandaba un POST por articulo:
    // si la pestana se cerraba (o fallaba uno) quedaba una nota sin renglones,
    // y el PDF sacado en esa ventana salia en blanco.
    createCompleto: async (req, res) => {
        const { articulos = [], ...cabecera } = req.body || {}

        if (!Array.isArray(articulos) || articulos.length === 0) {
            return res.status(400).json({ message: "La nota no trae articulos" })
        }

        let surtidoCreado = null
        const invAplicados = []   // para revertir si algo truena
        const apAplicados = []

        try {
            surtidoCreado = await new Surtidos(cabecera).save()

            for (const a of articulos) {
                const cantidad = parseFloat(a.cantidad) || 0
                if (cantidad <= 0) continue

                await new ArticulosSurtidos({
                    ...a,
                    cantidad,
                    surtidos: surtidoCreado._id,
                }).save()

                if (a.inventarios) {
                    await Inventarios.findByIdAndUpdate(a.inventarios, { $inc: { cantidad: -cantidad } })
                    invAplicados.push({ id: a.inventarios, cantidad })
                }

                const ap = await ArticulosPedido.findOneAndUpdate(
                    { pedidos: [cabecera.pedidos], articulos: [a.articulos] },
                    { $inc: { surtido: cantidad, pendiente_surtir: -cantidad } },
                    { new: true }
                )
                if (ap) apAplicados.push({ id: ap._id, cantidad })
            }

            // Los saldos se mueven al final, ya con todo guardado
            await Clientes.findByIdAndUpdate(cabecera.clientes, {
                $inc: { cargos: cabecera.total_general, saldo: cabecera.total_general },
            })
            await Pedidos.findByIdAndUpdate(cabecera.pedidos, {
                $inc: { piezasEntregadas: cabecera.total_cantidad, piezasPendientes: -cabecera.total_cantidad },
            })

            res.status(201).json(surtidoCreado)
        } catch (error) {
            console.log("Error en createCompleto, revirtiendo:", error)
            try {
                for (const i of invAplicados) {
                    await Inventarios.findByIdAndUpdate(i.id, { $inc: { cantidad: i.cantidad } })
                }
                for (const a of apAplicados) {
                    await ArticulosPedido.findByIdAndUpdate(a.id, { $inc: { surtido: -a.cantidad, pendiente_surtir: a.cantidad } })
                }
                if (surtidoCreado) {
                    await ArticulosSurtidos.deleteMany({ surtidos: surtidoCreado._id })
                    await Surtidos.findByIdAndDelete(surtidoCreado._id)
                }
            } catch (e) {
                console.log("Error revirtiendo:", e)
            }
            res.status(400).json({ message: "No se guardo la nota, no se aplico ningun movimiento", error: String(error) })
        }
    },
    delete: (req, res)=>{
        Surtidos.findByIdAndDelete(req.params.id)
            .then((resDB)=> res.status(204).json(resDB))
            .catch((err)=> res.status(400).json(err))
    },
    edit: (req, res)=>{
        const { body } = req
        Surtidos.findByIdAndUpdate(req.params.id, body, { new: true})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    },
    cancel:async(req, res)=>{
        try {
            const surtido = await Surtidos.findById(req.params.id)
            if (!surtido) return res.status(404).json({ message: "No existe la nota" })
            if (surtido.is_active === "No") return res.status(400).json({ message: "La nota ya estaba cancelada" })

            const articulos = await ArticulosSurtidos.find({ surtidos: req.params.id })

            // Se revierte CADA renglon esperando a que termine. Antes era un
            // .map(async...) sin await: las reversiones corrian sueltas y el
            // updateMany que pone cantidad:0 (mas abajo) podia ganarles la
            // carrera, dejando inventario y pedido sin devolver.
            for (const a of articulos) {
                const cantidad = a.cantidad || 0
                if (cantidad <= 0) continue
                if (a.articulosPedido) {
                    await ArticulosPedido.findByIdAndUpdate(a.articulosPedido, { $inc: { surtido: -cantidad, pendiente_surtir: cantidad } })
                }
                if (a.inventarios) {
                    await Inventarios.findByIdAndUpdate(a.inventarios, { $inc: { cantidad: cantidad } })
                }
            }

            await Clientes.findByIdAndUpdate(surtido.clientes, {
                $inc: { cargos: -surtido.total_general, saldo: -surtido.total_general },
            })
            // Al cancelar, las piezas vuelven a estar PENDIENTES: antes restaba
            // en los dos campos y el pedido quedaba con pendientes en negativo.
            await Pedidos.findByIdAndUpdate(surtido.pedidos, {
                $inc: { piezasEntregadas: -surtido.total_cantidad, piezasPendientes: surtido.total_cantidad },
            })

            await Surtidos.findByIdAndUpdate(req.params.id, { is_active: "No" })
            await ArticulosSurtidos.updateMany({ surtidos: req.params.id }, { cantidad: 0 })

            res.status(201).json({ message: "Nota cancelada" })
        } catch (err) {
            console.log("Error cancelando nota:", err)
            res.status(400).json(err)
        }
    },

    findOneFactura: (req, res)=>{
        const { factura } = req.params
        Surtidos.find({facturas:factura})
        .populate('user')
        .populate('empresas')
        .populate({path: 'pedidos', populate:{path: 'clientes'}})
        .populate({path: 'clientes', populate:{path: 'vendedor'}})
        .populate("articulos")
        .populate("colaboradores")
        .populate('sociedades')
        .populate('articulos')
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOneFacturacion: (req, res)=>{
        const { cliente, empresa } = req.params
        Surtidos.find({clientes:cliente,  
            // empresas:empresa, 
            is_active:"Si", facturado:"No"})
        .populate('user')
        .populate('empresas')
        .populate({path: 'pedidos', populate:{path: 'clientes'}})
        .populate({path: 'clientes', populate:{path: 'vendedor'}})
        .populate("articulos")
        .populate("colaboradores")
        .populate('sociedades')
        .populate('articulos')
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    editFactura: async (req, res)=>{
        const { body } = req
        
        let art = await ArticulosSurtidos.updateMany({surtidos: req.params.id}, {facturas: body.facturas, facturado:"Si"}, { new: true})

        let s = await Surtidos.findByIdAndUpdate(req.params.id, body, { new: true})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    },


    // desarrollo: async(req, res)=>{
    //     try{
    //    let sur = await Pedidos.find()
    //     // .populate({path: 'clientes', populate:{path: 'departamentosClientes'}})
    
    //     let A1 = sur.slice(2990,4000)

    //     A1.map(async(a)=>{
    //         await Pedidos.findByIdAndUpdate(a._id, {fecha_entrega: a.fecha, fecha_estimada: a.fecha}, { new: true})
    //     })
    //      res.status(200).json("Ya acabe");
    // } catch (error) {
    //     res.status(400).json(error);
    // }

    // },
}



