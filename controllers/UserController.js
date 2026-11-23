const { User, Logs } = require('../models')
const { UserService } = require('../services')
const { comparePasswords, createToken } = require('../utils')
const bcrypt = require ('bcrypt')
const { SendMailService } = require('../services')

const SALT_WORK_FACTOR = 10;

module.exports = {
    findAll: (request, response)=>{
        User.find()
        .populate('clientes')
        .populate('planteles')
        .populate('areas')
            .then((respDB)=> response.status(200).json(respDB))
            .catch((err)=> console.log(err));
    },
    findUsuarios: (request, response)=>{
        User.find({menu_edoCta_Cliente:false})
        .populate('planteles')
        .populate('areas')
            .then((respDB)=> response.status(200).json(respDB))
            .catch((err)=> console.log(err));
    },
    findOne: (request, response)=>{
        User.findById(request.params.id)
        .populate('clientes')
        .populate('planteles')
        .populate('areas')
            .then((respDB)=> response.status(200).json(respDB))
            .catch((err)=> console.log(err));
    },
    findStatus: (request, response)=>{
        const { status } = request.params
        User.find({is_active:status})
        .populate('clientes')
        .populate('planteles')
        .populate('areas')
            .then((respDB)=> response.status(200).json(respDB))
            .catch((err)=> console.log(err));
    },
    findOneFamilia: (request, response)=>{
        const { email } = request.params
        User.find({ email })
        .populate('clientes')
        .populate('planteles')
        .populate('areas')
            .then((respDB)=> response.status(200).json(respDB))
            .catch((err)=> console.log(err));
    },
    findOneClientePassword: (request, response)=>{
        const { id } = request.params
        User.find({ clientes: id })
        .populate('clientes')
        .populate('planteles')
        .populate('areas')
            .then((respDB)=> {
                response.status(200).json(respDB)
            })
            .catch((err)=> console.log(err));
    },
    findOneFamiliaPassword: (request, response)=>{
        const { id } = request.params
        User.find({ familias: id })
        .populate('clientes')
        .populate('planteles')
        .populate('areas')
            .then((respDB)=> {
                response.status(200).json(respDB)
            })
            .catch((err)=> console.log(err));
    },
    signup: async (request, response)=>{
        const { body } = request;
        try {
                const newUser = new User(body);
                const user = await newUser.save();
                user.password = undefined
                SendMailService.Mail(body.email, 'Alta Usuario', 
                `<table border="0" cellpadding="0" cellspacing="0" width="100%">
                <th><img width="${process.env.REACT_APP_TAMANO_LOGO_MAIL}" align="center" src="${process.env.REACT_APP_LINK_SISTEMA}logoInstitucion.png" /></th>
                <tr align="center" style="font-size:30px;font-family:Helvetica,Arial,sans-serif;color:#333333;padding-top:30px;font-weight:bold"><br>Hola ${body.nombre} ${body.apellido}.</tr>
                <tbody>
                <tr align="center" style="font-size:24px;font-family:Helvetica,Arial,sans-serif;color:#333333;padding-top:30px"><br>${process.env.REACT_APP_NOMBRE_INSTITUCION} te da la bienvenida!</tr>
                <tr align="center" style="font-size:18px;font-family:Helvetica,Arial,sans-serif;color:#333333;padding-top:30px"><br>Has quedado registrado en nuestro sistema</tr>
                <tr align="center" style="font-size:18px;font-family:Helvetica,Arial,sans-serif;color:#333333;padding-top:30px"><br>Podras acceder con las siguientes credenciales:</tr>
                <tr align="center" style="font-size:18px;font-family:Helvetica,Arial,sans-serif;color:#333333;padding-top:30px"><br>Usuario: ${body.email}</tr>
                <tr align="center" style="font-size:18px;font-family:Helvetica,Arial,sans-serif;color:#333333;padding-top:30px"><br>Contraseña: ${body.password}</tr>
                <tr align="center" style="font-size:18px;font-family:Helvetica,Arial,sans-serif;color:#333333;padding-top:30px"><br>Puedes ingresar en el siguiente link: ${process.env.REACT_APP_LINK_SISTEMA}login</tr>
                </tbody>
                <tr style="font-size:16px;font-family:Helvetica,Arial,sans-serif;color:#333333;padding-top:10px"><br>Favor de no responder este correo, para cualquier duda favor de comunicarse al ${process.env.REACT_APP_TELEFONO_INSTITUCION}</tr>
                
                </table>`)
                response.status(201).json({message: 'Successfull Created'})
            } catch (error) {
                response.status(400).json(error)
            }
    },
login: async (req, res) => {
    try {
      const { email, password } = req.body || {};
      if (!email || !password) {
        return res.status(400).json({ message: 'Email y password son requeridos' });
      }

      const user = await UserService.findOneLogin(email);
      if (!user) {
        return res.status(401).json({ message: 'Email no válido' });
      }

      const isValid = comparePasswords(password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: 'Password inválido' });
      }

      const token = createToken(user);
      if (!token) {
        return res.status(500).json({ message: 'Error creando token' });
      }

      // log no debe bloquear; si falla, seguimos
      Logs.create({ tipo: 'Login', detalle: `${user.nombre} ${user.apellido}`, user: user._id })
        .catch(() => {});

      return res.status(200).json({ message: 'Login ok', token });
    } catch (err) {
      console.error('Login error:', err?.message || err);
      return res.status(500).json({ message: 'Error en login' });
    }
  },

    passwordUser: async (request, response)=>{
        const { email, password, passwordNuevo } = request.body;
        try {
            const user = await UserService.findOneByEmail(email);
            if(!user) response.status(400).json({message: 'Email not valid'})
            const isValid = comparePasswords(password, user.password)
            if (!isValid) {response.status(400).json({message: 'Invalid Password'})}
            else {
            const hash = bcrypt.hashSync(passwordNuevo, SALT_WORK_FACTOR);
   const updated = await User.findByIdAndUpdate(request.params.id, {password: hash}, {new: true})
            SendMailService.Mail([user.email], 'Cambio Contraseña',
             `<table border="0" cellpadding="0" cellspacing="0" width="100%">
             <th><img width="${process.env.REACT_APP_TAMANO_LOGO_MAIL}" align="center" src="${process.env.REACT_APP_LINK_SISTEMA}logoInstitucion.png" /></th>
             <tr align="center" style="font-size:30px;font-family:Helvetica,Arial,sans-serif;color:#333333;padding-top:30px;font-weight:bold"><br>Hola ${user.nombre} ${user.apellido}.</tr>
             <tbody>
             <tr align="center" style="font-size:24px;font-family:Helvetica,Arial,sans-serif;color:#333333;padding-top:30px"><br>${process.env.REACT_APP_NOMBRE_INSTITUCION}</tr>
             <tr align="center" style="font-size:18px;font-family:Helvetica,Arial,sans-serif;color:#333333;padding-top:30px"><br>Ha cambiado tu contraseña</tr>
             <tr align="center" style="font-size:18px;font-family:Helvetica,Arial,sans-serif;color:#333333;padding-top:30px"><br>Podras acceder con las siguientes credenciales:</tr>
             <tr align="center" style="font-size:18px;font-family:Helvetica,Arial,sans-serif;color:#333333;padding-top:30px"><br>Usuario: ${user.email}</tr>
             <tr align="center" style="font-size:18px;font-family:Helvetica,Arial,sans-serif;color:#333333;padding-top:30px"><br>Contraseña: ${passwordNuevo}</tr>
             <tr align="center" style="font-size:18px;font-family:Helvetica,Arial,sans-serif;color:#333333;padding-top:30px"><br>Puedes ingresar en el siguiente link: ${process.env.REACT_APP_LINK_SISTEMA}login</tr>
             </tbody>
             <tr style="font-size:16px;font-family:Helvetica,Arial,sans-serif;color:#333333;padding-top:10px"><br>Favor de no responder este correo, para cualquier duda favor de comunicarse al ${process.env.REACT_APP_TELEFONO_INSTITUCION}</tr>
         
             </table>`)
             response.status(201).json({message: 'Se guardo la contraseña'})
            }
        } catch (error) {
            response.status(400).json(error)
        }
    },
    passwordCliente: async (request, response)=>{
        const { body } = request;
        const password = request.body.password
        try{
            const usuario = await User.findById(request.params.id)
            const hash = bcrypt.hashSync(password, SALT_WORK_FACTOR);
   const updated = await User.findByIdAndUpdate(request.params.id, {password: hash}, {new: true})
            SendMailService.Mail([usuario.email], 'Cambio Contraseña', 
            `<table border="0" cellpadding="0" cellspacing="0" width="100%">
            <th><img width="${process.env.REACT_APP_TAMANO_LOGO_MAIL}" align="center" src="${process.env.REACT_APP_LINK_SISTEMA}logoInstitucion.png" /></th>
            <tr align="center" style="font-size:30px;font-family:Helvetica,Arial,sans-serif;color:#333333;padding-top:30px;font-weight:bold"><br>Hola ${usuario.nombre} ${usuario.apellido}.</tr>
            <tbody>
            <tr align="center" style="font-size:24px;font-family:Helvetica,Arial,sans-serif;color:#333333;padding-top:30px"><br>${process.env.REACT_APP_NOMBRE_INSTITUCION}</tr>
            <tr align="center" style="font-size:18px;font-family:Helvetica,Arial,sans-serif;color:#333333;padding-top:30px"><br>Ha cambiado tu contraseña</tr>
            <tr align="center" style="font-size:18px;font-family:Helvetica,Arial,sans-serif;color:#333333;padding-top:30px"><br>Podras acceder con las siguientes credenciales:</tr>
            <tr align="center" style="font-size:18px;font-family:Helvetica,Arial,sans-serif;color:#333333;padding-top:30px"><br>Usuario: ${usuario.email}</tr>
            <tr align="center" style="font-size:18px;font-family:Helvetica,Arial,sans-serif;color:#333333;padding-top:30px"><br>Contraseña: ${password}</tr>
            <tr align="center" style="font-size:18px;font-family:Helvetica,Arial,sans-serif;color:#333333;padding-top:30px"><br>Puedes ingresar en el siguiente link: ${process.env.REACT_APP_LINK_SISTEMA}login</tr>
            </tbody>
            <tr style="font-size:16px;font-family:Helvetica,Arial,sans-serif;color:#333333;padding-top:10px"><br>Favor de no responder este correo, para cualquier duda favor de comunicarse al ${process.env.REACT_APP_TELEFONO_INSTITUCION}</tr>
         
            </table>`)
            response.status(201).json({message: 'Se guardo la contraseña'})
        }catch (error) {
            response.status(400).json(error)
        }
    },
    edit: (request, response)=>{
        const { body } = request;
        User.findByIdAndUpdate(request.params.id, body, {new: true})
            .then((respDB)=> response.status(201).json(respDB))
            .catch((error)=> response.status(400).json(error))
    },
    delete: (request, response)=>{
        User.findByIdAndDelete(request.params.id)
            .then((respDB)=> response.status(200).json(respDB))
            .catch((err)=> console.log(err));
    },
};