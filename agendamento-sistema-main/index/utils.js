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

function validatePhone(phone) {
  return /^\d{10,11}$/.test(phone.replace(/\D/g, ""));
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