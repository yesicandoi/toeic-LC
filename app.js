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
let allSentences = {};

// 🔥 정답 표시 상태 저장
let revealedAnswers = new Set();

/* ===========================
   전체 데이터 로드
=========================== */

async function loadAllData() {
  allSentences = {};

  const res = await fetch(`data/day1.csv?v=${Date.now()}`);
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
  revealedAnswers.clear(); // 🔥 초기화

  document.getElementById("main-screen").classList.add("hidden");
  document.getElementById("study-screen").classList.remove("hidden");

  document.getElementById("day-title").innerText = "Day " + dayNumber;

  const response = await fetch(`data/day1.csv?v=${Date.now()}`);
  const text = await response.text();

  const rows = text.trim().split(/\r?\n/).slice(1);

  const startIndex = (dayNumber - 1) * 10;
  const endIndex = Math.min(startIndex + 10, rows.length);

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
  revealedAnswers.clear(); // 🔥 초기화

  currentSentences = bookmarks
    .map(n => allSentences[n])
    .filter(Boolean)
    .sort(() => Math.random() - 0.5);

  document.getElementById("main-screen").classList.add("hidden");
  document.getElementById("study-screen").classList.remove("hidden");

  document.getElementById("day-title").innerText = "📌 북마크";

  renderBookmarkPage();
}

/* ===========================
   뒤로가기
=========================== */

function addBackButton(content) {
  const btn = document.createElement("button");
  btn.innerText = "← 뒤로가기";
  btn.style.marginTop = "20px";
  btn.onclick = goHome;
  content.appendChild(btn);
}

/* ===========================
   북마크 페이지
=========================== */

function renderBookmarkPage() {
  const content = document.getElementById("content");
  content.innerHTML = "";

  currentSentences.forEach((item, idx) => {

    const isMarked = bookmarks.includes(item.number);

    const div = document.createElement("div");

    div.innerHTML = `
      <p>
        <strong>${idx + 1}. ${item.question_korean}</strong>
        <span style="color:gray; font-size:12px; margin-left:8px;">(${item.number})</span>
      </p>

      <input type="text" style="width:80%; padding:5px;">

      <br>

      <button onclick="toggleBookmark('${item.number}', this)">
        ${isMarked ? "⭐" : "☆"}
      </button>

      <button onclick="toggleAnswer('${item.number}')">정답 보기</button>

      <p id="answer-${item.number}" style="color:blue;">
        ${revealedAnswers.has(item.number) ? item.question : ""}
      </p>
    `;

    content.appendChild(div);
  });

  addBackButton(content);
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
   학습 (영작)
=========================== */

function renderStudyPage(start, end, base) {
  const content = document.getElementById("content");
  content.innerHTML = "";

  const data = currentSentences.slice(start, end);

  data.forEach((item, idx) => {

    const isMarked = bookmarks.includes(item.number);

    const div = document.createElement("div");

    div.innerHTML = `
      <p>
        <strong>${base + idx}. ${item.question_korean}</strong>
        <span style="color:gray; font-size:12px; margin-left:8px;">
          (${item.number}회-${idx + 1})
        </span>
      </p>

      <input type="text" style="width:80%; padding:5px;">

      <br>

      <button onclick="toggleBookmark('${item.number}', this)">
        ${isMarked ? "⭐" : "☆"}
      </button>

      <button onclick="toggleAnswer('${item.number}')">정답 보기</button>

      <p id="answer-${item.number}" style="color:blue;">
        ${revealedAnswers.has(item.number) ? item.question : ""}
      </p>
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
   LC (채점 기능 추가)
=========================== */

function renderLCPage(start, end, base) {
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
      <p>
        <strong>${base + idx}. ${item.question}</strong>
        <span style="color:gray; font-size:12px; margin-left:8px;">
          (${item.number}회-${idx + 1})
        </span>
      </p>

      <select id="lc-${item.number}">
        <option>선택</option>
        ${options}
      </select>

      <button onclick="checkLC('${item.number}')">채점</button>

      <div id="result-${item.number}" style="margin-top:5px;"></div>
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
   LC 채점 함수
=========================== */

function checkLC(number) {
  const select = document.getElementById(`lc-${number}`);
  const result = document.getElementById(`result-${number}`);
  const item = currentSentences.find(i => i.number === number);

  if (!select.value || select.value === "선택") {
    result.innerHTML = `<span style="color:gray;">선택해주세요</span>`;
    return;
  }

  if (select.value === item.answer) {
    result.innerHTML = `
      <span style="color:green;">⭕ 정답</span><br>
      <span style="color:blue;"> ${item.answer}</span>
    `;
  } else {
    result.innerHTML = `
      <span style="color:red;">❌ 오답</span><br>
      <span style="color:blue;">정답: ${item.answer}</span>
    `;

      // 🔥 오답 자동 저장
    if (!lcWrongs.includes(number)) {
      lcWrongs.push(number);
      localStorage.setItem("lcWrongs", JSON.stringify(lcWrongs));
    }
  }
}

/* ===========================
   리뷰
=========================== */

function renderReviewPage() {
  const content = document.getElementById("content");
  content.innerHTML = "";

  const btn = document.createElement("button");
  btn.innerText = "Day 완료";

  btn.onclick = () => {
    if (!isBookmarkMode) {
      localStorage.setItem("day" + currentDayNumber, "completed");

      const buttons = document.querySelectorAll("#day-buttons button");
      buttons[currentDayNumber - 1].classList.add("completed");

      if (!buttons[currentDayNumber - 1].innerText.includes("❌")) {
        buttons[currentDayNumber - 1].innerText += " ❌";
      }
    }

    alert("고생했습니다.\n꾸준하게만 하면 됩니다. 다음에 또 봐요.");
    goHome();
  };

  content.appendChild(btn);
  addBackButton(content);
}

/* ===========================
   기능
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


/* ===========================
   LC 오답노트
=========================== */

async function openLCWrongs() {
  await loadAllData();

  isBookmarkMode = false;
  revealedAnswers.clear();

  currentSentences = lcWrongs
    .map(n => allSentences[n])
    .filter(Boolean);

  document.getElementById("main-screen").classList.add("hidden");
  document.getElementById("study-screen").classList.remove("hidden");

  document.getElementById("day-title").innerText = "🎧 LC 오답노트";

  renderLCWrongPage();
}

function getRandomOptions(correctAnswer) {
  const allAnswers = Object.values(allSentences).map(i => i.answer);

  const shuffled = allAnswers.sort(() => Math.random() - 0.5);

  const options = new Set([correctAnswer]);

  for (let a of shuffled) {
    if (options.size >= 10) break;
    options.add(a);
  }

  return Array.from(options).sort(() => Math.random() - 0.5);
}

function renderLCWrongPage() {
  const content = document.getElementById("content");
  content.innerHTML = "";

  currentSentences.forEach((item, idx) => {

    const options = getRandomOptions(item.answer)
      .map(a => `<option value="${a}">${a}</option>`)
      .join("");

    const div = document.createElement("div");

    div.innerHTML = `
      <p>
        <strong>${idx + 1}. ${item.question}</strong>
        <span style="color:gray; font-size:12px; margin-left:8px;">
          (${item.number}회-${idx + 1})
        </span>
      </p>

      <select id="wrong-${item.number}">
        <option>선택</option>
        ${options}
      </select>

      <button onclick="checkWrong('${item.number}')">채점</button>
      <button onclick="removeWrong('${item.number}')">삭제</button>

      <div id="wrong-result-${item.number}" style="margin-top:5px;"></div>
    `;

    content.appendChild(div);
  });

  addBackButton(content);
}

function checkWrong(number) {
  const select = document.getElementById(`wrong-${number}`);
  const result = document.getElementById(`wrong-result-${number}`);
  const item = currentSentences.find(i => i.number === number);

  if (!select.value || select.value === "선택") {
    result.innerHTML = `<span style="color:gray;">선택해주세요</span>`;
    return;
  }

  if (select.value === item.answer) {
    result.innerHTML = `
      <span style="color:green;">⭕ 정답</span><br>
      <span style="color:blue;">정답: ${item.answer}</span>
    `;
  } else {
    result.innerHTML = `
      <span style="color:red;">❌ 오답</span><br>
      <span style="color:blue;">정답: ${item.answer}</span>
    `;
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

function goHome() {
  document.getElementById("study-screen").classList.add("hidden");
  document.getElementById("main-screen").classList.remove("hidden");
}
