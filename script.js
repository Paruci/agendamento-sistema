// config do Firebase (preencha com suas credenciais reais)
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_DOMINIO.firebaseapp.com",
  projectId: "SEU_PROJECT_ID",
  storageBucket: "SEU_PROJECT_ID.appspot.com",
  messagingSenderId: "SEU_MESSAGING_SENDER_ID",
  appId: "SEU_APP_ID"
};

let db;

function initFirebase() {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  db = firebase.firestore();
}

function horarioFuncionamentoValido(dataStr, horaStr) {
  const datetime = new Date(`${dataStr}T${horaStr}:00`);
  const dia = datetime.getDay();
  const hora = datetime.getHours();
  const minuto = datetime.getMinutes();

  if (dia === 0 || dia === 1 || dia === 6) return false;
  if (hora < 9 || hora > 18) return false;
  if (hora === 18 && minuto > 59) return false;

  return true;
}

function calcularFaturamento(agendamentos) {
  const preco = {
    "Corte Masculino": 80,
    "Barba": 40,
    "Combo": 110,
    "Degradê Premium": 120
  };
  const hoje = new Date().toISOString().slice(0, 10);
  return agendamentos
    .filter(a => a.data === hoje)
    .reduce((total, a) => total + (preco[a.servico] || 0), 0);
}

function serviceMaisPedido(agendamentos) {
  const contagem = {};
  agendamentos.forEach(item => {
    if (!item.servico) return;
    contagem[item.servico] = (contagem[item.servico] || 0) + 1;
  });

  const melhor = Object.entries(contagem).sort((a, b) => b[1] - a[1])[0];
  return melhor ? `${melhor[0]} (${melhor[1]}x)` : "Nenhum serviço";
}

function renderLista(agendamentos) {
  const lista = document.getElementById("lista");
  if (!lista) return;
  lista.innerHTML = "";

  agendamentos.forEach(a => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${a.nome}</strong> - ${a.data} às ${a.hora}<br>
      ${a.servico} - ${a.barbeiro}<br>
      <small>${a.telefone || "Telefone não informado"}</small>
    `;
    lista.appendChild(li);
  });
}

function getStorageArray(key) {
  return JSON.parse(localStorage.getItem(key) || "[]");
}

function setStorageArray(key, arr) {
  localStorage.setItem(key, JSON.stringify(arr));
}

function atualizarDashboard(agendamentos) {
  const faturamento = calcularFaturamento(agendamentos);
  const maisPedido = serviceMaisPedido(agendamentos);

  const receitaTotal = getStorageArray("transacoes").reduce((sum, item) => sum + Number(item.valor || 0), 0);

  const faturamentoEl = document.getElementById("faturamento");
  const maisPedidoEl = document.getElementById("maisPedido");
  const receitaTotalEl = document.getElementById("receitaTotal");
  if (faturamentoEl) faturamentoEl.innerText = `R$ ${faturamento.toFixed(2)}`;
  if (maisPedidoEl) maisPedidoEl.innerText = maisPedido;
  if (receitaTotalEl) receitaTotalEl.innerText = `R$ ${receitaTotal.toFixed(2)}`;
}

function renderExtrato() {
  const transacoes = getStorageArray("transacoes");
  const extrato = document.getElementById("extrato");
  if (!extrato) return;

  if (transacoes.length === 0) {
    extrato.innerHTML = "Nenhuma entrada registrada";
    return;
  }

  extrato.innerHTML = transacoes
    .slice(-8)
    .reverse()
    .map(tx => `${tx.data} - ${tx.tipo} - R$${Number(tx.valor).toFixed(2)} - ${tx.descricao}`)
    .join("<br>");
}

function renderHistoricoClientes() {
  const agendamentos = getStorageArray("agendamentos")
    .sort((a, b) => new Date(b.data) - new Date(a.data));

  const tbody = document.querySelector("#tabelaClientes tbody");
  if (!tbody) return;

  const clientes = {};
  agendamentos.forEach(item => {
    if (!clientes[item.telefone]) {
      clientes[item.telefone] = { ...item };
    }
  });

  tbody.innerHTML = Object.values(clientes)
    .map(item => `
      <tr>
        <td>${item.nome}</td>
        <td>${item.telefone}</td>
        <td>${item.servico}</td>
        <td>${item.data}</td>
      </tr>
    `).join("");
}

function renderLogins() {
  const logins = getStorageArray("logins");
  const lista = document.getElementById("listaLogins");
  if (!lista) return;
  if (logins.length === 0) {
    lista.innerHTML = "<li>Nenhum login salvo</li>";
    return;
  }

  lista.innerHTML = logins.map(item => `<li><strong>${item.usuario}</strong> (${item.role})</li>`).join("");
}

function agendarNoFirebase(obj) {
  return db.collection("agendamentos").add(obj);
}

function consultarAgendamentosRealtime() {
  return db.collection("agendamentos")
    .orderBy("data", "asc")
    .orderBy("hora", "asc")
    .onSnapshot(snapshot => {
      const agendamentos = [];
      snapshot.forEach(doc => agendamentos.push({ id: doc.id, ...doc.data() }));
      renderLista(agendamentos);
      atualizarDashboard(agendamentos);
    });
}

function enviarWhatsapp(numero, mensagem) {
  const telefone = numero.replace(/[^0-9]/g, "");
  const texto = encodeURIComponent(mensagem);
  const url = `https://wa.me/55${telefone}?text=${texto}`;
  window.open(url, "_blank");
}

function formatDateGy(m) {
  return String(m).padStart(2, "0");
}

function toYMD(date) {
  return `${date.getFullYear()}-${formatDateGy(date.getMonth()+1)}-${formatDateGy(date.getDate())}`;
}

function gerarDiasDaSemana(dataBase) {
  const weekdays = document.getElementById("weekdays");
  if (!weekdays) return;

  weekdays.innerHTML = "";
  const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const base = new Date(dataBase);
  const start = new Date(base);
  // exibir semana atual (domingo a sábado) ou 7 dias centrados na dataBase
  start.setDate(base.getDate() - base.getDay());

  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "weekday";
    btn.innerHTML = `<span>${dayNames[d.getDay()]}</span><strong>${formatDateGy(d.getDate())}/${formatDateGy(d.getMonth()+1)}</strong>`;
    if (toYMD(d) === toYMD(new Date(dataBase))) {
      btn.classList.add("active");
    }
    btn.addEventListener("click", () => {
      document.querySelectorAll(".weekday").forEach(w => w.classList.remove("active"));
      btn.classList.add("active");
      const inputDate = document.querySelector("input[name='data']");
      if (inputDate) inputDate.value = toYMD(d);
    });
    weekdays.appendChild(btn);
  }
}

function gerarHorariosDisponiveis() {
  const slotsContainer = document.getElementById("slots");
  if (!slotsContainer) return;

  slotsContainer.innerHTML = "";
  const horarios = [];
  for (let h = 9; h < 19; h++) {
    const hora = String(h).padStart(2, "0");
    horarios.push(`${hora}:00`);
    horarios.push(`${hora}:30`);
  }

  horarios.forEach(hora => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "slot-btn";
    btn.innerText = hora;
    btn.addEventListener("click", () => {
      const horaInput = document.querySelector("input[name='hora']");
      const all = document.querySelectorAll(".slot-btn");
      all.forEach(i => i.classList.remove("active"));
      btn.classList.add("active");
      if (horaInput) horaInput.value = hora;
    });
    slotsContainer.appendChild(btn);
  });
}

function agendaWhatsAppLembrete() {
  const agora = new Date();
  db.collection("agendamentos")
    .where("reminderSent", "==", false)
    .get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        const agendamento = doc.data();
        const dt = new Date(`${agendamento.data}T${agendamento.hora}:00`);
        const diff = (dt - agora) / (1000*60);

        if (diff > 119 && diff < 121) {
          if (agendamento.telefone) {
            const texto = `Lembrete: Olá ${agendamento.nome}, seu agendamento em ${agendamento.data} às ${agendamento.hora} está em 2 horas.`;
            enviarWhatsapp(agendamento.telefone, texto);
          }
          db.collection("agendamentos").doc(doc.id).update({ reminderSent: true });
        }
      });
    });
}

function nomeBarbeiroNormalizado(barbeiro) {
  const mapa = {
    "Adriano": "Adriano Júnior",
    "Arthur": "Arthur Pinheiro",
    "Igor": "Igor Nascimento",
    "Vinícius": "Vinícius Soler"
  };
  return mapa[barbeiro] || barbeiro;
}

function initApp() {
  initFirebase();

  const formAg = document.getElementById("formAgendamento");
  const formAdmin = document.getElementById("formAdminAgendamento");

  if (formAg) {
    const dateInput = formAg.querySelector("input[name='data']");
    const today = new Date();
    if (dateInput) {
      const todayYmd = toYMD(today);
      dateInput.value = todayYmd;
      gerarDiasDaSemana(todayYmd);
      dateInput.addEventListener("change", event => {
        if (event.target.value) gerarDiasDaSemana(event.target.value);
      });
    }

    gerarHorariosDisponiveis();

    formAg.addEventListener("submit", e => {
      e.preventDefault();

      const data = formAg.querySelector("input[name='data']").value;
      const hora = formAg.querySelector("input[name='hora']").value;
      const nome = formAg.querySelector("input[name='nome']").value;
      const telefone = formAg.querySelector("input[name='telefone']").value;
      const servico = formAg.querySelector("select[name='servico']").value;

      if (!hora) {
        document.getElementById("msg").innerText = "Selecione um horário disponível.";
        return;
      }

      if (!horarioFuncionamentoValido(data, hora)) {
        document.getElementById("msg").innerText = "Operamos de terça a sábado, 09h às 19h.";
        return;
      }

      const texto = `Olá ${nome}, desejo agendar ${servico} para ${data} às ${hora}.`;
      enviarWhatsapp(telefone, texto);

      document.getElementById("msg").innerText = "Pedido de agendamento enviado ao WhatsApp!";
      formAg.reset();
      document.querySelectorAll(".slot-btn").forEach(b => b.classList.remove("active"));
    });
  }

  const formControleEntrada = document.getElementById("formControleEntrada");
  if (formControleEntrada) {
    formControleEntrada.addEventListener("submit", e => {
      e.preventDefault();
      const valor = Number(formControleEntrada.querySelector("input[name='valor']").value);
      const tipo = formControleEntrada.querySelector("select[name='tipo']").value;
      const descricao = formControleEntrada.querySelector("input[name='descricao']").value;
      const data = new Date().toLocaleDateString();

      const transacoes = getStorageArray("transacoes");
      transacoes.push({ valor, tipo, descricao, data });
      setStorageArray("transacoes", transacoes);
      renderExtrato();
      atualizarDashboard(getStorageArray("agendamentos"));

      formControleEntrada.reset();
    });
  }

  const formLogins = document.getElementById("formLogins");
  if (formLogins) {
    formLogins.addEventListener("submit", e => {
      e.preventDefault();
      const usuario = formLogins.querySelector("input[name='usuario']").value;
      const senha = formLogins.querySelector("input[name='senha']").value;
      const role = formLogins.querySelector("select[name='role']").value;

      const logins = getStorageArray("logins");
      logins.push({ usuario, role, senha: "********" });
      setStorageArray("logins", logins);
      renderLogins();
      formLogins.reset();
    });
  }

  renderExtrato();
  renderHistoricoClientes();
  renderLogins();

  if (formAdmin) {
    formAdmin.addEventListener("submit", e => {
      e.preventDefault();

      const data = formAdmin.querySelector("input[name='data']").value;
      const hora = formAdmin.querySelector("input[name='hora']").value;
      const nome = formAdmin.querySelector("input[name='nome']").value;
      const telefone = formAdmin.querySelector("input[name='telefone']").value;
      const barbeiro = formAdmin.querySelector("select[name='barbeiro']").value;
      const servico = formAdmin.querySelector("select[name='servico']").value;

      if (!horarioFuncionamentoValido(data, hora)) {
        document.getElementById("msgAdmin").innerText = "Horário inválido. Terça a sábado, de 09h a 19h.";
        return;
      }

      const agendamento = {
        nome,
        telefone,
        data,
        hora,
        barbeiro,
        servico,
        origem: "manual",
        reminderSent: false,
        criadoEm: new Date().toISOString()
      };

      agendarNoFirebase(agendamento).then(() => {
        document.getElementById("msgAdmin").innerText = "Agendamento salvo no painel.";

        const agendamentosLoc = getStorageArray("agendamentos");
        agendamentosLoc.push(agendamento);
        setStorageArray("agendamentos", agendamentosLoc);

        renderLista(agendamentosLoc);
        renderHistoricoClientes();
        atualizarDashboard(agendamentosLoc);
        formAdmin.reset();
      }).catch(err => {
        document.getElementById("msgAdmin").innerText = "Erro ao salvar no painel.";
        console.error(err);
      });
    });
  }

  const stopRealtime = consultarAgendamentosRealtime();

  setInterval(() => {
    agendaWhatsAppLembrete();
  }, 60000);

  window.onbeforeunload = () => {
    if (stopRealtime) stopRealtime();
  };
}

document.addEventListener("DOMContentLoaded", initApp);
