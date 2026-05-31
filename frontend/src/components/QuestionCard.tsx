import { Alternative, Question } from "../types/api";

type Props = {
  question: Question;
  selectedId: number | null;
  correctAlternativeId?: number | null;
  answered?: boolean;
  disabled: boolean;
  onSelect: (alternative: Alternative) => void;
};

const difficultyClass = {
  EASY: "easy",
  MEDIUM: "medium",
  HARD: "hard",
};

export function QuestionCard({
  question,
  selectedId,
  correctAlternativeId = null,
  answered = false,
  disabled,
  onSelect,
}: Props) {
  function getAlternativeClass(alternative: Alternative) {
    const classes = ["alternative"];

    if (selectedId === alternative.id) {
      classes.push("selected");
    }

    if (answered) {
      classes.push("locked");

      if (correctAlternativeId === alternative.id) {
        classes.push("correct");
      } else if (selectedId === alternative.id) {
        classes.push("incorrect");
      }
    }

    return classes.join(" ");
  }

  function handleSelect(alternative: Alternative) {
    if (disabled || answered) {
      return;
    }

    onSelect(alternative);
  }

  return (
    <article className="question-card">
      <div className="question-meta">
        <span>{question.theme}</span>
        <span className={`difficulty-badge ${difficultyClass[question.difficulty]}`}>
          {question.difficulty}
        </span>
      </div>
      <h2>{question.statement}</h2>
      <div className="alternatives">
        {question.alternatives.map((alternative) => (
          <button
            key={alternative.id}
            className={getAlternativeClass(alternative)}
            aria-disabled={disabled || answered}
            aria-pressed={selectedId === alternative.id}
            onClick={() => handleSelect(alternative)}
          >
            {alternative.text}
          </button>
        ))}
      </div>
    </article>
  );
}
