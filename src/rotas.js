const express = require('express');
const { listarContas, criarConta, alterarDados, deletarConta, depositar, sacar, transferir, saldo, extrato } = require('./controladores/controladores');
const rotas = express();

const senhaIntermediario = require('./controladores/intermediarios')

rotas.get('/contas', senhaIntermediario, listarContas);
rotas.post('/contas', criarConta);
rotas.put('/contas/:numero_conta', alterarDados);
rotas.delete('/contas/:numero_conta', deletarConta);
rotas.post('/transacoes/depositar', depositar);
rotas.post('/transacoes/sacar', sacar);
rotas.post('/transacoes/transferir', transferir);
rotas.get('/contas/saldo', saldo);
rotas.get('/contas/extrato', extrato)



module.exports = rotas;