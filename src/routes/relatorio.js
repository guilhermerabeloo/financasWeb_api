import express from "express";
import RelatorioController from "../controllers/relatorio.js";

const router = express.Router();

router
    .post('/lancamentosUsuario', RelatorioController.gerarRelLancamentosUsuario)
    .post('/relatorioGraficos', RelatorioController.gerarRelGraficos)

export default router
