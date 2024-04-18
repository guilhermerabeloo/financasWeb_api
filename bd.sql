create table usuarios (
	id SERIAL NOT NULL,
	nome VARCHAR(150) NOT NULL,
	email VARCHAR(100) NOT NULL UNIQUE,
	senha_hash VARCHAR(100) NOT NULL,
	data_create TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

create table checklistMensal (
	id SERIAL,
	item VARCHAR(50) not null,
	valor NUMERIC(9,2) NOT null,
	dia_mes INTEGER not null,
	user_id INTEGER not null,
	data_create TIMESTAMP DEFAULT current_timestamp not null,
	
	primary key(id)
)

ALTER TABLE checklistMensal ADD CONSTRAINT FK_checklistMensal_usuarios
FOREIGN KEY (user_id) REFERENCES usuarios(id)

create table tipoMovimento (
	id SERIAL,
	item VARCHAR(15) not null,
	data_create TIMESTAMP DEFAULT current_timestamp not null,
	
	primary key(id)
)

create table tagmovimento (
	id SERIAL,
	tag VARCHAR(40),
	cor VARCHAR(7),
	
	primary key(id)
)

create table movimento (
	id SERIAL,
	descricao VARCHAR(100) not null,
	data TIMESTAMP not null,
	valor NUMERIC(9,2) NOT null,
	tipoMovimento_id INTEGER not null,
	user_id INTEGER not null,
	checklistMensal_id INTEGER not null,
	tag_id INTEGER,
	data_create TIMESTAMP DEFAULT current_timestamp not null,
	competencia VARCHAR(8) NOT NULL,
	
	primary key(id)
)

ALTER TABLE movimento ADD CONSTRAINT FK_movimento_tag
FOREIGN KEY (tag_id) REFERENCES tagmovimento(id)

ALTER TABLE movimento ADD CONSTRAINT FK_movimento_usuarios
FOREIGN KEY (user_id) REFERENCES usuarios(id)

ALTER TABLE movimento ADD CONSTRAINT FK_movimento_tipoMovimento
FOREIGN KEY (tipoMovimento_id) REFERENCES tipoMovimento(id)

ALTER TABLE movimento ADD CONSTRAINT FK_movimento_checklistMensal
FOREIGN KEY (checklistMensal_id) REFERENCES checklistMensal(id)


CREATE TABLE temp_checklistmensal (
	id SERIAL,
	item_id INTEGER,
	data_create TIMESTAMP,
	data DATE,
	checked CHAR(1),
	
	primary key(id)
)

ALTER TABLE temp_checklistmensal
ADD CONSTRAINT fk_tempChecklist_checklist
FOREIGN KEY (item_id) REFERENCES checklistmensal(id)

create table objetivo (
	id SERIAL,
	nome VARCHAR(200) not null,
	dataInicio DATE not null,
	dataFinal DATE not null,
	valorInicio NUMERIC(9,2) not null,
	valorFinal NUMERIC(9,2) not null,
	user_id INTEGER not null unique,
	tipo_id INTEGER not null,
	data_create TIMESTAMP DEFAULT current_timestamp not null,
	
	primary key(id)
)

alter table objetivo add constraint FK_objetivo_usuarios
foreign key (user_id) references usuarios(id)

alter table objetivo add constraint FK_objetivo_tipo
foreign key (tipo_id) references tipoObjetivo(id)

create table meta_objetivo (
	id SERIAL,
	competencia VARCHAR(8) not null,
	data DATE not null,
	meta NUMERIC(9,2) not null,
	realizado NUMERIC(9,2),
	atingido CHAR(1),
	objetivo_id INTEGER not null,
	
	primary key(id)
)

alter table meta_objetivo add constraint FK_metaObjetivo_objetivo
foreign key (objetivo_id) references objetivo(id)

create table temp_objetivo (
	user_id INT unique not null,
	objetivo_id INT unique not null,
	primary key(user_id, objetivo_id)
)


alter table	temp_objetivo add constraint fk_tempObjetivo_objetivo
foreign key (user_id) references usuarios(id)

alter table	temp_objetivo add constraint fk_tempObjetivo_objetivos
foreign key (objetivo_id) references objetivo(id)

CREATE OR REPLACE FUNCTION renova_checklist(p_user_id INTEGER)
RETURNS VOID AS
$$
BEGIN
    BEGIN
        -- Inserção dos dados na tabela movimento
        INSERT INTO movimento 
            (descricao, data, valor, tipomovimento_id, user_id, checklistmensal_id, tag_id)
        SELECT 
            c.item,
            tc.data,
            c.valor,
            1 as tipomovimento,
            p_user_id,
			c.tag_id,
            c.id 
        FROM temp_checklistmensal tc 
        INNER JOIN checklistmensal c ON c.id = tc.item_id 
        WHERE c.user_id = p_user_id;
        
        -- Exclusão dos dados da tabela temporária
        DELETE FROM temp_checklistmensal
        WHERE item_id IN (
            SELECT id FROM checklistmensal
            WHERE user_id = p_user_id
        );
    END;
END;
$$
LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION cria_objetivo(p_user_id INTEGER, p_tipo_id INTEGER, p_nome VARCHAR(200), p_dataInicio DATE, p_dataFinal DATE, p_valorInicio numeric(9,2), p_valorFinal numeric(9,2))
RETURNS INT AS
$$
DECLARE
    obj_id INT;
BEGIN
    -- Inserir dados na tabela 'objetivo' e obter o ID gerado
    INSERT INTO objetivo 
        (nome, dataInicio, dataFinal, valorInicio, valorFinal, user_id, tipo_id)
    VALUES 
        (p_nome, p_dataInicio, p_dataFinal, p_valorInicio, p_valorFinal, p_user_id, p_tipo_id)
    RETURNING id INTO obj_id;

    -- Inserir dados na tabela 'temp_objetivo' com a chave primária composta
    INSERT INTO temp_objetivo
        (user_id, objetivo_id)
    VALUES
        (p_user_id, obj_id);

    RETURN obj_id;
END;
$$
LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION cancela_criacao_objetivo(p_user_id INTEGER)
RETURNS void AS
$$
DECLARE
    obj_id INT;
begin
	delete from temp_objetivo
	where 
		user_id = p_user_id;
	
	delete from objetivo
	where 
		user_id = p_user_id;
END;
$$
LANGUAGE plpgsql;

-- DROP FUNCTION public.relatorio_lancamentos(int4, varchar, date, date);

CREATE OR REPLACE FUNCTION public.relatorio_lancamentos(p_user_id integer, p_lancamento character varying, p_dtinicio date, p_dtfinal date)
 RETURNS TABLE(competencia character varying, valor numeric, tipomovimento INTEGER, datacompetencia TIMESTAMP)
 LANGUAGE plpgsql
AS $function$
begin
	DROP TABLE IF EXISTS temp_intervalomeses;
	DROP TABLE IF EXISTS temp_competencias;
	CREATE TEMP TABLE temp_intervalomeses (
	    data timestamp
	);
	CREATE TEMP TABLE temp_competencias (
	    competencia varchar(10),
	    data TIMESTAMP
	);
	INSERT INTO temp_intervalomeses (data)
	    SELECT 
	        generate_series(
	            DATE_TRUNC('MONTH', p_dtInicio::DATE),
	            DATE_TRUNC('MONTH', p_dtFinal::DATE),
	            '1 month'::INTERVAL
	        ) AS mes;
	INSERT INTO temp_competencias (competencia, data)
		select 
			case
				when EXTRACT(MONTH FROM data) = 1 then 'JAN '
				when EXTRACT(MONTH FROM data) = 2 then 'FEV '
				when EXTRACT(MONTH FROM data) = 3 then 'MAR '
				when EXTRACT(MONTH FROM data) = 4 then 'ABR '
				when EXTRACT(MONTH FROM data) = 5 then 'MAI '
				when EXTRACT(MONTH FROM data) = 6 then 'JUN '
				when EXTRACT(MONTH FROM data) = 7 then 'JUL '
				when EXTRACT(MONTH from data) = 8 then 'AGO '
				when EXTRACT(MONTH FROM data) = 9 then 'SET '
				when EXTRACT(MONTH FROM data) = 10 then 'OUT '
				when EXTRACT(MONTH FROM data) = 11 then 'NOV '
				when EXTRACT(MONTH FROM data) = 12 then 'DEZ '
			end || EXTRACT(YEAR FROM data) as competencia,
			data
		from temp_intervalomeses;
	RETURN QUERY
	select 
		tc.competencia,
		case 
			when sum(m.valor) is null then 0
			when m.tipomovimento_id = 2 then sum(m.valor)
			else sum(m.valor) * -1
		end as valor,
		m.tipomovimento_id,
		tc.data as datacompetencia
	from temp_competencias tc
	left join movimento m on m.competencia = tc.competencia and descricao = p_lancamento and m.user_id = p_user_id
	group by tc.competencia, m.tipomovimento_id, tc.data
	order by datacompetencia;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.relatorio_lancamentos_checklist(p_user_id integer, p_dtinicio date, p_dtfinal date)
 RETURNS TABLE(competencia character varying, totalchecklist numeric)
 LANGUAGE plpgsql
AS $function$
begin
	DROP TABLE IF EXISTS temp_intervalomeses;
	DROP TABLE IF EXISTS temp_competencias;
	CREATE TEMP TABLE temp_intervalomeses (
	    data timestamp
	);
	CREATE TEMP TABLE temp_competencias (
	    competencia varchar(10),
	    data TIMESTAMP
	);
	INSERT INTO temp_intervalomeses (data)
	    SELECT 
	        generate_series(
	            DATE_TRUNC('MONTH', p_dtinicio::DATE),
	            DATE_TRUNC('MONTH', p_dtfinal::DATE),
	            '1 month'::INTERVAL
	        ) AS mes;
	INSERT INTO temp_competencias (competencia, data)
		select 
			case
				when EXTRACT(MONTH FROM data) = 1 then 'JAN '
				when EXTRACT(MONTH FROM data) = 2 then 'FEV '
				when EXTRACT(MONTH FROM data) = 3 then 'MAR '
				when EXTRACT(MONTH FROM data) = 4 then 'ABR '
				when EXTRACT(MONTH FROM data) = 5 then 'MAI '
				when EXTRACT(MONTH FROM data) = 6 then 'JUN '
				when EXTRACT(MONTH FROM data) = 7 then 'JUL '
				when EXTRACT(MONTH from data) = 8 then 'AGO '
				when EXTRACT(MONTH FROM data) = 9 then 'SET '
				when EXTRACT(MONTH FROM data) = 10 then 'OUT '
				when EXTRACT(MONTH FROM data) = 11 then 'NOV '
				when EXTRACT(MONTH FROM data) = 12 then 'DEZ '
			end || EXTRACT(YEAR FROM data) as competencia,
			data
		from temp_intervalomeses;
	RETURN QUERY
	SELECT
	    tc.competencia,
	    cm.totalchecklist
	FROM
	    temp_competencias tc
	CROSS JOIN
	    (
	        SELECT 
	        	case 
	            	when SUM(valor) is null then 0
	            	else SUM(valor) * -1
	           	end as totalchecklist
	        FROM 
	            checklistmensal
	        where user_id = p_user_id
	    ) cm;
end;
$function$;


CREATE OR REPLACE FUNCTION relatorio_totais_por_periodo(p_user_id integer, p_tipo_movimento integer, p_dtinicio date, p_dtfinal date)
 RETURNS TABLE(competencia character varying, valor numeric, datacompetencia timestamp without time zone)
 LANGUAGE plpgsql
AS $function$
begin
	DROP TABLE IF EXISTS temp_intervalomeses;
	DROP TABLE IF EXISTS temp_competencias;
	CREATE TEMP TABLE temp_intervalomeses (
	    data timestamp
	);
	CREATE TEMP TABLE temp_competencias (
	    competencia varchar(10),
	    data TIMESTAMP
	);
	INSERT INTO temp_intervalomeses (data)
	    SELECT 
	        generate_series(
	            DATE_TRUNC('MONTH', '20240101'::DATE),
	            DATE_TRUNC('MONTH', '20240630'::DATE),
	            '1 month'::INTERVAL
	        ) AS mes;
	INSERT INTO temp_competencias (competencia, data)
		select 
			case
				when EXTRACT(MONTH FROM data) = 1 then 'JAN '
				when EXTRACT(MONTH FROM data) = 2 then 'FEV '
				when EXTRACT(MONTH FROM data) = 3 then 'MAR '
				when EXTRACT(MONTH FROM data) = 4 then 'ABR '
				when EXTRACT(MONTH FROM data) = 5 then 'MAI '
				when EXTRACT(MONTH FROM data) = 6 then 'JUN '
				when EXTRACT(MONTH FROM data) = 7 then 'JUL '
				when EXTRACT(MONTH from data) = 8 then 'AGO '
				when EXTRACT(MONTH FROM data) = 9 then 'SET '
				when EXTRACT(MONTH FROM data) = 10 then 'OUT '
				when EXTRACT(MONTH FROM data) = 11 then 'NOV '
				when EXTRACT(MONTH FROM data) = 12 then 'DEZ '
			end || EXTRACT(YEAR FROM data) as competencia,
			data
		from temp_intervalomeses;
	return query
	select
	    tc.competencia,
	    case 
	    	when sum(m.valor) is null then 0
	    	else sum(m.valor)
	    end as valor,
	   	tc.data as datacompetencia
	from temp_competencias tc
	left join movimento m on m.competencia = tc.competencia and tipomovimento_id = p_tipo_movimento and user_id = p_user_id
	group by tc.competencia, tc.data
	order by 3;
end;
$function$;


CREATE OR REPLACE FUNCTION relatorio_total_receitasdespesas(p_user_id integer, p_dtinicio date, p_dtfinal date)
 RETURNS TABLE(receitas numeric, despesas numeric)
 LANGUAGE plpgsql
AS $function$
begin
	return query
	select 
		(select 
			SUM(valor) as receitas
		from movimento m 
		where 
			m.user_id = p_user_id
			and m.data >= p_dtinicio
			and m.data <= p_dtfinal
			and m.tipomovimento_id = 2),
		(select 
			SUM(valor) as despesas
		from movimento m 
		where 
			m.user_id = p_user_id
			and m.data >= p_dtinicio
			and m.data <= p_dtfinal
			and m.tipomovimento_id = 1);
end;
$function$;


CREATE OR REPLACE FUNCTION relatorio_despesas_por_tag(p_user_id integer, p_dtinicio date, p_dtfinal date)
 RETURNS TABLE(tag character varying, valor numeric)
 LANGUAGE plpgsql
AS $function$
begin
	return query
	select 
		t.tag,
		sum(m.valor) as valor
	from movimento m 
	inner join tagmovimento t on t.id = m.tag_id 
	where 
		m.tipomovimento_id = 1
		and m.data >= p_dtinicio
		and m.data <= p_dtfinal
		and m.user_id = p_user_id
	group by t.tag 
	order by 2 desc;
end;
$function$;

