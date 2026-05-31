import { useEffect, useState } from "react";
import { api } from "../services/api";
import { RankingItem } from "../types/api";
import { formatMs } from "../utils/format";

export function RankingPage() {
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .ranking()
      .then((response) => {
        setRanking(response.ranking);
        setMessage(response.message ?? "");
      })
      .catch((error) => setMessage(error instanceof Error ? error.message : "Erro ao carregar"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p>Carregando...</p>;
  }

  return (
    <section className="page-stack">
      <div>
        <p className="eyebrow">Classificação geral</p>
        <h1>Ranking</h1>
      </div>

      {ranking.length === 0 ? (
        <p className="muted">{message || "Nenhum simulado oficial foi feito ainda"}</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Posição</th>
                <th>Usuário</th>
                <th>Simulados</th>
                <th>Melhor resultado</th>
                <th>Tempo</th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((item) => (
                <tr key={item.userId}>
                  <td>{item.position}</td>
                  <td>{item.name}</td>
                  <td>{item.simulationsCount}</td>
                  <td>
                    {item.bestCorrectAnswers}/{item.bestTotalQuestions}
                  </td>
                  <td>{formatMs(item.bestTotalTimeMs)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
