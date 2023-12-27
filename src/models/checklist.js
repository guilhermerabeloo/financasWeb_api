import pgPool from "../../config/pgPool.js"

function Checklist(){}

Checklist.prototype.buscaChecklist = async (req, res) => {
    const email = req.params.email;

    try {
        const sqlQuery = `
            select 
                cl.id,
                cl.item,
                cl.valor,
                cl.dia_mes,
                case
                    when m.checklistMensal_id is null then 0
                    else 1
                end as checked
            from checklistMensal as cl
            left join usuarios as u on u.id = cl.user_id 
            left join movimento as m on cl.id = m.checklistMensal_id
            where 
                u.email = '${email}'
            order by 5, 4 
        `

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

Checklist.prototype.criaItemChecklist = async (req, res) => {
    const { email, item, valor, dia_mes } = req.body;

    try {
        if(!email || !item || !valor || !dia_mes) {
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

        await pgPool(`
            INSERT INTO checklistmensal 
            (item, valor, dia_mes, user_id)
            VALUES
            ($1, $2, $3, $4)
        `, [item, valor, dia_mes, userId])

        const result = {
            code: 200,
            msg: true,
            data: "Item de checklist cadastrado com sucesso!",
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

Checklist.prototype.marcaItemChecklist = async (req, res) => {
    const { descricao, data, valor, tipomovimento_id, email, checklistmensal_id } = req.body;
    console.log(descricao, data, valor, tipomovimento_id, email, checklistmensal_id)

    try {
        if(!descricao || !data || !valor || !tipomovimento_id || !email || !checklistmensal_id) {
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

        await pgPool(`
            INSERT INTO movimento 
            (descricao, data, valor, tipomovimento_id, user_id, checklistmensal_id)
            VALUES
            ($1, $2, $3, $4, $5, $6)
        `, [descricao, data, valor, tipomovimento_id, userId, checklistmensal_id])

        const result = {
            code: 200,
            msg: true,
            data: "Item de checklist marcado com sucesso!",
        };

        return result        
    } catch (err) {
        const result = {
            code: err.code || 500,
            hint: err.hint || 'Erro interno',
            msg: false,
            error: err,
        }
        
        return result
    }
}

export default Checklist;