import express from "express";
import ChecklistController from "../controllers/checklist.js";

const router = express.Router();

router
    .get('/checklistUsuario/:email', ChecklistController.itensDoChecklist)
    .get('/totaisDoChecklist/:email', ChecklistController.totaisDoChecklist)
    .post('/criaItemChecklist', ChecklistController.cadastroItemChecklist)
    .post('/marcaItemChecklist', ChecklistController.marcacaoItemChecklist)
    .post('/desmarcaItemChecklist', ChecklistController.desmarcacaoItemChecklist)

export default router;