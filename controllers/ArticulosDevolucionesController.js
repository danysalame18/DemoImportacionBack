const { ArticulosDevoluciones, Inventarios, Devoluciones } = require('../models')

module.exports = { 
    findAll: (req, res)=>{
        ArticulosDevoluciones.find()
        .populate({path: 'devoluciones', populate:{path: 'clientes'}})
        .populate({path: 'devoluciones', populate:{path: 'colaboradores'}})
        .populate({path: 'articulos', populate:{path: 'familias'}})
        .populate({path: 'articulos', populate:{path: 'lineas'}})
        .populate({path: 'articulos', populate:{path: 'colecciones'}})
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOne: (req, res)=>{
        const { id } = req.params
        ArticulosDevoluciones.findById(id)
        .populate({path: 'devoluciones', populate:{path: 'clientes'}})
        .populate({path: 'devoluciones', populate:{path: 'colaboradores'}})
        .populate({path: 'articulos', populate:{path: 'familias'}})
        .populate({path: 'articulos', populate:{path: 'lineas'}})
        .populate({path: 'articulos', populate:{path: 'colecciones'}})
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },   
    findOneDevolucion: (req, res)=>{
        const { id } = req.params
        ArticulosDevoluciones.find({ devoluciones: id })
        .populate({path: 'devoluciones', populate:{path: 'clientes'}})
        .populate({path: 'devoluciones', populate:{path: 'colaboradores'}})
        .populate({path: 'articulos', populate:{path: 'familias'}})
        .populate({path: 'articulos', populate:{path: 'lineas'}})
        .populate({path: 'articulos', populate:{path: 'colecciones'}})
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    
findOneFechas: async (req, res) => {
  try {
    const { inicio, fin } = req.params;

    // Buscar ids de devoluciones dentro del rango
    const devoluciones = await Devoluciones.find({
      fecha: { $gte: inicio, $lte: fin }
    }).select('_id');

    const idsDevoluciones = devoluciones.map(d => d._id);

    if (idsDevoluciones.length === 0) {
      return res.status(404).json({ message: "No se encontraron resultados" });
    }

    const respDB = await ArticulosDevoluciones.find({
      devoluciones: { $in: idsDevoluciones }
    })
      .populate({ path: 'devoluciones', populate: { path: 'clientes' } })
      .populate({ path: 'devoluciones', populate: { path: 'areas' } })
      .populate({ path: 'devoluciones', populate: { path: 'colaboradores' } })
      .populate({ path: 'articulos', populate: { path: 'familias' } })
      .populate({ path: 'articulos', populate: { path: 'lineas' } })
      .populate({ path: 'articulos', populate: { path: 'colecciones' } });

    if (respDB.length === 0) {
      return res.status(404).json({ message: "No se encontraron resultados" });
    }

    res.status(200).json(respDB);
  } catch (err) {
    console.log("Error:", err);
    res.status(500).json({ error: 'An error occurred' });
  }
},
    create: async (req, res)=>{
        const { body } = req
        try{
          
            let surt = await Inventarios.findOneAndUpdate( {areas: [body.areas], articulos: [body.articulos]} ,
                { $inc: { cantidad: body.cantidad }, is_active: "Si"}, { new: true, upsert: true }  );

            // let surt2 = await Inventarios.findOneAndUpdate( {areas: [body.areas], articulos: [process.env.REACT_APP_ARTICULO_DEFECTO]} ,
            //     { $inc: { cantidad: body.defectos } }, { new: true, upsert: true }  );

        const newArticulosDevoluciones = new ArticulosDevoluciones(body)
        const articulo = newArticulosDevoluciones.save()
        
        res.status(200).json({ message: "Se guardo la devolucion" });
          } catch (error) {
            res.status(400).json(error);
          }
    },
    delete: (req, res)=>{
        ArticulosDevoluciones.findByIdAndDelete(req.params.id)
            .then((resDB)=> res.status(204).json(resDB))
            .catch((err)=> res.status(400).json(err))
    },
    edit: (req, res)=>{
        const { body } = req
        ArticulosDevoluciones.findByIdAndUpdate(req.params.id, body, { new: true})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    }
}