import express from "express";
import ObjetivoController from "../controllers/objetivo.js";

const router = express.Router();

router
    .get('/buscaObjetivo/:email', ObjetivoController.consultaObjetivo)
    .get('/buscaObjetivoTemp/:email', ObjetivoController.consultaObjetivoTemp)
    .get('/buscaObjetivoCompleto/:email', ObjetivoController.consultaObjetivoCompleto)
    .get('/buscaMetaAtual/:email', ObjetivoController.consultaMetaAtual)
    .post('/criaCabecalhoObjetivo', ObjetivoController.criacaoCabecalhoObjetivo)
    .post('/criaMetasObjetivo', ObjetivoController.criacaoMetasObjetivo)
    .post('/informaRealizado', ObjetivoController.informacaoRealizado)
    .delete('/cancelaObjetivoTemp/:email', ObjetivoController.cancelamentoObjetivoTemp)

export default router