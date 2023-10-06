import app from './src/app.js';

const porta = 3001;

app.listen(porta, () => {
    console.log(`Servidor escutando na porta http:localhost:${porta}`)
})