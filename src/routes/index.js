import express from "express";
import auth from "./auth.js";
import checklist from "./checklist.js";
import movimento from "./movimento.js";
import objetivo from "./objetivo.js";

const routes = (app) => {
    app.route('/').get((req, res) => {
        res.status(200).send({titulo: 'Pagina inicial'})
    })

    app.use(
        express.json(),
        auth,
        checklist,
        movimento,
        objetivo
    )
}

export default routes;