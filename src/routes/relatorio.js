import express from "express";
import RelatorioController from "../controllers/relatorio.js";

const router = express.Router();

router
    .post('/lancamentosUsuario', RelatorioController.gerarRelLancamentosUsuario)

export default router
