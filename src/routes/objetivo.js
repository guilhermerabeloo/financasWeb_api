import express from "express";
import ObjetivoController from "../controllers/objetivo.js";

const router = express.Router();

router
    .get('/buscaObjetivo/:email', ObjetivoController.consultaObjetivo)
    .get('/buscaObjetivoTemp/:email', ObjetivoController.consultaObjetivoTemp)
    .post('/criaCabecalhoObjetivo', ObjetivoController.criacaoCabecalhoObjetivo)
    .post('/criaMetasObjetivo', ObjetivoController.criacaoMetasObjetivo)
    .delete('/cancelaObjetivoTemp/:email', ObjetivoController.cancelamentoObjetivoTemp)

export default router