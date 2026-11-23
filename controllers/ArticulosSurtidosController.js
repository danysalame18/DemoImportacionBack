const { ArticulosSurtidos, Inventarios, ArticulosPedido } = require('../models')

module.exports = {
  findAll: (req, res) => {
    ArticulosSurtidos.find()
      .populate({
        path: "surtidos",
        populate: { path: "pedidos", populate: { path: "clientes" } },
      })
      .populate({
        path: "surtidos",
        populate: { path: "pedidos", populate: { path: "colaboradores" } },
      })
      .populate({ path: "surtidos", populate: { path: "user" } })
      .populate({ path: "inventarios", populate: { path: "articulos" } })
      .populate("clientes")
      .populate({ path: "surtidos", populate: { path: "areas" } })
      .populate({ path: "articulosPedido", populate: { path: "pedidos" } })
      .populate({ path: "articulos", populate: { path: "lineas" } })
      .populate({ path: "articulos", populate: { path: "marcas" } })
      .populate({ path: "articulos", populate: { path: "familias" } })
      .populate({ path: "articulos", populate: { path: "colecciones" } })
      .populate({ path: "articulos", populate: { path: "proveedores" } })
      .then((respDB) => res.status(200).json(respDB))
      .catch((err) => console.log(err));
  },
  findOne: (req, res) => {
    const { id } = req.params;
    ArticulosSurtidos.findById(id)
      .populate({path: "surtidos", populate: { path: "pedidos", populate: { path: "clientes" } } })
      .populate({
        path: "surtidos",
        populate: { path: "pedidos", populate: { path: "colaboradores" } },
      })
      .populate({ path: "surtidos", populate: { path: "user" } })
      .populate({ path: "inventarios", populate: { path: "articulos" } })
      .populate("clientes")
      .populate({ path: "surtidos", populate: { path: "areas" } })
      .populate({ path: "articulosPedido", populate: { path: "pedidos" } })
      .populate({ path: "articulos", populate: { path: "lineas" } })
      .populate({ path: "articulos", populate: { path: "marcas" } })
      .populate({ path: "articulos", populate: { path: "familias" } })
      .populate({ path: "articulos", populate: { path: "colecciones" } })
      .populate({ path: "articulos", populate: { path: "proveedores" } })
      .then((respDB) => res.status(200).json(respDB))
      .catch((err) => console.log(err));
  },
  findOneSurtido: (req, res) => {
    const { id } = req.params;
    ArticulosSurtidos.find({ surtidos: id })
    .populate({path: "surtidos", populate: { path: "pedidos", populate: { path: "clientes" } } })
    .populate({
      path: "surtidos",
      populate: { path: "pedidos", populate: { path: "colaboradores" } },
    })
    .populate({ path: "surtidos", populate: { path: "user" } })
    .populate({ path: "inventarios", populate: { path: "articulos" } })
    .populate("clientes")
    .populate({ path: "surtidos", populate: { path: "areas" } })
    .populate({ path: "articulosPedido", populate: { path: "pedidos" } })
    .populate({ path: "articulos", populate: { path: "lineas" } })
    .populate({ path: "articulos", populate: { path: "marcas" } })
    .populate({ path: "articulos", populate: { path: "familias" } })
    .populate({ path: "articulos", populate: { path: "colecciones" } })
    .populate({ path: "articulos", populate: { path: "proveedores" } })
      .then((respDB) => res.status(200).json(respDB))
      .catch((err) => console.log(err));
  },
  findOneClienteDevolucion: (req, res) => {
    const { id } = req.params;
    ArticulosSurtidos.find({ clientes: id, cantidad: { $gt: 0 }})
      .populate({
        path: "surtidos",
        populate: { path: "pedidos", populate: { path: "clientes" } },
      })
      .populate({
        path: "surtidos",
        populate: { path: "pedidos", populate: { path: "colaboradores" } },
      })
      .populate({ path: "surtidos", populate: { path: "user" } })
      .populate({ path: "inventarios", populate: { path: "articulos" } })
      .populate("clientes")
      .populate({ path: "surtidos", populate: { path: "areas" } })
      .populate({ path: "articulosPedido", populate: { path: "pedidos" } })
      .populate({ path: "articulos", populate: { path: "lineas" } })
      .populate({ path: "articulos", populate: { path: "marcas" } })
      .populate({ path: "articulos", populate: { path: "familias" } })
      .populate({ path: "articulos", populate: { path: "colecciones" } })
      .populate({ path: "articulos", populate: { path: "proveedores" } })
      .then((respDB) => res.status(200).json(respDB))
      .catch((err) => console.log(err));
  },

  findOneFechas: (req, res)=>{
    const { inicio, fin } = req.params
    ArticulosSurtidos.find({fecha:{$gte: inicio, $lte: fin}})
    .populate({ path: "surtidos", populate: { path: "areas" } })
    .populate("clientes")
    .populate("articulos")
    .populate("articulosPedido")
    .then((respDB)=> res.status(200).json(respDB))
    .catch((err)=> console.log(err))
},
  findOneInventario: (req, res) => {
    const { id } = req.params;
    ArticulosSurtidos.find({ inventarios: id })
      .populate({
        path: "surtidos",
        populate: { path: "pedidos", populate: { path: "clientes" } },
      })
      .populate({
        path: "surtidos",
        populate: { path: "pedidos", populate: { path: "colaboradores" } },
      })
      .populate({ path: "surtidos", populate: { path: "user" } })
      .populate({ path: "inventarios", populate: { path: "articulos" } })
      .populate("clientes")
      .populate({ path: "surtidos", populate: { path: "areas" } })
      .populate({ path: "articulosPedido", populate: { path: "pedidos" } })
      .populate({ path: "articulos", populate: { path: "lineas" } })
      .populate({ path: "articulos", populate: { path: "marcas" } })
      .populate({ path: "articulos", populate: { path: "familias" } })
      .populate({ path: "articulos", populate: { path: "colecciones" } })
      .populate({ path: "articulos", populate: { path: "proveedores" } })
      .then((respDB) => res.status(200).json(respDB))
      .catch((err) => console.log(err));
  },
  create: async (req, res) => {
    const { body } = req;

    try {
      
      // if (body.inventarios != "NA") {
        let inv = await Inventarios.findByIdAndUpdate( body.inventarios,   { $inc: { cantidad: -body.cantidad }}, { new: true } )   

        let surt = await ArticulosPedido.findOneAndUpdate(
          { pedidos: [body.pedidos], articulos: [body.articulos] },
          { $inc: { surtido: body.cantidad, pendiente_surtir: -body.cantidad } },
          { new: true }
        );
  
        const newArtSurt = new ArticulosSurtidos(body);
        // Faltaba el await: respondia 200 aunque el guardado no hubiera
        // terminado (o fallara), y el front seguia como si todo estuviera bien.
        await newArtSurt.save();
  
        res.status(200).json({ message: "Se guardo el surtido" });     

      // }else{

      //   const newInventarios = new Inventarios({articulos:body.articulos, areas:body.areas, cantidad: -body.cantidad});
      //   const inventario = await newInventarios.save()

      //   let surt = await ArticulosPedido.findOneAndUpdate(
      //     { pedidos: [body.pedidos], articulos: [body.articulos] },
      //     { $inc: { surtido: body.cantidad, pendiente_surtir: -body.cantidad } },
      //     { new: true }
      //   );
  
      //   const newArtSurt = new ArticulosSurtidos({
      //     inventarios:inventario._id,
      //     surtidos:body.surtidos,
      //     cantidad:body.cantidad,
      //     articulos:body.articulos,
      //     pedidos:body.pedidos,
      //     articulosPedido:body.articulosPedido,
      //     areas:body.areas,
      //     clientes:body.clientes,
      //     fecha:body.fecha,
      //     costoUnitario:body.costoUnitario,
      //   });
      //   const ArtSurt = newArtSurt.save();
  
      //   res.status(200).json({ message: "Se guardo el surtido" });
      // }
     
     
    } catch (error) {
      res.status(400).json(error);
    }
  },
  delete: (req, res) => {
    ArticulosSurtidos.findByIdAndDelete(req.params.id)
      .then((resDB) => res.status(204).json(resDB))
      .catch((err) => res.status(400).json(err));
  },
  edit: (req, res) => {
    const { body } = req;
    ArticulosSurtidos.findByIdAndUpdate(req.params.id, body, { new: true })
      .then((resDB) => res.status(201).json(resDB))
      .catch((err) => res.status(400).json(err));
  },

  findOneFactura: (req, res) => {
    const { id } = req.params;
    ArticulosSurtidos.find({ facturas: id })
      .populate("clientes")
      .populate("surtidos")
      .populate({ path: "pedidos", populate: { path: "colaboradores" } })
      .populate({path: 'articulos', populate:{path: 'colores'}})
      .populate("articulosPedido")
      .populate("colores")
    .populate('sociedades')
      .then((respDB) => res.status(200).json(respDB))
      .catch((err) => console.log(err));
  },




  // desarrollo: async (req, res) => {
  //   try {
  //     let art = await ArticulosTS.find()
  //     // .populate({path: "traspasosEntrada", populate: { path: "traspasosSalida", populate: { path: "areaDestino" } } })
  //     .populate({path: "traspasosSalida", populate: { path: "areaSalida" } } )

  //     art.map(async(a)=>{
  //       await ArticulosTS.findByIdAndUpdate(a._id, {areas: a.traspasosSalida[0].areaSalida[0]._id})
  //     })

  //   } catch (error) {
  //     res.status(400).json(error);
  //   }
  // },

  
};
