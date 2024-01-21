import pgPool from "../../config/pgPool.js"

function Movimento(){}

Movimento.prototype.listaMovimentos = async (req, res) => {
    const { email } = req.params;
    
    try {
        if(!email) {
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
        
        const data = await pgPool(`
            (
                select 
                    m.descricao 
                    , to_char(m.data, 'DD/MM/YYYY') AS data
                    , m.valor
                    , t.item as tipo
                from movimento m 
                inner join usuarios as u on u.id = m.user_id 
                inner join tipomovimento t on t.id = tipomovimento_id
                where 
                    m.user_id = ${userId}
            )
            union all
            (
                select 
                    c.item as descricao
                    , to_char(tc.data, 'DD/MM/YYYY') AS data
                    , c.valor
                    , 'Despesa' as tipo
                from checklistmensal c 
                inner join temp_checklistmensal tc on tc.item_id = c.id 
                where 
                    c.user_id = ${userId}
            )
            order by data desc
        `)

        const result = {
            code: 200,
            msg: true,
            data: data.rows,
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

Movimento.prototype.buscaTotaisMovimentos = async (req, res) => {
    const { email } = req.params;
    
    try {
        if(!email) {
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
        
        const data = await pgPool(`
            select 
                (select SUM(m.valor) as receita from movimento m inner join usuarios as u on u.id = m.user_id where m.user_id = ${userId} and m.tipomovimento_id = 2) as receitas,
                (select SUM(m.valor) from movimento m inner join usuarios as u on u.id = m.user_id where m.user_id = ${userId} and m.tipomovimento_id = 1) + (select sum(c.valor) from checklistmensal c inner join temp_checklistmensal tc on tc.item_id = c.id where c.user_id = ${userId}) as despesa
        `)

        const result = {
            code: 200,
            msg: true,
            data: data.rows,
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

Movimento.prototype.buscaTotaisMovimentosAtuais = async (req, res) => {
    const { email } = req.params;
    
    try {
        if(!email) {
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
        
        const data = await pgPool(`
            SELECT 
                (SELECT COALESCE(SUM(m.valor), 0) FROM movimento m 
                INNER JOIN usuarios u ON u.id = m.user_id 
                WHERE m.user_id = ${userId} AND m.tipomovimento_id = 2 AND DATE_TRUNC('MONTH', m.data) = DATE_TRUNC('MONTH', CURRENT_DATE)) AS receitas,
                (SELECT COALESCE(SUM(m.valor), 0) FROM movimento m 
                INNER JOIN usuarios u ON u.id = m.user_id 
                WHERE m.user_id = ${userId} AND m.tipomovimento_id = 1 AND DATE_TRUNC('MONTH', m.data) = DATE_TRUNC('MONTH', CURRENT_DATE)) 
                +
                (SELECT COALESCE(SUM(c.valor), 0) FROM checklistmensal c 
                INNER JOIN temp_checklistmensal tc ON tc.item_id = c.id 
                WHERE c.user_id = ${userId}) AS despesa      
        `)

        const result = {
            code: 200,
            msg: true,
            data: data.rows,
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