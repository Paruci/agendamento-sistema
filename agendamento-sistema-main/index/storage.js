const STORAGE_KEY = "ahs_agendamentos";
const LOGIN_KEY = "ahs_admin_logado";

const ADMIN_CREDENTIALS = {
  email: "admin@admin.com",
  senha: "123456"
};

function gerarId() {
  return "ag_" + Date.now() + "_" + Math.random().toString(16).slice(2);
}

function buscarAgendamentos() {
  try {
    const dados = localStorage.getItem(STORAGE_KEY);
    return dados ? JSON.parse(dados) : [];
  } catch (e) {
    showNotification("Erro ao carregar dados.", "error");
    return [];
  }
}

function salvarAgendamentos(agendamentos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(agendamentos));
}

function adicionarAgendamento(agendamento) {
  const agendamentos = buscarAgendamentos();

  const origem = agendamento.origem || "Online";
  const exigeTelefone = origem === "Online";

  if (!agendamento.name || !agendamento.service || !agendamento.stylist || !agendamento.date || !agendamento.time) {
    return { sucesso: false, mensagem: "Preencha nome, serviço, barbeiro, data e horário." };
  }

  if (exigeTelefone) {
    if (!agendamento.phone) {
      return { sucesso: false, mensagem: "Telefone obrigatório para agendamento online." };
    }

    if (!validatePhone(agendamento.phone)) {
      return { sucesso: false, mensagem: "Telefone inválido. Use DDD + número." };
    }
  }

  const hoje = getTodayISO();

  if (agendamento.date < hoje && origem !== "Caixa") {
    return { sucesso: false, mensagem: "Não é possível agendar para datas passadas." };
  }

  const dataSelecionada = new Date(agendamento.date + "T00:00:00");
  const diaSemana = dataSelecionada.getDay();
  const diasTrabalho = WORK_CONFIG.workDays || [2, 3, 4, 5, 6];

  if (!diasTrabalho.includes(diaSemana) && origem !== "Caixa") {
    return { sucesso: false, mensagem: "A barbearia atende de terça a sábado." };
  }

  const duration = Number(agendamento.duration || getDuracaoServico(agendamento.service, agendamento.stylist));

  const conflito = agendamentos.some(item => {
    if (
      item.date !== agendamento.date ||
      item.stylist !== agendamento.stylist ||
      item.status === "Cancelado" ||
      item.status === "Despesa" ||
      origem === "Caixa"
    ) {
      return false;
    }

    const novoInicio = timeToMinutes(agendamento.time);
    const novoFim = novoInicio + duration;

    const existenteInicio = timeToMinutes(item.time);
    const existenteDuracao = Number(item.duration || getDuracaoServico(item.service, item.stylist));
    const existenteFim = existenteInicio + existenteDuracao;

    return novoInicio < existenteFim && novoFim > existenteInicio;
  });

  if (conflito) {
    return { sucesso: false, mensagem: "Este horário conflita com outro atendimento deste barbeiro." };
  }

  const novo = {
    id: gerarId(),
    name: sanitizeString(agendamento.name),
    phone: sanitizeString(agendamento.phone || ""),
    service: sanitizeString(agendamento.service),
    stylist: sanitizeString(agendamento.stylist),
    date: agendamento.date,
    time: agendamento.time,
    duration,
    status: agendamento.status || "Pendente",
    price: Number(agendamento.price || extractPrice(agendamento.service)),
    categoria: agendamento.categoria || "Serviço",
    paymentMethod: agendamento.paymentMethod || "",
    feeAmount: Number(agendamento.feeAmount || 0),
    origem,
    createdAt: new Date().toISOString()
  };

  agendamentos.push(novo);
  salvarAgendamentos(agendamentos);

  return {
    sucesso: true,
    mensagem: "Agendamento salvo com sucesso.",
    agendamento: novo
  };
}

  function fecharAtendimento(id, dadosFechamento) {
    const agendamentos = buscarAgendamentos();
    const index = agendamentos.findIndex(item => item.id === id);

    if (index === -1) {
      return { sucesso: false, mensagem: "Agendamento não encontrado." };
    }

    const agendamento = agendamentos[index];

    if (agendamento.status === "Finalizado") {
      return { sucesso: false, mensagem: "Este atendimento já foi fechado." };
    }

    const valor = Number(dadosFechamento.valor || 0);
    const metodoPagamento = dadosFechamento.metodoPagamento;

    if (valor <= 0) {
      return { sucesso: false, mensagem: "Informe um valor válido." };
    }

    if (!metodoPagamento) {
      return { sucesso: false, mensagem: "Selecione a forma de pagamento." };
    }

    const taxa = valor * Number(PAYMENT_FEES[metodoPagamento] || 0);

    agendamentos[index] = {
      ...agendamento,
      status: "Finalizado",
      price: valor,
      paymentMethod: metodoPagamento,
      payments: [{ metodo: metodoPagamento, valor }],
      feeAmount: taxa,
      closedAt: new Date().toISOString()
    };

    salvarAgendamentos(agendamentos);

    return {
      sucesso: true,
      mensagem: "Atendimento fechado com sucesso.",
      agendamento: agendamentos[index]
    };
  }

function removerAgendamento(id) {
  const agendamentos = buscarAgendamentos().filter(item => item.id !== id);
  salvarAgendamentos(agendamentos);
}

function loginAdmin(email, senha) {
  if (email === ADMIN_CREDENTIALS.email && senha === ADMIN_CREDENTIALS.senha) {
    localStorage.setItem(LOGIN_KEY, "sim");
    return true;
  }

  return false;
}

function logoutAdmin() {
  localStorage.removeItem(LOGIN_KEY);
}

function adminLogado() {
  return localStorage.getItem(LOGIN_KEY) === "sim";
}

function protegerAdmin() {
  if (!adminLogado()) {
    window.location.href = "login.html";
  }
}