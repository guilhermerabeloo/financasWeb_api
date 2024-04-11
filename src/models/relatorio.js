import pgPool from "../../config/pgPool.js";

function Relatorio() {}

Relatorio.prototype.lancamentosUsuario = async (req, res) => {
    const { email, dtInicio, dtFinal } = req.body;

    try {   
        if(!email || !dtInicio || !dtFinal) {
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

        const nomesMovimentos = await pgPool(`
            select distinct 
                case
                    when m.tipomovimento_id = 2 then 'C'
                    else 'D'
                end as tipoMovimento,
                m.descricao  
            from movimento m 
            where 
                user_id = $1
                and m.data >= $2
                and m.data <= $3
            order by 1 
        `, [userId, dtInicio, dtFinal])

        return Promise.all(nomesMovimentos.rows.map(async (m) => {
            const lancamentos = await pgPool(`
                SELECT * FROM relatorio_lancamentos($1, $2, $3, $4)
            `, [userId, m.descricao, dtInicio, dtFinal])

            const linhas = lancamentos.rows;
            let competencias = [];
            let valores = [];

            linhas.forEach((i) => {
                competencias.push(i.competencia)
                valores.push(i.valor)
            })
            const resultado = {
                rotulo: m.descricao,
                tipo: m.tipomovimento,
                competencias: competencias,
                valores: valores
            }
            
            return resultado
        })).then(movimentos => {
            return {
                code: 200,
                msg: true,
                data: movimentos,
            };
        })
    } catch(err) {
        const result = {
            code: 500,
            hint: err.hint || 'Erro interno',
            msg: false,
        }
        
        return result
    }
}

export default Relatorio;