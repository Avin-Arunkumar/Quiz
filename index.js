import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "world",
  password: "4599",
  port: 5432,
});

db.connect();

let quiz = [];

// Fetch quiz data properly
async function loadQuiz() {
  try {
    const res = await db.query("SELECT * FROM capitals");
    quiz = res.rows;
  } catch (err) {
    console.log("Error executing query", err.stack);
  }
}

await loadQuiz(); // Ensure quiz is loaded before usage

let totalCorrect = 0;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let currentQuestion = {};

// GET home page
app.get("/", async (req, res) => {
  totalCorrect = 0;
  await nextQuestion();
  console.log(currentQuestion);
  res.render("index.ejs", { question: currentQuestion });
});

// POST a new post
app.post("/submit", async (req, res) => {
  let answer = req.body.answer?.trim();
  let isCorrect = false;

  if (currentQuestion.capitals?.toLowerCase() === answer?.toLowerCase()) {
    totalCorrect++;
    console.log(totalCorrect);
    isCorrect = true;
  }

  await nextQuestion();
  res.render("index.ejs", {
    question: currentQuestion,
    wasCorrect: isCorrect,
    totalScore: totalCorrect,
  });
});

// Function to fetch a new question
async function nextQuestion() {
  if (quiz.length === 0) {
    console.error("No quiz data available!");
    currentQuestion = {};
    return;
  }

  const randomCountry = quiz[Math.floor(Math.random() * quiz.length)];
  currentQuestion = randomCountry;
}

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
