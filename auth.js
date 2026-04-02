function login() {
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  auth.signInWithEmailAndPassword(email, senha)
    .then(() => {
      window.location.href = "admin.html";
    })
    .catch(() => alert("Erro no login"));
}

auth.onAuthStateChanged(user => {
  if (window.location.pathname.includes("admin") && !user) {
    window.location.href = "login.html";
  }
});