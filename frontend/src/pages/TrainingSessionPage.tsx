import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { EmptyState } from "../components/EmptyState";
import { QuestionCard } from "../components/QuestionCard";
import { api } from "../services/api";
import { Alternative, Question } from "../types/api";
import { formatMs } from "../utils/format";

type LocationState = {
  questionIds?: number[];
};

export function TrainingSessionPage() {
  const { tema = "" } = useParams();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const decodedTheme = decodeURIComponent(tema);
  const isErrorTraining = decodedTheme === "meus-erros";

  const [questions, setQuestions] = useState<Question[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [startedAt, setStartedAt] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{
    isCorrect: boolean;
    correctId: number | null;
    correctText: string;
    explanation: string;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const currentQuestion = questions[index];
  const finished = questions.length > 0 && index >= questions.length;

  useEffect(() => {
    async function load() {
      try {
        if (isErrorTraining) {
          const ids = state?.questionIds ?? [];
          const response = await api.questions();
          setQuestions(response.questions.filter((question) => ids.includes(question.id)));
          setMessage(ids.length === 0 ? "Você ainda não possui erros registrados" : "");
          return;
        }

        const response = await api.randomQuestions(decodedTheme, 10);
        setQuestions(response.questions);
        setMessage(response.message ?? "");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Erro ao carregar treino");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [decodedTheme, isErrorTraining, state?.questionIds]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setElapsed(Date.now() - startedAt);
    }, 250);
    return () => window.clearInterval(interval);
  }, [startedAt]);

  const title = useMemo(
    () => (isErrorTraining ? "Treino dos meus erros" : `Treino: ${decodedTheme}`),
    [decodedTheme, isErrorTraining],
  );

  function handleSelect(alternative: Alternative) {
    if (!currentQuestion || feedback) {
      return;
    }

    setSelectedId(alternative.id);
    setError("");
  }

  async function confirmAnswer() {
    if (!currentQuestion || !selectedId || feedback || submitting) {
      return;
    }

    const responseTimeMs = Date.now() - startedAt;
    setSubmitting(true);
    setError("");

    try {
      const response = await api.answer({
        questionId: currentQuestion.id,
        selectedAlternativeId: selectedId,
        responseTimeMs,
      });

      setFeedback({
        isCorrect: response.isCorrect,
        correctId: response.correctAlternative?.id ?? null,
        correctText: response.correctAlternative?.text ?? "",
        explanation: response.explanation,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao confirmar resposta");
    } finally {
      setSubmitting(false);
    }
  }

  function goNext() {
    setIndex((current) => current + 1);
    setSelectedId(null);
    setFeedback(null);
    setError("");
    setStartedAt(Date.now());
    setElapsed(0);
  }

  if (loading) {
    return <p>Carregando...</p>;
  }

  if (!currentQuestion && !finished) {
    return <EmptyState message={message || "Nenhuma questão cadastrada ainda"} />;
  }

  if (finished) {
    return (
      <section className="empty-state">
        <h2>Treino concluído</h2>
        <Link className="button" to="/dashboard">
          Voltar ao dashboard
        </Link>
      </section>
    );
  }

  return (
    <section className="page-stack">
      <div className="session-header">
        <div>
          <p className="eyebrow">{title}</p>
          <h1>
            Questão {index + 1} de {questions.length}
          </h1>
        </div>
        <strong>{formatMs(elapsed)}</strong>
      </div>

      <QuestionCard
        question={currentQuestion}
        selectedId={selectedId}
        correctAlternativeId={feedback?.correctId ?? null}
        answered={Boolean(feedback)}
        disabled={submitting}
        onSelect={handleSelect}
      />

      {error ? <p className="error">{error}</p> : null}

      {feedback ? (
        <section className={feedback.isCorrect ? "feedback ok" : "feedback wrong"}>
          <h2>{feedback.isCorrect ? "Você acertou" : "Você errou"}</h2>
          {!feedback.isCorrect ? <p>Resposta correta: {feedback.correctText}</p> : null}
          <p>{feedback.explanation}</p>
          <button onClick={goNext}>Próxima</button>
        </section>
      ) : (
        <button disabled={!selectedId || submitting} onClick={confirmAnswer}>
          {submitting ? "Confirmando..." : "Confirmar resposta"}
        </button>
      )}
    </section>
  );
}
