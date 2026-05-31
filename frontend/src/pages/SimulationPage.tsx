import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { EmptyState } from "../components/EmptyState";
import { QuestionCard } from "../components/QuestionCard";
import { api } from "../services/api";
import { Alternative, Question, SimulationResult } from "../types/api";
import { formatMs } from "../utils/format";

type SimulationAnswer = {
  questionId: number;
  selectedAlternativeId: number;
  responseTimeMs: number;
};

export function SimulationPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [questionStartedAt, setQuestionStartedAt] = useState(Date.now());
  const [simulationStartedAt, setSimulationStartedAt] = useState(Date.now());
  const [questionElapsed, setQuestionElapsed] = useState(0);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [answers, setAnswers] = useState<SimulationAnswer[]>([]);
  const [feedback, setFeedback] = useState<{
    isCorrect: boolean;
    correctId: number | null;
  } | null>(null);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const currentQuestion = questions[index];

  useEffect(() => {
    api
      .simulationQuestions()
      .then((response) => {
        setQuestions(response.questions);
        setMessage(response.message ?? "");
        setQuestionStartedAt(Date.now());
        setSimulationStartedAt(Date.now());
      })
      .catch((err) => setMessage(err instanceof Error ? err.message : "Erro ao carregar"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setQuestionElapsed(Date.now() - questionStartedAt);
      setTotalElapsed(Date.now() - simulationStartedAt);
    }, 250);
    return () => window.clearInterval(interval);
  }, [questionStartedAt, simulationStartedAt]);

  function handleSelect(alternative: Alternative) {
    if (!currentQuestion || feedback || submitting) {
      return;
    }

    setSelectedId(alternative.id);
    setError("");
  }

  async function confirmAnswer() {
    if (!currentQuestion || !selectedId || feedback || submitting) {
      return;
    }

    const responseTimeMs = Date.now() - questionStartedAt;
    setSubmitting(true);
    setError("");

    try {
      const response = await api.checkAnswer({
        questionId: currentQuestion.id,
        selectedAlternativeId: selectedId,
      });

      setAnswers((current) => [
        ...current,
        {
          questionId: currentQuestion.id,
          selectedAlternativeId: selectedId,
          responseTimeMs,
        },
      ]);
      setFeedback({
        isCorrect: response.isCorrect,
        correctId: response.correctAlternative?.id ?? null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao confirmar resposta");
    } finally {
      setSubmitting(false);
    }
  }

  async function goNext() {
    setError("");

    if (index < questions.length - 1) {
      setIndex((current) => current + 1);
      setSelectedId(null);
      setFeedback(null);
      setQuestionStartedAt(Date.now());
      setQuestionElapsed(0);
      return;
    }

    try {
      const response = await api.finishSimulation({
        answers,
        totalTimeMs: Date.now() - simulationStartedAt,
      });
      setResult(response.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao finalizar simulado");
    }
  }

  if (loading) {
    return <p>Carregando...</p>;
  }

  if (questions.length === 0 && !result) {
    return <EmptyState message={message || "Nenhuma questão cadastrada ainda"} />;
  }

  if (result) {
    return (
      <section className="page-stack">
        <div>
          <p className="eyebrow">Resultado do simulado</p>
          <h1>{result.correctAnswers} acertos</h1>
        </div>

        <div className="stats-grid">
          <article className="stat-card">
            <span>Acertos</span>
            <strong>{result.correctAnswers}</strong>
          </article>
          <article className="stat-card">
            <span>Erros</span>
            <strong>{result.wrongAnswers}</strong>
          </article>
          <article className="stat-card">
            <span>Tempo total</span>
            <strong>{formatMs(result.totalTimeMs)}</strong>
          </article>
          <article className="stat-card">
            <span>Percentual</span>
            <strong>{result.accuracyPercent}%</strong>
          </article>
        </div>

        <section className="list-section">
          <h2>Questões erradas</h2>
          {result.wrongQuestions.length === 0 ? (
            <p>Nenhum erro neste simulado.</p>
          ) : (
            result.wrongQuestions.map((question) => (
              <article className="error-card" key={question.questionId}>
                <span>{question.theme}</span>
                <h3>{question.statement}</h3>
                <p>Sua resposta: {question.selectedAnswer}</p>
                <p>Resposta correta: {question.correctAnswer}</p>
                <p>{question.explanation}</p>
              </article>
            ))
          )}
        </section>

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
          <p className="eyebrow">Simulado oficial</p>
          <h1>
            Questão {index + 1} de {questions.length}
          </h1>
        </div>
        <div className="timers">
          <strong>Questão: {formatMs(questionElapsed)}</strong>
          <strong>Total: {formatMs(totalElapsed)}</strong>
        </div>
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
        <section className={feedback.isCorrect ? "feedback compact ok" : "feedback compact wrong"}>
          <h2>{feedback.isCorrect ? "Resposta correta" : "Resposta incorreta"}</h2>
          <button onClick={goNext}>
            {index === questions.length - 1 ? "Finalizar simulado" : "Próxima"}
          </button>
        </section>
      ) : (
        <button disabled={!selectedId || submitting} onClick={confirmAnswer}>
          {submitting ? "Confirmando..." : "Confirmar resposta"}
        </button>
      )}
    </section>
  );
}
