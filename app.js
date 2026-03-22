const totalDays = 30;
const buttonsContainer = document.getElementById("day-buttons");

/* ===========================
   Day 버튼 생성
=========================== */
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

  currentDayNumber = dayNumber;
  pageStep = 0;
  revealedAnswers.clear();

  document.getElementById("main-screen").classList.add("hidden");
  document.getElementById("study-screen").classList.remove("hidden");

  document.getElementById("day-title").innerText = "Day " + dayNumber;

  const start = (dayNumber - 1) * 10;
  const end = start + 10;

  currentSentences = Object.values(allSentences).slice(start, end);

  renderPage();
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
   문제 목록
=========================== */
function renderIntroPage() {
  const content = document.getElementById("content");

  const first = currentSentences.slice(0,5).map(i => i.number).join(", ");
  const second = currentSentences.slice(5,10).map(i => i.number).join(", ");

  content.innerHTML = `
    <p>${first}</p>
    <p>${second}</p>
  `;

  const btn = document.createElement("button");
  btn.innerText = "학습 시작 →";
  btn.onclick = () => { pageStep = 1; renderPage(); };

  content.appendChild(btn);
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
        <span style="color:gray;">(${item.number})</span>
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
  btn.innerText = pageStep === 1 ? "다음 →" : "LC 시작 →";
  btn.onclick = () => { pageStep++; renderPage(); };

  content.appendChild(btn);
  addBackButton(content);
}

/* ===========================
   shuffle
=========================== */
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/* ===========================
   LC
=========================== */
function renderLCPage(start, end, base) {
  const content = document.getElementById("content");
  content.innerHTML = "";

  const answers = currentSentences.map(i => i.answer);

  currentSentences.slice(start, end).forEach((item, idx) => {

    const shuffled = shuffle(answers);

    const options = shuffled.map(a =>
      `<option value="${a}">${a}</option>`
    ).join("");

    const div = document.createElement("div");

    div.innerHTML = `
      <p>
        <strong>${base + idx}. ${item.question}</strong>
        (${item.number})
      </p>

      <select id="lc-${item.number}">
        <option>선택</option>
        ${options}
      </select>

      <p id="result-${item.number}"></p>
    `;

    content.appendChild(div);
  });

  const checkBtn = document.createElement("button");
  checkBtn.innerText = "전체 채점";
  checkBtn.onclick = checkAllLC;

  content.appendChild(checkBtn);

  const nextBtn = document.createElement("button");
  nextBtn.innerText = pageStep === 3 ? "다음 →" : "리뷰 →";
  nextBtn.onclick = () => { pageStep++; renderPage(); };

  content.appendChild(nextBtn);

  addBackButton(content);
}

/* ===========================
   LC 채점
=========================== */
function checkAllLC() {
  currentSentences.forEach(item => {
    const select = document.getElementById(`lc-${item.number}`);
    const result = document.getElementById(`result-${item.number}`);

    if (!select) return;

    if (select.value === item.answer) {
      result.innerHTML = `<span style="color:green; font-weight:bold;">⭕ 정답</span>`;
    } else {
      result.innerHTML = `
        <span style="color:red; font-weight:bold;">❌ 오답</span><br>
        <span style="color:blue;">${item.answer}</span>
      `;

      if (!lcWrongs.includes(item.number)) {
        lcWrongs.push(item.number);
      }
    }
  });

  localStorage.setItem("lcWrongs", JSON.stringify(lcWrongs));
}

/* ===========================
   오답노트
=========================== */
function getRandomOptions(correctAnswer, allAnswers, count = 5) {
  const filtered = allAnswers.filter(a => a !== correctAnswer);
  const selected = shuffle(filtered).slice(0, count - 1);
  return shuffle([correctAnswer, ...selected]);
}

function renderLCWrongPage() {
  const content = document.getElementById("content");
  content.innerHTML = "";

  const allAnswers = Object.values(allSentences).map(i => i.answer);

  currentSentences.forEach((item, idx) => {

    const optionsArr = getRandomOptions(item.answer, allAnswers);

    const options = optionsArr.map(a =>
      `<option value="${a}">${a}</option>`
    ).join("");

    const div = document.createElement("div");

    div.innerHTML = `
      <p><strong>${idx + 1}. ${item.question}</strong></p>

      <select id="wrong-${item.number}">
        <option>선택</option>
        ${options}
      </select>

      <button onclick="checkWrong('${item.number}')">채점</button>

      <p id="wrong-result-${item.number}"></p>
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
    result.innerHTML = `<span style="color:green; font-weight:bold;">⭕ 정답</span>`;
  } else {
    result.innerHTML = `
      <span style="color:red; font-weight:bold;">❌ 오답</span><br>
      <span style="color:blue;">${item.answer}</span>
    `;
  }
}

/* ===========================
   리뷰
=========================== */
function renderReviewPage() {
  const content = document.getElementById("content");

  content.innerHTML = `<h2>복습</h2>`;

  const btn = document.createElement("button");
  btn.innerText = "Day 완료";

  btn.onclick = () => {
    localStorage.setItem("day" + currentDayNumber, "completed");
    alert("완료!");
    goHome();
  };

  content.appendChild(btn);
}

/* ===========================
   기타 기능
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

function addBackButton(content) {
  const btn = document.createElement("button");
  btn.innerText = "← 뒤로가기";
  btn.onclick = goHome;
  content.appendChild(btn);
}

function goHome() {
  revealedAnswers.clear();

  document.getElementById("study-screen").classList.add("hidden");
  document.getElementById("main-screen").classList.remove("hidden");
}
