import Objetivo from "../models/objetivo.js";

class ObjetivoController {
    static criacaoCabecalhoObjetivo = async (req, res) => {
        const ObjetivoModal = new Objetivo();

        try {
            const resultado = await ObjetivoModal.criaCabecalhoObjetivo(req);
            if(!resultado.msg) {
                throw resultado
            }
            res.status(200).send(resultado);
        } catch (err) {
            console.log(err);
            res.status(500).send(err);
        }
    }

    static criacaoMetasObjetivo = async (req, res) => {
        const ObjetivoModal = new Objetivo();

        try {
            const resultado = await ObjetivoModal.criaMetasObjetivo(req);
            if(!resultado.msg) {
                throw resultado
            }
            res.status(200).send(resultado);
        } catch (err) {
            console.log(err);
            res.status(500).send(err);
        }
    }

    static consultaObjetivo = async (req, res) => {
        const ObjetivoModal = new Objetivo();

        try {
            const resultado = await ObjetivoModal.buscaObjetivo(req);
            if(!resultado.msg) {
                throw resultado
            }
            res.status(200).send(resultado);
        } catch (err) {
            console.log(err);
            res.status(500).send(err);
        }
    }

    static consultaObjetivoTemp = async (req, res) => {
        const ObjetivoModal = new Objetivo();

        try {
            const resultado = await ObjetivoModal.buscaObjetivoTemp(req);
            if(!resultado.msg) {
                throw resultado
            }
            res.status(200).send(resultado);
        } catch (err) {
            console.log(err);
            res.status(500).send(err);
        }
    }
}

export default ObjetivoController;