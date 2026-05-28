function formatMoney(value) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function extractPrice(service) {
  const match = String(service).match(/R\$\s*([\d.,]+)/);
  return match ? Number(match[1].replace(/\./g, "").replace(/,/g, ".")) : 0;
}

function formatDate(dateString) {
  if (!dateString) return "--/--/----";
  return new Date(dateString + "T00:00:00").toLocaleDateString("pt-BR");
}

function onlyNumbers(value) {
  return String(value || "").replace(/\D/g, "");
}

function validatePhone(phone) {
  const cleaned = onlyNumbers(phone);
  return cleaned.length === 10 || cleaned.length === 11;
}

function formatPhone(phone) {
  const cleaned = onlyNumbers(phone);

  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }

  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }

  return phone;
}

function maskPhone(e) {
  e.target.value = formatPhone(e.target.value);
}

function sanitizeString(str) {
  return String(str || "").replace(/[<>]/g, "").trim();
}

function getTodayISO() {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const dia = String(hoje.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

function isDiaUtil(dateString) {
  const data = new Date(dateString + "T00:00:00");
  const diaSemana = data.getDay();

  return diaSemana >= 2 && diaSemana <= 6;
}

function getHorariosBase() {
  return [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
    "18:00",
    "18:30",
    "19:00"
  ];
}

function getHorariosDisponiveis(data, barbeiro) {
  const horarios = getHorariosBase();

  if (!data || !barbeiro) {
    return [];
  }

  const agendamentos = typeof buscarAgendamentos === "function"
    ? buscarAgendamentos()
    : [];

  const ocupados = agendamentos
    .filter(item =>
      item.date === data &&
      item.stylist === barbeiro &&
      item.status !== "Cancelado" &&
      item.status !== "Despesa"
    )
    .map(item => item.time);

  return horarios.filter(horario => !ocupados.includes(horario));
}

function showNotification(message, type = "info") {
  const el = document.createElement("div");
  el.className = `notification ${type}`;

  const icons = {
    success: "fa-check-circle",
    error: "fa-times-circle",
    info: "fa-info-circle"
  };

  el.innerHTML = `<i class="fa-solid ${icons[type] || icons.info}"></i> ${message}`;
  document.body.appendChild(el);

  setTimeout(() => {
    el.style.animation = "slideOut 0.3s ease forwards";
    setTimeout(() => el.remove(), 300);
  }, 3000);
}