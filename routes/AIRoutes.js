const express = require("express");
const router  = express.Router();

const { AIController } = require("../controllers");
const { verifyToken }  = require("../middlewares");

router.post("/ai/chat", verifyToken, AIController.chat);

module.exports = router;
