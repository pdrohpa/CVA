const firebaseConfig = {
  apiKey: "AIzaSyBTghhMKFHgiWtumkLdjlyuohlR__yzEag",
  authDomain: "cva-controle-de-vac-de-animais.firebaseapp.com",
  databaseURL:
    "https://cva-controle-de-vac-de-animais-default-rtdb.firebaseio.com",
  projectId: "cva-controle-de-vac-de-animais",
  storageBucket: "cva-controle-de-vac-de-animais.appspot.com",
  messagingSenderId: "674772281471",
  appId: "1:674772281471:web:7c9dedf81224a4459fb74a",
};
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const database = firebase.database();

const form = document.getElementById("form-cadastrar-animal");
const mensagem = document.getElementById("mensagem");
const especieSelect = document.getElementById("especie");
const racaSelect = document.getElementById("raca");
const inputRacaOutros = document.getElementById("racaOutros");
const containerRacaOutros = document.getElementById("containerRacaOutros");

const params = new URLSearchParams(window.location.search);
const uidTutor = params.get("uidTutor");
const idAnimal = params.get("idAnimal");

const racasCachorro = [
  "Shih Tzu",
  "Poodle",
  "Yorkshire Terrier",
  "Labrador Retriever",
  "Golden Retriever",
  "Bulldog Francês",
  "Pinscher",
  "Dachshund (Salsicha)",
  "Lhasa Apso",
  "Outro",
];
const racasGato = [
  "Siamês",
  "Persa",
  "Maine Coon",
  "Sphynx",
  "Ragdoll",
  "Bengal",
  "Abissínio",
  "Outro",
];
const racasPassaro = [
  "Calopsita",
  "Canário",
  "Periquito",
  "Papagaio",
  "Agapornis",
  "Outro",
];

especieSelect.addEventListener("change", () => {
  const especie = especieSelect.value;
  racaSelect.innerHTML = '<option value="">Selecione uma raça</option>';
  containerRacaOutros.style.display = "none";
  inputRacaOutros.required = false;
  inputRacaOutros.value = "";

  let racas = [];
  if (especie === "cachorro") racas = racasCachorro;
  else if (especie === "gato") racas = racasGato;
  else if (especie === "passaro") racas = racasPassaro;

  racas.forEach((raca) => {
    const option = document.createElement("option");
    option.value = raca.toLowerCase();
    option.textContent = raca;
    racaSelect.appendChild(option);
  });
});

racaSelect.addEventListener("change", () => {
  if (racaSelect.value === "outro") {
    containerRacaOutros.style.display = "block";
    inputRacaOutros.required = true;
  } else {
    containerRacaOutros.style.display = "none";
    inputRacaOutros.required = false;
    inputRacaOutros.value = "";
  }
});

auth.onAuthStateChanged((user) => {
  if (!user) {
    mensagem.textContent = "Você precisa estar logado.";
    mensagem.className = "text-danger";
    return;
  }

  if (!uidTutor) {
    mensagem.textContent = "Tutor não especificado.";
    mensagem.className = "text-danger";
    return;
  }

  if (idAnimal) {
    document.getElementById("titulo-form").textContent = "Editar Animal";
    const refAnimal = database.ref(`animais/${uidTutor}/${idAnimal}`);
    refAnimal.once("value").then((snapshot) => {
      if (snapshot.exists()) {
        const animal = snapshot.val();
        document.getElementById("nome").value = animal.nome || "";
        document.getElementById("nascimento").value = animal.nascimento || "";
        especieSelect.value = animal.especie;
        especieSelect.dispatchEvent(new Event("change"));

        setTimeout(() => {
          const racaNormalizada = (animal.raca || "").toLowerCase();
          if (
            Array.from(racaSelect.options).some(
              (opt) => opt.value === racaNormalizada
            )
          ) {
            racaSelect.value = racaNormalizada;
          } else {
            racaSelect.value = "outro";
            containerRacaOutros.style.display = "block";
            inputRacaOutros.value = animal.raca;
          }
        }, 100);
      } else {
        mensagem.textContent = "Animal não encontrado.";
        mensagem.className = "text-danger";
      }
    });
  }
});

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const nome = document.getElementById("nome").value.trim();
  const especie = especieSelect.value;
  let raca = racaSelect.value;
  if (raca === "outro") {
    raca = inputRacaOutros.value.trim();
  }
  const nascimento = document.getElementById("nascimento").value;

  if (!nome || !especie || !raca) {
    mensagem.textContent = "Por favor, preencha os campos obrigatórios.";
    mensagem.className = "text-danger";
    return;
  }

  const animal = {
    nome,
    especie,
    raca,
    nascimento: nascimento || null,
    atualizadoEm: new Date().toISOString(),
  };

  const ref = idAnimal
    ? database.ref(`animais/${uidTutor}/${idAnimal}`)
    : database.ref(`animais/${uidTutor}`).push();

  ref
    .set(animal)
    .then(() => {
      mensagem.textContent = idAnimal
        ? "Animal atualizado com sucesso!"
        : "Animal cadastrado com sucesso!";
      mensagem.className = "text-success";
      form.reset();
      containerRacaOutros.style.display = "none";
    })
    .catch((error) => {
      mensagem.textContent = "Erro: " + error.message;
      mensagem.className = "text-danger";
    });
});
const btnSair = document.getElementById("btnSair");
const btnExcluir = document.getElementById("btnExcluir");

btnSair.addEventListener("click", () => {
  window.location.href = `animais.html?uid=${uidTutor}`;
});

if (idAnimal) {
  btnExcluir.style.display = "inline-block";

  btnExcluir.addEventListener("click", () => {
    const confirmar = confirm("Tem certeza que deseja excluir este animal?");
    if (!confirmar) return;

    const animalRef = database.ref(`animais/${uidTutor}/${idAnimal}`);
    animalRef
      .remove()
      .then(() => {
        alert("Animal excluído com sucesso.");
        window.location.href = `animais.html?uid=${uidTutor}`;
      })
      .catch((error) => {
        alert("Erro ao excluir animal: " + error.message);
      });
  });
}
