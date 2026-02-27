const totalDays = 27;
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

async function startDay(dayNumber) {
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

  const rows = text.trim().split("\n").slice(1);
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

  currentPage = 0;
  renderWritingPage();
}

function renderWritingPage() {
  const content = document.getElementById("content");
  content.innerHTML = "";

  const start = currentPage * 5;
  const end = start + 5;
  const pageSentences = currentSentences.slice(start, end);

  pageSentences.forEach((item, index) => {
    const div = document.createElement("div");
    div.style.marginBottom = "20px";

    div.innerHTML = `
      <p><strong>${start + index + 1}. ${item.question_korean}</strong></p>
      <input type="text" id="input-${start + index}" style="width:80%; padding:5px;">
      <br>
      <button onclick="showAnswer(${start + index})">정답 보기</button>
      <p id="answer-${start + index}" style="color:blue;"></p>
    `;

    content.appendChild(div);
  });

  const navButton = document.createElement("button");

  if (currentPage === 0) {
    navButton.innerText = "다음 5문장 →";
    navButton.onclick = () => {
      currentPage = 1;
      renderWritingPage();
    };
  } else {
    navButton.innerText = "LC 매칭 시작 →";
    navButton.onclick = () => {
      renderLCPage();
    };
  }

  content.appendChild(navButton);
}

/* 🔥 여기 수정됨 */
function showAnswer(index) {
  const item = currentSentences[index];
  document.getElementById(`answer-${index}`).innerText =
    `정답: ${item.question} (${item.number})`;
}

function goHome() {
  document.getElementById("study-screen").classList.add("hidden");
  document.getElementById("main-screen").classList.remove("hidden");
}

let lcPage = 0;
let shuffledAnswers = [];

function renderLCPage() {
  lcPage = 0;

  shuffledAnswers = [...currentSentences]
    .map(item => item.answer)
    .sort(() => Math.random() - 0.5);

  renderLCQuestions();
}

function renderLCQuestions() {
  const content = document.getElementById("content");
  content.innerHTML = "";

  const start = lcPage * 5;
  const end = start + 5;
  const pageQuestions = currentSentences.slice(start, end);

  pageQuestions.forEach((item, index) => {
    const div = document.createElement("div");
    div.style.marginBottom = "20px";

    let options = shuffledAnswers.map(answer =>
      `<option value="${answer}">${answer}</option>`
    ).join("");

    div.innerHTML = `
      <p><strong>${start + index + 1}. ${item.question}</strong></p>
      <select id="lc-${start + index}">
        <option value="">선택하세요</option>
        ${options}
      </select>
      <p id="lc-result-${start + index}"></p>
    `;

    content.appendChild(div);
  });

  const checkBtn = document.createElement("button");
  checkBtn.innerText = "채점하기";
  checkBtn.onclick = checkLCAnswers;
  content.appendChild(checkBtn);
}

function checkLCAnswers() {
  const start = lcPage * 5;
  const end = start + 5;

  let score = 0;
  let allAnswered = true;

  for (let i = start; i < end; i++) {
    const selected = document.getElementById(`lc-${i}`).value;
    const result = document.getElementById(`lc-result-${i}`);
    const correctAnswer = currentSentences[i].answer;

    if (!selected) {
      result.innerText = "선택하세요";
      result.style.color = "orange";
      allAnswered = false;
      continue;
    }

    if (selected === correctAnswer) {
      result.innerText = "정답 ✅";
      result.style.color = "green";
      score++;
    } else {
      result.innerText = `오답 ❌ (정답: ${correctAnswer})`;
      result.style.color = "red";
    }
  }

  if (!allAnswered) return;

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
    const finishBtn = document.createElement("button");
    finishBtn.innerText = "Day 완료";
    finishBtn.onclick = completeDay;
    content.appendChild(finishBtn);
  }
}

function completeDay() {
  localStorage.setItem("day" + currentDayNumber, "completed");

  alert("Day 완료!");

  goHome();

  const buttons = document.querySelectorAll("#day-buttons button");
  buttons[currentDayNumber - 1].classList.add("completed");
  buttons[currentDayNumber - 1].innerText += " ❌";
}
