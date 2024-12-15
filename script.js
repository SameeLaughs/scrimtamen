let questions = [];
let selectedCategories = [];
let currentQuestionIndex = -1;
let score = 0;
let intervalId, timerId;
let currentWordIndex = 0;
let timeLeft = 30;
let buzzedWord = "";
let buzzedTimeLeft = 30;

async function loadQuestions() {
    try {
        const response = await fetch('questions.json');
        const allQuestions = await response.json();
        questions = allQuestions.filter(q => selectedCategories.includes(q.category));
        
        if (questions.length === 0) {
            alert("No questions available for the selected categories.");
            document.getElementById("categorySelection").style.display = "flex";
            document.getElementById("gameContainer").style.display = "none";
            return;
        }
        startQuestion();
    } catch (error) {
        console.error("Error loading questions:", error);
        document.getElementById("question").innerText = "There was an issue loading the questions.";
    }
}

function startGame() {
    selectedCategories = [];
    document.getElementById("myth").checked && selectedCategories.push("Myth");
    document.getElementById("language").checked && selectedCategories.push("Language");
    document.getElementById("literature").checked && selectedCategories.push("Literature");
    document.getElementById("history").checked && selectedCategories.push("History");

    if (selectedCategories.length === 0) {
        alert("Please select at least one category.");
        return;
    }

    document.getElementById("categorySelection").style.display = "none";
    document.getElementById("gameContainer").style.display = "flex";
    loadQuestions();
}

function startQuestion() {
    resetTimer();
    let newQuestionIndex;
    do {
        newQuestionIndex = Math.floor(Math.random() * questions.length);
    } while (newQuestionIndex === currentQuestionIndex);

    currentQuestionIndex = newQuestionIndex;
    currentWordIndex = 0;
    document.getElementById("question").innerText = "";  
    document.getElementById("answerInput");
    document.getElementById("submitAnswer");
    document.getElementById("buzzButton").disabled = false;
    buzzedWord = "";
    buzzedTimeLeft = 30;
    clearInterval(intervalId);
    intervalId = setInterval(revealNextWord, 300);
    timerId = setInterval(countDown, 1000);
}

function revealNextWord() {
    const words = questions[currentQuestionIndex].question.split(' ');
    if (currentWordIndex < words.length) {
        document.getElementById("question").innerText += ' ' + words[currentWordIndex];
        currentWordIndex++;
    } else {
        clearInterval(intervalId);
    }
}

document.getElementById("buzzButton").onclick = function() {
    clearInterval(intervalId);
    clearInterval(timerId);
    buzzedWord = questions[currentQuestionIndex].question.split(' ')[currentWordIndex - 1];
    buzzedTimeLeft = timeLeft;
    document.getElementById("buzzButton").disabled = true;
    document.getElementById("answerInput").style.display = 'inline';
    document.getElementById("submitAnswer").style.display = 'inline';
};

document.getElementById("submitAnswer").onclick = function() {
    checkAnswer();
};

function checkAnswer() {
    const userAnswer = document.getElementById("answerInput").value.trim().toLowerCase();
    const correctAnswer = questions[currentQuestionIndex].answer.toLowerCase();

    if (userAnswer === correctAnswer) {
        score++;
        alert("Correct!");
    } else {
        alert("Incorrect! The correct answer was: " + correctAnswer);
    }

    logAttempt(userAnswer === correctAnswer, userAnswer);
    document.getElementById("score").innerText = "Score: " + score;
    document.getElementById("answerInput").value = '';
    startQuestion();
}

function logAttempt(isCorrect, userAnswer) {
    const logEntry = {
        question: questions[currentQuestionIndex].question,
        correctAnswer: questions[currentQuestionIndex].answer,
        userAnswer,
        result: isCorrect ? "Correct" : "Incorrect",
        buzzedWord,
        buzzedTimeLeft,
        timestamp: new Date().toLocaleString()
    };

    const log = JSON.parse(localStorage.getItem("quizLog") || "[]");
    log.push(logEntry);
    localStorage.setItem("quizLog", JSON.stringify(log));
}

function viewLog() {
    const log = JSON.parse(localStorage.getItem("quizLog") || "[]");
    const logContent = document.getElementById("logContent");
    logContent.innerHTML = log.length
        ? log.map(entry => `<p><b>Question:</b> ${entry.question}<br><b>Your Answer:</b> ${entry.userAnswer}<br><b>Result:</b> ${entry.result}<br><b>Correct Answer:</b> ${entry.correctAnswer}<br><b>Buzzed Word:</b> ${entry.buzzedWord}<br><b>Time Left on Buzz:</b> ${entry.buzzedTimeLeft} seconds</p><hr>`).join('')
        : "<p>No attempts logged yet.</p>";

    document.getElementById("logModal").style.display = "flex";
}

function closeLog() {
    document.getElementById("logModal").style.display = "none";
}

document.getElementById("clearLogButton").onclick = function() {
    localStorage.removeItem("quizLog");
    alert("Log cleared.");
};

function countDown() {
    if (timeLeft > 0) {
        timeLeft--;
        document.getElementById("timeLeft").innerText = timeLeft;
    } else {
        clearInterval(intervalId);
        clearInterval(timerId);
        alert("Time's up!");
        startQuestion();
    }
}

function resetTimer() {
    clearInterval(timerId);
    timeLeft = 30;
    document.getElementById("timeLeft").innerText = timeLeft;
}

document.getElementById('modeToggleButton').onclick = function() {
    document.body.classList.toggle('dark-mode');
};
