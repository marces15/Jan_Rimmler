const CONFIG = {
  name: "Spätz",
  question: "Möchtest du mit mir auf ein Date gehen?",
  finalMessage: "Yippiiieeeee!! Ich freue mich auf dich, Schätz <3",
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
let selectedDate = "";
let selectedTime = "";
let selectedNote = "";
let noAttempts = 0;
let lastInputWasKeyboard = false;

function showScreen(name) {
  screens.forEach((screen) => {
    const isActive = screen.dataset.screen === name;
    screen.classList.toggle("is-active", isActive);
    screen.setAttribute("aria-hidden", String(!isActive));
  });

  const activeScreen = document.querySelector(`[data-screen="${name}"]`);
  const firstControl = activeScreen?.querySelector("input:not([disabled]), textarea:not([disabled]), button:not([disabled]), [role='radio']");
  if (firstControl) {
    setTimeout(() => firstControl.focus({ preventScroll: true }), 80);
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

function continueToSchedule() {
  if (!selectedChoice) return;
  showScreen("schedule");
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
  const currentX = parseFloat(noButton.style.getPropertyValue("--no-x")) || 0;
  const currentY = parseFloat(noButton.style.getPropertyValue("--no-y")) || 0;
  const screenRect = screen.getBoundingClientRect();
  const buttonRect = noButton.getBoundingClientRect();
  const baseLeft = buttonRect.left - currentX;
  const baseRight = buttonRect.right - currentX;
  const baseTop = buttonRect.top - currentY;
  const baseBottom = buttonRect.bottom - currentY;
  const padding = 14;
  const minX = Math.ceil(screenRect.left + padding - baseLeft);
  const maxX = Math.floor(screenRect.right - padding - baseRight);
  const minY = Math.ceil(screenRect.top + padding - baseTop);
  const maxY = Math.floor(screenRect.bottom - padding - baseBottom);
  const randomX = minX + Math.random() * Math.max(0, maxX - minX);
  const randomY = minY + Math.random() * Math.max(0, maxY - minY);

  noButton.style.setProperty("--no-x", `${Math.round(randomX)}px`);
  noButton.style.setProperty("--no-y", `${Math.round(randomY)}px`);
}

function saveAndShowFinal() {
  if (!selectedChoice || !selectedDate || !selectedTime) return;

  const payload = {
    choice: selectedChoice,
    date: selectedDate,
    time: selectedTime,
    note: selectedNote,
    savedAt: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  updateFinal(payload);
  showScreen("final");
}

function updateFinal(result) {
  const choice = typeof result === "string" ? result : result.choice;
  const date = typeof result === "string" ? "" : result.date;
  const time = typeof result === "string" ? "" : result.time;
  const note = typeof result === "string" ? "" : result.note;

  document.querySelector(".result-choice").textContent = choice;
  document.querySelector(".result-when").textContent = formatDateTime(date, time);
  selectedChoice = choice || "";
  selectedDate = date || "";
  selectedTime = time || "";
  selectedNote = note || "";
}

function formatDateTime(date, time) {
  if (!date || !time) return "Noch kein Termin eingetragen.";

  const [year, month, day] = date.split("-");
  return `${day}.${month}.${year} um ${time} Uhr`;
}

function buildReplyText() {
  const when = formatDateTime(selectedDate, selectedTime);
  const notePart = selectedNote ? ` Nachricht: ${selectedNote}` : "";
  return `Jaaa, ich bin dabei! Unser Date: ${selectedChoice}. Termin: ${when}.${notePart}`;
}

async function copyResult() {
  const text = buildReplyText();
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
  selectedDate = "";
  selectedTime = "";
  selectedNote = "";
  noAttempts = 0;
  noButton.textContent = "Nein";
  noButton.style.setProperty("--no-x", "0px");
  noButton.style.setProperty("--no-y", "0px");
  document.querySelector(".confirm-choice").disabled = true;
  document.querySelector(".copy-status").textContent = "";
  document.querySelector(".schedule-form").reset();
  document.querySelectorAll(".date-card").forEach((card) => card.setAttribute("aria-checked", "false"));
  showScreen("start");
}

function restoreSavedChoice() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved?.choice) {
      updateFinal(saved);
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
  if (action === "confirm-choice") continueToSchedule();
  if (action === "copy") copyResult();
  if (action === "restart") restart();
});

document.querySelector(".schedule-form").addEventListener("submit", (event) => {
  event.preventDefault();
  selectedDate = document.querySelector(".date-input").value;
  selectedTime = document.querySelector(".time-input").value;
  selectedNote = document.querySelector(".note-input").value.trim();
  saveAndShowFinal();
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
showScreen("start");
restoreSavedChoice();
