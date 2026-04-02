async function agendar() {
  const dados = {
    nome: document.getElementById("nome").value,
    telefone: document.getElementById("telefone").value,
    barbeiro: document.getElementById("barbeiro").value,
    data: document.getElementById("data").value,
    hora: document.getElementById("hora").value,
    createdAt: new Date()
  };

  await db.collection("agendamentos").add(dados);

  const msg = `Olá, meu nome é ${dados.nome}. Agendei ${dados.data} às ${dados.hora}`;
  const url = `https://wa.me/55${dados.telefone}?text=${encodeURIComponent(msg)}`;

  window.open(url, "_blank");
}