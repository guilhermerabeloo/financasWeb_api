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

Checklist.prototype.buscaTotaisChecklist = async (req, res) => {
    const email = req.params.email;

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
                (SELECT SUM(ch.valor) FROM checklistmensal ch WHERE ch.user_id = $1) AS valorTotal,
                (SELECT SUM(ch.valor) FROM checklistmensal ch INNER JOIN temp_checklistmensal tch ON ch.id = tch.item_id WHERE ch.user_id = $1) AS valorGasto;
        `, [ userId ])

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

Checklist.prototype.desmarcaItemChecklist = async (req, res) => {
    const { checklistmensal_id, email  } = req.body;

    try {
        if(!email || !checklistmensal_id) {
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

        const resultItem = await pgPool(`
            select 
                tc.id
            from temp_checklistmensal tc 
            inner join checklistmensal c on c.id = tc.item_id 
            inner join usuarios u on u.id = c.user_id 
            where
                u.id = $1
                and c.id = $2  
        `, [userId, checklistmensal_id])
        const tempItemId = resultItem.rows[0] && resultItem.rows[0].id;

        if(!tempItemId) {
            const result = {
                code: 404,
                hint: 'Item não encontrado',
                msg: false,
            }

            throw result
        }

        await pgPool(`delete from temp_checklistmensal tc where tc.id = $1`, [tempItemId])

        const result = {
            code: 200,
            msg: true,
            data: "Item de checklist desmarcado com sucesso!",
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

Checklist.prototype.renovaChecklist = async (req, res) => {
    const { email  } = req.body;

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

        await pgPool(`SELECT renova_checklist($1)`, [ userId ])

        const result = {
            code: 200,
            msg: true,
            data: "Checklist renovado com sucesso!",
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