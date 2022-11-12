let messageAlert = () => {
    alert("Primeiro gere um relatório prévio (preferêncialmente, desde o primeiro dia do mês), só depois clique no botão Calcular!");
}

let horaEmMinutos = (horario) => {
    let [hora, minuto] = horario.split(':').map(v => parseInt(v));

    return minuto + hora*60;
}

let minutosEmHorasTexto = (valorEmMinutos) => {
    let minutos = valorEmMinutos%60;
    let horas = (valorEmMinutos - minutos)/60;

    minutos = (minutos < 10) ? "0"+minutos : minutos;
    horas = (horas < 10) ? "0"+horas : horas;

    return horas + ":" + minutos;
}

let totalDeHorasRealizadas = () => {
    let bottomRelatorio = document.getElementById("bottomRelatorio");

    return bottomRelatorio ? bottomRelatorio.querySelectorAll("div i")[1] : null;
}

let exibirAvaliacaoBancoDeHoras = (texto) => {
    let element = document.createElement("i");
    element.classList.add("estadoBancoDeHoras");
    element.innerText = " | " + texto;

    if (totalDeHorasRealizadas()) {
        let parent = totalDeHorasRealizadas().parentNode;
        
        if (parent.querySelector(".estadoBancoDeHoras") != null) parent.removeChild(parent.querySelector(".estadoBancoDeHoras"));
        
        parent.appendChild(element);
    }
    else {
        messageAlert();
    }
}

let avaliarBancoDeHoras = (totalHorasDevidas, totalHorasTrabalhadas) => {
    let minutosDevidos = horaEmMinutos(totalHorasDevidas);
    let minutosTrabalhados = horaEmMinutos(totalHorasTrabalhadas);

    if (minutosDevidos > minutosTrabalhados) {
        let devido = minutosEmHorasTexto(minutosDevidos - minutosTrabalhados);
        exibirAvaliacaoBancoDeHoras("Você está devendo " + devido + " horas neste mês.");
    }
    else if (minutosDevidos < minutosTrabalhados) {
        let credito = minutosEmHorasTexto(minutosTrabalhados - minutosDevidos);
        exibirAvaliacaoBancoDeHoras("Você está com crédito de " + credito + " horas neste mês.");
    }
    else {
        exibirAvaliacaoBancoDeHoras("Você está em dia com seu Banco de Horas.");
    }
}

let totalizarHorasDia = (entrada, inicioAlmoco, fimAlmoco, saida) => {
    return (horaEmMinutos(inicioAlmoco) - horaEmMinutos(entrada)) + (horaEmMinutos(saida) - horaEmMinutos(fimAlmoco));
}

let contarDiasNaoRegistrados = (totaisDiarios) => {
    let total = 0;
    for (let dia of totaisDiarios) {
        if (dia.value == "ND") {
            total++;
        }
    }
    return total;
}

let totalHorasDevidas = (totalDeDias, diasNaoRegistrados) => {
    return (totalDeDias - diasNaoRegistrados) *  8;
}

let salvarPonto = () => {
    if (document.getElementsByClassName("entrada").length == 0) transformarTabela();

    let totais = document.querySelectorAll(".total");
    let totalMensal = 0;
    
    for (let total of totais) {
        let tr = total.parentNode;
        
        let entrada = tr.querySelector(".entrada input").value;
        let inicioAlmoco = tr.querySelector(".inicioAlmoco input").value;
        let fimAlmoco = tr.querySelector(".fimAlmoco input").value;
        let saida = tr.querySelector(".saida input").value;
        
        if (entrada.includes(":") && inicioAlmoco.includes(":") && fimAlmoco.includes(":") && saida.includes(":")) {
            let totalDiario = totalizarHorasDia(entrada, inicioAlmoco, fimAlmoco, saida);
            totalMensal += totalDiario;
            
            total.querySelector("input").value = minutosEmHorasTexto(totalDiario);
        }
    }
    
    if (totalDeHorasRealizadas()) {
        totalDeHorasRealizadas().innerText = minutosEmHorasTexto(totalMensal);
        
        let totaisDiarios = document.querySelectorAll('.total input');
        avaliarBancoDeHoras(totalHorasDevidas(totaisDiarios.length, contarDiasNaoRegistrados(totaisDiarios)) + ":00", minutosEmHorasTexto(totalMensal));
    }
    else {
        messageAlert();
    }
}

let getCpfUsuario = () => {
    return document.querySelectorAll(".profile-pic span")[0].innerText;
}

let buildPonto = tr => {
    let data = tr.querySelector(".data").innerText;
    let entrada = tr.querySelector(".entrada input").value;
    let inicioAlmoco = tr.querySelector(".inicioAlmoco input").value;
    let fimAlmoco = tr.querySelector(".fimAlmoco input").value;
    let saida = tr.querySelector(".saida input").value;

    return {
        "data": data,
        "entrada" : entrada,
        "inicioAlmoco" : inicioAlmoco,
        "fimAlmoco" : fimAlmoco,
        "saida" : saida
    };
}

let carregarPonto = (tr, pontoSalvo) => {
    tr.querySelector(".data").innerText = pontoSalvo.data;
    tr.querySelector(".entrada input").value = pontoSalvo.entrada;
    tr.querySelector(".inicioAlmoco input").value = pontoSalvo.inicioAlmoco;
    tr.querySelector(".fimAlmoco input").value = pontoSalvo.fimAlmoco;
    tr.querySelector(".saida input").value = pontoSalvo.saida;
}

let inserirButtonSalvar = (parentElement) => {
    let buttonSalvar = document.createElement("button");
    buttonSalvar.innerText = "Salvar";
    buttonSalvar.classList.add("salvar", "btn","btnPCSStyle", "mr-1");
    buttonSalvar.style = "padding: 0.5em;border-color: darkgray;border-radius: 50%;font-weight: normal;font-size: 0.65rem;background-color: darkgreen;";

    parentElement.appendChild(buttonSalvar);
    
    buttonSalvar.addEventListener("click", () => {
        let ponto = buildPonto(parentElement.parentNode);

        let key = getCpfUsuario() + ponto.data;

        localStorage.setItem(key, JSON.stringify(ponto));

        calcularBancoDeHoras();
    });
}

let carregarPontosSalvos = () => {
    let datasTD = document.querySelectorAll(".data");

    datasTD.forEach(dataTD => {
        let pontoSalvo = JSON.parse(localStorage.getItem(getCpfUsuario() + dataTD.innerText));

        if (pontoSalvo) {
            carregarPonto(dataTD.parentNode, pontoSalvo);
        }
    });
}

let transformarTabela = () => {
    let celulasDaTabela = document.querySelectorAll(".AtenaMvcGrid tbody td");
    
    for (let index = 0; index < celulasDaTabela.length; index++) {
        let celula = celulasDaTabela[index];
        if (index%7 == 0) celula.classList.add("data");
        if (index%7 == 2) celula.classList.add("entrada");
        if (index%7 == 3) celula.classList.add("inicioAlmoco");
        if (index%7 == 4) celula.classList.add("fimAlmoco");
        if (index%7 == 5) celula.classList.add("saida");
        
        if (index%7 > 1) {
            let valor = celula.innerText;
            let input = "<input type='text' />";
            celula.setHTML(input);
            celula.querySelectorAll("input")[0].value = valor;
            celula.querySelectorAll("input")[0].style = "width: inherit; border-style: none; background-color: transparent;";
        }

        if (index%7 == 6) {
            celula.classList.add("total");

            inserirButtonSalvar(celula);
        }
    }

    carregarPontosSalvos();
}

let calcularBancoDeHoras = () => {
    if (document.getElementsByClassName("entrada").length == 0) transformarTabela();

    let totais = document.querySelectorAll(".total");
    let totalMensal = 0;
    
    for (let total of totais) {
        let tr = total.parentNode;
        
        let entrada = tr.querySelector(".entrada input").value;
        let inicioAlmoco = tr.querySelector(".inicioAlmoco input").value;
        let fimAlmoco = tr.querySelector(".fimAlmoco input").value;
        let saida = tr.querySelector(".saida input").value;
        
        if (entrada.includes(":") && inicioAlmoco.includes(":") && fimAlmoco.includes(":") && saida.includes(":")) {
            let totalDiario = totalizarHorasDia(entrada, inicioAlmoco, fimAlmoco, saida);
            totalMensal += totalDiario;
            
            total.querySelector("input").value = minutosEmHorasTexto(totalDiario);
        }
    }
    
    if (totalDeHorasRealizadas()) {
        totalDeHorasRealizadas().innerText = minutosEmHorasTexto(totalMensal);
        
        let totaisDiarios = document.querySelectorAll('.total input');
        avaliarBancoDeHoras(totalHorasDevidas(totaisDiarios.length, contarDiasNaoRegistrados(totaisDiarios)) + ":00", minutosEmHorasTexto(totalMensal));
    }
    else {
        messageAlert();
    }
}

let removeOldButtonIfExists = () => {
    let oldButton = document.getElementById("calcular");
    if (oldButton) {
        oldButton.parentNode.removeChild(oldButton);
    }
}

let inserirButtonCalcular = () => {
    removeOldButtonIfExists();

    let buttonCalcular = document.createElement("button");
    buttonCalcular.id = "calcular";
    buttonCalcular.innerText = "Calcular";
    buttonCalcular.classList.add("btn","btnPCSStyle", "mr-1");
    buttonCalcular.style = "padding: 0.5em;border-color: darkgray;";

    document.getElementById("google_translate_element").parentNode.insertBefore(buttonCalcular, document.getElementById("google_translate_element"));
    
    buttonCalcular.addEventListener("click", calcularBancoDeHoras);
}

inserirButtonCalcular();