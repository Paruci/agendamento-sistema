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
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(agendamentos));
  } catch (e) {
    showNotification("Erro ao salvar dados.", "error");
  }
}

function adicionarAgendamento(agendamento) {
  const agendamentos = buscarAgendamentos();

  if (!agendamento.name || !agendamento.service || !agendamento.stylist || !agendamento.date || !agendamento.time) {
    return { sucesso: false, mensagem: "Todos os campos são obrigatórios." };
  }

  if (agendamento.phone && !validatePhone(agendamento.phone)) {
    return { sucesso: false, mensagem: "Telefone inválido. Use formato brasileiro." };
  }

  const hoje = new Date().toISOString().split("T")[0];
  if (agendamento.date < hoje) {
    return { sucesso: false, mensagem: "Não é possível agendar para datas passadas." };
  }

  const existe = agendamentos.some(item =>
    item.date === agendamento.date &&
    item.time === agendamento.time &&
    item.stylist === agendamento.stylist
  );

  if (existe) {
    return { sucesso: false, mensagem: "Este horário já está ocupado para este barbeiro." };
  }

  const novo = {
    id: gerarId(),
    name: sanitizeString(agendamento.name),
    phone: sanitizeString(agendamento.phone || ""),
    service: sanitizeString(agendamento.service),
    stylist: sanitizeString(agendamento.stylist),
    date: agendamento.date,
    time: agendamento.time,
    status: agendamento.status || "Pendente",
    price: agendamento.price || extractPrice(agendamento.service),
    categoria: agendamento.categoria || "Serviço",
    paymentMethod: agendamento.paymentMethod || "",
    feeAmount: agendamento.feeAmount || 0,
    origem: agendamento.origem || "Online",
    createdAt: new Date().toISOString()
  };

  agendamentos.push(novo);
  salvarAgendamentos(agendamentos);

  return { sucesso: true, mensagem: "Agendamento salvo com sucesso." };
}

function removerAgendamento(id) {
  salvarAgendamentos(buscarAgendamentos().filter(item => item.id !== id));
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