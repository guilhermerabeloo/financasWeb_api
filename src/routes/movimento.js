import express from "express";
import MovimentoController from "../controllers/movimento.js";

const router = express.Router();

router
    .get('/buscaTipoMovimento', MovimentoController.tiposMovimento)
    .get('/listaMovimentos/:email', MovimentoController.listagemDeMovimentos)
    .post('/criaMovimento', MovimentoController.criacaoMovimento)

export default router;