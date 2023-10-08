import pg from 'pg';
import dotenv from "dotenv";

const { Pool } = pg;

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

const pool = new Pool(dbConfig);

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
    return new Promise((resolve, reject) => {
        pool
            .connect()
            .then((client) => {
                if(values) {
                    client
                        .query(sqlQuery, values)
                        .then((e) => {
                            resolve(e);
                        })
                        .catch((e) => {
                            reject(e);
                        })
                        .finally(() => {
                            client.release();
                        })
                } else {
                    client
                        .query(sqlQuery)
                        .then((e) => {
                            resolve(e);
                        })
                        .catch((e) => {
                            reject(e);
                        })
                        .finally(() => {
                            client.release();
                        })
                }
            })
            .catch((e) => {
                reject(e);
            });
    });
};

export default pgPool;