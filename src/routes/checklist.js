import express from "express";
import ChecklistController from "../controllers/checklist.js";

const router = express.Router();

router
    .get('/checklistUsuario/:email', ChecklistController.itensDoChecklist)
    .post('/criaItemChecklist', ChecklistController.cadastroItemChecklist)

export default router;