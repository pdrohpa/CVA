-- Cria o banco de dados chamado CVA
CREATE DATABASE CVA;

-- Seleciona o banco de dados CVA para uso
USE CVA;

-- Cria a tabela de veterinários
CREATE TABLE tb_veterinario(
    id_veterinario INT NOT NULL AUTO_INCREMENT, -- Identificador único do veterinário
    nome VARCHAR(30), -- Nome do veterinário
    usuario VARCHAR(30) UNIQUE, -- Nome de usuário exclusivo para login
    senha VARCHAR(100), -- Senha criptografada
    PRIMARY KEY(id_veterinario) -- Chave primária
);

-- Cria a tabela de tutores (donos dos animais)
CREATE TABLE tb_tutor(
    id_tutor INT NOT NULL AUTO_INCREMENT, -- Identificador único do tutor
    nome VARCHAR(30), -- Nome do tutor
    email VARCHAR(40) UNIQUE, -- Email exclusivo para login/comunicação
    senha VARCHAR(255),
    telefone VARCHAR(15), -- Telefone de contato
    PRIMARY KEY (id_tutor) -- Chave primária
);

-- Cria a tabela de animais
CREATE TABLE tb_animal(
    id_animal INT NOT NULL AUTO_INCREMENT, -- Identificador único do animal
    nome VARCHAR(30), -- Nome do animal
    especie VARCHAR(20), -- Espécie do animal (ex: cão, gato)
    PRIMARY KEY(id_animal) -- Chave primária
);

-- Cria a tabela de vacinas
CREATE TABLE tb_vacina (
    id_vacina INT NOT NULL AUTO_INCREMENT, -- Identificador único da vacina
    nome VARCHAR(20) NOT NULL, -- Nome da vacina
    lote VARCHAR(50) NOT NULL, -- Número do lote da vacina
    validade DATE NOT NULL, -- Data de validade da vacina
    PRIMARY KEY (id_vacina) -- Chave primária
);

-- Cria a tabela de funcionários
CREATE TABLE tb_funcionario(
    id_funcionario INT NOT NULL AUTO_INCREMENT, -- Identificador único do funcionário
    nome VARCHAR(50), -- Nome do funcionário
    email VARCHAR(50) UNIQUE, -- Email exclusivo
    senha VARCHAR(255), -- Senha de acesso
    cargo VARCHAR(50), -- Cargo ocupado (ex: recepcionista, técnico)
    PRIMARY KEY(id_funcionario) -- Chave primária
);

-- Cria a tabela de relacionamento entre animal e tutor
CREATE TABLE tb_ani_tut(
    id_animal INT NOT NULL, -- ID do animal
    id_tutor INT NOT NULL, -- ID do tutor
    FOREIGN KEY(id_animal) REFERENCES tb_animal(id_animal), -- Chave estrangeira para animal
    FOREIGN KEY(id_tutor) REFERENCES tb_tutor(id_tutor) -- Chave estrangeira para tutor
);

-- Cria a tabela de agendamentos de atendimentos
CREATE TABLE tb_agendamento(
    id_agendamento INT NOT NULL AUTO_INCREMENT, -- Identificador único do agendamento
    id_veterinario INT NOT NULL, -- ID do veterinário responsável
    id_animal INT NOT NULL, -- ID do animal atendido
    horario DATETIME NOT NULL, -- Data e hora do agendamento
    situacao VARCHAR(10), -- Situação do atendimento (ex: "realizado", "pendente")
    PRIMARY KEY(id_agendamento), -- Chave primária
    FOREIGN KEY(id_veterinario) REFERENCES tb_veterinario(id_veterinario), -- FK para veterinário
    FOREIGN KEY(id_animal) REFERENCES tb_animal(id_animal) -- FK para animal (corrigido aqui)
);

-- Cria a tabela de registros de vacinação
CREATE TABLE tb_vacinacao(
    id_vacinacao INT NOT NULL AUTO_INCREMENT, -- Identificador único da vacinação
    id_agendamento INT NOT NULL, -- ID do agendamento onde a vacina foi aplicada
    id_vacina INT NOT NULL, -- ID da vacina aplicada
    data_aplicacao DATE, -- Data de aplicação da vacina
    PRIMARY KEY(id_vacinacao), -- Chave primária
    FOREIGN KEY(id_agendamento) REFERENCES tb_agendamento(id_agendamento), -- FK para agendamento
    FOREIGN KEY(id_vacina) REFERENCES tb_vacina(id_vacina) -- FK para vacina
);

-- Cria a tabela de histórico de vacinações de cada animal
CREATE TABLE tb_historico(
    id_historico INT NOT NULL AUTO_INCREMENT, -- Identificador único do histórico
    id_vacinacao INT NOT NULL, -- ID da vacinação realizada
    id_animal INT NOT NULL, -- ID do animal vacinado
    PRIMARY KEY (id_historico), -- Chave primária
    FOREIGN KEY (id_vacinacao) REFERENCES tb_vacinacao (id_vacinacao), -- FK para vacinação
    FOREIGN KEY (id_animal) REFERENCES tb_animal (id_animal) -- FK para animal
);

-- Cria a tabela de lançamentos de vacinas (entrada no sistema ou no estoque)
CREATE TABLE tb_lancamento_vacina(
    id_lancamento INT NOT NULL AUTO_INCREMENT, -- Identificador do lançamento
    id_funcionario INT, -- ID do funcionário que fez o lançamento
    id_vacina INT, -- ID da vacina lançada
    PRIMARY KEY(id_lancamento), -- Chave primária
    FOREIGN KEY (id_funcionario) REFERENCES tb_funcionario(id_funcionario), -- FK para funcionário
    FOREIGN KEY (id_vacina) REFERENCES tb_vacina(id_vacina) -- FK para vacina
);

CREATE VIEW vw_historico_vacinacao AS
SELECT
    a.nome AS animal,
    v.nome AS vacina,
    vac.data_aplicacao
FROM tb_historico h
JOIN tb_vacinacao vac ON h.id_vacinacao = vac.id_vacinacao
JOIN tb_animal a ON h.id_animal = a.id_animal
JOIN tb_vacina v ON vac.id_vacina = v.id_vacina;

DELIMITER //
CREATE PROCEDURE sp_vacinas_por_animal(IN nome_animal VARCHAR(30))
BEGIN
    SELECT
        a.nome AS animal,
        v.nome AS vacina,
        vac.data_aplicacao
    FROM tb_animal a
    JOIN tb_agendamento ag ON ag.id_animal = a.id_animal
    JOIN tb_vacinacao vac ON ag.id_agendamento = vac.id_agendamento
    JOIN tb_vacina v ON vac.id_vacina = v.id_vacina
    WHERE a.nome = nome_animal;
END;
//
DELIMITER ;

-- Consulta 1: Histórico de vacinação de um animal específico
SELECT a.nome AS animal, v.nome AS vacina, h.id_historico, vac.data_aplicacao
FROM tb_historico h
JOIN tb_vacinacao vac ON h.id_vacinacao = vac.id_vacinacao
JOIN tb_animal a ON h.id_animal = a.id_animal
JOIN tb_vacina v ON vac.id_vacina = v.id_vacina
WHERE a.nome = 'Nina';

-- Consulta 2: Listar agendamentos pendentes
SELECT ag.id_agendamento, a.nome AS animal, ag.horario, ag.situacao
FROM tb_agendamento ag
JOIN tb_animal a ON ag.id_animal = a.id_animal
WHERE ag.situacao = 'pendente';

-- Consulta 3: Quantidade de vacinas aplicadas por veterinário
SELECT v.nome AS veterinario, COUNT(*) AS total_aplicadas
FROM tb_agendamento ag
JOIN tb_veterinario v ON ag.id_veterinario = v.id_veterinario
JOIN tb_vacinacao vac ON ag.id_agendamento = vac.id_agendamento
GROUP BY v.nome;
