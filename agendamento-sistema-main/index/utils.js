function formatMoney(value) {
  return Number(value || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function extractPrice(service) {
  const match = String(service).match(/R\$\s*([\d.,]+)/);
  return match ? Number(match[1].replace(/\./g, "").replace(/,/g, ".")) : 0;
}

function formatDate(dateString) {
  if (!dateString) return "--/--/----";
  try {
    return new Date(dateString + "T00:00:00").toLocaleDateString("pt-BR");
  } catch (e) {
    return "--/--/----";
  }
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

function sanitizeString(str) {
  return str.replace(/[<>]/g, "").trim();
}

function showNotification(message, type = "info") {
  const el = document.createElement("div");
  el.className = `notification ${type}`;

  const icons = { success: "fa-check-circle", error: "fa-times-circle", info: "fa-info-circle" };
  el.innerHTML = `<i class="fa-solid ${icons[type] || icons.info}"></i> ${message}`;
  document.body.appendChild(el);

  setTimeout(() => {
    el.style.animation = "slideOut 0.3s ease forwards";
    setTimeout(() => el.remove(), 300);
  }, 3000);
}