import express from "express";
import MovimentoController from "../controllers/movimento.js";

const router = express.Router();

router
    .get('/buscaTipoMovimento', MovimentoController.tiposMovimento)

export default router;