import pgPool from "../../config/pgPool.js"

function Movimento(){}

Movimento.prototype.buscaTipoMovimento = async (req, res) => {
    try {
        const sqlQuery = `select id, item  from tipomovimento t`

        const data = await pgPool(sqlQuery)
        const result = {
            code: 200,
            msg: true,
            data: data.rows
        }

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

Movimento.prototype.criaMovimento = async (req, res) => {
    const { email, dados } = req.body;
    
    try {
        if(!email || !dados) {
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

        const movimentos = dados.map((movimento) => {
            return `(${userId}, '${movimento.descricao}', '${movimento.data}', ${movimento.valor}, ${movimento.tipomovimento_id}, ${movimento.checklistmensal_id})`;
        });

        const sqlText = `
            insert into movimento 
            (user_id, descricao, data, valor, tipomovimento_id, checklistmensal_id)
            values
            ${movimentos.join(', ')}
        `
        
        await pgPool(sqlText)

        const result = {
            code: 200,
            msg: true,
            data: "Movimentos cadastrados com sucesso!",
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

export default Movimento;