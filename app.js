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

let currentSentences = [];
let allSentences = {}; // 🔥 number 기준 저장소

let currentDayNumber = 0;
let mode = "normal";

let bookmarks = new Set();
let wrongAnswers = new Set();

/* ===========================
   📥 Day 시작
=========================== */

async function startDay(dayNumber) {

  currentDayNumber = dayNumber;
  mode = "normal";

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

    allSentences[item.number] = item; // 🔥 누적 저장
    return item;
  });

  saveAllSentences();

  showTodayNumbers();
  renderWritingPage(currentSentences);
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
  localStorage.setItem("wrongAnswers", JSON.stringify([...wrongAnswers]));
}

function loadStorage() {
  bookmarks = new Set(JSON.parse(localStorage.getItem("bookmarks") || "[]"));
  wrongAnswers = new Set(JSON.parse(localStorage.getItem("wrongAnswers") || "[]"));
  loadAllSentences();
}

/* ===========================
   🔢 상단
=========================== */

function showTodayNumbers() {
  const numbers = currentSentences.map(i => i.number).join(", ");
  document.getElementById("today-numbers").innerText =
    "오늘 문제: " + numbers;
}

/* ===========================
   🧠 데이터 가져오기
=========================== */

function getBookmarkData() {
  return [...bookmarks]
    .map(n => allSentences[n])
    .filter(Boolean);
}

function getWrongData() {
  return [...wrongAnswers]
    .map(n => allSentences[n])
    .filter(Boolean);
}

/* ===========================
   ✏️ 공통 렌더
=========================== */

function renderWritingPage(data) {
  const content = document.getElementById("content");
  content.innerHTML = "";

  if (!data || data.length === 0) {
    content.innerHTML = "<p>문제가 없습니다</p>";
    return;
  }

  data.forEach((item, idx) => {
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
    <button onclick="renderLCPage(currentViewData)">LC</button>
    <button onclick="goHome()">← 뒤로가기</button>
  `;

  content.appendChild(nav);

  currentViewData = data; // 🔥 현재 데이터 유지
}

/* ===========================
   🎧 LC
=========================== */

let currentViewData = [];

function renderLCPage(data) {
  const content = document.getElementById("content");
  content.innerHTML = "";

  const shuffled = data.map(i => i.answer).sort(() => Math.random() - 0.5);

  data.forEach(item => {

    const options = shuffled.map(a =>
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
    <button onclick="checkLC(currentViewData)">채점</button>
    <button onclick="renderWritingPage(currentViewData)">← 뒤로</button>
  `;

  content.appendChild(btns);
}

function checkLC(data) {
  data.forEach(item => {
    const selected = document.getElementById(`lc-${item.number}`).value;
    const result = document.getElementById(`result-${item.number}`);

    if (selected === item.answer) {
      result.innerText = "정답";
    } else {
      result.innerText = "오답";
      wrongAnswers.add(item.number);
    }
  });

  saveStorage();
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
  renderWritingPage(currentViewData);
}

function toggleAnswer(number) {
  const item = allSentences[number];
  const el = document.getElementById(`answer-${number}`);
  el.innerText = el.innerText ? "" : item.question;
}

/* ===========================
   📌 메인 버튼용
=========================== */

function openBookmarks() {
  loadStorage();

  document.getElementById("main-screen").classList.add("hidden");
  document.getElementById("study-screen").classList.remove("hidden");

  document.getElementById("day-title").innerText = "📌 북마크";

  const data = getBookmarkData();
  renderWritingPage(data);
}

function openWrong() {
  loadStorage();

  document.getElementById("main-screen").classList.add("hidden");
  document.getElementById("study-screen").classList.remove("hidden");

  document.getElementById("day-title").innerText = "❌ 오답노트";

  const data = getWrongData();
  renderWritingPage(data);
}

/* ===========================
   기타
=========================== */

function goHome() {
  document.getElementById("study-screen").classList.add("hidden");
  document.getElementById("main-screen").classList.remove("hidden");
}
