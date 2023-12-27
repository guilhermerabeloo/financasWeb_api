import Checklist from "../models/checklist.js";

class ChecklistController {
    static itensDoChecklist = async (req, res) => {
        const checklistModel = new Checklist();

        await checklistModel
            .buscaChecklist(req)
            .then((resultado) => {
                res.status(200).send(resultado)
            })
            .catch((err) => {
                console.log(err)
                res.status(500).send(err)
            })
    }

    static cadastroItemChecklist = async (req, res) => {
        const checklistModel = new Checklist();

        await checklistModel
            .criaItemChecklist(req)
            .then((resultado) => {
                res.status(200).send(resultado)
            })
            .catch((err) => {
                console.log(err)
                res.status(500).send(err)
            })
    }

    static marcacaoItemChecklist = async (req, res) => {
        const checklistModel = new Checklist();

        await checklistModel
            .marcaItemChecklist(req)
            .then((resultado) => {
                res.status(200).send(resultado)
            })
            .catch((err) => {
                console.log(err)
                res.status(500).send(err)
            })
    }
}

export default ChecklistController;