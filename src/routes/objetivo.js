import express from "express";
import ObjetivoController from "../controllers/objetivo.js";

const router = express.Router();

router
    .post('/criaCabecalhoObjetivo', ObjetivoController.criacaoCabecalhoObjetivo)
    .post('/criaMetasObjetivo', ObjetivoController.criacaoMetasObjetivo)

export default router