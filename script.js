const paletteElement = document.getElementById("palette");
const generateButton = document.getElementById("generateButton");
const copyCssButton = document.getElementById("copyCssButton");
const savePaletteButton = document.getElementById("savePaletteButton");
const clearFavoritesButton = document.getElementById("clearFavoritesButton");
const cssOutput = document.getElementById("cssOutput");
const favoritesList = document.getElementById("favoritesList");
const message = document.getElementById("message");

const STORAGE_KEY = "color-palette-maker-favorites";

let colors = [];
let locked = [false, false, false, false, false];

function showMessage(text, type = "normal") {
  message.textContent = text;

  if (type === "error") {
    message.style.color = "#dc2626";
  } else if (type === "success") {
    message.style.color = "#15803d";
  } else {
    message.style.color = "#2563eb";
  }
}

function randomHexColor() {
  const randomArray = new Uint8Array(3);
  crypto.getRandomValues(randomArray);

  return "#" + Array.from(randomArray)
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

function generatePalette() {
  for (let i = 0; i < 5; i++) {
    if (!locked[i]) {
      colors[i] = randomHexColor();
    }
  }

  renderPalette();
  updateCssOutput();
  showMessage("カラーパレットを生成しました。", "success");
}

function renderPalette() {
  paletteElement.innerHTML = "";

  colors.forEach((color, index) => {
    const card = document.createElement("article");
    card.className = "color-card";

    const preview = document.createElement("div");
    preview.className = "color-preview";
    preview.style.background = color;

    const info = document.createElement("div");
    info.className = "color-info";

    const hexCode = document.createElement("span");
    hexCode.className = "hex-code";
    hexCode.textContent = color;
    hexCode.title = "クリックでコピー";
    hexCode.addEventListener("click", () => copyText(color, `${color} をコピーしました。`));

    const lockButton = document.createElement("button");
    lockButton.className = locked[index] ? "lock-button locked" : "lock-button";
    lockButton.type = "button";
    lockButton.textContent = locked[index] ? "ロック中" : "ロック";
    lockButton.addEventListener("click", () => toggleLock(index));

    info.appendChild(hexCode);
    info.appendChild(lockButton);

    card.appendChild(preview);
    card.appendChild(info);

    paletteElement.appendChild(card);
  });
}

function toggleLock(index) {
  locked[index] = !locked[index];
  renderPalette();

  if (locked[index]) {
    showMessage(`${colors[index]} をロックしました。`, "normal");
  } else {
    showMessage(`${colors[index]} のロックを解除しました。`, "normal");
  }
}

function getCssVariables() {
  return `:root {
  --color-1: ${colors[0]};
  --color-2: ${colors[1]};
  --color-3: ${colors[2]};
  --color-4: ${colors[3]};
  --color-5: ${colors[4]};
}`;
}

function updateCssOutput() {
  cssOutput.textContent = getCssVariables();
}

async function copyText(text, successMessage) {
  try {
    await navigator.clipboard.writeText(text);
    showMessage(successMessage, "success");
  } catch {
    showMessage("コピーに失敗しました。", "error");
  }
}

function copyCss() {
  copyText(getCssVariables(), "CSS変数をコピーしました。");
}

function getFavorites() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return [];
  }

  try {
    return JSON.parse(saved);
  } catch {
    return [];
  }
}

function saveFavorites(favorites) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
}

function saveCurrentPalette() {
  const favorites = getFavorites();

  const paletteData = {
    id: Date.now(),
    colors: [...colors]
  };

  favorites.unshift(paletteData);
  saveFavorites(favorites);
  renderFavorites();

  showMessage("お気に入りに保存しました。", "success");
}

function renderFavorites() {
  const favorites = getFavorites();
  favoritesList.innerHTML = "";

  if (favorites.length === 0) {
    const emptyText = document.createElement("p");
    emptyText.className = "empty-text";
    emptyText.textContent = "まだお気に入りはありません。";
    favoritesList.appendChild(emptyText);
    return;
  }

  favorites.forEach((favorite) => {
    const item = document.createElement("div");
    item.className = "favorite-item";

    const colorRow = document.createElement("div");
    colorRow.className = "favorite-colors";

    favorite.colors.forEach((color) => {
      const colorBox = document.createElement("div");
      colorBox.className = "favorite-color";
      colorBox.style.background = color;
      colorBox.title = color;
      colorRow.appendChild(colorBox);
    });

    const actions = document.createElement("div");
    actions.className = "favorite-actions";

    const loadButton = document.createElement("button");
    loadButton.className = "small-button";
    loadButton.type = "button";
    loadButton.textContent = "読み込み";
    loadButton.addEventListener("click", () => loadFavorite(favorite.colors));

    const copyButton = document.createElement("button");
    copyButton.className = "small-button";
    copyButton.type = "button";
    copyButton.textContent = "コピー";
    copyButton.addEventListener("click", () => {
      copyText(favorite.colors.join(", "), "パレットをコピーしました。");
    });

    const deleteButton = document.createElement("button");
    deleteButton.className = "small-button";
    deleteButton.type = "button";
    deleteButton.textContent = "削除";
    deleteButton.addEventListener("click", () => deleteFavorite(favorite.id));

    actions.appendChild(loadButton);
    actions.appendChild(copyButton);
    actions.appendChild(deleteButton);

    item.appendChild(colorRow);
    item.appendChild(actions);

    favoritesList.appendChild(item);
  });
}

function loadFavorite(favoriteColors) {
  colors = [...favoriteColors];
  locked = [false, false, false, false, false];

  renderPalette();
  updateCssOutput();
  showMessage("お気に入りパレットを読み込みました。", "success");
}

function deleteFavorite(id) {
  const favorites = getFavorites();
  const updatedFavorites = favorites.filter((favorite) => favorite.id !== id);

  saveFavorites(updatedFavorites);
  renderFavorites();
  showMessage("お気に入りを削除しました。", "success");
}

function clearFavorites() {
  const ok = confirm("お気に入りをすべて削除しますか？");

  if (!ok) {
    return;
  }

  localStorage.removeItem(STORAGE_KEY);
  renderFavorites();
  showMessage("お気に入りをすべて削除しました。", "success");
}

generateButton.addEventListener("click", generatePalette);
copyCssButton.addEventListener("click", copyCss);
savePaletteButton.addEventListener("click", saveCurrentPalette);
clearFavoritesButton.addEventListener("click", clearFavorites);

generatePalette();
renderFavorites();
