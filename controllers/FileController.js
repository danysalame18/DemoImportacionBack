const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { Articulos } = require('../models')

cloudinary.config({
  cloud_name: "sistemify",
  api_key: process.env.API_KEY_CLOUDINARY,
  api_secret: process.env.API_SECRET_CLOUDINARY,
});

// async function transformar() {
//   try {
//     const articulos = await Articulos.find({ foto: "Si" });

//     let art2 = articulos.slice(0, 1500);

//     for (const articulo of art2) {
//       const publicId = `americanFlyArticulos/${articulo._id}`;

//       try {
//         const result = await cloudinary.api.resource(publicId);

//         if (result && result.secure_url) {
//           const uploadResult = await cloudinary.uploader.upload(result.secure_url, {
//             public_id: publicId,
//             quality: 'auto:low',
//             overwrite: true // Asegúrate de que la imagen existente se sobrescriba con la versión optimizada
//           });

//           await Articulos.findByIdAndUpdate(
//             articulo._id,
//             { urlFoto: uploadResult.secure_url },
//             { new: true }
//           );

//           console.log(`Optimized ${result.secure_url} to ${uploadResult.secure_url}`);
//         } else {
//           console.error(`No URL found for articulo ${articulo._id}`);
//         }
//       } catch (err) {
//         console.error(`Error processing articulo ${articulo._id}:`, err);
//       }
//     }

//     console.log("Updated all image URLs with quality auto:low");
//   } catch (err) {
//     console.error(err);
//   }
// }

// // Ejemplo de uso de la función transformar
// transformar();


module.exports = {
  upMedia: (req, res) => {
    // El archivo temporal lleva un nombre UNICO. Antes se guardaba con el
    // nombre original (file.originalname): si llegaban dos subidas con el
    // mismo nombre al mismo tiempo (las dos evidencias de una venta suelen ser
    // la misma foto, o dos usuarios subiendo IMG_1234.jpg), la segunda pisaba
    // a la primera en disco y el unlinkSync de una borraba el archivo de la
    // otra antes de subirlo a Cloudinary. De ahi que "a veces no agarra".
    const storage = multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, "./api");
      },
      filename: function (req, file, cb) {
        const sufijo = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${sufijo}-${file.originalname}`);
      },
    });
    const upload = multer({ storage }).single("file");
    upload(req, res, function (err) {
      if (err) {
        return res.status(400).send(err);
      }
      if (!req.file) {
        return res.status(400).json({ message: "No se recibio ningun archivo" });
      }
      const path = req.file.path;
      const nombre = req.body.nombre;
      // public_id unico tambien en Cloudinary (el ISO de la fecha se repetia
      // si dos subidas caian en el mismo milisegundo)
      const uniqueFilename = `${new Date().toISOString()}-${Math.round(Math.random() * 1e6)}`;
      const fs = require("fs");
      const limpiar = () => { try { fs.unlinkSync(path); } catch (e) {} };
      cloudinary.uploader.upload(
        path,
        { public_id: `americanFlyEvidencia/${uniqueFilename}`, tags: nombre, format:"jpg", quality: "auto:low" }, // directory and tags are optional
        function (err, image) {
          limpiar();
          if (err) return res.status(500).send(err);
          res.status(200).json(image);
        }
      );
    });
  },
  cargaMasiva: (req, res) => {
    const storage = multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, "./api");
      },
      filename: function (req, file, cb) {
        // nombre temporal unico: evita que dos subidas simultaneas se pisen en disco
        const sufijo = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${sufijo}-${file.originalname}`);
      },
    });
    const upload = multer({ storage }).single("file");
    upload(req, res, async function (err) {
      if (err) {
        return res.send(err);
      }
      const path = req.file.path;

      // El codigo del modelo es el nombre ORIGINAL del archivo (sin extension);
      // en disco el archivo lleva un prefijo unico y no sirve para buscarlo.
      let b = String(req.file.originalname || "").split(".")[0]

      let c = await Articulos.find({codigo: b})
      if(c.length == 0){
        return res.send("No existe el articulo")
      }
      cloudinary.uploader.upload(
        path,
        { public_id: `americanFlyArticulos/${c[0]._id}`, format:"jpg", quality: "auto:low", overwrite: true }, // directory and tags are optional
       async function (err, image) {
          if (err) return res.send(err);
          await Articulos.findByIdAndUpdate(
            c[0]._id,
            { urlFoto: image.secure_url, foto:"Si" },
            { new: true }
        );
          const fs = require("fs");
          fs.unlinkSync(path);
          res.status(200).json(image);
        }
      );
    });
  },
  upProfilePhoto: (req, res) => {
    const storage = multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, "./api");
      },
      filename: function (req, file, cb) {
        // nombre temporal unico: evita que dos subidas simultaneas se pisen en disco
        const sufijo = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${sufijo}-${file.originalname}`);
      },
    });
    const upload = multer({ storage }).single("file");
    upload(req, res, function (err) {
      if (err) {
        return res.send(err);
      }
      const path = req.file.path;
      const articulo = req.body.articulo;
      cloudinary.uploader.upload(
        path,
        { public_id: `americanFlyArticulos/${articulo}`, format:"jpg", quality: "auto:low", overwrite: true }, // directory and tags are optional
        async function (err, image) {
          if (err) return res.send(err);
          await Articulos.findByIdAndUpdate(
            articulo,
            { urlFoto: image.secure_url },
            { new: true }
        );
          const fs = require("fs");
          fs.unlinkSync(path);
          res.status(200).json(image);
        }
      );
    });
  },
  findOne: (req, res) => {
    cloudinary.api.resource(
      `americanFlyArticulos/${req.params.id}`,
      function (err, result) {
        if (err) return res.send(err);
        res.status(200).json(result);
      }
    );
  },
  findAllMedia: (req, res) => {
    cloudinary.api.resources(function (err, result) {
      if (err) return res.send(err);
      res.status(200).json(result);
    });
  },
  // Borra una imagen de Cloudinary por su public_id (viene en el body porque
  // trae "/" y no cabe en un parametro de ruta). Lo usa el modal de evidencias.
  delMediaPublicId: async (req, res) => {
    const { public_id } = req.body || {};
    if (!public_id) return res.status(400).json({ message: "Falta public_id" });
    try {
      const r = await cloudinary.uploader.destroy(public_id, { invalidate: true });
      res.status(200).json(r);
    } catch (err) {
      console.error("Error borrando evidencia:", err);
      res.status(500).send(err);
    }
  },
  findMediaByTag: (req, res) => {
    // esta funcion solo encuentra imagenes con el tag, no otro tipo de archivo
    cloudinary.api.resources_by_tag(req.params.tag, {max_results:100}, function (err, result) {
      if (err) return res.send(err);
      res.status(200).json(result);
    });
  },
  findMediaByTag2: (req, res) => {
    cloudinary.search
      .expression(req.params.tag)
      .with_field("context")
      .with_field("tags")
      .max_results(10)
      .execute()
      .then((resDB) => res.status(200).json(resDB))
      .catch((Error) => console.log(Error));
  },
  delMedia: async (req, res) => {
    try {
      const assetId = req.params.id;
      // Buscar el recurso para obtener el public_id
      const resourceResult = await cloudinary.search
        .expression(`asset_id:${assetId}`)
        .execute();
  
      if (resourceResult.resources.length > 0) {
        const publicId = resourceResult.resources[0].public_id;
  
        // Borrar el recurso usando el public_id
        const deleteResult = await cloudinary.api.delete_resources(publicId);
  
        res.status(200).json(deleteResult);
      } else {
        res.status(404).json({ message: "Resource not found" });
      }
    } catch (err) {
      console.error("Error deleting resource:", err);
      res.status(500).send(err);
    }
  },
  findOneAndUpdate: async (req, res) => {
    try {
        let art = await Articulos.find({foto: "Si" });

        // Array para guardar las promesas
        let promises = art.map(a => {
            return new Promise((resolve, reject) => {
                cloudinary.api.resource(`americanFlyArticulos/${a._id}`, async function (err, result) {
                    if (err) return reject(err);
                    try {
                        await Articulos.findByIdAndUpdate(
                            a._id,
                            { urlFoto: result.secure_url },
                            { new: true }
                        );
                        resolve(result);
                    } catch (updateErr) {
                        reject(updateErr);
                    }
                });
            });
        });

        // Esperar a que todas las promesas se resuelvan
        let results = await Promise.all(promises);

        // Enviar una respuesta con los resultados
        res.status(200).json(results);
    } catch (err) {
        // Manejar errores y enviar una respuesta de error
        res.status(500).json({ error: err.message });
    }
},
};