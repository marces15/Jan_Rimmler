const CONFIG = {
  name: "Spätz",
  question: "Möchtest du mit mir auf ein Date gehen?",
  finalMessage: "Yippiiieeeee!! Egal, was wir machen: Hauptsache, wir sind zusammen.",
  options: [
    "Picknick unter Sternen",
    "Kinoabend mit Lieblingssnacks",
    "Sonnenuntergang-Spaziergang",
    "Pizza, Spiele und Kuscheldecke",
    "Überraschung ;)"
  ],
  photoPath: "assets/photo.jpg"
};

const STORAGE_KEY = "pixelDateChoice";
const screens = Array.from(document.querySelectorAll(".screen"));
const noButton = document.querySelector(".no-button");
const noTexts = [
  "Bist du sicher?🥺",
  "Überleg noch mal🥺",
  "Späst",
  "Du erwischst mich nicht LOL 😛",
  "Opfer",
  "Mein Großmutter klickt besser..."
];

let selectedChoice = "";
let noAttempts = 0;
let lastInputWasKeyboard = false;

function showScreen(name) {
  screens.forEach((screen) => {
    const isActive = screen.dataset.screen === name;
    screen.classList.toggle("is-active", isActive);
    screen.setAttribute("aria-hidden", String(!isActive));
  });

  const activeScreen = document.querySelector(`[data-screen="${name}"]`);
  const firstButton = activeScreen?.querySelector("button:not([disabled]), [role='radio']");
  if (firstButton) {
    setTimeout(() => firstButton.focus({ preventScroll: true }), 80);
  }
}

function initText() {
  document.querySelector("#start-title").textContent = `Hey ${CONFIG.name}!`;
  document.querySelector("#question-title").textContent = CONFIG.question;
  document.querySelector(".personal-message").textContent = CONFIG.finalMessage;

  const photo = document.querySelector(".couple-photo");
  photo.src = CONFIG.photoPath;
  photo.addEventListener("load", () => {
    photo.hidden = false;
  });
  photo.addEventListener("error", () => {
    photo.hidden = true;
  });
}

function renderOptions() {
  const grid = document.querySelector(".date-grid");
  grid.innerHTML = "";

  CONFIG.options.forEach((option, index) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "date-card";
    card.setAttribute("role", "radio");
    card.setAttribute("aria-checked", "false");
    card.dataset.option = option;
    card.textContent = option;
    card.addEventListener("click", () => selectOption(option));
    card.addEventListener("keydown", (event) => handleOptionKeys(event, index));
    grid.appendChild(card);
  });
}

function selectOption(option) {
  selectedChoice = option;
  document.querySelectorAll(".date-card").forEach((card) => {
    card.setAttribute("aria-checked", String(card.dataset.option === option));
  });
  document.querySelector(".confirm-choice").disabled = false;
}

function handleOptionKeys(event, index) {
  const keys = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "Home", "End"];
  if (!keys.includes(event.key)) return;

  event.preventDefault();
  const cards = Array.from(document.querySelectorAll(".date-card"));
  let nextIndex = index;

  if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = (index + 1) % cards.length;
  if (event.key === "ArrowLeft" || event.key === "ArrowUp") nextIndex = (index - 1 + cards.length) % cards.length;
  if (event.key === "Home") nextIndex = 0;
  if (event.key === "End") nextIndex = cards.length - 1;

  cards[nextIndex].focus();
  selectOption(cards[nextIndex].dataset.option);
}

function moveNoButton() {
  if (lastInputWasKeyboard || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  noAttempts += 1;
  noButton.textContent = noTexts[(noAttempts - 1) % noTexts.length];

  const screen = document.querySelector('[data-screen="question"]');
  const screenRect = screen.getBoundingClientRect();
  const buttonRect = noButton.getBoundingClientRect();
  const maxX = Math.max(0, (screenRect.width - buttonRect.width) / 2 - 18);
  const maxY = Math.max(0, (screenRect.height - buttonRect.height) / 2 - 18);
  const direction = noAttempts % 2 === 0 ? -1 : 1;
  const randomX = (Math.random() * maxX * 0.9 + 24) * direction;
  const randomY = (Math.random() * maxY * 0.5 - maxY * 0.25);

  noButton.style.setProperty("--no-x", `${Math.round(randomX)}px`);
  noButton.style.setProperty("--no-y", `${Math.round(randomY)}px`);
}

function saveAndShowFinal() {
  if (!selectedChoice) return;

  const payload = {
    choice: selectedChoice,
    savedAt: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  updateFinal(payload.choice);
  showScreen("final");
}

function updateFinal(choice) {
  document.querySelector(".result-choice").textContent = choice;
}

async function copyResult() {
  const text = `Unser Date: ${selectedChoice || document.querySelector(".result-choice").textContent}. ${CONFIG.finalMessage}`;
  const status = document.querySelector(".copy-status");

  try {
    await navigator.clipboard.writeText(text);
    status.textContent = "Nachricht kopiert.";
  } catch {
    const fallback = document.createElement("textarea");
    fallback.value = text;
    document.body.appendChild(fallback);
    fallback.select();
    document.execCommand("copy");
    fallback.remove();
    status.textContent = "Nachricht kopiert.";
  }
}

function restart() {
  selectedChoice = "";
  noAttempts = 0;
  noButton.textContent = "Nein 🥺";
  noButton.style.setProperty("--no-x", "0px");
  noButton.style.setProperty("--no-y", "0px");
  document.querySelector(".confirm-choice").disabled = true;
  document.querySelector(".copy-status").textContent = "";
  document.querySelectorAll(".date-card").forEach((card) => card.setAttribute("aria-checked", "false"));
  showScreen("start");
}

function restoreSavedChoice() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved?.choice) {
      selectedChoice = saved.choice;
      updateFinal(saved.choice);
      showScreen("final");
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
}

document.addEventListener("keydown", () => {
  lastInputWasKeyboard = true;
  noButton.classList.add("is-keyboard");
});

document.addEventListener("pointerdown", () => {
  lastInputWasKeyboard = false;
  noButton.classList.remove("is-keyboard");
});

document.addEventListener("click", (event) => {
  const action = event.target.closest("[data-action]")?.dataset.action;
  if (!action) return;

  if (action === "start") showScreen("question");
  if (action === "yes") showScreen("confirm");
  if (action === "choose") showScreen("dates");
  if (action === "confirm-choice") saveAndShowFinal();
  if (action === "copy") copyResult();
  if (action === "restart") restart();
});

noButton.addEventListener("pointerenter", moveNoButton);
noButton.addEventListener("pointerdown", moveNoButton);
noButton.addEventListener("focus", () => {
  if (!lastInputWasKeyboard) moveNoButton();
});
noButton.addEventListener("click", (event) => {
  if (!lastInputWasKeyboard) {
    event.preventDefault();
    moveNoButton();
  }
});

initText();
renderOptions();
restoreSavedChoice();
