function formatMoney(value) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

function getServiceConfig(service) {
  if (!Array.isArray(typeof SERVICES !== "undefined" ? SERVICES : [])) return null;

  const text = normalizeText(service);

  return SERVICES.find(item =>
    normalizeText(item.value) === text ||
    normalizeText(item.label) === text ||
    text.includes(normalizeText(item.label)) ||
    normalizeText(item.value).includes(text)
  ) || null;
}

function extractPrice(service) {
  const serviceConfig = getServiceConfig(service);
  if (serviceConfig) return Number(serviceConfig.price || 0);

  const match = String(service || "").match(/R\$\s*([\d.,]+)/);
  return match ? Number(match[1].replace(/\./g, "").replace(",", ".")) : 0;
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

function maskPhone(event) {
  event.target.value = formatPhone(event.target.value);
}

function sanitizeString(value) {
  return String(value || "").replace(/[<>]/g, "").trim();
}

function getTodayISO() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function isDiaUtil(dateString) {
  const date = new Date(dateString + "T00:00:00");
  const day = date.getDay();

  return day >= 2 && day <= 6;
}

function timeToMinutes(time) {
  const [hours, minutes] = String(time || "00:00").split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function getDuracaoServico(service, stylist) {
  const serviceConfig = getServiceConfig(service);
  const barber = String(stylist || "").trim();

  if (serviceConfig) {
    if (serviceConfig.barberDurations && serviceConfig.barberDurations[barber]) {
      return Number(serviceConfig.barberDurations[barber]);
    }

    return Number(serviceConfig.duration || 60);
  }

  return 60;
}

function getIntervaloAgenda(service, stylist) {
  const serviceConfig = getServiceConfig(service);
  const barber = String(stylist || "").trim();

  if (serviceConfig) {
    if (serviceConfig.barberIntervals && serviceConfig.barberIntervals[barber]) {
      return Number(serviceConfig.barberIntervals[barber]);
    }

    return Number(serviceConfig.interval || 60);
  }

  return 60;
}

function getHorariosBase(service, stylist) {
  const start = timeToMinutes(typeof WORK_CONFIG !== "undefined" ? WORK_CONFIG.openingTime : "09:00");
  const end = timeToMinutes(typeof WORK_CONFIG !== "undefined" ? WORK_CONFIG.closingTime : "19:00");
  const interval = getIntervaloAgenda(service, stylist);
  const times = [];

  for (let current = start; current < end; current += interval) {
    times.push(minutesToTime(current));
  }

  return times;
}

function horariosConflitam(startA, durationA, startB, durationB) {
  const endA = startA + durationA;
  const endB = startB + durationB;

  return startA < endB && endA > startB;
}

function getHorariosDisponiveis(date, stylist, service) {
  if (!date || !stylist || !service) {
    return [];
  }

  const baseTimes = getHorariosBase(service, stylist);
  const newDuration = getDuracaoServico(service, stylist);

  const appointments = typeof buscarAgendamentos === "function"
    ? buscarAgendamentos()
    : [];

  const appointmentsOnDay = appointments.filter(item =>
    item.date === date &&
    item.stylist === stylist &&
    item.status !== "Cancelado" &&
    item.status !== "Despesa"
  );

  return baseTimes.filter(time => {
    const newStart = timeToMinutes(time);
    const newEnd = newStart + newDuration;

    if (newEnd > timeToMinutes(typeof WORK_CONFIG !== "undefined" ? WORK_CONFIG.closingTime : "19:00")) {
      return false;
    }

    return !appointmentsOnDay.some(item => {
      const existingStart = timeToMinutes(item.time);
      const existingDuration = item.duration || getDuracaoServico(item.service, item.stylist);

      return horariosConflitam(
        newStart,
        newDuration,
        existingStart,
        existingDuration
      );
    });
  });
}

function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;

  const icons = {
    success: "fa-check-circle",
    error: "fa-times-circle",
    info: "fa-info-circle"
  };

  notification.innerHTML = `
    <i class="fa-solid ${icons[type] || icons.info}"></i>
    <span>${message}</span>
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease forwards";

    setTimeout(() => {
      notification.remove();
    }, 300);
  }, type === "success" ? 1200 : 2500);
}