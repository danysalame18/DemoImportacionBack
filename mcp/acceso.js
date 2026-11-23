// Reglas de acceso del MCP, iguales a las del front:
// - Header.js: el usuario de tienda (area Aby o Maya) solo ve el menu Tiendas, y Tiendas lo ve
//   quien este en area General o tenga menuTiendas.
// - Las pantallas de tienda filtran por la tienda del usuario.
// - Utilidad de tiendas: solo los usuarios de views/Reportes/usuariosUtilidadTiendas.js.
const AREAS = {
  GENERAL: process.env.REACT_APP_AREAS_GENERAL || '5fade908a9d14923bc7cd3d3',
  ABY: process.env.REACT_APP_AREAS_ABY || '6201b1920f94f86068a741c6',
  MAYA: process.env.REACT_APP_AREAS_MAYA || '6240a0754999152b10f8e0a3',
}
// Tienda Aby se migro a otra base: sus clientes no salen en ningun reporte de saldos
const AREA_EXCLUIDA = AREAS.ABY

const USUARIOS_UTILIDAD_TIENDAS = [
  '661db8938f3cb5005988712b', // ISAAC SHUEKE
  '662b063a0f8e873fc0fa6096', // RAFA SHUEKE
  '613a9434225bce3df050c220', // Admin Lynqro
]

const uno = (v) => (Array.isArray(v) ? v[0] : v)
const areaDe = (u) => String((uno(u && u.areas) && uno(u.areas)._id) || uno(u && u.areas) || '')
const esDeTienda = (u) => [AREAS.ABY, AREAS.MAYA].includes(areaDe(u))
const tiendaDe = (u) => (esDeTienda(u) ? areaDe(u) : '')
const accesoTiendas = (u) => esDeTienda(u) || areaDe(u) === AREAS.GENERAL || !!u.menuTiendas
const verCostos = (u) => !esDeTienda(u) && !!(u.inventarios || u.menu_reportes)
const verUtilidadTiendas = (u) => USUARIOS_UTILIDAD_TIENDAS.includes(String(u && u._id))

module.exports = { AREAS, AREA_EXCLUIDA, esDeTienda, tiendaDe, accesoTiendas, verCostos, verUtilidadTiendas }
