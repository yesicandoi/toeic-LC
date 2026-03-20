const totalDays = 30;
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
   상태
=========================== */

let currentSentences = [];
let currentDayNumber = 0;
let pageStep = 0;
let isBookmarkMode = false;

let bookmarks = JSON.parse(localStorage.getItem("bookmarks") || "[]");
let lcWrongs = JSON.parse(localStorage.getItem("lcWrongs") || "[]");

let allSentences = {};
let revealedAnswers = new Set();

/* ===========================
   데이터 로드
=========================== */

async function loadAllData() {
  const res = await fetch(`data/day1.csv?v=${Date.now()}`);
  const text = await res.text();

  const rows = text.trim().split(/\r?\n/).slice(1);

  allSentences = {};

  rows.forEach(row => {
    const cols = row.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g);

    const item = {
      question: cols[0].replace(/"/g, "").trim(),
      answer: cols[1].replace(/"/g, "").trim(),
      question_korean: cols[2].replace(/"/g, "").trim(),
      number: cols[3].replace(/"/g, "").trim()
    };

    allSentences[item.number] = item;
  });
}

/* ===========================
   Day 시작
=========================== */

async function startDay(dayNumber) {
  await loadAllData();

  isBookmarkMode = false;
  currentDayNumber = dayNumber;
  pageStep = 0;
  revealedAnswers.clear();

  document.getElementById("main-screen").classList.add("hidden");
  document.getElementById("study-screen").classList.remove("hidden");

  document.getElementById("day-title").innerText = "Day " + dayNumber;

  const startIndex = (dayNumber - 1) * 10;
  const endIndex = startIndex + 10;

  currentSentences = Object.values(allSentences).slice(startIndex, endIndex);

  renderPage();
}

/* ===========================
   북마크
=========================== */

async function openBookmarks() {
  await loadAllData();

  isBookmarkMode = true;
  revealedAnswers.clear();

  currentSentences = bookmarks
    .map(n => allSentences[n])
    .filter(Boolean);

  document.getElementById("main-screen").classList.add("hidden");
  document.getElementById("study-screen").classList.remove("hidden");

  document.getElementById("day-title").innerText = "📌 북마크";

  renderBookmarkPage();
}

/* ===========================
   공통
=========================== */

function addBackButton(content) {
  const btn = document.createElement("button");
  btn.innerText = "← 뒤로가기";
  btn.onclick = goHome;
  btn.style.marginTop = "20px";
  content.appendChild(btn);
}

/* ===========================
   페이지 컨트롤
=========================== */

function renderPage() {
  if (pageStep === 0) renderIntroPage();
  else if (pageStep === 1) renderStudyPage(0, 5, 1);
  else if (pageStep === 2) renderStudyPage(5, 10, 6);
  else if (pageStep === 3) renderLCPage(0, 5, 1);
  else if (pageStep === 4) renderLCPage(5, 10, 6);
  else if (pageStep === 5) renderReviewPage();
}

/* ===========================
   영작
=========================== */

function renderStudyPage(start, end, base) {
  const content = document.getElementById("content");
  content.innerHTML = "";

  currentSentences.slice(start, end).forEach((item, idx) => {

    const div = document.createElement("div");

    div.innerHTML = `
      <p>
        <strong>${base + idx}. ${item.question_korean}</strong>
        <span style="color:gray; font-size:12px;">(${item.number}회-${idx+1})</span>
      </p>

      <input type="text">

      <button onclick="toggleBookmark('${item.number}', this)">
        ${bookmarks.includes(item.number) ? "⭐" : "☆"}
      </button>

      <button onclick="toggleAnswer('${item.number}')">정답</button>

      <p id="answer-${item.number}">
        ${revealedAnswers.has(item.number) ? item.question : ""}
      </p>
    `;

    content.appendChild(div);
  });

  const btn = document.createElement("button");
  btn.innerText = pageStep === 1 ? "다음" : "LC 시작";
  btn.onclick = () => { pageStep++; renderPage(); };

  content.appendChild(btn);
  addBackButton(content);
}

/* ===========================
   LC
=========================== */

function renderLCPage(start, end, base) {
  const content = document.getElementById("content");
  content.innerHTML = "";

  const answers = currentSentences.map(i => i.answer);

  currentSentences.slice(start, end).forEach((item, idx) => {

    const options = answers
      .map(a => `<option value="${a}">${a}</option>`)
      .join("");

    const div = document.createElement("div");

    div.innerHTML = `
      <p>
        <strong>${base + idx}. ${item.question}</strong>
        <span style="color:gray;">(${item.number}회-${idx+1})</span>
      </p>

      <select id="lc-${item.number}">
        <option>선택</option>
        ${options}
      </select>

      <button onclick="checkLC('${item.number}')">채점</button>

      <div id="result-${item.number}"></div>
    `;

    content.appendChild(div);
  });

  const btn = document.createElement("button");
  btn.innerText = pageStep === 3 ? "다음" : "리뷰";
  btn.onclick = () => { pageStep++; renderPage(); };

  content.appendChild(btn);
  addBackButton(content);
}

/* ===========================
   LC 채점
=========================== */

function checkLC(number) {
  const select = document.getElementById(`lc-${number}`);
  const result = document.getElementById(`result-${number}`);
  const item = currentSentences.find(i => i.number === number);

  if (select.value === item.answer) {
    result.innerHTML = `⭕<br>${item.answer}`;
  } else {
    result.innerHTML = `❌<br>${item.answer}`;

    if (!lcWrongs.includes(number)) {
      lcWrongs.push(number);
      localStorage.setItem("lcWrongs", JSON.stringify(lcWrongs));
    }
  }
}

/* ===========================
   LC 오답노트
=========================== */

async function openLCWrongs() {
  await loadAllData();

  currentSentences = lcWrongs.map(n => allSentences[n]).filter(Boolean);

  document.getElementById("main-screen").classList.add("hidden");
  document.getElementById("study-screen").classList.remove("hidden");

  document.getElementById("day-title").innerText = "LC 오답노트";

  renderLCWrongPage();
}

function renderLCWrongPage() {
  const content = document.getElementById("content");
  content.innerHTML = "";

  currentSentences.forEach((item, idx) => {

    const options = Object.values(allSentences)
      .slice(0, 10)
      .map(i => `<option value="${i.answer}">${i.answer}</option>`)
      .join("");

    const div = document.createElement("div");

    div.innerHTML = `
      <p>
        <strong>${idx+1}. ${item.question}</strong>
        <span style="color:gray;">(${item.number}회-${idx+1})</span>
      </p>

      <select id="wrong-${item.number}">
        <option>선택</option>
        ${options}
      </select>

      <button onclick="checkWrong('${item.number}')">채점</button>
      <button onclick="removeWrong('${item.number}')">삭제</button>

      <div id="wrong-result-${item.number}"></div>
    `;

    content.appendChild(div);
  });

  addBackButton(content);
}

function checkWrong(number) {
  const select = document.getElementById(`wrong-${number}`);
  const result = document.getElementById(`wrong-result-${number}`);
  const item = currentSentences.find(i => i.number === number);

  if (select.value === item.answer) {
    result.innerHTML = `⭕<br>${item.answer}`;
  } else {
    result.innerHTML = `❌<br>${item.answer}`;
  }
}

function removeWrong(number) {
  lcWrongs = lcWrongs.filter(n => n !== number);
  localStorage.setItem("lcWrongs", JSON.stringify(lcWrongs));
  renderLCWrongPage();
}

/* ===========================
   기타
=========================== */

function toggleAnswer(number) {
  const item = currentSentences.find(i => i.number === number);
  const el = document.getElementById(`answer-${number}`);

  if (revealedAnswers.has(number)) {
    revealedAnswers.delete(number);
    el.innerText = "";
  } else {
    revealedAnswers.add(number);
    el.innerText = item.question;
  }
}

function toggleBookmark(number, btn) {
  if (bookmarks.includes(number)) {
    bookmarks = bookmarks.filter(n => n !== number);
    btn.innerText = "☆";
  } else {
    bookmarks.push(number);
    btn.innerText = "⭐";
  }

  localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
}

function renderIntroPage() {
  const content = document.getElementById("content");
  content.innerHTML = `<button onclick="pageStep=1;renderPage()">학습 시작</button>`;
}

function renderReviewPage() {
  const content = document.getElementById("content");
  content.innerHTML = "";

  const btn = document.createElement("button");
  btn.innerText = "Day 완료";

  btn.onclick = () => {
    localStorage.setItem("day" + currentDayNumber, "completed");
    alert("완료");
    goHome();
  };

  content.appendChild(btn);
}

function goHome() {
  document.getElementById("study-screen").classList.add("hidden");
  document.getElementById("main-screen").classList.remove("hidden");
}
