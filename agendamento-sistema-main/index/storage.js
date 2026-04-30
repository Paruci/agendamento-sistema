const STORAGE_KEY = 'ahs_agendamentos';
const LOGIN_KEY = 'ahs_admin_logado';

function gerarId() {
  return 'ag_' + Date.now() + '_' + Math.random().toString(16).slice(2);
}

function buscarAgendamentos() {
  const dados = localStorage.getItem(STORAGE_KEY);
  return dados ? JSON.parse(dados) : [];
}

function salvarAgendamentos(agendamentos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(agendamentos));
}

function adicionarAgendamento(agendamento) {
  const agendamentos = buscarAgendamentos();

  const existe = agendamentos.some(item =>
    item.date === agendamento.date &&
    item.time === agendamento.time &&
    item.stylist === agendamento.stylist
  );

  if (existe) {
    return {
      sucesso: false,
      mensagem: 'Este horário já está ocupado.'
    };
  }

  agendamentos.push({
    id: gerarId(),
    ...agendamento,
    createdAt: new Date().toISOString()
  });

  salvarAgendamentos(agendamentos);

  return {
    sucesso: true,
    mensagem: 'Agendamento salvo com sucesso.'
  };
}

function removerAgendamento(id) {
  const agendamentos = buscarAgendamentos().filter(item => item.id !== id);
  salvarAgendamentos(agendamentos);
}

function loginAdmin(email, senha) {
  if (email === 'admin@admin.com' && senha === '123456') {
    localStorage.setItem(LOGIN_KEY, 'sim');
    return true;
  }

  return false;
}

function logoutAdmin() {
  localStorage.removeItem(LOGIN_KEY);
}

function adminLogado() {
  return localStorage.getItem(LOGIN_KEY) === 'sim';
}

function protegerAdmin() {
  if (!adminLogado()) {
    window.location.href = 'login.html';
  }
}