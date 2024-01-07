import pgPromise from 'pg-promise';
import dotenv from "dotenv";

const pgp = pgPromise();
const env = dotenv.config().parsed;

const dbConfig = {
    host: env.PG_HOST,
    database: env.PG_DATABASE,
    user: env.PG_USER,
    password: env.PG_PWD,
    port: env.PG_PORT,
    max: 10,
    idleTimeoutMillis: 5000,
    connectionTimeoutMillis: 5000,
}

const db = pgp(dbConfig);
const pool = db.$pool;

pool.on('acquire', () => {
    console.count('-----Cliente novo gerado-------')
})
pool.on('error', () => {
    console.error('Erro com cliente idle')
})
pool.on('remove', () => {
    console.count('Cliente removido');
})
pool.on('connect', () => {
    console.log('-----------------CONECTADO AO PG-------------------')
})

async function pgPool(sqlQuery, values) {
    return new Promise(async (resolve, reject) => {
        const client = await pool.connect();

        try {
            const result = values ? await client.query(sqlQuery, values) : await client.query(sqlQuery);

            resolve(result);
        } catch(error) {
            reject(error)
        } finally {
            client.release();
        }
    });
};

export default pgPool;