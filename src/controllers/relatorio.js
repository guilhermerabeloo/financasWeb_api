import Relatorio from "../models/relatorio.js";

class RelatorioController {
    static gerarRelLancamentosUsuario = async (req, res) => {
        const RelatorioModel = new Relatorio();
        try {
            const resultado = await RelatorioModel.lancamentosUsuario(req);
            if(!resultado.msg) {
                throw resultado;
            }
            res.status(200).send(resultado);
        } catch(err) {
            console.log(err);
            res.status(500).send(err);
        }

    }

    static gerarRelGraficos = async (req, res) => {
        const RelatorioModel = new Relatorio();
        try {
            const resultado = await RelatorioModel.relatorioGraficos(req);
            if(!resultado.msg) {
                throw resultado;
            }
            res.status(200).send(resultado);
        } catch(err) {
            console.log(err);
            res.status(500).send(err);
        }
    }
}

export default RelatorioController;