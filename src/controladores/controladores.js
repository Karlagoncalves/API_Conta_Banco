let {banco, contas, depositos, saques, transferencias} = require('../bancodedados')
let { format } = require('date-fns')


const listarContas = (req, res) => {
    const { senha_banco } = req.query;

    if(senha_banco === banco.senha){
        return res.json(contas)
    }

}

const criarConta = (req, res) => {
    let numeroConta = contas.length +1;

    const { nome, cpf, data_nascimento, telefone, email, senha} = req.body;

    if(!nome.trim() || !cpf.trim() || !data_nascimento.trim() || !telefone.trim() || !email.trim() || !senha.trim() ){
        return res.status(400).json({ 
            mensagem: "Todos os campos são obrigatórios o preenchimento"})
    }
   
    const cpfExistente = contas.find((usuario) => {
        const cpfBanco = usuario.usuario.cpf
        return cpf === cpfBanco
    })

    if(cpfExistente){
            return res.status(400).json({ mensagem: "Já existe uma conta com o CPF informado"})
    }

    const emailExistente = contas.find((usuario) => {
        const emailBanco = usuario.usuario.email
        return email === emailBanco
    })

    if(emailExistente){
            return res.status(400).json({ mensagem: "Já existe uma conta com o email informado"})
    }
    
    const contaNova = 
    {
        numero_conta: numeroConta,
        saldo: 0,
            
       usuario: {
            nome: nome,
            cpf: cpf,
            data_nascimento: data_nascimento,
            telefone: telefone,
            email: email,
            senha: senha
        }
    }

        contas.push(contaNova);

        return res.status(201).json();

}

const alterarDados = (req, res) => {
    const { numero_conta } = req.params;
    const { nome, cpf, data_nascimento, telefone, email, senha} = req.body;

    if(!nome.trim() || !cpf.trim() || !data_nascimento.trim() || !telefone.trim() || !email.trim() || !senha.trim() ){
        return res.status(400).json({ 
            mensagem: "Todos os campos são obrigatórios o preenchimento"})
    }

    const cpfExistente = contas.find((usuario) => {
        const cpfBanco = usuario.usuario.cpf
        return cpf === cpfBanco
    })

    if(cpfExistente){
            return res.status(400).json({ mensagem: "Já existe uma conta com o CPF informado"})
    }

    const emailExistente = contas.find((usuario) => {
        const emailBanco = usuario.usuario.email
        return email === emailBanco
    })

    if(emailExistente){
            return res.status(400).json({ mensagem: "Já existe uma conta com o email informado"})
    }

    const conta = contas.find((dados) => {
         return dados.numero_conta === Number(numero_conta)
    });

    if(!conta){
        return res.status(404).json({ mensagem: 'Usuário não encontrado.'})
    }

    conta.usuario.nome = nome,
    conta.usuario.cpf = cpf,
    conta.usuario.data_nascimento = data_nascimento,
    conta.usuario.telefone = telefone,
    conta.usuario.email = email,
    conta.usuario.senha = senha

    return res.status(201).json();

}

const deletarConta = (req, res) => {
    const { numero_conta } = req.params;


    const conta = contas.find((dados) => {
        return dados.numero_conta === Number(numero_conta)
   });

   if(!conta){
       return res.status(404).json({ mensagem: 'Usuário não encontrado.'})
   }

   if(conta.saldo != 0){
        return res.status(403).json({ mensagem: 'A conta só pode ser removida se o saldo for zero!'})
   }

   contas = contas.filter((conta) => {
        return conta.numero_conta !== Number(numero_conta)
   })

   return res.status(204).json();

}

const depositar = (req, res) => {

    const { numero_conta, valor } = req.body;

    if(!numero_conta || !valor ){
        return res.status(400).json({ 
            mensagem: "O número da conta e o valor são obrigatórios!"})
    }

    const conta = contas.find((conta) => {
       return conta.numero_conta === Number(numero_conta);

    })

    if(!conta){
        return res.status(404).json({
            mensagem : "Conta bancária não encontrada."
        })
    }

    if(valor <= 0){
        return res.status(40).json({
            mensagem: "Verifique o valor informado. Depósitos com valores negativos ou zerados não são permitidos."
        })
    }
    
    conta.saldo += valor;
    
    let transacao = {

        data: new Date(),
        numero_conta: numero_conta,
        valor: valor

    };
    
    depositos.push(transacao);

    return res.status(204).json(); 

}

const sacar = (req, res) => {
    const { numero_conta, valor, senha } = req.body;

    if(!numero_conta || !valor || !senha ){
        return res.status(400).json({ 
            mensagem: "O número da conta, o valor e a senha são obrigatórios!"})
    }

    const conta = contas.find((conta) => {
       return conta.numero_conta === Number(numero_conta);

    })

    if(!conta){
        return res.status(404).json({
            mensagem : "Conta bancária não encontrada."
        })
    }

    if(conta.usuario.senha !== senha){
        return res.status(401).json({
            mensagem: "Senha incorreta." })
    }

    if(valor <= 0){
        return res.status(400).json({
            mensagem: "O valor não pode ser menor que zero."
        })
    }

    if(conta.saldo < valor) {
        return res.status(400).json({
            mensagem: "Saldo insuficiente. Operação não pode ser realizada."
        })
    }

    conta.saldo -= valor;

    let saquesRealizados = {

        data: new Date(),
        numero_conta: numero_conta,
        valor: valor

    };

    saques.push(saquesRealizados);
    
    return res.status(204).json(); 

}

const transferir = (req, res) => {

    const { numero_conta_origem, numero_conta_destino, valor, senha } = req.body;

    if( !numero_conta_origem || !numero_conta_destino || !valor || !senha){
        return res.status(400).json({
            mensagem: "Todos os campos são obrigatórios o preenchimento."
        })
    }

    const contaOrigem = contas.find((conta) => {
        return conta.numero_conta == numero_conta_origem
    });

    const contaDestino = contas.find((conta) => {
        return conta.numero_conta == numero_conta_destino
    })

    if(!contaOrigem){
        return res.status(404).json({
            mensagem: "Conta de origem não encontrada."
        })
    }

    if(!contaDestino){
        return res.status(404).json({
            mensagem: "Conta de destino não encontrada."
        })
    }

    if(contaOrigem.usuario.senha != senha){
        return res.status(401).json({
            mensagem: "Senha inválida."
        })
    }

    if(contaOrigem.saldo < valor){
        return res.status(404).json({
            mensagem: "Saldo insuficiente."
        })
    }

    contaOrigem.saldo -= valor;
    contaDestino.saldo += valor;

    const transferencia = {
        data: new Date(),
        numero_conta_origem,
        numero_conta_destino,
        valor
    }

    transferencias.push(transferencia);

    return res.status(201).json();

}

const saldo = (req, res) => {
    const numero_conta = req.query.numero_conta;
    const senha  = req.query.senha;

    if(!senha || !numero_conta){
        return res.status(400).json({  
            mensagem : "Informe a senha e número da conta!"})
    }

    const conta = contas.find((conta) => {
        return conta.numero_conta == numero_conta
    })

    if(!conta){
        return res.status(404).json({ 
            mensagem : "A conta bancária não encontrada!"})
    }

    if(conta.usuario.senha != senha){
        return res.status(401).json({
            mensagem: "Senha inválida."
        })
    }

    return res.status(200).json({
        saldo: conta.saldo
    })

}

const extrato = (req, res) => {
    const numero_conta = req.query.numero_conta;
    const senha = req.query.senha;

    if(!numero_conta || !senha){
        return res.status(400).json({
            mensagem: "O número da conta e a senha são obrigatórios."
        })
    };

    const conta = contas.find((conta) => {
       return conta.numero_conta == numero_conta
    });

    if(!conta){
        return res.status(404).json({
            mensagem: "Conta bancária não encontrada"
        })
    }

    if(conta.usuario.senha != senha){
        return res.status(401).json({
            mensagem: "Senha incorreta."
        })
    };

    const saqueFiltrado = saques.filter((saque) => { 
        return saque.numero_conta == numero_conta});

    const depositoFiltrado = depositos.filter((deposito) => {
        return deposito.numero_conta == numero_conta});

    const transRecebidas = transferencias.filter((trans) => {
        return trans.numero_conta_destino == numero_conta});

    const transEnviadas = transferencias.filter((trans) => {
        return trans.numero_conta_origem == numero_conta});

    const extratoFinal = {
        saques: saqueFiltrado,
        depositos: depositoFiltrado,
        transferenciasEnviadas: transEnviadas,
        transferenciasRecebidas: transRecebidas
    };

    return res.status(200).json(extratoFinal);

}

module.exports = {
    listarContas,
    criarConta,
    alterarDados,
    deletarConta,
    depositar,
    sacar,
    transferir,
    saldo,
    extrato
}