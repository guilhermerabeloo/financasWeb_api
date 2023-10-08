import Auth from "../models/auth.js";

class AuthController {
    static cadastroDeUsuario = async (req, res) => {
        const AuthModel = new Auth();

        await AuthModel
            .criaUsuario(req)
            .then((resultado) => {
                res.status(200).send(resultado)
            })
            .catch((err) => {
                console.log(err)
                res.status(500).send(err)
            })
    }

    static validacaoDeUsuario = async (req, res) => {

    }
}

export default AuthController;