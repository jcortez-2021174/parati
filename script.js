const STORAGE_KEY = "kitty_snoopy_20_love_notes_v1";

const DEFAULT_DATA = {
  title: "Para la persona más especial de mi vida",
  kitty: [
    "Desde que llegaste a mi vida, cada día tiene más color, más dulzura y mil razones para sonreír.",
    "Me encanta tu forma de ser, tu ternura y cómo logras hacerme sentir en casa con solo abrazarme.",
    "Eres mi notificación favorita, mi pensamiento más bonito del día y mi lugar seguro.",
    "Si tuviera que volver a elegir entre millones de personas, te elegiría a ti una y mil veces más.",
    "Gracias por llenar mis días de risas, paciencia y momentos que guardo como mis mayores tesoros.",
    "Tu sonrisa tiene el superpoder de arreglar hasta el día más complicado.",
    "Contigo aprendí que los mejores planes no dependen del lugar, sino de tenerte a mi lado.",
    "Me fascina cada pequeño detalle tuyo: tu voz, tu mirada y la magia con la que iluminas todo.",
    "Eres la casualidad más bonita que me pasó y la historia que quiero seguir escribiendo siempre.",
    "Te amo muchísimo, hoy y todos los días que nos quedan por vivir juntos. "
  ],
  snoopy: [
    "Como Snoopy encima de su casita, contigo siento que puedo soñar en grande y llegar hasta las estrellas.",
    "Eres mi mejor compañera de aventuras; no importa a dónde vayamos mientras sea de tu mano.",
    "Contigo hasta los días más tranquilos y sencillos se convierten en mis recuerdos favoritos.",
    "Me haces tan feliz que dan ganas de hacer el bailecito de la felicidad de Snoopy cada vez que te veo.",
    "Gracias por ser mi apoyo, mi mejor amiga y el amor más bonito que pude imaginar.",
    "Cuando estoy contigo el tiempo pasa volando, pero cada segundo se queda grabado en mi corazón.",
    "Prometo estar siempre para ti, en las tardes de risas y en los días en que solo necesites un abrazo.",
    "Eres mi persona favorita para compartir canciones, comidas ricas y charlas infinitas.",
    "No necesito un mapa cuando estoy contigo, porque a tu lado siempre sé que estoy donde quiero estar.",
    "Te quiero hoy, mañana y en todas nuestras próximas aventuras juntos. "
  ]
};

// Cargar datos guardados o usar los originales
let appData = loadAppData();
let seenNotes = {
  kitty: new Set(),
  snoopy: new Set()
};

let currentCharacter = "kitty"; // "kitty" | "snoopy"
let currentIndex = 0; // 0..9
let activeEditorTab = "kitty";

// Elementos del DOM
const mainTitleEl = document.getElementById("mainTitle");
const kittyCountEl = document.getElementById("kittyCount");
const snoopyCountEl = document.getElementById("snoopyCount");
const totalDiscoveredEl = document.getElementById("totalDiscoveredCount");
const completionBannerEl = document.getElementById("completionBanner");

const kittyTrigger = document.getElementById("kittyTrigger");
const snoopyTrigger = document.getElementById("snoopyTrigger");
const kittyViewAllBtn = document.getElementById("kittyViewAllBtn");
const snoopyViewAllBtn = document.getElementById("snoopyViewAllBtn");

// Modal nota individual
const noteModal = document.getElementById("noteModal");
const noteCardContainer = document.getElementById("noteCardContainer");
const noteCharacterTag = document.getElementById("noteCharacterTag");
const noteModalTitle = document.getElementById("noteModalTitle");
const noteMessageText = document.getElementById("noteMessageText");
const noteDotsRow = document.getElementById("noteDotsRow");
const prevNoteBtn = document.getElementById("prevNoteBtn");
const nextNoteBtn = document.getElementById("nextNoteBtn");
const closeNoteModalBtn = document.getElementById("closeNoteModalBtn");

// Modal ver todas
const allNotesModal = document.getElementById("allNotesModal");
const allNotesTitle = document.getElementById("allNotesTitle");
const allNotesList = document.getElementById("allNotesList");
const closeAllNotesBtn = document.getElementById("closeAllNotesBtn");

// Modal editor
const editorModal = document.getElementById("editorModal");
const openEditorBtn = document.getElementById("openEditorBtn");
const closeEditorBtn = document.getElementById("closeEditorBtn");
const titleInput = document.getElementById("titleInput");
const editorNotesList = document.getElementById("editorNotesList");
const saveEditorBtn = document.getElementById("saveEditorBtn");
const resetDefaultsBtn = document.getElementById("resetDefaultsBtn");
const tabButtons = document.querySelectorAll(".tab-btn");

const particlesLayer = document.getElementById("particlesLayer");

function loadAppData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(DEFAULT_DATA);
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed.title === "string" &&
      Array.isArray(parsed.kitty) &&
      parsed.kitty.length === 10 &&
      Array.isArray(parsed.snoopy) &&
      parsed.snoopy.length === 10
    ) {
      return parsed;
    }
  } catch (e) {
    console.warn("No se pudo leer localStorage, usando valores por defecto.");
  }
  return structuredClone(DEFAULT_DATA);
}

function saveAppData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
}

function updateUI() {
  mainTitleEl.textContent = appData.title;
  const kSeen = seenNotes.kitty.size;
  const sSeen = seenNotes.snoopy.size;
  const total = kSeen + sSeen;

  kittyCountEl.textContent = `${kSeen}/10`;
  snoopyCountEl.textContent = `${sSeen}/10`;
  totalDiscoveredEl.textContent = `${total} / 20`;

  if (total === 20) {
    completionBannerEl.classList.remove("hidden");
  } else {
    completionBannerEl.classList.add("hidden");
  }
}

// Obtener la siguiente nota no leída o avanzar secuencialmente
function getNextIndexForCharacter(char) {
  for (let i = 0; i < 10; i++) {
    if (!seenNotes[char].has(i)) return i;
  }
  // Si ya vio todas, rotar secuencialmente
  return currentCharacter === char ? (currentIndex + 1) % 10 : 0;
}

function openCharacterNote(char, specificIndex = null, clickEvent = null) {
  const triggerEl = char === "kitty" ? kittyTrigger : snoopyTrigger;

  // Animación de rebote
  triggerEl.classList.remove("bounce");
  void triggerEl.offsetWidth;
  triggerEl.classList.add("bounce");

  // Partículas
  spawnParticles(char, clickEvent || triggerEl);

  const indexToOpen = specificIndex !== null ? specificIndex : getNextIndexForCharacter(char);
  currentCharacter = char;
  currentIndex = indexToOpen;

  renderNoteModal();
  noteModal.classList.remove("hidden");
}

function renderNoteModal() {
  seenNotes[currentCharacter].add(currentIndex);
  updateUI();

  const isKitty = currentCharacter === "kitty";
  noteCardContainer.classList.toggle("is-kitty", isKitty);
  noteCardContainer.classList.toggle("is-snoopy", !isKitty);

  noteCharacterTag.textContent = isKitty ? " Nota de Hello Kitty" : " Nota de Snoopy";
  noteModalTitle.textContent = `Nota #${currentIndex + 1} de 10`;
  noteMessageText.textContent = appData[currentCharacter][currentIndex];

  // Puntos indicadores 1..10
  noteDotsRow.innerHTML = "";
  for (let i = 0; i < 10; i++) {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "dot";
    dot.setAttribute("aria-label", `Ir a nota ${i + 1}`);
    if (seenNotes[currentCharacter].has(i)) dot.classList.add("seen");
    if (i === currentIndex) dot.classList.add("active");
    dot.addEventListener("click", () => {
      currentIndex = i;
      renderNoteModal();
    });
    noteDotsRow.appendChild(dot);
  }
}

function spawnParticles(char, target) {
  const emojis = char === "kitty" ? ["", "", "", ""] : ["", "", "", ""];
  let originX = window.innerWidth / 2;
  let originY = window.innerHeight / 2;

  if (target && target.clientX) {
    originX = target.clientX;
    originY = target.clientY;
  } else if (target && target.getBoundingClientRect) {
    const rect = target.getBoundingClientRect();
    originX = rect.left + rect.width / 2;
    originY = rect.top + rect.height / 2;
  }

  for (let i = 0; i < 10; i++) {
    const span = document.createElement("span");
    span.className = "particle";
    span.textContent = emojis[i % emojis.length];
    span.style.left = `${originX}px`;
    span.style.top = `${originY}px`;

    const angle = (Math.PI * 2 * i) / 10 + (Math.random() - 0.5) * 0.4;
    const distance = 65 + Math.random() * 65;
    span.style.setProperty("--dx", `${Math.cos(angle) * distance}px`);
    span.style.setProperty("--dy", `${Math.sin(angle) * distance - 30}px`);

    particlesLayer.appendChild(span);
    setTimeout(() => span.remove(), 1000);
  }
}

function openAllNotesModal(char) {
  const isKitty = char === "kitty";
  allNotesTitle.textContent = isKitty
    ? " Las 10 Notas de Hello Kitty"
    : " Las 10 Notas de Snoopy";

  allNotesList.innerHTML = "";
  appData[char].forEach((text, idx) => {
    seenNotes[char].add(idx);
    const item = document.createElement("div");
    item.className = "all-note-item";
    item.innerHTML = `<strong>#${idx + 1}:</strong> ${escapeHtml(text)}`;
    allNotesList.appendChild(item);
  });

  updateUI();
  allNotesModal.classList.remove("hidden");
}

function openEditorModal() {
  titleInput.value = appData.title;
  renderEditorNotes();
  editorModal.classList.remove("hidden");
}

function renderEditorNotes() {
  editorNotesList.innerHTML = "";
  appData[activeEditorTab].forEach((noteText, idx) => {
    const row = document.createElement("div");
    row.className = "editor-note-row";

    const label = document.createElement("label");
    label.textContent = `Nota #${idx + 1}:`;

    const textarea = document.createElement("textarea");
    textarea.value = noteText;
    textarea.dataset.index = idx;

    row.appendChild(label);
    row.appendChild(textarea);
    editorNotesList.appendChild(row);
  });
}

function saveEditorChanges() {
  const newTitle = titleInput.value.trim();
  if (newTitle) {
    appData.title = newTitle;
  }

  const textareas = editorNotesList.querySelectorAll("textarea");
  textareas.forEach((ta) => {
    const idx = Number(ta.dataset.index);
    const val = ta.value.trim();
    if (val) {
      appData[activeEditorTab][idx] = val;
    }
  });

  saveAppData();
  updateUI();
  editorModal.classList.add("hidden");
}

function escapeHtml(str) {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

// Event Listeners
kittyTrigger.addEventListener("click", (e) => openCharacterNote("kitty", null, e));
snoopyTrigger.addEventListener("click", (e) => openCharacterNote("snoopy", null, e));

kittyViewAllBtn.addEventListener("click", () => openAllNotesModal("kitty"));
snoopyViewAllBtn.addEventListener("click", () => openAllNotesModal("snoopy"));

prevNoteBtn.addEventListener("click", () => {
  currentIndex = (currentIndex - 1 + 10) % 10;
  renderNoteModal();
});

nextNoteBtn.addEventListener("click", () => {
  currentIndex = (currentIndex + 1) % 10;
  renderNoteModal();
});

closeNoteModalBtn.addEventListener("click", () => noteModal.classList.add("hidden"));
closeAllNotesBtn.addEventListener("click", () => allNotesModal.classList.add("hidden"));

openEditorBtn.addEventListener("click", openEditorModal);
closeEditorBtn.addEventListener("click", () => editorModal.classList.add("hidden"));

tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    // Guardar temporalmente lo escrito en la pestaña actual antes de cambiar
    const textareas = editorNotesList.querySelectorAll("textarea");
    textareas.forEach((ta) => {
      const idx = Number(ta.dataset.index);
      if (ta.value.trim()) appData[activeEditorTab][idx] = ta.value.trim();
    });

    tabButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    activeEditorTab = btn.dataset.tab;
    renderEditorNotes();
  });
});

saveEditorBtn.addEventListener("click", saveEditorChanges);

resetDefaultsBtn.addEventListener("click", () => {
  appData = structuredClone(DEFAULT_DATA);
  saveAppData();
  titleInput.value = appData.title;
  renderEditorNotes();
  updateUI();
});

// Cerrar modales al hacer clic fuera de la tarjeta
[noteModal, allNotesModal, editorModal].forEach((modal) => {
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.add("hidden");
  });
});

// Inicializar pantalla
updateUI();