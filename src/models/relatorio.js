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

        const movimentos = await Promise.all(nomesMovimentos.rows.map(async (m) => {
            const lancamentos = await pgPool(`
                SELECT * FROM relatorio_lancamentos($1, $2, $3, $4)
            `, [userId, m.descricao, dtInicio, dtFinal]);
    
            const linhas = lancamentos.rows;
            let competencias = [];
            let valores = [];
    
            linhas.forEach((i) => {
                competencias.push(i.competencia);
                valores.push(i.valor);
            });
    
            return {
                rotulo: m.descricao,
                tipo: m.tipomovimento,
                competencias: competencias,
                valores: valores
            };
        }));
    
        const checklistResult = await pgPool(`
            select * from relatorio_lancamentos_checklist($1, $2, $3)
        `, [userId, dtInicio, dtFinal]);

        let competenciasChecklist = [];
        let valoresChecklist = [];
        checklistResult.rows.forEach((c) => {
            competenciasChecklist.push(c.competencia);
            valoresChecklist.push(c.totalchecklist);
        })

        const lancamentosChecklist = {
            rotulo: 'Gastos Fixos',
            tipo: 'D',
            competencias: competenciasChecklist,
            valores: valoresChecklist
        }
        
        const lancamentos = [...movimentos, lancamentosChecklist]
        return {
            code: 200,
            msg: true,
            data: lancamentos,
        };
    } catch(err) {
        const result = {
            code: 500,
            hint: err || 'Erro interno',
            msg: false,
        }
        
        return result
    }
}

Relatorio.prototype.relatorioGraficos = async (req, res) => {
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

        const totaisDespesasPeriodo = pgPool(`
            SELECT * FROM relatorio_totais_por_periodo($1, '1', $2, $3)
        `, [userId, dtInicio, dtFinal])

        const totaisReceitasPeriodo = pgPool(`
            SELECT * FROM relatorio_totais_por_periodo($1, '2', $2, $3)
        `, [userId, dtInicio, dtFinal])

        const totaisReceitasDespesas = pgPool(`
            SELECT * FROM relatorio_total_receitasdespesas($1, $2, $3)
        `, [userId, dtInicio, dtFinal])

        const despesasPorTag = pgPool(`
            SELECT * FROM relatorio_despesas_por_tag($1, $2, $3)
        `, [userId, dtInicio, dtFinal])

        const objetivo = pgPool(`
            select 
                coalesce((select valorfinal from objetivo where user_id = $1), 0) as objetivo, 
                coalesce((select sum(realizado) from meta_objetivo mo inner join objetivo o on o.id = mo.objetivo_id where o.user_id = $1), 0) as realizado
        `, [userId])

        return Promise.all([totaisDespesasPeriodo, totaisReceitasPeriodo, totaisReceitasDespesas, despesasPorTag, objetivo])
            .then((res) => {
                const reltotaisDespesasPeriodo = res[0].rows;
                const reltotaisReceitasPeriodo = res[1].rows;
                const reltotaisReceitasDespesas = res[2].rows;
                const reldespesasPorTag = res[3].rows;
                const objetivo = res[4].rows[0];

                const competencias = reltotaisDespesasPeriodo.map((r) => {
                    return r.competencia
                })
                const despesas = reltotaisDespesasPeriodo.map((r) => {
                    return Number(r.valor)
                })
                const receitas = reltotaisReceitasPeriodo.map((r) => {
                    return Number(r.valor)
                })
                const tagsRel = reldespesasPorTag.map((r) => {
                    return r.tag
                })
                const valorTagsRel = reldespesasPorTag.map((r) => {
                    return Number(r.valor)
                })
                const totalReceita = Number(reltotaisReceitasDespesas[0].receitas)
                const totalDespesa = Number(reltotaisReceitasDespesas[0].despesas)
                const atingimentoObjetivo = objetivo.atingido / objetivo.objetivo * 100

                const result =  {
                    code: 200,
                    msg: true,
                    data: {
                        competencias: competencias,
                        receitas: receitas,
                        despesas: despesas,
                        totaisreceitas: totalReceita,
                        totaisdespesas: totalDespesa,
                        labeltags: tagsRel,
                        valortags: valorTagsRel,
                        objetivo: atingimentoObjetivo ? atingimentoObjetivo : 0
                    },
                };

                return result
            }).catch((err) => {
                const result = {
                    code: err.code || 500,
                    hint: err || 'Erro interno',
                    msg: false
                }
                
                throw result
            })
    } catch(err) {
        const result = {
            code: err.code || 500,
            hint: err || 'Erro interno',
            msg: false
        }
        
        return result
    }
}

export default Relatorio;