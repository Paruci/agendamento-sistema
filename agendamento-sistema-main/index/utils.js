// utils.js - Funções utilitárias compartilhadas

/**
 * Formata um valor numérico como moeda brasileira (R$)
 * @param {number} value - Valor a ser formatado
 * @returns {string} Valor formatado
 */
function formatMoney(value) {
  return Number(value || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/**
 * Extrai o preço de uma string de serviço (ex: "Corte - R$ 50" -> 50)
 * @param {string} service - String do serviço
 * @returns {number} Preço extraído ou 0
 */
function extractPrice(service) {
  const match = String(service).match(/R\$\s*([\d.,]+)/);
  return match ? Number(match[1].replace(/\./g, "").replace(/,/g, ".")) : 0;
}

/**
 * Formata uma data no formato brasileiro (dd/mm/yyyy)
 * @param {string} dateString - Data em formato ISO (yyyy-mm-dd)
 * @returns {string} Data formatada ou "--/--/----" se inválida
 */
function formatDate(dateString) {
  if (!dateString) return "--/--/----";
  try {
    const date = new Date(dateString + "T00:00:00");
    return date.toLocaleDateString("pt-BR");
  } catch (e) {
    console.error("Erro ao formatar data:", e);
    return "--/--/----";
  }
}

/**
 * Valida um número de telefone brasileiro (10 ou 11 dígitos)
 * @param {string} phone - Telefone a validar
 * @returns {boolean} Verdadeiro se válido
 */
function validatePhone(phone) {
  const cleanPhone = phone.replace(/\D/g, "");
  return /^\d{10,11}$/.test(cleanPhone);
}

/**
 * Sanitiza uma string removendo caracteres potencialmente perigosos
 * @param {string} str - String a sanitizar
 * @returns {string} String sanitizada
 */
function sanitizeString(str) {
  return str.replace(/[<>]/g, "").trim();
}

/**
 * Mostra uma notificação temporária na tela
 * @param {string} message - Mensagem a exibir
 * @param {string} type - Tipo: 'success', 'error', 'info'
 */
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 16px;
    border-radius: 8px;
    color: white;
    font-weight: 500;
    z-index: 1000;
    animation: slideIn 0.3s ease;
  `;

  // Cores baseadas no tipo
  const colors = {
    success: '#39d98a',
    error: '#ff4d4f',
    info: '#2979ff'
  };
  notification.style.backgroundColor = colors[type] || colors.info;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Adiciona estilos CSS para notificações se não existirem
if (!document.querySelector('#notification-styles')) {
  const style = document.createElement('style');
  style.id = 'notification-styles';
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
}