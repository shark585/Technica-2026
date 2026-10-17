"use client";

import { useEffect, useState } from "react";
import data from "./database.json";

type Row = {
  language: string;
  short_title: string;
  published_version_of_question: string;
  human_wrong_percentage: number;
  option_a: string;
  option_a_correctness: number;
  option_b: string;
  option_b_correctness: number;
  option_c: string;
  option_c_correctness: number;
};

type Option = { text: string; correct: boolean };
type Quiz = { title: string; text: string; wrongPct: number; options: Option[] };

const COUNT = 10;

function shuffle<T>(array: T[]): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function toQuiz(row: Row): Quiz {
  const options: Option[] = [
    { text: row.option_a, correct: row.option_a_correctness === 1 },
    { text: row.option_b, correct: row.option_b_correctness === 1 },
    { text: row.option_c, correct: row.option_c_correctness === 1 },
  ].filter((o) => o.text); // skip missing options

  return {
    title: row.short_title,
    text: row.published_version_of_question,
    wrongPct: row.human_wrong_percentage,
    options: shuffle(options),
  };
}

export default function Page() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  const start = () => {
    const rows = (data as unknown as Row[]).filter(
      (r) => r.language === "en-US" && r.published_version_of_question
    );
    setQuizzes(shuffle(rows).slice(0, COUNT).map(toQuiz));
    setIndex(0);
    setPicked(null);
    setScore(0);
  };

  // Shuffle after mount so server and client HTML match
  useEffect(() => {
    start();
  }, []);

  if (quizzes.length === 0) return <main style={{ padding: 24 }}>Loading...</main>;

  if (index >= quizzes.length) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Done!</h1>
        <p>
          You got {score} of {quizzes.length} right.
        </p>
        <button onClick={start}>Try again</button>
      </main>
    );
  }

  const quiz = quizzes[index];
  const answered = picked !== null;

  const choose = (i: number) => {
    if (answered) return;
    setPicked(i);
    if (quiz.options[i].correct) setScore((s) => s + 1);
  };

  const next = () => {
    setPicked(null);
    setIndex((i) => i + 1);
  };

  const colorFor = (i: number) => {
    if (!answered) return undefined;
    if (quiz.options[i].correct) return "#c8f7c5"; // right answer
    if (i === picked) return "#f7c5c5"; // your wrong pick
    return undefined;
  };

  return (
    <main style={{ padding: 24, maxWidth: 600 }}>
      <p>
        Question {index + 1} of {quizzes.length}
      </p>
      <h2>{quiz.title}</h2>
      <p>{quiz.text}</p>

      <div style={{ display: "grid", gap: 8 }}>
        {quiz.options.map((o, i) => (
          <button
            key={i}
            onClick={() => choose(i)}
            disabled={answered}
            style={{
              padding: 12,
              textAlign: "left",
              background: colorFor(i) ?? "#fff",
              color: "#000",
              border: "1px solid #999",
              borderRadius: 6,
            }}
          >
            {o.text}
          </button>
        ))}
      </div>

      {answered && (
        <>
          <p>
            {quiz.options[picked].correct ? "Correct!" : "Not quite."}{" "}
            {quiz.wrongPct}% of people get this one wrong.
          </p>
          <button onClick={next}>
            {index + 1 === quizzes.length ? "See results" : "Next"}
          </button>
        </>
      )}
    </main>
  );
}