import express from "express";
import AuthController from "../controllers/auth.js";

const router = express.Router();

router
    .post('/singin', AuthController.cadastroDeUsuario)
    .post('/login', AuthController.validacaoDeUsuario)

export default router;