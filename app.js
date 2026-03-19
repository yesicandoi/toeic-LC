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
let currentPage = 0;
let currentDayNumber = 0;

/* ===========================
   📥 Day 시작
=========================== */

async function startDay(dayNumber) {

  // 🔴 이전 데이터 초기화
  currentSentences = [];

  currentDayNumber = dayNumber;

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
   .filter(row => row.trim() !== "");
  const selectedRows = rows.slice(startIndex, endIndex);
  if (selectedRows.length === 0) {
  alert("문제를 불러오지 못했습니다.");
  goHome();
  return;
}

  currentSentences = selectedRows
  .filter(row => row)
  .map(row => {
    const cols = row.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g);
    return {
      question: cols[0].replace(/"/g, "").trim(),
      answer: cols[1].replace(/"/g, "").trim(),
      question_korean: cols[2].replace(/"/g, "").trim(),
      number: cols[3].replace(/"/g, "").trim()
    };
  });

  currentPage = 0;

  // 🔵 오늘 학습 번호 먼저 표시
  showTodayNumbers();

  // 🔵 그 다음 영작 페이지 이동
  renderWritingPage();
}

/* ===========================
   🔢 오늘 문제 번호 표시
=========================== */

function showTodayNumbers() {
  const numbers = currentSentences.map(item => item.number).join(", ");
  alert("오늘 학습할 문제 번호:\n\n" + numbers);
}

/* ===========================
   ✏️ 영작 페이지
=========================== */

function renderWritingPage() {
  const content = document.getElementById("content");
  content.innerHTML = "";

  const start = currentPage * 5;
  const end = start + 5;
  const pageSentences = currentSentences.slice(start, end);

  pageSentences.forEach((item, index) => {
    const realIndex = start + index;

    const div = document.createElement("div");
    div.style.marginBottom = "20px";

    div.innerHTML = `
      <p><strong>${realIndex + 1}. ${item.question_korean}</strong></p>
      <input type="text" style="width:80%; padding:5px;">
      <br>
      <button id="btn-${realIndex}" onclick="toggleAnswer(${realIndex})">정답 보기</button>
      <p id="answer-${realIndex}" style="color:blue;"></p>
    `;

    content.appendChild(div);
  });

  const navDiv = document.createElement("div");
  navDiv.style.marginTop = "20px";

  const prevBtn = document.createElement("button");
  prevBtn.innerText = "← 1~5";
  prevBtn.onclick = () => {
    currentPage = 0;
    renderWritingPage();
  };

  const nextBtn = document.createElement("button");
  nextBtn.innerText = "6~10 →";
  nextBtn.onclick = () => {
    currentPage = 1;
    renderWritingPage();
  };

  const lcBtn = document.createElement("button");
  lcBtn.innerText = "LC 매칭 시작 →";
  lcBtn.onclick = renderLCPage;

  navDiv.appendChild(prevBtn);
  navDiv.appendChild(nextBtn);
  navDiv.appendChild(document.createElement("br"));
  navDiv.appendChild(document.createElement("br"));
  navDiv.appendChild(lcBtn);

  content.appendChild(navDiv);
}

/* 🔵 정답 ON/OFF 기능 */
function toggleAnswer(index) {
  const item = currentSentences[index];
  const answerElement = document.getElementById(`answer-${index}`);
  const buttonElement = document.getElementById(`btn-${index}`);

  if (answerElement.innerText === "") {
    answerElement.innerText = `정답: ${item.question} (${item.number})`;
    buttonElement.innerText = "정답 숨기기";
  } else {
    answerElement.innerText = "";
    buttonElement.innerText = "정답 보기";
  }
}

/* ===========================
   🎧 LC 파트
=========================== */

let lcPage = 0;
let shuffledAnswers = [];
let lcSubmitted = false;

function renderLCPage() {
  lcPage = 0;
  lcSubmitted = false;

  shuffledAnswers = [...currentSentences]
    .map(item => item.answer)
    .sort(() => Math.random() - 0.5);

  renderLCQuestions();
}

function renderLCQuestions() {
  const content = document.getElementById("content");
  content.innerHTML = "";
  lcSubmitted = false;

  const start = lcPage * 5;
  const end = start + 5;
  const pageQuestions = currentSentences.slice(start, end);

  pageQuestions.forEach((item, index) => {
    const realIndex = start + index;

    const div = document.createElement("div");
    div.style.marginBottom = "20px";

    let options = shuffledAnswers.map(answer =>
      `<option value="${answer}">${answer}</option>`
    ).join("");

    div.innerHTML = `
      <p><strong>${realIndex + 1}. ${item.question}</strong></p>
      <select id="lc-${realIndex}">
        <option value="">선택하세요</option>
        ${options}
      </select>
      <p id="lc-result-${realIndex}"></p>
    `;

    content.appendChild(div);
  });

  const checkBtn = document.createElement("button");
  checkBtn.innerText = "채점하기";
  checkBtn.onclick = checkLCAnswers;
  content.appendChild(checkBtn);
}

function checkLCAnswers() {
  if (lcSubmitted) return;   // 🔥 중복 방지
  lcSubmitted = true;

  const start = lcPage * 5;
  const end = start + 5;

  let score = 0;

  for (let i = start; i < end; i++) {
    const selected = document.getElementById(`lc-${i}`).value;
    const result = document.getElementById(`lc-result-${i}`);
    const correctAnswer = currentSentences[i].answer;

    if (selected === correctAnswer) {
      result.innerText = "정답 ✅";
      result.style.color = "green";
      score++;
    } else {
      result.innerText = `오답 ❌ (정답: ${correctAnswer})`;
      result.style.color = "red";
    }
  }

  const content = document.getElementById("content");

  const scoreText = document.createElement("p");
  scoreText.innerHTML = `<strong>점수: ${score} / 5</strong>`;
  scoreText.style.marginTop = "15px";
  content.appendChild(scoreText);

  if (lcPage === 0) {
    const nextBtn = document.createElement("button");
    nextBtn.innerText = "다음 5문제 →";
    nextBtn.onclick = () => {
      lcPage = 1;
      renderLCQuestions();
    };
    content.appendChild(nextBtn);
  } else {
    const numberBtn = document.createElement("button");
    numberBtn.innerText = "오늘 사용된 number 보기";
    numberBtn.onclick = showTodayNumbers;

    const finishBtn = document.createElement("button");
    finishBtn.innerText = "Day 완료";
    finishBtn.onclick = completeDay;

    content.appendChild(document.createElement("br"));
    content.appendChild(numberBtn);
    content.appendChild(finishBtn);
  }
}

/* ===========================
   ✅ Day 완료
=========================== */

function completeDay() {
  localStorage.setItem("day" + currentDayNumber, "completed");

  alert("Day 완료!");

  goHome();

  const buttons = document.querySelectorAll("#day-buttons button");
  buttons[currentDayNumber - 1].classList.add("completed");
  buttons[currentDayNumber - 1].innerText += " ❌";
}

function goHome() {
  document.getElementById("study-screen").classList.add("hidden");
  document.getElementById("main-screen").classList.remove("hidden");
}


