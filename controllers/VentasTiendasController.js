const { VentasTiendas, Clientes, ArticulosVentasTiendas, Inventarios, AbonosTiendas } = require('../models')

// Forma de pago de cada venta, sumada de sus abonos activos
// (cada abono guarda cuanto fue en efectivo, tdc, transfer, cortesia y nomina).
const FORMAS_PAGO = [
    ["efectivo", "Efectivo"],
    ["tdc", "TDC"],
    ["transfer", "Transferencia"],
    ["cortesia", "Cortesia"],
    ["nomina", "Nomina"],
]
const agregaFormaPago = async (ventas)=>{
    const ids = ventas.map((v)=> v._id)
    const abonos = await AbonosTiendas.find({ ventasTiendas: { $in: ids }, is_active: "Si" }).lean()
    const porVenta = {}
    abonos.forEach((a)=> {
        const k = String(Array.isArray(a.ventasTiendas) ? a.ventasTiendas[0] : a.ventasTiendas)
        porVenta[k] = porVenta[k] || {}
        FORMAS_PAGO.forEach(([campo])=> { porVenta[k][campo] = (porVenta[k][campo] || 0) + (parseFloat(a[campo]) || 0) })
    })
    const money = (n)=> "$" + n.toLocaleString("en-US", { maximumFractionDigits: 2 })
    return ventas.map((v)=> {
        const p = porVenta[String(v._id)] || {}
        const usadas = FORMAS_PAGO.filter(([campo])=> (p[campo] || 0) > 0)
        const formaPago = usadas.length === 0
            ? "Sin pago"
            : usadas.length === 1
                ? usadas[0][1]
                : usadas.map(([campo, nombre])=> `${nombre} ${money(p[campo])}`).join(" / ")
        return { ...v, formaPago, pagos: p }
    })
}

module.exports = { 
    findAll: (req, res)=>{
        VentasTiendas.find()
        .populate('clientes')
        .populate('colaboradores')
        .populate('areas')
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOne: (req, res)=>{
        const { id } = req.params
        VentasTiendas.findById(id)
        .populate('clientes')
        .populate('colaboradores')
        .populate('areas')
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOneCliente: (req, res)=>{
        const { cliente } = req.params
        VentasTiendas.find({clientes:cliente, "saldo"  : {$gt : 0}})
        .populate('clientes')
        .populate('colaboradores')
        .populate('areas')
        .then((respDB)=> res.status(200).json(respDB))
        .catch((err)=> console.log(err))
    },
    findOneClienteAbono: (req, res)=>{
        const { cliente } = req.params
        VentasTiendas.find({clientes:cliente, "saldo"  : {$gt : 0}, is_active:"Si"})
        .populate('clientes')
        .populate('colaboradores')
        .populate('areas')
        .then((respDB)=> res.status(200).json(respDB))
        .catch((err)=> console.log(err))
    },
    findOneClienteDevolucion: (req, res)=>{
        const { cliente } = req.params
        VentasTiendas.find({clientes:cliente})
        .populate('clientes')
        .populate('colaboradores')
        .populate('areas')
        .then((respDB)=> res.status(200).json(respDB))
        .catch((err)=> console.log(err))
    },
    findOneVentasDiario: (req, res)=>{
        const { almacen, inicio, fin } = req.params
        VentasTiendas.find({fecha:{$gte: inicio, $lte: fin},areas:almacen})
        .populate('clientes')
        .populate('colaboradores')
        .populate('areas')
        .lean()
            .then(agregaFormaPago)
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> { console.log(err); res.status(400).json({ message: err.message }) })
    },
    findOneCorte: (req, res)=>{
        const { almacen, inicio, fin } = req.params
        VentasTiendas.find({fecha:{$gte: inicio, $lte: fin},areas:almacen, is_active:"Si"})
        .populate('clientes')
        .populate('colaboradores')
        .populate('areas')
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOneCorteK: (req, res)=>{
        const { almacen, inicio, fin } = req.params
        VentasTiendas.find({fecha:{$gte: inicio, $lte: fin},areas:almacen, is_active:"Si", fiscal:"Si"})
        .populate('clientes')
        .populate('colaboradores')
        .populate('areas')
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOneVentasDiarioGeneral: (req, res)=>{
        const { inicio, fin } = req.params
        VentasTiendas.find({fecha:{$gte: inicio, $lte: fin}})
        .populate('clientes')
        .populate('colaboradores')
        .populate('areas')
        .lean()
            .then(agregaFormaPago)
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> { console.log(err); res.status(400).json({ message: err.message }) })
    },
    findPendienteSurtir: (req, res)=>{
        VentasTiendas.find({is_active:"Si", autorizadoSurtido:"Si", status:"Abierto"})
        .populate('clientes')
        .populate('colaboradores')
        .populate('areas')
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    create: async (req, res)=>{
        const { body } = req
        const saldoCliente = await Clientes.findByIdAndUpdate(body.clientes, {$inc:{cargos: body.total_general, saldo: body.total_general}}, {new:true})

        const newVentasTiendas = new VentasTiendas(body)
        const pedido = newVentasTiendas.save()
            .then((respDB)=> res.status(201).json(respDB))
            .catch((err)=> console.log(err))
    },
    delete: (req, res)=>{
        VentasTiendas.findByIdAndDelete(req.params.id)
            .then((resDB)=> res.status(204).json(resDB))
            .catch((err)=> res.status(400).json(err))
    },
    edit: async (req, res)=>{
        const { body } = req
        let ped = await VentasTiendas.findByIdAndUpdate(req.params.id, body, { new: true})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    },
    cancel:async(req, res)=>{
        let temp1 = await VentasTiendas.findById(req.params.id)
        let temp2 = await ArticulosVentasTiendas.find({ventasTiendas:req.params.id})
        let temp22 = Object.values(temp2);

        let abo=0
        let temp66 = await AbonosTiendas.find({ventasTiendas:req.params.id})

        let TEfe = temp66.map((c) => parseFloat(c.total));
        abo = TEfe.reduce((t, total, index) => t + total, 0);

      temp22.map(async(a)=>{
            await Inventarios.updateOne({articulos:a.articulos, areas:temp1.areas}, {$inc:{cantidad:a.cantidad}},{new:true})
        })

        let sal = temp1.total_general - abo

        let temp6 = await AbonosTiendas.updateMany({ventasTiendas:req.params.id}, {total: 0, efectivo:0, transfer:0, tdc:0, nomina:0, cortesia:0, is_active:"No"}, { new: true})

        let temp3 = await Clientes.findByIdAndUpdate(temp1.clientes, {$inc:{cargos: -temp1.total_general, saldo: -sal, abonos: -abo}}, { new: true})

        let temp4 = await VentasTiendas.findByIdAndUpdate(req.params.id, {is_active:"No"}, { new: true})
        let temp5 = await ArticulosVentasTiendas.updateMany({ventasTiendas:req.params.id}, {cantidad:0}, { new: true})

        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    },
}