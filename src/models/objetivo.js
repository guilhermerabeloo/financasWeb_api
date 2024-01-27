import pgPool from "../../config/pgPool.js";

function Objetivo() {}

Objetivo.prototype.criaCabecalhoObjetivo = async (req, res) => {
    const { email, nome, dataInicio, dataFinal, valorInicial, valorFinal, id, tipoObjetivo } = req.body;
    try {
        if(!email || !nome || !dataInicio || !dataFinal || !valorFinal) {
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

        if(id) {
            await pgPool(`
                UPDATE objetivo
                SET
                    nome = $2,
                    datainicio = $3,
                    datafinal = $4,
                    valorinicio = $5,
                    valorfinal = $6,
                    tipo_id = $7
                WHERE
                    id = $1
            `, [id, nome, dataInicio, dataFinal, valorInicial, valorFinal, tipoObjetivo])

            const result = {
                code: 200,
                msg: true,
                data: "Objetivo temporário atualizado com sucesso!",
                objetivo: id
            };
    
            return result
        }
        
        const objetivo = await pgPool(`
            SELECT cria_objetivo($1, $2, $3, $4, $5, $6, $7)
        `, [userId, Number(tipoObjetivo), nome, dataInicio, dataFinal, valorInicial, valorFinal])

        const result = {
            code: 200,
            msg: true,
            objetivo: objetivo.rows[0].cria_objetivo,
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

        const insert = `
            INSERT INTO meta_objetivo 
            (competencia, data, meta, objetivo_id)
            VALUES
            ${[meses.join(', ')]};
        `
        await pgPool(insert);
        await pgPool(`
            DELETE FROM temp_objetivo
            WHERE
                user_id = $1;
        `, [userId])
        
        const result = {
            code: 200,
            msg: true,
            data: 'Metas cadastradas com sucesso!',
        };

        return result
    } catch(err) {
        const result = {
            code: 500,
            hint: err.hint || 'Erro interno',
            msg: false,
        }
        
        return result
    }
}

Objetivo.prototype.buscaObjetivo = async (req, res) => {
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
            select 
                o.id
                , o.nome 
                , o.datainicio 
                , o.datafinal 
                , o.valorinicio 
                , o.valorfinal 
                , mo.competencia
                , mo.data 
                , mo.meta 
                , mo.realizado 
                , mo.atingido 
            from objetivo o 
            inner join meta_objetivo mo on mo.objetivo_id = o.id
            where 
                o.user_id = ${userId}
            order by
                mo.data     
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
        }
        
        return result
    }
}


Objetivo.prototype.buscaObjetivoTemp = async (req, res) => {
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
            select 
                o.id
                , o.nome 
                , TO_CHAR(datainicio, 'YYYY-MM-DD') as datainicio 
                , TO_CHAR(datafinal, 'YYYY-MM-DD') as datafinal 
                , o.valorinicio 
                , o.valorfinal 
                , ot.id as objetivo
            from temp_objetivo to2 
            inner join objetivo o on to2.objetivo_id = o.id
            inner join tipoobjetivo ot on o.tipo_id = ot.id
            where 
                o.user_id = ${userId}
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
        }
        
        return result
    }
}

Objetivo.prototype.cancelaObjetivoTemp = async (req, res) => {
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

        await pgPool(`
            SELECT cancela_criacao_objetivo($1)
        `, [userId])

        const result = {
            code: 200,
            msg: true,
            data: 'Objetivo cancelado com sucesso',
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

export default Objetivo;