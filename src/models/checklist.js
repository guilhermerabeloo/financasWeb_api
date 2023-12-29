import pgPool from "../../config/pgPool.js"

function Checklist(){}

Checklist.prototype.buscaChecklist = async (req, res) => {
    const email = req.params.email;

    try {
        const sqlQuery = `
        select 
            ch.id,
            ch.item,
            ch.valor,
            ch.dia_mes,
            case
                when tch.checked = '1' then 1
                else 0
            end checked
        from checklistMensal as ch
        left join usuarios as u on u.id = ch.user_id 
        left join temp_checklistmensal as tch on ch.id = tch.item_id
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
    const { checklistmensal_id, data, email  } = req.body;

    try {
        if(!data || !email || !checklistmensal_id) {
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
            INSERT INTO temp_checklistmensal 
            (item_id, data, checked)
            VALUES
            ($1, $2, $3)
        `, [checklistmensal_id, data, 1])

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