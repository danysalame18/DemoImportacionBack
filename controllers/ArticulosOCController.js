const { ArticulosOC, ArticulosEmbarques, OrdenesCompra } = require('../models')

module.exports = {
  findAll: (req, res) => {
    ArticulosOC.find()
      .populate({ path: "ordenesCompra", populate: { path: "proveedores" } })
      .populate({ path: "articulos", populate: { path: "lineas" } })
      .populate({ path: "articulos", populate: { path: "marcas" } })
      .populate({ path: "articulos", populate: { path: "familias" } })
      .populate({ path: "articulos", populate: { path: "colecciones" } })
      .populate({ path: "articulos", populate: { path: "proveedores" } })
      .then((respDB) => res.status(200).json(respDB))
      .catch((err) => console.log(err));
  },
  findAllPendEmbarcar: async (req, res) => {
    try {
      let temp = await ArticulosOC.find({
        is_active: "Si",
        pendiente_embarcar: { $gt: 0 },
      })
        .populate({ path: "ordenesCompra", populate: { path: "proveedores" } })
        .populate({ path: "articulos", populate: { path: "lineas" } })
        .populate({ path: "articulos", populate: { path: "marcas" } })
        .populate({ path: "articulos", populate: { path: "familias" } })
        .populate({ path: "articulos", populate: { path: "colecciones" } });

      let temp2 = await temp
        .map((a) => {
          if (a.ordenesCompra[0].is_active == "Si") {
            return {
              codigo: a.articulos[0].codigo,
              nombre: a.articulos[0].nombre,
              idArticulo: a.articulos[0]._id,
              cantidad: a.cantidad,
              embarcado: a.embarcado,
              pendiente_embarcar: a.pendiente_embarcar,
              linea: a.articulos[0].lineas[0].name,
              idLinea: a.articulos[0].lineas[0]._id,
              marca: a.articulos[0].marcas[0].name,
              idMarca: a.articulos[0].marcas[0]._id,
              familia: a.articulos[0].familias[0].name,
              idFamilia: a.articulos[0].familias[0]._id,
              coleccion: a.articulos[0].colecciones[0].name,
              idColeccion: a.articulos[0].colecciones[0]._id,
              proveedor: a.ordenesCompra[0].proveedores[0].nombre_comercial,
              idProveedor: a.ordenesCompra[0].proveedores[0]._id,
              precio: a.precio,
            };
          }
        })
        .filter(function (el) {
          return el != null;
        });

      let agrupado = temp2.reduce(function (groups, item) {
        const val = item["idArticulo"];
        groups[val] = groups[val] || {
          idArticulo: item.idArticulo,
          cantidad: 0,
          embarcado: 0,
          pendiente_embarcar: 0,
        };
        groups[val].cantidad += item.cantidad;
        groups[val].embarcado += item.embarcado;
        groups[val].pendiente_embarcar += item.pendiente_embarcar;
        groups[val].nombre = item.nombre;
        groups[val].codigo = item.codigo;
        groups[val].idArticulo = item.idArticulo;
        groups[val].linea = item.linea;
        groups[val].idLinea = item.idLinea;
        groups[val].marca = item.marca;
        groups[val].idMarca = item.idMarca;
        groups[val].familia = item.familia;
        groups[val].idFamilia = item.idFamilia;
        groups[val].coleccion = item.coleccion;
        groups[val].idColeccion = item.idColeccion;
        groups[val].proveedor = item.proveedor;
        groups[val].idProveedor = item.idProveedor;
        groups[val].precio = item.precio;
        return groups;
      }, []);

      let computedComments = Object.values(agrupado);
      res.status(200).json(computedComments);
    } catch (error) {
      res.status(400).json(error);
    }
  },
  findAllPendEmbarcarDash: async (req, res) => {
    try {
      let temp = await ArticulosOC.find({
        is_active: "Si",
        pendiente_embarcar: { $gt: 0 },
      }).populate({ path: "ordenesCompra", populate: { path: "proveedores" } });

      let temp2 = await temp
        .map((a) => {
          if (a.ordenesCompra[0].is_active == "Si") {
            return {
              pendiente_embarcar: a.pendiente_embarcar,
              idProveedor: a.ordenesCompra[0].proveedores[0]._id,
              proveedor: a.ordenesCompra[0].proveedores[0].nombre_comercial,
            };
          }
        })
        .filter(function (el) {
          return el != null;
        });

      let agrupado = temp2.reduce(function (groups, item) {
        const val = item["idProveedor"];
        groups[val] = groups[val] || {
          idProveedor: item.idProveedor,
          pendiente_embarcar: 0,
        };
        groups[val].pendiente_embarcar += item.pendiente_embarcar;
        groups[val].idProveedor = item.idProveedor;
        groups[val].proveedor = item.proveedor;
        return groups;
      }, []);

      let computedComments = Object.values(agrupado);
      res.status(200).json(computedComments);
    } catch (error) {
      res.status(400).json(error);
    }
  },
  findAllPendRecibirArticulo: async (req, res) => {
    const { articulo } = req.params;
    try {
      let temp = await ArticulosOC.find({
        is_active: "Si",
        articulos: articulo,
        pendiente_embarcar: { $gte: 0 },
      })
        .populate({ path: "ordenesCompra", populate: { path: "proveedores" } })
        .populate({ path: "articulos", populate: { path: "lineas" } })
        .populate({ path: "articulos", populate: { path: "marcas" } })
        .populate({ path: "articulos", populate: { path: "familias" } })
        .populate({ path: "articulos", populate: { path: "colecciones" } })
        .populate({ path: "articulos", populate: { path: "proveedores" } });

      let temp2 = await temp.map((a) => {
        return {
          codigo: a.articulos[0].codigo,
          nombre: a.articulos[0].nombre,
          idArticulo: a.articulos[0]._id,
          cantidad: a.cantidad,
          embarcado: a.embarcado,
          pendiente_embarcar: a.pendiente_embarcar,
          idOrdenCompra: a.ordenesCompra[0].idOrdenCompra,
          fecha_compromiso: a.ordenesCompra[0].fecha_compromiso,
          proveedor: a.articulos[0].proveedores[0].nombre_comercial,
          idProveedor: a.articulos[0].proveedores[0]._id,
        };
      });

      let computedComments = Object.values(temp2);
      res.status(200).json(computedComments);
    } catch (error) {
      res.status(400).json(error);
    }
  },
  findOne: (req, res) => {
    const { id } = req.params;
    ArticulosOC.findById(id)
      .populate("ordenesCompra")
      .populate({ path: "articulos", populate: { path: "lineas" } })
      .populate({ path: "articulos", populate: { path: "marcas" } })
      .populate({ path: "articulos", populate: { path: "familias" } })
      .populate({ path: "articulos", populate: { path: "colecciones" } })
      .populate({ path: "articulos", populate: { path: "proveedores" } })
      .then((respDB) => res.status(200).json(respDB))
      .catch((err) => console.log(err));
  },
  findOneOrden: (req, res) => {
    const { id } = req.params;
    ArticulosOC.find({ ordenesCompra: id })
      .populate("ordenesCompra")
      .populate({ path: "articulos", populate: { path: "lineas" } })
      .populate({ path: "articulos", populate: { path: "marcas" } })
      .populate({ path: "articulos", populate: { path: "familias" } })
      .populate({ path: "articulos", populate: { path: "colecciones" } })
      .populate({ path: "articulos", populate: { path: "proveedores" } })
      .then((respDB) => res.status(200).json(respDB))
      .catch((err) => console.log(err));
  },
  create: (req, res) => {
    const { body } = req;
    const newArticulosOC = new ArticulosOC(body);
    const articulo = newArticulosOC
      .save()
      .then((respDB) => res.status(201).json(respDB))
      .catch((err) => console.log(err));
  },
  delete: (req, res) => {
    ArticulosOC.findByIdAndDelete(req.params.id)
      .then((resDB) => res.status(204).json(resDB))
      .catch((err) => res.status(400).json(err));
  },
  edit: (req, res) => {
    const { body } = req;
    ArticulosOC.findByIdAndUpdate(req.params.id, body, { new: true })
      .then((resDB) => res.status(201).json(resDB))
      .catch((err) => res.status(400).json(err));
  },
  editEmbarcado: async (req, res) => {
    const { id } = req.params;
    const { body } = req;

      const emb = await ArticulosOC.findByIdAndUpdate(id, {$inc: {embarcado: body.embarcado, pendiente_embarcar: -body.embarcado}}, { new: true });
      const ord = await OrdenesCompra.findByIdAndUpdate(body.ordenesCompra, {$inc: {embarcado: body.embarcado}}, { new: true })

      .then((respDB) => res.status(201).json(respDB))
      .catch((err) => console.log(err));
  },
  editEmbarcadoCant: async (req, res) => {
    const { id } = req.params;
    const { body } = req;
 
      const emb = await ArticulosOC.findByIdAndUpdate(id, {$inc: {embarcado: body.embarcado, pendiente_embarcar: -body.embarcado}}, { new: true });
      const ord = await OrdenesCompra.findByIdAndUpdate(body.ordenesCompra, {$inc: {embarcado: body.embarcado}}, { new: true })

      .then((respDB) => res.status(201).json(respDB))
      .catch((err) => console.log(err));
  },
  editBaja: (req, res) => {
    const { body } = req;
    ArticulosOC.updateMany(
      { ordenesCompra: req.params.id },
      { is_active: body.is_active }
    )
      .then((resDB) => res.status(201).json(resDB))
      .catch((err) => res.status(400).json(err));
  },
  findAllInfoArt: async (req, res) => {
    try {
      let temp = await ArticulosOC.find()
        .populate({ path: "ordenesCompra", populate: { path: "proveedores" } })
        .populate({ path: "articulos", populate: { path: "lineas" } })
        .populate({ path: "articulos", populate: { path: "marcas" } })
        .populate({ path: "articulos", populate: { path: "familias" } })
        .populate({ path: "articulos", populate: { path: "colecciones" } })
        .populate({ path: "articulos", populate: { path: "proveedores" } });

      let temp2 = await temp.map((a) => {
        return {
          codigo: a.articulos[0].codigo,
          nombre: a.articulos[0].nombre,
          idArticulo: a.articulos[0]._id,
          cantidad: a.cantidad,
          embarcado: a.embarcado,
          pendiente_embarcar: a.pendiente_embarcar,
        };
      });

      let agrupado = temp2.reduce(function (groups, item) {
        const val = item["idArticulo"];
        groups[val] = groups[val] || {
          idArticulo: item.idArticulo,
          cantidad: 0,
          embarcado: 0,
          pendiente_embarcar: 0,
        };
        groups[val].cantidad += item.cantidad;
        groups[val].embarcado += item.embarcado;
        groups[val].pendiente_embarcar += item.pendiente_embarcar;
        groups[val].nombre = item.nombre;
        groups[val].codigo = item.codigo;
        groups[val].idArticulo = item.idArticulo;
        return groups;
      }, []);

      let computedComments = Object.values(agrupado);
      res.status(200).json(computedComments);
    } catch (error) {
      res.status(400).json(error);
    }
  },
};