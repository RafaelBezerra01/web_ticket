
let contadores = { 'SP': 0, 'SG': 0, 'SE': 0 };
let filas = { 'SP': [], 'SG': [], 'SE': [] };
let historicoChamados = []; 
let guiches = {
    1: { atendendo: null, tempoEstimado: 0 }
   
};
let ultimaPrioridadeChamada = ''; 
function formatarSenha(tipo) {
    const data = new Date();
    const ano = String(data.getFullYear()).slice(2);
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    contadores[tipo]++;
    const seq = String(contadores[tipo]).padStart(2, '0');
    return `${ano}${mes}${dia}-${tipo}${seq}`;
}


function calcularTM(tipo) {
    if (tipo === 'SP') {
       
        const variacao = Math.floor(Math.random() * 11) - 5; 
        return 15 + variacao;
    } else if (tipo === 'SG') {
       
        const variacao = Math.floor(Math.random() * 7) - 3; 
        return 5 + variacao;
    } else if (tipo === 'SE') {
        
        const chance = Math.random();
        return chance < 0.95 ? 1 : 5;
    }
    return 0;
}


function emitirSenha(tipo) {
    const novaSenha = {
        numero: formatarSenha(tipo),
        tipo: tipo,
        dataEmissao: new Date().toLocaleTimeString(),
        status: 'Em Fila'
    };
    
    
    if (Math.random() * 100 < 5) {
       
        console.log(`Senha ${novaSenha.numero} (${tipo}) emitida, mas descartada (5% de chance).`);
    } else {
        filas[tipo].push(novaSenha);
        console.log(`Senha ${novaSenha.numero} (${tipo}) emitida e adicionada à fila.`);
        document.getElementById('ultima-senha-emitida').textContent = `Última Senha Emitida: ${novaSenha.numero}`;
       
        atualizarProximaLogica();
    }
}


function obterProximaSenha() {
    const ordemPreferencial = ['SP', 'SE', 'SG'];
    let proximaSenha = null;
    let proximoTipo = null;

   
    if (ultimaPrioridadeChamada !== 'SP' || ultimaPrioridadeChamada === '') {
       
        if (filas['SP'].length > 0) {
            proximoTipo = 'SP';
        } else {
            
            if (filas['SE'].length > 0) {
                proximoTipo = 'SE';
            } else if (filas['SG'].length > 0) {
                proximoTipo = 'SG';
            }
        }
    } else {
        if (filas['SE'].length > 0) {
            proximoTipo = 'SE';
        } else if (filas['SG'].length > 0) {
            proximoTipo = 'SG';
        } else {
            
            if (filas['SP'].length > 0) {
                proximoTipo = 'SP';
            }
        }
    }

    if (proximoTipo && filas[proximoTipo].length > 0) {
        proximaSenha = filas[proximoTipo].shift(); 
        ultimaPrioridadeChamada = proximoTipo;
    } else {
        
        for (const tipo of ordemPreferencial) {
            if (filas[tipo].length > 0) {
                proximaSenha = filas[tipo].shift();
                ultimaPrioridadeChamada = tipo;
                break;
            }
        }
    }

    return proximaSenha;
}

function atualizarProximaLogica() {
    
    let proximaLogicaElement = document.getElementById('proxima-logica');
    
   
    if (filas['SP'].length > 0) {
        proximaLogicaElement.textContent = `SP (${filas['SP'].length} na fila)`;
    } else if (filas['SE'].length > 0) {
        proximaLogicaElement.textContent = `SE (${filas['SE'].length} na fila)`;
    } else if (filas['SG'].length > 0) {
        proximaLogicaElement.textContent = `SG (${filas['SG'].length} na fila)`;
    } else {
        proximaLogicaElement.textContent = `Nenhuma senha aguardando.`;
    }
}


function chamarProximaSenha(guicheId) {
    const guiche = guiches[guicheId];
    
    if (guiche.atendendo) {
        alert('Este guichê já está em atendimento. Finalize a senha atual primeiro.');
        return;
    }
    
    const senhaChamada = obterProximaSenha();
    
    if (senhaChamada) {
        const tm = calcularTM(senhaChamada.tipo);
        guiche.atendendo = senhaChamada.numero;
        guiche.tempoEstimado = tm;
        
       
        document.getElementById('senha-atendimento').textContent = senhaChamada.numero;
        document.getElementById('tempo-estimado').textContent = `${tm} minutos`;

       
        historicoChamados.unshift({
            numero: senhaChamada.numero,
            guiche: guicheId,
            status: 'CHAMANDO'
        });

    
        if (historicoChamados.length > 5) {
            historicoChamados.pop();
        }
        
        atualizarPainel();
        atualizarProximaLogica();
        console.log(`Guichê ${guicheId} chamou senha ${senhaChamada.numero} (TM: ${tm} min).`);
    } else {
        alert('Não há senhas em nenhuma fila para chamar.');
    }
}

function finalizarAtendimento(guicheId) {
    const guiche = guiches[guicheId];

    if (!guiche.atendendo) {
        alert('Nenhuma senha em atendimento para finalizar.');
        return;
    }
    
    const senhaFinalizada = guiche.atendendo;
    console.log(`Atendimento da senha ${senhaFinalizada} finalizado no Guichê ${guicheId}.`);

    
    const item = historicoChamados.find(h => h.numero === senhaFinalizada && h.guiche === guicheId);
    if (item) {
        item.status = 'ATENDIDO';
    }

    
    guiche.atendendo = null;
    guiche.tempoEstimado = 0;
    
    
    document.getElementById('senha-atendimento').textContent = 'Nenhuma';
    document.getElementById('tempo-estimado').textContent = '0 min';

    atualizarPainel();
}

function descartarSenha(guicheId) {
    const guiche = guiches[guicheId];

    if (!guiche.atendendo) {
        alert('Nenhuma senha em atendimento para descartar.');
        return;
    }
    
    const senhaDescartada = guiche.atendendo;
    console.log(`Senha ${senhaDescartada} descartada (Cliente Ausente) no Guichê ${guicheId}.`);

    
    const item = historicoChamados.find(h => h.numero === senhaDescartada && h.guiche === guicheId);
    if (item) {
        item.status = 'DESCARTADA';
    }

    
    guiche.atendendo = null;
    guiche.tempoEstimado = 0;
    
    
    document.getElementById('senha-atendimento').textContent = 'Nenhuma';
    document.getElementById('tempo-estimado').textContent = '0 min';

    atualizarPainel();
}



function atualizarPainel() {
    const painel = document.getElementById('historico-chamados');
    painel.innerHTML = ''; 

    historicoChamados.forEach(item => {
        const row = painel.insertRow();
        
       
        if(item.status === 'CHAMANDO') {
            row.classList.add('chamando');
        }

        row.insertCell(0).textContent = item.numero;
        row.insertCell(1).textContent = item.guiche;
        row.insertCell(2).textContent = item.status;
    });
}


document.addEventListener('DOMContentLoaded', () => {
    atualizarProximaLogica();
   
    emitirSenha('SG');
    emitirSenha('SP');
    emitirSenha('SE');
    emitirSenha('SG');
});