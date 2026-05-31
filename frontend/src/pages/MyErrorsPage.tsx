import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { MyErrorsGroup } from "../types/api";

export function MyErrorsPage() {
  const [groups, setGroups] = useState<MyErrorsGroup[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .myErrors()
      .then((response) => {
        setGroups(response.groups);
        setMessage(response.message ?? "");
      })
      .catch((error) => setMessage(error instanceof Error ? error.message : "Erro ao carregar"))
      .finally(() => setLoading(false));
  }, []);

  const questionIds = useMemo(
    () => groups.flatMap((group) => group.errors.map((error) => error.questionId)),
    [groups],
  );

  function trainAgain() {
    navigate("/treino/meus-erros", { state: { questionIds } });
  }

  if (loading) {
    return <p>Carregando...</p>;
  }

  return (
    <section className="page-stack">
      <div className="session-header">
        <div>
          <p className="eyebrow">Histórico individual</p>
          <h1>Meus erros</h1>
        </div>
        <button disabled={questionIds.length === 0} onClick={trainAgain}>
          Treinar novamente meus erros
        </button>
      </div>

      {groups.length === 0 ? (
        <p className="muted">{message || "Você ainda não possui erros registrados"}</p>
      ) : (
        groups.map((group) => (
          <section className="list-section" key={group.theme}>
            <h2>{group.theme}</h2>
            {group.errors.map((error) => (
              <article className="error-card" key={error.questionId}>
                <h3>{error.statement}</h3>
                <p>Sua resposta: {error.selectedAnswer}</p>
                <p>Resposta correta: {error.correctAnswer}</p>
                <p>{error.explanation}</p>
                <span>Erros nessa questão: {error.wrongCount}</span>
              </article>
            ))}
          </section>
        ))
      )}
    </section>
  );
}
