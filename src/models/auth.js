import pgPool from "../../config/pgPool.js";
import bcrypt from "bcrypt"

function Auth() {}

Auth.prototype.criaUsuario = async (req, res) => {
    const { Senha } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashSenha = await bcrypt.hash(Senha, salt);

    return new Promise((resolve, reject) => {
        pgPool(`
            INSERT INTO usuarios
            (nome, email, senha_hash)
            VALUES
            ($1, $2, $3)
        `,
        [
            req.body.Nome,
            req.body.Email,
            hashSenha,
        ])
        .then(() => {
            const result = {
                code: 200,
                data: "Usuário cadastrado com sucesso!",
                msg: true,
            }
            resolve(result)
        })
        .catch((err) => {
            const result = {
                code: 500,
                hint: 'Erro interno',
                msg: false,
                error: err.stack,
            }
            reject(result)
        })
    })
}

Auth.prototype.validaUsuario = async (req, res) => {
    return new Promise((resolve, reject) => {

    })
}

export default Auth;