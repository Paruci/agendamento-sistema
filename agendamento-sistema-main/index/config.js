const BARBERS = ["Adriano", "Arthur", "Igor", "Vinícius"];

const SERVICES = [
  {
    label: "Corte Masculino",
    value: "Corte Masculino - R$ 50",
    price: 50,
    duration: 60,
    interval: 60,
    barberDurations: { Arthur: 30 },
    barberIntervals: { Arthur: 30 }
  },
  {
    label: "Corte + Sobrancelha",
    value: "Corte + Sobrancelha - R$ 55",
    price: 55,
    duration: 60,
    interval: 60,
    barberDurations: { Arthur: 30 },
    barberIntervals: { Arthur: 30 }
  },
  {
    label: "Corte + Barba",
    value: "Corte + Barba - R$ 90",
    price: 90,
    duration: 90,
    interval: 60,
    barberIntervals: { Arthur: 30 }
  },
  {
    label: "Acabamento",
    value: "Acabamento - R$ 20",
    price: 20,
    duration: 30,
    interval: 30
  },
  {
    label: "Pigmentação",
    value: "Pigmentação",
    price: 0,
    duration: 60,
    interval: 60,
    barberIntervals: { Arthur: 30 }
  },
  {
    label: "Química e cor",
    value: "Química e cor",
    price: 0,
    duration: 120,
    interval: 60,
    barberIntervals: { Arthur: 30 }
  }
];

const PAYMENT_FEES = {
  Pix: 0,
  Dinheiro: 0,
  Débito: 0.00415,
  Crédito: 0.0125
};

const BARBER_SHARE = {
  Adriano: 1,
  Arthur: 0.56,
  Igor: 0.5,
  Vinícius: 0.5
};

const DURATIONS = [
    { label: "30 min", value: 30 },
    { label: "60 min", value: 60 },
    { label: "90 min", value: 90 },
    { label: "2h", value: 120 }
];

const WORK_CONFIG = {
    openingTime: "09:00",
    closingTime: "19:00",
    workDays: [2, 3, 4, 5, 6]
};

const DURATIONS = [
  { label: "30 min", value: 30 },
  { label: "60 min", value: 60 },
  { label: "90 min", value: 90 },
  { label: "2h", value: 120 }
];