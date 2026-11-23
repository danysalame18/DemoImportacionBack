const { Clientes, UsuariosWhatsApp } = require('../models')
const { ClientesService, UserService } = require('../services')
var cron = require('node-cron');
const { WhatsAppService } = require("../services");

// cron.schedule('0 9 1,15 * *', () => {
    cron.schedule('07 11 * * *', () => {
    saldoSemanal()
  }, {
    scheduled: true,
    timezone: "America/Mexico_City"
  });


async function saldoSemanal() {
  try {
    const clientes = await Clientes.find({
      saldo: { $gt: 0 },
      is_active: "Si",
      alertasEdoCta: "Si",
      nombre_comercial:"DANI SALAMAE"
    }).lean();

    console.log(`Clientes a notificar: ${clientes.length}`);

    for (const a of clientes) {
      try {
        const telefono = a.telefonoCobranza || a.telefono;

        if (!telefono) {
          console.log(`Sin teléfono: ${a.nombre_comercial}`);
          continue;
        }

        const saldoFormateado = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 2,
        }).format(a.saldo);

        // Mensaje PROACTIVO (fuera de ventana de 24 h) => plantilla aprobada por Meta.
        const resp = await WhatsAppService.sendSaldoRecordatorio(
          telefono,
          a.nombre_comercial,
          saldoFormateado
        );

        console.log(
          `Resultado envío -> ${a.nombre_comercial} - ${telefono}:`,
          resp
        );

        await UsuariosWhatsApp.findOneAndUpdate(
          { telefono: String(telefono).replace(/\D/g, "") },
          {
            telefono: String(telefono).replace(/\D/g, ""),
            estado: "edoCtaCron"
          },
          { new: true, upsert: true }
        );
      } catch (error) {
        console.log(
          `Error con el cliente ${a.nombre_comercial} - telefono: ${a.telefonoCobranza || a.telefono}`,
          error.message
        );
      }
    }

    console.log("saldoSemanal finalizado");
  } catch (error) {
    console.log("Error general en saldoSemanal:", error.message);
  }
}



cron.schedule('0 9 * * 1', () => {
    saldoSemanalMorosos()
  }, {
    scheduled: true,
    timezone: "America/Mexico_City"
  });

  async function saldoSemanalMorosos(){

    let cli = await Clientes.find({saldo:{$gt:0}, is_active:"Si", categoria:"Moroso"})


    cli.map(async(a)=>{

    const saldoFormateado = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(a.saldo);

    // Mensaje PROACTIVO (fuera de ventana de 24 h) => plantilla aprobada por Meta.
    await WhatsAppService.sendSaldoRecordatorio(
      a.telefono,
      a.nombre_comercial,
      saldoFormateado
    );

      const actualizaEstado = await UsuariosWhatsApp.findOneAndUpdate(
        { telefono: a.telefono },
        { estado: "edoCtaCron" },
        { new: true, upsert: true }
      );

    }) 

}

module.exports = { 
    findAll: (req, res)=>{
        Clientes.find()
            .populate('grupos')
            .populate('areas')
            .populate('departamentosClientes')
            .populate("empresas")
            .populate({path: 'vendedor', populate:{path: 'puestos', populate:{path: 'areas'}}})

            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOne: (req, res)=>{
        const { id } = req.params
        Clientes.findById(id)
        .populate('grupos')
        .populate('areas')
        .populate('departamentosClientes')
        .populate("empresas")
        .populate({path: 'vendedor', populate:{path: 'puestos', populate:{path: 'areas'}}})
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findStatus: (req, res)=>{
        const { status} = req.params
        Clientes.find({is_active:status})
        .populate('grupos')
        .populate('areas')
        .populate('departamentosClientes')
        .populate("empresas")
        .populate({path: 'vendedor', populate:{path: 'puestos', populate:{path: 'areas'}}})
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findStatusArea: (req, res)=>{
        const { status, area } = req.params
        Clientes.find({is_active:status, areas: area})
        .populate('grupos')
        .populate('areas')
        .populate('departamentosClientes')
        .populate("empresas")
        .populate({path: 'vendedor', populate:{path: 'puestos', populate:{path: 'areas'}}})
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findArea: (req, res)=>{
        const { area } = req.params
        Clientes.find({areas:{$nin:[process.env.REACT_APP_AREAS_BENY, process.env.REACT_APP_AREAS_ABY]}})
        .populate('grupos')
        .populate('areas')
        .populate('departamentosClientes')
        .populate("empresas")
        .populate({path: 'vendedor', populate:{path: 'puestos', populate:{path: 'areas'}}})
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findAreaActivos: (req, res)=>{
        const { area } = req.params
        Clientes.find({is_active:"Si",areas:area})
        .populate('grupos')
        .populate('areas')
        .populate('departamentosClientes')
        .populate("empresas")
        .populate({path: 'vendedor', populate:{path: 'puestos', populate:{path: 'areas'}}})
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findGeneral: (req, res)=>{
        Clientes.find({areas:{$in:[process.env.REACT_APP_AREAS_CEDIS]}})
        .populate('grupos')
        .populate('areas')
        .populate('departamentosClientes')
        .populate("empresas")
        .populate({path: 'vendedor', populate:{path: 'puestos', populate:{path: 'areas'}}})
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findGeneralActivos: (req, res)=>{
        Clientes.find({is_active:"Si", areas:{$nin:[process.env.REACT_APP_AREAS_BENY, process.env.REACT_APP_AREAS_ABY]}})
        .populate('grupos')
        .populate('areas')
        .populate('departamentosClientes')
        .populate("empresas")
        .populate({path: 'vendedor', populate:{path: 'puestos', populate:{path: 'areas'}}})
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findTiendas: (req, res)=>{
        // Solo clientes cuya area es una tienda. Antes era un $nin que excluia
        // a Tienda Maya (la unica tienda activa) y dejaba pasar a CEDIS, General
        // y bodegas: ~1,100 clientes que nunca tienen ventas de tienda.
        // (REACT_APP_AREAS_BENY no existe en el .env de AmericanFly.)
        Clientes.find({areas:{$in:[process.env.REACT_APP_AREAS_ABY, process.env.REACT_APP_AREAS_MAYA]}} )
        .populate('grupos')
        .populate('areas')
        .populate('departamentosClientes')
        .populate("empresas")
        .populate({path: 'vendedor', populate:{path: 'puestos', populate:{path: 'areas'}}})
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    // findDashboard: async (req, res)=>{
    //     try {
    //     let cli = await Clientes.find({ is_active: "Si", cargos: { $gt: 0}, abonos: { $gt: 0} })
    //         .populate('grupos')
    //         .populate('areas')
    //         .populate('departamentosClientes')
    //         .populate('vendedor')
    //         let array = cli.map((a)=>{
    //             return{
    //                 Cliente: a.nombre_comercial,
    //                 idCliente: a._id,
    //                 Cargos: a.cargos,
    //                 Abonos: a.abonos,
    //                 Saldo: a.saldo,
    //                 DepartamentoCliente: a.departamentosClientes[0].name,
    //                 idDepartamentoCliente: a.departamentosClientes[0]._id,
    //                 idVendedor: a.vendedor[0]._id,
    //                 Vendedor: a.vendedor[0].nombre + " " + a.vendedor[0].apellido,          
    //             }
    //         }).filter(function (el) {
    //             return el != null;
    //           });
    //           let data = Object.values(array);

    //         res.status(200).json(data)
    //     } catch (error) {
    //       res.status(400).json(error);
    //     }
    // },
    findOneClienteMail: (req, res)=>{
        const { email } = req.params
        Clientes.find({"email": email})
        .populate('grupos')
        .populate('areas')
        .populate('departamentosClientes')
        .populate("empresas")
        .populate({path: 'vendedor', populate:{path: 'puestos', populate:{path: 'areas'}}})
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    create: async (req, res)=>{
        const { body } = req
       try {
        // const clienteExists = await ClientesService.findOneByCodigo(body.codigo)

        // if (clienteExists) {
        //     res.status(400).json({message: 'El cliente ya esta registrado'}) 
        // alert('El cliente ya esta registrado')
        // }else{
        const newCliente = new Clientes(body)
        const cliente = await newCliente.save()
        res.status(201).json(cliente)
        // }
       } catch (error) {
           res.status(400).json(error)
           console.log(error)
       }
    },
    
    edit: (req, res)=>{
        const { body } = req
        Clientes.findByIdAndUpdate(req.params.id, body, { new: true})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    },
    // Captura de seguimiento de cobranza desde EstadoCuenta: actualiza el
    // valor vigente y agrega el registro al historial en una sola operacion.
    seguimientoCobranza: (req, res)=>{
        const { observaciones = "", fechaCompromiso = "", usuario = "" } = req.body
        const hoy = new Date().toISOString().slice(0, 10)
        Clientes.findByIdAndUpdate(
            req.params.id,
            {
                $set: { observacionesCobranza: observaciones, fechaCompromiso },
                $push: { historialCobranza: { fecha: hoy, observaciones, fechaCompromiso, usuario } },
            },
            { new: true }
        )
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    },
    // Borra un comentario del historial de cobranza. Si el borrado era el
    // vigente (el ultimo), el listado pasa a mostrar el comentario anterior,
    // o queda vacio si no queda ninguno.
    borrarSeguimientoCobranza: async (req, res)=>{
        const { id, idSeguimiento } = req.params
        try {
            const cliente = await Clientes.findByIdAndUpdate(
                id,
                { $pull: { historialCobranza: { _id: idSeguimiento } } },
                { new: true }
            )
            if (!cliente) return res.status(404).json({ message: "No existe el cliente" })

            const ultimo = (cliente.historialCobranza || []).slice(-1)[0]
            cliente.observacionesCobranza = ultimo ? ultimo.observaciones : ""
            cliente.fechaCompromiso = ultimo ? ultimo.fechaCompromiso : ""
            await cliente.save()

            res.status(200).json(cliente)
        } catch (err) {
            console.log("Error borrando seguimiento:", err)
            res.status(400).json(err)
        }
    },
    delete: (req, res)=>{
        Clientes.findByIdAndDelete(req.params.id)
            .then((resDB)=> res.status(204).json(resDB))
            .catch((err)=> res.status(400).json(err))
    },
    login: (req, res)=>{
    const { user } = req.params
    Clientes.findOne({ user })
        .then((respDB)=> res.status(200).json(respDB))
        .catch((err)=> console.log(err))
    }
 }