const { Embarques, ComprasAcumulados, Proveedores, ArticulosEmbarques, ArticulosOC, OrdenesCompra, NotasCxP } = require('../models')
const { EmbarquesService } = require('../services')

module.exports = { 
    findAll: (req, res)=>{
        Embarques.find()
        .populate('creado')
        .populate('brokers')
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOne: (req, res)=>{
        const { id } = req.params
        Embarques.findById(id)
        .populate('creado')
        .populate('brokers')
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    create: async (req, res)=>{
        const { body } = req
        try{
            const embarquesExists = await EmbarquesService.findOneByContenedor(body.contenedor)
            if (embarquesExists) {res.status(400).json({message: 'Este contenedor ya esta registrado'})}
            else{
            const newEmbarques = new Embarques(body)
            const embarques = await newEmbarques.save()
            res.status(201).json(embarques)
            }

        }catch (error) {
           res.status(400).json(error)
           console.log(error)
       }
    },
    delete: (req, res)=>{
        Embarques.findByIdAndDelete(req.params.id)
            .then((resDB)=> res.status(204).json(resDB))
            .catch((err)=> res.status(400).json(err))
    },
    edit: (req, res)=>{
        const { body } = req
        Embarques.findByIdAndUpdate(req.params.id, body, { new: true})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    },
    // Editar articulos del contenedor en UNA peticion, todo o nada.
    // Cada proveedor tiene su propia NotaCxP: si se agregan articulos de un
    // proveedor que no estaba en el embarque, se le crea su nota.
    // Antes el front mandaba ~40 peticiones sueltas y actualizaba solo la
    // primera nota con el total de TODO el embarque.
    // body: { existentes: [{ id, cantidad }],
    //         nuevos: [{ articulosOC, articulos, proveedores, cantidad, costo, costoUSD }] }
    editArticulos: async (req, res)=>{
        const { id } = req.params
        const { existentes = [], nuevos = [] } = req.body || {}
        const num = (v)=> { const n = parseFloat(v); return Number.isFinite(n) ? n : 0 }
        const r2 = (n)=> Math.round((num(n) + Number.EPSILON) * 100) / 100
        const primero = (v)=> Array.isArray(v) ? v[0] : v
        const deshacer = []   // se corre al reves si algo truena

        try {
            const emb = await Embarques.findById(id)
            if (!emb) return res.status(404).json({ message: "No existe el embarque" })

            const arts = await ArticulosEmbarques.find({ embarques: id })
            const artsPorId = {}
            arts.forEach((a)=> { artsPorId[String(a._id)] = a })

            // ---- Validaciones antes de mover nada
            for (const e of existentes) {
                if (!artsPorId[String(e.id)]) return res.status(400).json({ message: "Un articulo ya no pertenece a este embarque, recarga la pantalla" })
                if (num(e.cantidad) < 0) return res.status(400).json({ message: "No puede haber cantidades negativas" })
            }
            const nuevosValidos = nuevos.filter((n)=> n.articulos && num(n.cantidad) > 0)
            const ocs = {}
            for (const n of nuevosValidos) {
                if (!n.proveedores) return res.status(400).json({ message: "Falta el proveedor en un renglon nuevo" })
                const aoc = await ArticulosOC.findById(n.articulosOC)
                if (!aoc) return res.status(400).json({ message: "Falta la OC en un renglon nuevo" })
                ocs[String(n.articulosOC)] = aoc
            }

            const moverOC = async (articulosOC, cantidad)=> {
                if (!cantidad) return
                const aoc = ocs[String(articulosOC)] || await ArticulosOC.findById(articulosOC)
                if (!aoc) return
                const oc = primero(aoc.ordenesCompra)
                await ArticulosOC.findByIdAndUpdate(aoc._id, { $inc: { embarcado: cantidad, pendiente_embarcar: -cantidad } })
                if (oc) await OrdenesCompra.findByIdAndUpdate(oc, { $inc: { embarcado: cantidad } })
                deshacer.push(async ()=> {
                    await ArticulosOC.findByIdAndUpdate(aoc._id, { $inc: { embarcado: -cantidad, pendiente_embarcar: cantidad } })
                    if (oc) await OrdenesCompra.findByIdAndUpdate(oc, { $inc: { embarcado: -cantidad } })
                })
            }

            // ---- 1. Existentes: cantidad nueva contra lo que hay en la base
            for (const e of existentes) {
                const a = artsPorId[String(e.id)]
                const nueva = num(e.cantidad)
                const delta = nueva - num(a.cantidad)
                if (!delta) continue
                // costo unitario que ya traia el renglon (respeta USD/CNY del alta)
                const unit = num(a.cantidad) > 0 ? num(a.total_costo) / num(a.cantidad) : (num(a.costoUSD) || num(a.costo))
                const totalAnterior = a.total_costo
                await ArticulosEmbarques.findByIdAndUpdate(a._id, { total_costo: r2(unit * nueva), $inc: { cantidad: delta, pendiente_recibir: delta } })
                deshacer.push(()=> ArticulosEmbarques.findByIdAndUpdate(a._id, { total_costo: totalAnterior, $inc: { cantidad: -delta, pendiente_recibir: -delta } }))
                await moverOC(primero(a.articulosOC), delta)
            }

            // ---- 2. Nota por proveedor (la que ya tenga en el embarque o una nueva)
            const notaPorProveedor = {}
            arts.forEach((a)=> {
                const p = String(primero(a.proveedores))
                if (!notaPorProveedor[p] && primero(a.notasCxP)) notaPorProveedor[p] = String(primero(a.notasCxP))
            })
            for (const n of nuevosValidos) {
                const p = String(n.proveedores)
                if (notaPorProveedor[p]) continue
                const existente = await NotasCxP.findOne({ embarques: id, proveedores: p, is_active: "Si" })
                if (existente) { notaPorProveedor[p] = String(existente._id); continue }
                const nota = await new NotasCxP({
                    proveedores: p,
                    embarques: id,
                    total_cantidad: 0,
                    total_costo: 0,
                    saldo: 0,
                    calidad: "No",
                    fecha: emb.fecha,
                    compraDirecta: "No",
                }).save()
                notaPorProveedor[p] = String(nota._id)
                deshacer.push(()=> NotasCxP.findByIdAndDelete(nota._id))
            }

            // ---- 3. Renglones nuevos
            for (const n of nuevosValidos) {
                const cantidad = num(n.cantidad)
                const costoUSD = num(n.costoUSD) || num(n.costo)
                const nuevo = await new ArticulosEmbarques({
                    articulosOC: n.articulosOC,
                    articulos: n.articulos,
                    cantidad,
                    recibido: 0,
                    pendiente_recibir: cantidad,
                    embarques: id,
                    notasCxP: notaPorProveedor[String(n.proveedores)],
                    costo: num(n.costo),
                    costoUSD,
                    total_costo: r2(costoUSD * cantidad),
                    proveedores: n.proveedores,
                    faltante: 0,
                    danado: 0,
                    impuestos: 0,
                    revisarFaltante: 10,
                    revisarDanado: 10,
                    pedirFaltante: 0,
                    pedirDanado: 10,
                    faltanteTotal: 0,
                    danadoTotal: 0,
                    descuentoFaltante: 0,
                    descuentoDanado: 0,
                    descuentoTotal: 0,
                    familias: "NA",
                    sup: "NA",
                    observaciones: "NA",
                    calidad: "No",
                }).save()
                deshacer.push(()=> ArticulosEmbarques.findByIdAndDelete(nuevo._id))
                await moverOC(n.articulosOC, cantidad)
            }

            // ---- 4. Recalcula cada nota con SUS articulos y mueve el saldo del proveedor
            const notas = []
            for (const notaId of [...new Set(Object.values(notaPorProveedor))]) {
                const nota = await NotasCxP.findById(notaId)
                if (!nota) continue
                const suyos = await ArticulosEmbarques.find({ embarques: id, notasCxP: notaId })
                const cant = suyos.reduce((t, a)=> t + num(a.cantidad), 0)
                const costo = r2(suyos.reduce((t, a)=> t + num(a.total_costo), 0))
                const dif = r2(costo - num(nota.total_costo))
                const proveedor = primero(nota.proveedores)
                const antes = { total_cantidad: nota.total_cantidad, total_costo: nota.total_costo }
                await NotasCxP.findByIdAndUpdate(notaId, { total_cantidad: cant, total_costo: costo, $inc: { saldo: dif } })
                if (dif) await Proveedores.findByIdAndUpdate(proveedor, { $inc: { cargos: dif, saldo: dif } })
                deshacer.push(async ()=> {
                    await NotasCxP.findByIdAndUpdate(notaId, { ...antes, $inc: { saldo: -dif } })
                    if (dif) await Proveedores.findByIdAndUpdate(proveedor, { $inc: { cargos: -dif, saldo: -dif } })
                })
                notas.push({ nota: nota.idNotasCxP, proveedor, total_cantidad: cant, total_costo: costo, dif })
            }

            // ---- 5. Totales del embarque
            const todos = await ArticulosEmbarques.find({ embarques: id })
            const totalCantidad = todos.reduce((t, a)=> t + num(a.cantidad), 0)
            const totalCosto = r2(todos.reduce((t, a)=> t + num(a.total_costo), 0))
            const embarque = await Embarques.findByIdAndUpdate(id, {
                total_cantidad: totalCantidad,
                total_costo: totalCosto,
                $inc: { saldo: r2(totalCosto - num(emb.total_costo)) },
            }, { new: true })

            res.status(200).json({ embarque, notas })
        } catch (error) {
            console.log("Error en editArticulos embarque:", error)
            for (const fn of deshacer.reverse()) {
                try { await fn() } catch (e) { console.log("No se pudo revertir:", e.message) }
            }
            res.status(400).json({ message: "No se pudo guardar, no se hizo ningun cambio", error: error.message })
        }
    }
}