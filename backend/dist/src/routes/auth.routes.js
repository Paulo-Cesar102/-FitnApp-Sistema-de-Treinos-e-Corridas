"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const UserController_1 = require("../controller/UserController");
const validate_1 = require("../middlewares/validate"); // Importa o validador
const user_schema_1 = require("../schemas/user.schema"); // Importa o desenho do login
const router = (0, express_1.Router)();
const controller = new UserController_1.UserController();
// A mágica acontece aqui:
router.post("/login", (0, validate_1.validate)(user_schema_1.loginSchema), controller.login.bind(controller));
exports.default = router;
