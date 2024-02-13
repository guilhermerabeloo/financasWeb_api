import express from "express";
import MovimentoController from "../controllers/movimento.js";

const router = express.Router();

router
    .get('/buscaTipoMovimento', MovimentoController.tiposMovimento)
    .get('/listaMovimentos/:email', MovimentoController.listagemDeMovimentos)
    .get('/listaTags/:email', MovimentoController.listagemTagsMovimentos)
    .get('/totaisMovimentos/:email', MovimentoController.totaisDeMovimentos)
    .get('/totaisMovimentosAtuais/:email', MovimentoController.totaisDeMovimentosAtuais)
    .post('/criaMovimento', MovimentoController.criacaoMovimento)

export default router;