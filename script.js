var c = confirm("WELCOME TO PETER'S QUIZ APPLICATION. Please note that this quiz is designed to test your knowledge of Biology.");

if (c == true)
  alert("Let's get started!");
    
else 
  alert("You have cancelled the quiz, please refresh the page to try again!");

// Replace with your actual Firebase config if using
const firebaseConfig = {
  apiKey: "AIzaSyBNXhy5i-uaMf266ly0mSClwEmlX740bno",
  authDomain: "quiz-leaderboard-d6165.firebaseapp.com",
  projectId: "quiz-leaderboard-d6165",
  storageBucket: "quiz-leaderboard-d6165.appspot.com",
  messagingSenderId: "916927406285",
  appId: "1:916927406285:web:73406fa4fdf8a83f87c984"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let userName = "";
let current = 0;
let score = 0;

// Sound effects
const correctSound = new Audio("https://cdn.pixabay.com/audio/2022/03/15/audio_14749413b7.mp3");
const wrongSound = new Audio("https://cdn.pixabay.com/audio/2022/03/15/audio_ebd9940bc5.mp3");

// Quiz questions
const questions = [
  {
    question: "What phylum does Jellyfish belong to?",
    options: ["Cnidaria", "Porifera", "Platyhelminthes", "Annelida"],
    answer: "Cnidaria"
  },
  {
    question: "The most successful phylum in terms of number of species is?",
    options: ["Mollusca", "Annelida", "Arthropoda", "Cnidaria"],
    answer: "Arthropoda"
  },
  {
    question: "Which phylum is associated with a notochord?",
    options: ["Echinodermata", "Chordata", "Porifera", "Cnidaria"],
    answer: "Chordata"
  },
  {
    question: "Which phylum is associated with a coelom?",
    options: ["Porifera", "Platyhelminthes", "Annelida", "Cnidaria"],
    answer: "Annelida"
  }
];

// Shuffle questions
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Start quiz
function startQuiz() {
  const nameInput = document.getElementById("name-input");
  if (nameInput.value.trim() === "") {
    alert("Please enter your name!");
    return;
  }

  userName = nameInput.value.trim();
  current = 0;
  score = 0;
  shuffle(questions);

  document.getElementById("start-screen").style.display = "none";
  document.getElementById("quiz-box").style.display = "block";
  document.getElementById("end-screen").style.display = "none";

  showQuestion();
  updateScore();
}

// Display question
function showQuestion() {
  const q = questions[current];
  document.getElementById("question").innerText = q.question;

  const buttons = document.getElementById("options").children;
  for (let i = 0; i < buttons.length; i++) {
    buttons[i].innerText = q.options[i];
    buttons[i].disabled = false;
    buttons[i].style.background = "";
  }

  document.getElementById("result").innerText = "";
  document.getElementById("next-btn").style.display = "none";
}

// Check answer
function checkAnswer(button) {
  const correct = questions[current].answer;
  const result = document.getElementById("result");

  if (button.innerText === correct) {
    result.innerText = "✅ Correct!";
    button.style.background = "#9fff9f";
    correctSound.play();
    score++;
    updateScore();
  } else {
    result.innerText = "❌ Wrong!";
    button.style.background = "#ffb3b3";
    wrongSound.play();
  }

  const btns = document.getElementById("options").children;
  for (let i = 0; i < btns.length; i++) {
    btns[i].disabled = true;
    if (btns[i].innerText === correct) {
      btns[i].style.background = "#9fff9f";
    }
  }

  document.getElementById("next-btn").style.display = "inline-block";
}

// Show next question
function nextQuestion() {
  current++;
  if (current < questions.length) {
    showQuestion();
  } else {
    showFinalScreen();
  }
}

// Update score
function updateScore() {
  document.getElementById("score").innerText = `Score: ${score}`;
}

// Emoji-based score
function getEmojiScore(score, total) {
  const percent = (score / total) * 100;
  if (percent === 100) return "🌟🌟🌟 Perfect!";
  if (percent >= 75) return "🌟🌟 Great!";
  if (percent >= 50) return "🌟 Not bad!";
  return "😢 Try Again!";
}

// Show final screen
function showFinalScreen() {
  document.getElementById("quiz-box").style.display = "none";
  document.getElementById("end-screen").style.display = "block";

  const emoji = getEmojiScore(score, questions.length);
  document.getElementById("final-score").innerHTML = `
    ${userName}, you scored <strong>${score}</strong> out of <strong>${questions.length}</strong><br>
    <span style="font-size: 24px;">${emoji}</span>
  `;

  // Save to leaderboard
  db.collection("leaderboard").add({
    name: userName,
    score: score,
    total: questions.length,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  });

  // Save to local history
  const history = JSON.parse(localStorage.getItem("quizHistory") || "[]");
  history.push({ name: userName, score, total: questions.length });
  localStorage.setItem("quizHistory", JSON.stringify(history));
}

// Restart quiz
function restartQuiz() {
  startQuiz();
}

// Load leaderboard
function loadLeaderboard() {
  db.collection("leaderboard")
    .orderBy("score", "desc")
    .limit(10)
    .get()
    .then(snapshot => {
      const list = document.getElementById("leaderboard-list");
      list.innerHTML = "";
      snapshot.forEach(doc => {
        const data = doc.data();
        const li = document.createElement("li");
        li.innerText = `${data.name}: ${data.score}/${data.total}`;
        list.appendChild(li);
      });
    });

  document.getElementById("start-screen").style.display = "none";
  document.getElementById("quiz-box").style.display = "none";
  document.getElementById("end-screen").style.display = "none";
  document.getElementById("leaderboard-screen").style.display = "block";
}

// Load personal history
function loadHistory() {
  const history = JSON.parse(localStorage.getItem("quizHistory") || "[]");
  const list = document.getElementById("history-list");
  list.innerHTML = "";
  history.forEach(entry => {
    const li = document.createElement("li");
    li.innerText = `${entry.name}: ${entry.score}/${entry.total}`;
    list.appendChild(li);
  });

  document.getElementById("start-screen").style.display = "none";
  document.getElementById("quiz-box").style.display = "none";
  document.getElementById("end-screen").style.display = "none";
  document.getElementById("history-screen").style.display = "block";
}

// Go back to home
function goHome() {
  document.getElementById("start-screen").style.display = "block";
  document.getElementById("quiz-box").style.display = "none";
  document.getElementById("end-screen").style.display = "none";
  document.getElementById("leaderboard-screen").style.display = "none";
  document.getElementById("history-screen").style.display = "none";
}
