const express = require("express");
const router = express.Router();

const { verifyToken } = require('../middlewares')
const { FileController } = require("../controllers");

router.post("/upmedia", verifyToken, FileController.upMedia);
router.post("/upprofile", verifyToken, FileController.upProfilePhoto);
router.post("/cargaMasiva", verifyToken, FileController.cargaMasiva);
router.get("/findonemedia/:id", verifyToken, FileController.findOne);
router.get("/findallmedia", verifyToken, FileController.findAllMedia);
router.get("/findmediabytag/:tag", verifyToken, FileController.findMediaByTag);
router.post("/delmedia/:id", verifyToken, FileController.delMedia);
router.post("/delmediapublic", verifyToken, FileController.delMediaPublicId);

module.exports = router;