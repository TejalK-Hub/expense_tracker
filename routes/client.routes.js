const express = require("express");

const router = express.Router();

const controller = require("../controllers/client.controller");

const authMiddleware = require("../middleware/auth");

// -------------------------------- CLIENTS --------------------------------

router.get("/", authMiddleware, controller.getClients);

router.get("/sites/distinct", authMiddleware, controller.getDistinctSites);

router.get("/:id", authMiddleware, controller.getClientById);

router.post("/", authMiddleware, controller.createClient);

router.put("/:id", authMiddleware, controller.updateClient);

router.delete("/:id", authMiddleware, controller.deleteClient);

module.exports = router;
