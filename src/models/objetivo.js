import pgPool from "../../config/pgPool.js";

function Objetivo() {}

Objetivo.prototype.criaCabecalhoObjetivo = async (req, res) => {
    const { email, nome, dataInicio, dataFinal, valorInicial, valorFinal } = req.body;

    try {
        if(!email || !nome || !dataInicio || !dataFinal || !valorInicial || !valorFinal) {
            const result = {
                code: 400,
                hint: 'Parâmetros inválidos',
                msg: false,
            };
            throw result;
        }

        const resultUsuario = await pgPool(`SELECT id FROM usuarios WHERE email = $1`, [email]);
        const userId = resultUsuario.rows[0] && resultUsuario.rows[0].id;

        if(!userId) {
            const result = {
                code: 404,
                hint: 'Usuário não encontrado',
                msg: false,
            }

            throw result
        }
        
        const objetivo = await pgPool(`
            INSERT INTO objetivo 
            (nome, dataInicio, dataFinal, valorInicio, valorFinal, user_id)
            VALUES 
            ('${nome}', '${dataInicio}', '${dataFinal}', ${valorInicial}, ${valorFinal}, ${userId})
            RETURNING id;
        `)

        const result = {
            code: 200,
            msg: true,
            objetivo: objetivo.rows[0].id,
        };

        return result
    } catch(err) {
        const result = {
            code: err.code || 500,
            hint: err.hint || 'Erro interno',
            msg: false,
            error: err,
        }
        
        return result
    }
}

Objetivo.prototype.criaMetasObjetivo = async (req, res) => {
    const { email, objetivo, metas } = req.body;

    try {
        if(!email || !objetivo || !metas) {
            const result = {
                code: 400,
                hint: 'Parâmetros inválidos',
                msg: false,
            };
            throw result;
        }

        const resultUsuario = await pgPool(`SELECT id FROM usuarios WHERE email = $1`, [email]);
        const userId = resultUsuario.rows[0] && resultUsuario.rows[0].id;

        if(!userId) {
            const result = {
                code: 404,
                hint: 'Usuário não encontrado',
                msg: false,
            }

            throw result
        }

        const resultObj = await pgPool(`select id from objetivo where user_id = $1`, [userId]);
        
        if(resultObj.rowCount == 0) {
            const result = {
                code: 404,
                hint: 'Objetivo não encontrado',
                msg: false,
            }
            
            throw result
        }
        const objetivoId = resultObj.rows[0].id;

        const meses = metas.map((meta) => {
            return `('${meta.competencia}', '${meta.data}', ${meta.valor}, ${objetivoId})`;
        });
        
        await pgPool(`
            INSERT INTO meta_objetivo 
            (competencia, data, meta, objetivo_id)
            VALUES
            ${meses.join(', ')}
        `)

        const result = {
            code: 200,
            msg: true,
            data: 'Metas cadastradas com sucesso!',
        };

        return result
    } catch(err) {
        const result = {
            code: err.code || 500,
            hint: err.hint || 'Erro interno',
            msg: false,
        }
        
        return result
    }
}

export default Objetivo;