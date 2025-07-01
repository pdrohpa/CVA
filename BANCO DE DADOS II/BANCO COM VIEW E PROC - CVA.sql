-- Cria o banco de dados chamado CVA
CREATE DATABASE CVA;

-- Seleciona o banco de dados CVA para uso
USE CVA;

-- Cria a tabela de veterinários
CREATE TABLE tb_veterinario(
    id_veterinario INT NOT NULL AUTO_INCREMENT,
    nome VARCHAR(30),
    usuario VARCHAR(30) UNIQUE,
    senha VARCHAR(100),
    PRIMARY KEY(id_veterinario)
);

-- Cria a tabela de tutores (donos dos animais)
CREATE TABLE tb_tutor(
    id_tutor INT NOT NULL AUTO_INCREMENT,
    nome VARCHAR(30),
    email VARCHAR(40) UNIQUE,
    senha VARCHAR(255),
    telefone VARCHAR(15),
    PRIMARY KEY (id_tutor)
);

-- Cria a tabela de animais
CREATE TABLE tb_animal(
    id_animal INT NOT NULL AUTO_INCREMENT,
    nome VARCHAR(30),
    especie VARCHAR(20),
    PRIMARY KEY(id_animal)
);

-- Cria a tabela de vacinas
CREATE TABLE tb_vacina (
    id_vacina INT NOT NULL AUTO_INCREMENT,
    nome VARCHAR(20) NOT NULL,
    lote VARCHAR(50) NOT NULL,
    validade DATE NOT NULL,
    PRIMARY KEY (id_vacina)
);

-- Cria a tabela de funcionários
CREATE TABLE tb_funcionario(
    id_funcionario INT NOT NULL AUTO_INCREMENT,
    nome VARCHAR(50),
    email VARCHAR(50) UNIQUE,
    senha VARCHAR(255),
    cargo VARCHAR(50),
    PRIMARY KEY(id_funcionario)
);

-- Cria a tabela de relacionamento entre animal e tutor
CREATE TABLE tb_ani_tut(
    id_animal INT NOT NULL,
    id_tutor INT NOT NULL,
    FOREIGN KEY(id_animal) REFERENCES tb_animal(id_animal),
    FOREIGN KEY(id_tutor) REFERENCES tb_tutor(id_tutor)
);

-- Cria a tabela de agendamentos de atendimentos
CREATE TABLE tb_agendamento(
    id_agendamento INT NOT NULL AUTO_INCREMENT,
    id_veterinario INT NOT NULL,
    id_animal INT NOT NULL,
    horario DATETIME NOT NULL,
    situacao VARCHAR(10),
    PRIMARY KEY(id_agendamento),
    FOREIGN KEY(id_veterinario) REFERENCES tb_veterinario(id_veterinario),
    FOREIGN KEY(id_animal) REFERENCES tb_animal(id_animal)
);

-- Cria a tabela de registros de vacinação
CREATE TABLE tb_vacinacao(
    id_vacinacao INT NOT NULL AUTO_INCREMENT,
    id_agendamento INT NOT NULL,
    id_vacina INT NOT NULL,
    data_aplicacao DATE,
    PRIMARY KEY(id_vacinacao),
    FOREIGN KEY(id_agendamento) REFERENCES tb_agendamento(id_agendamento),
    FOREIGN KEY(id_vacina) REFERENCES tb_vacina(id_vacina)
);

-- Cria a tabela de histórico de vacinações de cada animal
CREATE TABLE tb_historico(
    id_historico INT NOT NULL AUTO_INCREMENT,
    id_vacinacao INT NOT NULL,
    id_animal INT NOT NULL,
    PRIMARY KEY (id_historico),
    FOREIGN KEY (id_vacinacao) REFERENCES tb_vacinacao (id_vacinacao),
    FOREIGN KEY (id_animal) REFERENCES tb_animal (id_animal)
);

-- Cria a tabela de lançamentos de vacinas (entrada no sistema ou no estoque)
CREATE TABLE tb_lancamento_vacina(
    id_lancamento INT NOT NULL AUTO_INCREMENT,
    id_funcionario INT,
    id_vacina INT,
    PRIMARY KEY(id_lancamento),
    FOREIGN KEY (id_funcionario) REFERENCES tb_funcionario(id_funcionario),
    FOREIGN KEY (id_vacina) REFERENCES tb_vacina(id_vacina)
);

-- Views

CREATE VIEW vw_historico_vacinacao AS
SELECT
    a.nome AS Animal,
    v.nome AS Vacina,
    vac.data_aplicacao AS 'Data de Aplicação'
FROM tb_historico h
JOIN tb_vacinacao vac ON h.id_vacinacao = vac.id_vacinacao
JOIN tb_animal a ON h.id_animal = a.id_animal
JOIN tb_vacina v ON vac.id_vacina = v.id_vacina;
SELECT * FROM vw_historico_vacinacao;

CREATE VIEW vw_vacinas_lancadas_funcionario AS
SELECT
    f.nome AS 'Nome do Funcionário',
    f.cargo AS 'Cargo',
    COUNT(lv.id_lancamento) AS 'Total de Lançamentos'
FROM tb_lancamento_vacina lv
JOIN tb_funcionario f ON lv.id_funcionario = f.id_funcionario
GROUP BY f.id_funcionario, f.nome, f.cargo;
SELECT * FROM vw_vacinas_lancadas_funcionario;


CREATE VIEW vw_agendamentos_detalhados AS
SELECT
    ag.id_agendamento AS 'Id do Agendamento',
    t.nome AS 'Tutor',
    a.nome AS 'Nome do Animal',
    a.especie AS 'Espécie do Animal',
    ag.horario AS 'Horário',
    v.nome AS 'Veterinário',
    ag.situacao AS 'Situação',
    t.email AS 'E-mail do Tutor',
    t.telefone AS 'Telefone do Tutor'
FROM tb_agendamento ag
JOIN tb_animal a ON ag.id_animal = a.id_animal
JOIN tb_ani_tut at ON a.id_animal = at.id_animal
JOIN tb_tutor t ON at.id_tutor = t.id_tutor
JOIN tb_veterinario v ON ag.id_veterinario = v.id_veterinario;
SELECT * FROM vw_agendamentos_detalhados;

CREATE VIEW vw_agendamentos_realizados AS
    SELECT
    ag.id_agendamento AS 'Id do Agendamento',
    t.nome AS 'Tutor',
    a.nome AS 'Nome do Animal',
    a.especie AS 'Espécie do Animal',
    ag.horario AS 'Horário',
    v.nome AS 'Veterinário',
    t.email AS 'E-mail do Tutor',
    t.telefone AS 'Telefone do Tutor'
FROM tb_agendamento ag
JOIN tb_animal a ON ag.id_animal = a.id_animal
JOIN tb_ani_tut at ON a.id_animal = at.id_animal
JOIN tb_tutor t ON at.id_tutor = t.id_tutor
JOIN tb_veterinario v ON ag.id_veterinario = v.id_veterinario
WHERE ag.situacao = 'realizado';
SELECT * FROM vw_agendamentos_realizados;

CREATE VIEW vw_agendamentos_pendentes AS
    SELECT
    ag.id_agendamento AS 'Id do Agendamento',
    t.nome AS 'Tutor',
    a.nome AS 'Nome do Animal',
    a.especie AS 'Espécie do Animal',
    ag.horario AS 'Horário',
    v.nome AS 'Veterinário',
    t.email AS 'E-mail do Tutor',
    t.telefone AS 'Telefone do Tutor'
FROM tb_agendamento ag
JOIN tb_animal a ON ag.id_animal = a.id_animal
JOIN tb_ani_tut at ON a.id_animal = at.id_animal
JOIN tb_tutor t ON at.id_tutor = t.id_tutor
JOIN tb_veterinario v ON ag.id_veterinario = v.id_veterinario
WHERE ag.situacao = 'pendente';
SELECT * FROM vw_agendamentos_pendentes;


CREATE VIEW vw_vacinas_aplicadas_por_veterinario AS
    SELECT
        v.nome AS 'Veterinário',
        COUNT(*) AS 'Total de Vacinas Aplicadas'
    FROM tb_agendamento ag
    JOIN tb_veterinario v ON ag.id_veterinario = v.id_veterinario
    JOIN tb_vacinacao vac ON ag.id_agendamento = vac.id_agendamento
    GROUP BY v.id_veterinario, v.nome;
SELECT * FROM vw_vacinas_aplicadas_por_veterinario;


-- Procedures

DELIMITER //
CREATE PROCEDURE historico_vacinas_animal(IN p_id_animal INT)
BEGIN
    SELECT
        a.nome AS 'Animal',
        v.nome AS 'Vacina',
        vac.data_aplicacao AS 'Data de Aplicação'
    FROM tb_animal a
    JOIN tb_agendamento ag ON ag.id_animal = a.id_animal
    JOIN tb_vacinacao vac ON ag.id_agendamento = vac.id_agendamento
    JOIN tb_vacina v ON vac.id_vacina = v.id_vacina
    WHERE a.id_animal = p_id_animal;
END;
//

DELIMITER ;
CALL historico_vacinas_animal(3);
