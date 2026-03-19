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
   상태
=========================== */

let currentSentences = [];
let currentDayNumber = 0;
let pageStep = 0;
let isBookmarkMode = false;

let bookmarks = JSON.parse(localStorage.getItem("bookmarks") || "[]");
let allSentences = {};

/* ===========================
   전체 데이터 로드
=========================== */

async function loadAllData() {
  allSentences = {};

  const res = await fetch(`data/day1.csv?v=${Date.now()}`); // 🔥 캐시 방지
  const text = await res.text();

  const rows = text.trim().split(/\r?\n/).slice(1);

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

  isBookmarkMode = false;
  currentDayNumber = dayNumber;
  pageStep = 0;

  document.getElementById("main-screen").classList.add("hidden");
  document.getElementById("study-screen").classList.remove("hidden");

  document.getElementById("day-title").innerText = "Day " + dayNumber;

  const startIndex = (dayNumber - 1) * 10;
  const endIndex = startIndex + 10;

  const response = await fetch(`data/day1.csv?v=${Date.now()}`);
  const text = await response.text();

  const rows = text.trim().split(/\r?\n/).slice(1);
  const selectedRows = rows.slice(startIndex, endIndex);

  currentSentences = selectedRows.map(row => {
    const cols = row.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g);

    return {
      question: cols[0].replace(/"/g, "").trim(),
      answer: cols[1].replace(/"/g, "").trim(),
      question_korean: cols[2].replace(/"/g, "").trim(),
      number: cols[3].replace(/"/g, "").trim()
    };
  });

  renderPage();
}

/* ===========================
   북마크
=========================== */

async function openBookmarks() {
  await loadAllData();

  isBookmarkMode = true;
  pageStep = 0;

  currentSentences = bookmarks.map(n => allSentences[n]).filter(Boolean);

  document.getElementById("main-screen").classList.add("hidden");
  document.getElementById("study-screen").classList.remove("hidden");

  document.getElementById("day-title").innerText = "📌 북마크";

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
   공통 뒤로가기
=========================== */

function addBackButton(content) {
  if (pageStep === 0) return;

  const backBtn = document.createElement("button");
  backBtn.innerText = "← 뒤로가기";

  backBtn.onclick = () => {
    pageStep--;
    renderPage();
  };

  content.appendChild(backBtn);
}

/* ===========================
   문제 목록
=========================== */

function renderIntroPage() {
  const content = document.getElementById("content");
  content.innerHTML = "";

  const first = currentSentences.slice(0,5).map(i => i.number).join(", ");
  const second = currentSentences.slice(5,10).map(i => i.number).join(", ");

  content.innerHTML = `
    <p>${first}</p>
    <p>${second}</p>
  `;

  const btn = document.createElement("button");
  btn.innerText = "학습 시작 →";
  btn.onclick = () => {
    pageStep = 1;
    renderPage();
  };

  content.appendChild(btn);
}

/* ===========================
   학습
=========================== */

function renderStudyPage(start, end, baseNumber) {
  const content = document.getElementById("content");
  content.innerHTML = "";

  const data = currentSentences.slice(start, end);

  data.forEach((item, idx) => {

    const isMarked = bookmarks.includes(item.number);

    const div = document.createElement("div");

    div.innerHTML = `
      <p><strong>${baseNumber + idx}. ${item.question_korean}</strong></p>

      <input type="text" style="width:80%; padding:5px;">

      <br>

      <button onclick="toggleBookmark('${item.number}')">
        ${isMarked ? "⭐" : "☆"}
      </button>

      <button onclick="toggleAnswer('${item.number}')">정답 보기</button>

      <p id="answer-${item.number}" style="color:blue;"></p>
    `;

    content.appendChild(div);
  });

  const btn = document.createElement("button");

  if (pageStep === 1) {
    btn.innerText = "다음 →";
    btn.onclick = () => { pageStep = 2; renderPage(); };
  } else {
    btn.innerText = "LC 시작 →";
    btn.onclick = () => { pageStep = 3; renderPage(); };
  }

  content.appendChild(btn);
  addBackButton(content);
}

/* ===========================
   LC
=========================== */

function renderLCPage(start, end, baseNumber) {
  const content = document.getElementById("content");
  content.innerHTML = "";

  const data = currentSentences.slice(start, end);
  const shuffled = [...currentSentences]
    .map(i => i.answer)
    .sort(() => Math.random() - 0.5);

  data.forEach((item, idx) => {

    const options = shuffled.map(a =>
      `<option value="${a}">${a}</option>`
    ).join("");

    const div = document.createElement("div");

    div.innerHTML = `
      <p><strong>${baseNumber + idx}. ${item.question}</strong></p>
      <select>
        <option>선택</option>
        ${options}
      </select>
    `;

    content.appendChild(div);
  });

  const btn = document.createElement("button");

  if (pageStep === 3) {
    btn.innerText = "다음 →";
    btn.onclick = () => { pageStep = 4; renderPage(); };
  } else {
    btn.innerText = "리뷰 →";
    btn.onclick = () => { pageStep = 5; renderPage(); };
  }

  content.appendChild(btn);
  addBackButton(content);
}

/* ===========================
   리뷰
=========================== */

function renderReviewPage() {
  const content = document.getElementById("content");
  content.innerHTML = "";

  content.innerHTML = `
    <h1 style="color:red; font-size:28px;">
      1.2배속으로 듣기<br>
      영작/LC 틀린 문제는 북마크해서 반복
    </h1>
  `;

  const finishBtn = document.createElement("button");
  finishBtn.innerText = "Day 완료";

  finishBtn.onclick = () => {
    if (!isBookmarkMode) {
      localStorage.setItem("day" + currentDayNumber, "completed");

      const buttons = document.querySelectorAll("#day-buttons button");
      buttons[currentDayNumber - 1].classList.add("completed");
      buttons[currentDayNumber - 1].innerText += " ❌";
    }

    goHome();
  };

  content.appendChild(finishBtn);
  addBackButton(content);
}

/* ===========================
   기능
=========================== */

function toggleAnswer(number) {
  const item = currentSentences.find(i => i.number === number);
  const el = document.getElementById(`answer-${number}`);
  el.innerText = el.innerText ? "" : item.question;
}

function toggleBookmark(number) {
  if (bookmarks.includes(number)) {
    bookmarks = bookmarks.filter(n => n !== number);
  } else {
    bookmarks.push(number);
  }

  localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
  renderPage();
}

/* ===========================
   기타
=========================== */

function goHome() {
  document.getElementById("study-screen").classList.add("hidden");
  document.getElementById("main-screen").classList.remove("hidden");
}
