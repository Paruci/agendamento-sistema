const STORAGE_KEY = 'ahs_agendamentos';
const LOGIN_KEY = 'ahs_admin_logado';

// Credenciais de admin (em produção, use backend com hash)
const ADMIN_CREDENTIALS = {
  email: 'admin@admin.com',
  senha: '123456'  // AVISO: Mude isso em produção!
};

/**
 * Gera um ID único para agendamentos
 * @returns {string} ID gerado
 */
function gerarId() {
  return 'ag_' + Date.now() + '_' + Math.random().toString(16).slice(2);
}

/**
 * Busca todos os agendamentos do localStorage
 * @returns {Array} Lista de agendamentos
 */
function buscarAgendamentos() {
  try {
    const dados = localStorage.getItem(STORAGE_KEY);
    return dados ? JSON.parse(dados) : [];
  } catch (e) {
    console.error('Erro ao carregar agendamentos:', e);
    showNotification('Erro ao carregar dados. Dados podem estar corrompidos.', 'error');
    return [];
  }
}

/**
 * Salva agendamentos no localStorage
 * @param {Array} agendamentos - Lista de agendamentos
 */
function salvarAgendamentos(agendamentos) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(agendamentos));
  } catch (e) {
    console.error('Erro ao salvar agendamentos:', e);
    showNotification('Erro ao salvar dados. Verifique o espaço disponível.', 'error');
  }
}

/**
 * Adiciona um novo agendamento
 * @param {Object} agendamento - Dados do agendamento
 * @returns {Object} Resultado com sucesso/mensagem
 */
function adicionarAgendamento(agendamento) {
  const agendamentos = buscarAgendamentos();

  // Validações básicas
  if (!agendamento.name || !agendamento.phone || !agendamento.service || !agendamento.stylist || !agendamento.date || !agendamento.time) {
    return { sucesso: false, mensagem: 'Todos os campos são obrigatórios.' };
  }

  if (!validatePhone(agendamento.phone)) {
    return { sucesso: false, mensagem: 'Telefone inválido. Use formato brasileiro.' };
  }

  // Verifica se horário já está ocupado
  const existe = agendamentos.some(item =>
    item.date === agendamento.date &&
    item.time === agendamento.time &&
    item.stylist === agendamento.stylist
  );

  if (existe) {
    return { sucesso: false, mensagem: 'Este horário já está ocupado.' };
  }

  // Verifica se data é futura
  const hoje = new Date().toISOString().split('T')[0];
  if (agendamento.date < hoje) {
    return { sucesso: false, mensagem: 'Não é possível agendar para datas passadas.' };
  }

  // Sanitiza dados
  const agendamentoSanitizado = {
    id: gerarId(),
    name: sanitizeString(agendamento.name),
    phone: sanitizeString(agendamento.phone),
    service: sanitizeString(agendamento.service),
    stylist: sanitizeString(agendamento.stylist),
    date: agendamento.date,
    time: agendamento.time,
    status: agendamento.status || 'Pendente',
    price: agendamento.price || extractPrice(agendamento.service),
    createdAt: new Date().toISOString()
  };

  agendamentos.push(agendamentoSanitizado);
  salvarAgendamentos(agendamentos);

  return { sucesso: true, mensagem: 'Agendamento salvo com sucesso.' };
}

/**
 * Remove um agendamento pelo ID
 * @param {string} id - ID do agendamento
 */
function removerAgendamento(id) {
  const agendamentos = buscarAgendamentos().filter(item => item.id !== id);
  salvarAgendamentos(agendamentos);
}

/**
 * Faz login do admin
 * @param {string} email - Email do admin
 * @param {string} senha - Senha do admin
 * @returns {boolean} Verdadeiro se login bem-sucedido
 */
function loginAdmin(email, senha) {
  if (email === ADMIN_CREDENTIALS.email && senha === ADMIN_CREDENTIALS.senha) {
    localStorage.setItem(LOGIN_KEY, 'sim');
    return true;
  }
  return false;
}

/**
 * Faz logout do admin
 */
function logoutAdmin() {
  localStorage.removeItem(LOGIN_KEY);
}

/**
 * Verifica se admin está logado
 * @returns {boolean} Verdadeiro se logado
 */
function adminLogado() {
  return localStorage.getItem(LOGIN_KEY) === 'sim';
}

/**
 * Protege páginas admin - redireciona se não logado
 */
function protegerAdmin() {
  if (!adminLogado()) {
    window.location.href = 'login.html';
  }
}