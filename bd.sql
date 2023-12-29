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


