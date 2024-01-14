import Movimento from "../models/movimento.js";

class MovimentoController {
    static tiposMovimento = async (req, res) => {
        const MovimentoModel = new Movimento();

        await MovimentoModel
            .buscaTipoMovimento(req)
            .then((resultado) => {
                res.status(200).send(resultado)
            })
            .catch((err) => {
                console.log(err)
                res.status(500).send(err)
            })
    }

    static criacaoMovimento = async (req, res) => {
        const MovimentoModel = new Movimento();

        try {
            const resultado = await MovimentoModel.criaMovimento(req);
            if(!resultado.msg) {
                throw resultado
            }
            res.status(200).send(resultado);
        } catch (err) {
            console.log(err);
            res.status(500).send(err);
        }
    }

    static listagemDeMovimentos = async (req, res) => {
        const MovimentoModel = new Movimento();

        try {
            const resultado = await MovimentoModel.listaMovimentos(req);
            if(!resultado.msg) {
                throw resultado
            }
            res.status(200).send(resultado);
        } catch (err) {
            console.log(err);
            res.status(500).send(err);
        }
    }

    static totaisDeMovimentosAtuais = async (req, res) => {
        const MovimentoModel = new Movimento();

        try {
            const resultado = await MovimentoModel.buscaTotaisMovimentosAtuais(req);
            if(!resultado.msg) {
                throw resultado
            }
            res.status(200).send(resultado);
        } catch (err) {
            console.log(err);
            res.status(500).send(err);
        }
    }
    
    static totaisDeMovimentos = async (req, res) => {
        const MovimentoModel = new Movimento();

        try {
            const resultado = await MovimentoModel.buscaTotaisMovimentos(req);
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

export default MovimentoController;