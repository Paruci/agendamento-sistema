const grid = document.getElementById("grid");

function render(agendamentos) {
  grid.innerHTML = "";

  agendamentos.forEach(a => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <strong>${a.nome}</strong><br>
      ${a.barbeiro} - ${a.data} às ${a.hora}
    `;
    grid.appendChild(div);
  });
}

db.collection("agendamentos")
  .orderBy("createdAt", "desc")
  .onSnapshot(snapshot => {
    const lista = snapshot.docs.map(doc => doc.data());
    render(lista);
  });

async function criarAgendamento() {
  const dados = {
    nome: document.getElementById("nome").value,
    telefone: document.getElementById("telefone").value,
    barbeiro: document.getElementById("barbeiro").value,
    data: document.getElementById("data").value,
    hora: document.getElementById("hora").value,
    createdAt: new Date()
  };

  await db.collection("agendamentos").add(dados);
}