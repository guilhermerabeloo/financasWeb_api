import pgPool from "../../config/pgPool.js"

function Checklist(){}

Checklist.prototype.buscaChecklist = async (req, res) => {
    const usuario = req.params.user;

    try {
        const sqlQuery = `
            select 
                cl.id,
                cl.item,
                cl.dia_mes,
                case
                    when m.checklistMensal_id is null then 0
                    else 1
                end as checked
                
            from checklistMensal as cl
            left join movimento as m on cl.id = m.checklistMensal_id
            where 
                cl.user_id = ${usuario}
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

export default Checklist;