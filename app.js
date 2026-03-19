const totalDays = 25;
const buttonsContainer = document.getElementById("day-buttons");

for (let i = 1; i <= totalDays; i++) {
  const btn = document.createElement("button");
  btn.innerText = "Day " + i;

  if (localStorage.getItem("day" + i) === "completed") {
    btn.classList.add("completed");
    btn.innerText += " ❌";
  }

  btn.onclick = () => startDay(i);
  buttonsContainer.appendChild(btn);
}

/* ===========================
   전역 상태
=========================== */

let currentSentences = [];
let currentViewData = [];
let allSentences = {};

let bookmarks = new Set();

let currentDayNumber = 0;

/* ===========================
   📥 Day 시작
=========================== */

async function startDay(dayNumber) {

  currentDayNumber = dayNumber;

  loadStorage();

  document.getElementById("main-screen").classList.add("hidden");
  document.getElementById("study-screen").classList.remove("hidden");

  document.getElementById("day-title").innerText = "Day " + dayNumber;

  const sheetIndex = Math.floor((dayNumber - 1) / 3) + 1;
  const dayOffset = (dayNumber - 1) % 3;

  const startIndex = dayOffset * 10;
  const endIndex = startIndex + 10;

  const response = await fetch(`data/day${sheetIndex}.csv`);
  const text = await response.text();

  const rows = text
    .trim()
    .split(/\r?\n/)
    .slice(1)
    .filter(r => r.trim() !== "");

  const selectedRows = rows.slice(startIndex, endIndex);

  currentSentences = selectedRows.map(row => {
    const cols = row.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g);

    const item = {
      question: cols[0].replace(/"/g, "").trim(),
      answer: cols[1].replace(/"/g, "").trim(),
      question_korean: cols[2].replace(/"/g, "").trim(),
      number: cols[3].replace(/"/g, "").trim()
    };

    allSentences[item.number] = item;
    return item;
  });

  saveAllSentences();

  showTodayNumbers();

  currentViewData = [...currentSentences]; // 🔥 핵심
  renderWritingPage();
}

/* ===========================
   💾 저장
=========================== */

function saveAllSentences() {
  localStorage.setItem("allSentences", JSON.stringify(allSentences));
}

function loadAllSentences() {
  allSentences = JSON.parse(localStorage.getItem("allSentences") || "{}");
}

function saveStorage() {
  localStorage.setItem("bookmarks", JSON.stringify([...bookmarks]));
}

function loadStorage() {
  bookmarks = new Set(JSON.parse(localStorage.getItem("bookmarks") || "[]"));
  loadAllSentences();
}

/* ===========================
   🔢 상단 표시
=========================== */

function showTodayNumbers() {
  const numbers = currentSentences.map(i => i.number).join(", ");
  document.getElementById("today-numbers").innerText =
    "오늘 문제: " + numbers;
}

/* ===========================
   ✏️ Writing
=========================== */

function renderWritingPage() {
  const content = document.getElementById("content");
  content.innerHTML = "";

  if (!currentViewData.length) {
    content.innerHTML = "<p>문제가 없습니다</p>";
    return;
  }

  currentViewData.forEach((item, idx) => {
    const div = document.createElement("div");

    div.innerHTML = `
      <p><strong>${idx + 1}. ${item.question_korean}</strong></p>
      <input type="text" style="width:80%;">
      <br>
      <button onclick="toggleBookmark('${item.number}')">
        ${bookmarks.has(item.number) ? "★ 북마크됨" : "☆ 북마크"}
      </button>
      <button onclick="toggleAnswer('${item.number}')">정답</button>
      <p id="answer-${item.number}"></p>
    `;

    content.appendChild(div);
  });

  const nav = document.createElement("div");

  nav.innerHTML = `
    <button onclick="renderLCPage()">LC</button>
    <br><br>
    <button onclick="goHome()">← 뒤로가기</button>
  `;

  content.appendChild(nav);
}

/* ===========================
   🎧 LC
=========================== */

let shuffledAnswers = [];

function renderLCPage() {
  const content = document.getElementById("content");
  content.innerHTML = "";

  shuffledAnswers = currentViewData
    .map(i => i.answer)
    .sort(() => Math.random() - 0.5);

  currentViewData.forEach(item => {

    const options = shuffledAnswers.map(a =>
      `<option value="${a}">${a}</option>`
    ).join("");

    const div = document.createElement("div");

    div.innerHTML = `
      <p>${item.question}</p>
      <select id="lc-${item.number}">
        <option value="">선택</option>
        ${options}
      </select>
      <p id="result-${item.number}"></p>
    `;

    content.appendChild(div);
  });

  const btns = document.createElement("div");

  btns.innerHTML = `
    <button onclick="checkLC()">채점</button>
    <button onclick="renderWritingPage()">← 뒤로</button>
  `;

  content.appendChild(btns);
}

function checkLC() {
  currentViewData.forEach(item => {
    const selected = document.getElementById(`lc-${item.number}`).value;
    const result = document.getElementById(`result-${item.number}`);

    if (selected === item.answer) {
      result.innerText = "정답";
    } else {
      result.innerText = "오답";
    }
  });
}

/* ===========================
   기능
=========================== */

function toggleBookmark(number) {
  if (bookmarks.has(number)) {
    bookmarks.delete(number);
  } else {
    bookmarks.add(number);
  }
  saveStorage();
  renderWritingPage();
}

function toggleAnswer(number) {
  const item = allSentences[number];
  const el = document.getElementById(`answer-${number}`);
  el.innerText = el.innerText ? "" : item.question;
}

/* ===========================
   📌 북마크 (메인 전용)
=========================== */

function openBookmarks() {
  loadStorage();

  const data = [...bookmarks]
    .map(n => allSentences[n])
    .filter(Boolean);

  document.getElementById("main-screen").classList.add("hidden");
  document.getElementById("study-screen").classList.remove("hidden");

  document.getElementById("day-title").innerText = "📌 북마크";

  currentViewData = data;
  renderWritingPage();
}

/* ===========================
   기타
=========================== */

function goHome() {
  document.getElementById("study-screen").classList.add("hidden");
  document.getElementById("main-screen").classList.remove("hidden");
}
