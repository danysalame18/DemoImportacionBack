const { ConceptosGastosTiendas, GastosTiendas } = require('../models')
const { ConceptosGastosTiendasService } = require('../services')

module.exports = {
    // Siembra los conceptos que ya se usan en GastosTiendas + los estándar.
    // Se llama una sola vez (crea solo los que falten).
    seed: async (req, res) => {
        try {
            const estandar = ["Agua", "Camionetas", "Limpieza", "Nominas", "Papeleria", "Policia", "Telefono", "Varios"]
            const usados = await GastosTiendas.distinct("concepto")
            const nombres = [...new Set([...estandar, ...usados].map(n => (n || "").trim()).filter(Boolean))]
            let creados = 0
            for (const name of nombres) {
                const exists = await ConceptosGastosTiendas.findOne({ name })
                if (!exists) {
                    await new ConceptosGastosTiendas({ name }).save()
                    creados++
                }
            }

            // Backfill: asigna conceptosGastosTiendas (_id) a los gastos anteriores
            // según el nombre que ya tienen en 'concepto'.
            const conceptos = await ConceptosGastosTiendas.find()
            const mapByName = {}
            conceptos.forEach((c) => { mapByName[c.name] = c._id })

            const gastos = await GastosTiendas.find({
                $or: [
                    { conceptosGastosTiendas: { $exists: false } },
                    { conceptosGastosTiendas: { $size: 0 } },
                    { conceptosGastosTiendas: null },
                ],
            })
            let actualizados = 0
            for (const g of gastos) {
                const id = mapByName[(g.concepto || "").trim()]
                if (id) {
                    await GastosTiendas.findByIdAndUpdate(g._id, { conceptosGastosTiendas: [id] })
                    actualizados++
                }
            }

            res.status(200).json({
                message: "Conceptos sembrados y gastos anteriores actualizados",
                creados,
                totalRevisados: nombres.length,
                gastosActualizados: actualizados,
            })
        } catch (error) {
            res.status(400).json(error)
            console.log(error)
        }
    },
    findAll: (req, res)=>{
        ConceptosGastosTiendas.find()
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOne: (req, res)=>{
        const { id } = req.params
        ConceptosGastosTiendas.findById(id)
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    create: async (req, res)=>{
        const { body } = req
        try {
            const exists = await ConceptosGastosTiendasService.findOneByName(body.name)
            if (exists) {
                res.status(400).json({ message: 'Ese concepto ya esta registrado' })
            } else {
                const nuevo = new ConceptosGastosTiendas(body)
                const concepto = await nuevo.save()
                res.status(201).json(concepto)
            }
        } catch (error) {
            res.status(400).json(error)
            console.log(error)
        }
    },
    delete: (req, res)=>{
        ConceptosGastosTiendas.findByIdAndDelete(req.params.id)
            .then((resDB)=> res.status(204).json(resDB))
            .catch((err)=> res.status(400).json(err))
    },
    edit: (req, res)=>{
        const { body } = req
        ConceptosGastosTiendas.findByIdAndUpdate(req.params.id, body, { new: true })
            .then((resDB)=> res.status(201).json(resDB))
            .catch((err)=> res.status(400).json(err))
    }
}
