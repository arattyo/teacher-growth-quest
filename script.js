const GAS_URL = "https://script.google.com/macros/s/AKfycbwFP-BRCBYZDD-xU5Y0MwA2Z5RAK48sHdgJtNcH-AaWnlJ-pGhbC_oa33csJD4UA3Pz/exec";

let allWords = [];

let currentWords = [];
let retryWords = [];

let currentQuestion;
let currentMode;

let level = 1;
let exp = 0;
let totalExp = 0;

const MAX_EXP = 5;
let streak = 0;

const stages = [

  { image: "images/stage1.png", title: "赤ちゃん" },
  { image: "images/stage2.png", title: "幼児" },
  { image: "images/stage3.png", title: "小学生" },
  { image: "images/stage4.png", title: "中学生" },
  { image: "images/stage5.png", title: "大学生" },

  { image: "images/stage6.png", title: "先生" },
  { image: "images/stage6.png", title: "学年主任" },
  { image: "images/stage6.png", title: "教務主任" },
  { image: "images/stage6.png", title: "教頭" },
  { image: "images/stage6.png", title: "校長" },
  { image: "images/stage6.png", title: "退職" }

];

async function loadWords() {

  loadSave();

  const response =
    await fetch(GAS_URL);

  allWords =
    await response.json();

  createUnitList();

  updateStatus();
}

function createUnitList() {

  const units =
    [...new Set(allWords.map(w => w.unit))];

  const select =
    document.getElementById("unitSelect");

  units.forEach(unit => {

    const option =
      document.createElement("option");

    option.value = unit;
    option.textContent = unit;

    select.appendChild(option);
  });
}

function startGame(mode) {

  currentMode = mode;

  const selectedUnit =
    document.getElementById("unitSelect").value;

  currentWords =
    allWords.filter(
      w => w.unit === selectedUnit
    );

  retryWords = [];

  document.getElementById("startScreen")
    .style.display = "none";

  document.getElementById("gameScreen")
    .style.display = "block";

  document.getElementById("endButtons")
    .style.display = "none";

  streak = 0;

  updateStatus();

  nextQuestion();
}

function nextQuestion() {

  if (currentWords.length === 0) {

    if (retryWords.length === 0) {

      document.getElementById("question")
       .textContent =
       "🎉 全問正解達成！";

      document.getElementById("choiceArea")
       .innerHTML = "";

      document.getElementById("inputArea")
       .style.display = "none";

      document.getElementById("message")
       .textContent =
       "おめでとう！";

      currentQuestion = null;

      document.getElementById("endButtons")
        .style.display = "block";

      return;
    }

    currentWords = [...retryWords];
    retryWords = [];
  }

  const index =
    Math.floor(
      Math.random() * currentWords.length
    );

  currentQuestion =
    currentWords.splice(index, 1)[0];

  showQuestion();
}

function showQuestion() {

  document.getElementById("message")
    .textContent = "";

  if (currentMode === "choice") {

    showChoiceQuestion();

  } else {

    showInputQuestion();
  }
}

function showChoiceQuestion() {

  document.getElementById("inputArea")
    .style.display = "none";

  document.getElementById("question")
    .textContent =
    currentQuestion.english;

  const choices =
    [currentQuestion.japanese];

  while (choices.length < 4) {

    const randomWord =
      allWords[
        Math.floor(
          Math.random() * allWords.length
        )
      ];

    if (
      !choices.includes(
        randomWord.japanese
      )
    ) {
      choices.push(
        randomWord.japanese
      );
    }
  }

  choices.sort(() => Math.random() - 0.5);

  const area =
    document.getElementById("choiceArea");

  area.innerHTML = "";

  choices.forEach(choice => {

    const button =
      document.createElement("button");

    button.textContent = choice;

    button.onclick = () =>
      checkChoiceAnswer(choice);

    area.appendChild(button);
  });
}

function showInputQuestion() {

  document.getElementById("choiceArea")
    .innerHTML = "";

  document.getElementById("inputArea")
    .style.display = "block";

  document.getElementById("question")
    .textContent =
    currentQuestion.japanese;
}

function checkChoiceAnswer(choice) {

  if (!currentQuestion) return;  

  if (
    choice === currentQuestion.japanese
  ) {

    streak++;

    let gain = 1;

    if (streak >= 10) {
      gain += 5;
    }
    else if (streak >= 5) {
      gain += 2;
    }
    else if (streak >= 3) {
      gain += 1;
    }

    gain = Math.min(gain, 3);

    addExp(gain);

    document.getElementById("message")
       .textContent =
      `⭕ 正解 +${gain}EXP`;

  } else {

    retryWords.push(currentQuestion);

    streak = 0;

    updateStatus();

    document.getElementById("message")
      .textContent =
      "❌ 不正解";
  }

  setTimeout(nextQuestion, 800);
}

function checkInputAnswer() {
   
  if (!currentQuestion) return;  

  const answer =
    document.getElementById("answerInput")
      .value
      .trim()
      .toLowerCase();

  document.getElementById("answerInput")
    .value = "";

  if (
    answer ===
    currentQuestion.english
      .toLowerCase()
  ) {

    streak++;

    let gain = 1;

    if (streak >= 10) {
      gain += 5;
    }
    else if (streak >= 5) {
      gain += 2;
    }
    else if (streak >= 3) {
      gain += 1;
    }

    gain = Math.min(gain, 3);

    addExp(gain);

    document.getElementById("message")
      .textContent =
      `⭕ 正解 +${gain}EXP`;

} else {

  retryWords.push(currentQuestion);

  streak = 0;

  updateStatus();

  document.getElementById("message")
    .textContent =
    `❌ 正解: ${currentQuestion.english}`;
}

  setTimeout(nextQuestion, 1000);
}

function updateStatus() {

  document.getElementById("exp").textContent =
    totalExp;

  document.getElementById("streak").textContent =
    streak;

  const currentStage =
    stages[level - 1];

  document.getElementById(
     "currentTitle"
  ).textContent =
     currentStage.title;

  const totalExpElement =
  document.getElementById(
    "totalExpDisplay"
  );

  if (totalExpElement) {

    totalExpElement.textContent =
      "総EXP: " + totalExp;

  }

  document.getElementById("teacherImage")
  .src = currentStage.image;

  const titleImage =
    document.getElementById(
      "titleCharacterImage"
    );

  if(titleImage){

    titleImage.src =
      currentStage.image;

  }

  document.getElementById("stageText")
    .textContent = currentStage.title;

}

function addExp(amount){

  totalExp += amount;

  exp += amount;

  while(exp >= MAX_EXP){

    exp -= MAX_EXP;

    if(level < stages.length){

      level++;

      alert(
        `${stages[level - 1].title}に成長した！`
      );
    }
  }

  saveGame();

  updateStatus();
}

function saveGame(){

  localStorage.setItem(
    "teacherQuestSave",

    JSON.stringify({
      level,
      exp,
      totalExp
    })
  );
}

function loadSave(){

  const save =
    localStorage.getItem(
      "teacherQuestSave"
    );

  if(!save) return;

  const data =
    JSON.parse(save);

  level = data.level || 1;
  exp = data.exp || 0;
  totalExp = data.totalExp || 0;
}

function playAgain() {

  document.getElementById("endButtons")
    .style.display = "none";

  const selectedUnit =
    document.getElementById(
      "unitSelect"
    ).value;

  currentWords =
    allWords.filter(
      w => w.unit === selectedUnit
    );

  retryWords = [];

  streak = 0;

  updateStatus();

  nextQuestion();
}

function backToTitle() {

  document.getElementById("endButtons")
    .style.display = "none";

  document.getElementById("gameScreen")
    .style.display = "none";

  document.getElementById("startScreen")
    .style.display = "block";
}

function resetGame() {

  const result = confirm(
    "育成データを初期化しますか？"
  );

  if (!result) return;

  localStorage.removeItem(
    "teacherQuestSave"
  );

  level = 1;
  exp = 0;
  totalExp = 0;
  streak = 0;

   localStorage.removeItem(
      "teacherQuestSave"
   );

  updateStatus();

  alert("初期化しました");
}

loadWords();