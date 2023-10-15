import express from 'express';
import dotenv from 'dotenv';
import pg from 'pg';
import routes from './routes/index.js';
import cors from 'cors';

const { Pool } = pg;

dotenv.config();

global.pg = new Pool({
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    user: process.env.PG_USER,
    password: process.env.PG_PWD,
    port: process.env.PG_PORT,  
})

global.pg
    .connect((err) => {
        if(err) {
            return console.error('Error acquiring client', err.stack);
        } else {
            console.log('CONECTADO AO BANDO DE DADOS')
        }
    })

global.pg.on('acquire', () => {
    console.count('------Cliente novo gerado---------\n\n\n')
});
global.pg.on('error', () => {
    console.count('Erro em cliente idle')
})
global.pg.on('remove', () => {
    console.count('Cliente removido')
})
global.pg.on('connect', () => {
    console.log('-----------CONECTADO COM O PG-------------\n\n\n')
})

const app = express();
app.use(express.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.use(cors({
    origin: 'http://localhost:5173',
}))

routes(app);

export default app;