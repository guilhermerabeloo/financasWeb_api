import pgPool from "../../config/pgPool.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';

const env = dotenv.config().parsed;

function Auth() {}

Auth.prototype.criaUsuario = async (req, res) => {
    const { Senha } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashSenha = await bcrypt.hash(Senha, salt);

    try {
        const emailQuery = await pgPool(`SELECT * FROM usuarios WHERE email = '${req.body.Email}'`);
        if(emailQuery.rowCount > 0) {
            const result = {
                code: 400,
                hint: 'Usuário já cadastrado',
                msg: false,
            }

            throw result
        }

        await pgPool(
            `
                INSERT INTO usuarios
                (nome, email, senha_hash)
                VALUES
                ($1, $2, $3)
            `,
            [
                req.body.Nome,
                req.body.Email,
                hashSenha,
            ]);

        const result = {
            code: 200,
            msg: true,
            data: "Usuário cadastrado com sucesso!",
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

Auth.prototype.validaUsuario = async (req, res) => {
    const { Email, Senha } = req.body;

    try {
        const userQuery = await pgPool(`SELECT * FROM usuarios WHERE email = '${Email}'`)
        if(userQuery.rowCount == 0) {
            const result = {
                code: 401,
                msg: false,
                hint: "Email não cadastrado"
            };
            throw result
        };

        const user = userQuery.rows[0];
        const verificacaoSenha = await bcrypt.compare(Senha, user.senha_hash);
        if(!verificacaoSenha) {
            const result = {
                code: 401,
                msg: false,
                hint: "Senha inválida"
            }

            throw result
        };

        const token = jwt.sign({ userId: user.id }, env.JWT_SECRET, { expiresIn: '100h' });
        const result = {
            code: 200,
            msg: true,
            token: token,
        };

        return result;
    } catch(err) {
        const result = {
            code: err.code || 500,
            hint: err.hint || "Erro interno",
            msg: err.msg || false,
        };
        throw result;
    }
}

export default Auth;