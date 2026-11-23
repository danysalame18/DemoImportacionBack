const { DevolucionesProveedores, Proveedores, MovimientosBancos, AbonosProveedores } = require('../models')

module.exports = { 
    findAll: (req, res)=>{
        DevolucionesProveedores.find()
        .populate('proveedores')
        .populate('areas')
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOne: (req, res)=>{
        const { id } = req.params
        DevolucionesProveedores.findById(id)
        .populate('proveedores')
        .populate('areas')
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOneProveedor: (req, res)=>{
        const { proveedor } = req.params
        DevolucionesProveedores.find({proveedores:proveedor})
        .populate('proveedores')
        .populate('areas')
        .then((respDB)=> res.status(200).json(respDB))
        .catch((err)=> console.log(err))
    },
    findOneColaborador: (req, res) => {
        const { colaborador } = req.params;
        DevolucionesProveedores.find({
          colaboradores: colaborador,
          comisionPagada: "No",
          is_active: "Si",
        })
        .populate('proveedores')
        .populate('areas')
          .then((respDB) => res.status(200).json(respDB))
          .catch((err) => console.log(err));
      },
      findOneColaboradorProveedor: (req, res) => {
        const { colaborador, proveedor } = req.params;
        DevolucionesProveedores.find({
          colaboradores: colaborador,
          proveedores: proveedor,
          comisionPagada: "No",
          is_active: "Si",
        })
        .populate('proveedores')
        .populate('areas')
          .then((respDB) => res.status(200).json(respDB))
          .catch((err) => console.log(err));
      },
    findOneFechas: (req, res)=>{
        const { inicio, fin } = req.params
        DevolucionesProveedores.find({fecha:{$gte: inicio, $lte: fin}})
        .populate('proveedores')
        .populate('areas')
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    create: (req, res)=>{
        const { body } = req
        const newDevolucionesProveedores = new DevolucionesProveedores(body)
         newDevolucionesProveedores.save()
            .then((respDB)=> res.status(201).json(respDB))
            .catch((err)=> console.log(err))
    },
    delete: (req, res)=>{
        DevolucionesProveedores.findByIdAndDelete(req.params.id)
            .then((resDB)=> res.status(204).json(resDB))
            .catch((err)=> res.status(400).json(err))
    },
    edit: (req, res)=>{
        const { body } = req
        DevolucionesProveedores.findByIdAndUpdate(req.params.id, body, { new: true})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    },
    aplicar: async (req, res) => {
        try {
            // Obtener datos de la devolución
            const devolucion = await DevolucionesProveedores.findById(req.params.id);
            if (!devolucion) {
                return res.status(404).json({ message: "Devolución no encontrada" });
            }
    
            const { proveedores, total_general, fecha } = devolucion;
    
            // Obtener información del proveedor para extraer la moneda
            const proveedor = await Proveedores.findById(proveedores);
            if (!proveedor) {
                return res.status(404).json({ message: "Proveedor no encontrado" });
            }
    
            const { moneda } = proveedor; // Suponiendo que la moneda está en el campo `moneda`
    
            // Formato de fecha "AAAA-MM-DD"
            const fechaActual = new Date().toISOString().split("T")[0];
    
            // Actualizar abonos de proveedores
            const proveedorActualizado = await Proveedores.findByIdAndUpdate(
                proveedores,
                { $inc: { abonos: - total_general, saldo: total_general } },
                { new: true }
            );
    
            // Crear movimiento en AbonosProveedores
            const abonoProveedor = await AbonosProveedores.create({
                fecha: fecha,
                importe: total_general,
                proveedores,
                concepto: "Abono por devolución",
                tipoCambio: 1, // Ajusta si se usa un tipo de cambio diferente
                bancos: "6255c1ca98f8a71d7414a115"
            });
    
            // Crear movimiento en MovimientosBancos
            const movimientoBanco = await MovimientosBancos.create({
                fecha: fecha,
                importe: -total_general,
                tipo: "Egreso",
                bancos: "6255c1ca98f8a71d7414a115",
                abonosProveedores: abonoProveedor._id,
                moneda, // Moneda del proveedor
                tipoCambio: 1 // Ajusta según sea necesario
            });
    
            // Actualizar la devolución para marcarla como "aplicada"
            const devolucionActualizada = await DevolucionesProveedores.findByIdAndUpdate(
                req.params.id,
                { aplicada: "Si" },
                { new: true }
            );
    
            // Respuesta exitosa con los resultados
            res.status(201).json({
                proveedorActualizado,
                abonoProveedor,
                movimientoBanco,
                devolucionActualizada
            });
        } catch (error) {
            res.status(400).json({ message: "Error al procesar la operación", error });
        }
    },
    
    
    
    
}