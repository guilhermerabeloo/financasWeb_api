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

    static informacaoRealizado = async (req, res) => {
        const ObjetivoModal = new Objetivo();

        try {
            const resultado = await ObjetivoModal.informaRealizado(req);
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

    static consultaMetaAtual = async (req, res) => {
        const ObjetivoModal = new Objetivo();

        try {
            const resultado = await ObjetivoModal.buscaMetaAtual(req);
            if(!resultado.msg) {
                throw resultado
            }
            res.status(200).send(resultado);
        } catch (err) {
            console.log(err);
            res.status(500).send(err);
        }
    }

    static cancelamentoObjetivoTemp = async (req, res) => {
        const ObjetivoModal = new Objetivo();

        try {
            const resultado = await ObjetivoModal.cancelaObjetivoTemp(req);
            if(!resultado.msg) {
                throw resultado
            }
            res.status(200).send(resultado);
        } catch (err) {
            console.log(err);
            res.status(500).send(err);
        }
    }

    static consultaObjetivoCompleto = async (req, res) => {
        const ObjetivoModal = new Objetivo();

        try {
            const resultado = await ObjetivoModal.objetivoCompleto(req);
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