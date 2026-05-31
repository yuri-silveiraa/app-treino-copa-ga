import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import { DashboardData } from "../types/api";
import { formatDecimal, formatMs } from "../utils/format";

export function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .dashboard()
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : "Erro ao carregar"));
  }, []);

  if (error) {
    return <p className="error">{error}</p>;
  }

  if (!data) {
    return <p>Carregando...</p>;
  }

  return (
    <section className="page-stack">
      <div>
        <p className="eyebrow">Olá, {data.user.name}</p>
        <h1>Dashboard</h1>
      </div>

      <div className="stats-grid">
        <article className="stat-card">
          <span>Simulados feitos</span>
          <strong>{data.totalSimulations}</strong>
        </article>
        <article className="stat-card">
          <span>Média de acertos</span>
          <strong>{formatDecimal(data.averageCorrect)}</strong>
        </article>
        <article className="stat-card">
          <span>Tempo médio</span>
          <strong>{formatMs(data.averageSimulationTimeMs)}</strong>
        </article>
        <article className="stat-card">
          <span>Tema com mais erros</span>
          <strong>{data.themeWithMostErrors ?? "-"}</strong>
        </article>
      </div>

      <div className="action-grid">
        <Link className="button" to="/treino">
          Treinar por tema
        </Link>
        <Link className="button" to="/simulado">
          Simulado oficial
        </Link>
        <Link className="button" to="/meus-erros">
          Meus erros
        </Link>
        <Link className="button" to="/ranking">
          Ranking
        </Link>
      </div>
    </section>
  );
}
