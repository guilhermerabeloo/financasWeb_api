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

create table movimento (
	id SERIAL,
	descricao VARCHAR(100) not null,
	data TIMESTAMP not null,
	valor NUMERIC(9,2) NOT null,
	tipoMovimento_id INTEGER not null,
	user_id INTEGER not null,
	checklistMensal_id INTEGER not null,
	data_create TIMESTAMP DEFAULT current_timestamp not null,
	
	primary key(id)
)


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
            (descricao, data, valor, tipomovimento_id, user_id, checklistmensal_id)
        SELECT 
            c.item,
            tc.data,
            c.valor,
            2 as tipomovimento,
            p_user_id,
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
