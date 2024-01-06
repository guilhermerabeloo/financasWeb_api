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

export default Movimento;