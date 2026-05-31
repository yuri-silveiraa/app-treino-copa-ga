import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { EmptyState } from "../components/EmptyState";
import { api } from "../services/api";

export function TrainingPage() {
  const [themes, setThemes] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .themes()
      .then((response) => {
        setThemes(response.themes);
        setMessage(response.message ?? "");
      })
      .catch((error) => setMessage(error instanceof Error ? error.message : "Erro ao carregar"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p>Carregando...</p>;
  }

  if (themes.length === 0) {
    return <EmptyState message={message || "Nenhuma questão cadastrada ainda"} />;
  }

  return (
    <section className="page-stack">
      <div>
        <p className="eyebrow">Treino rápido</p>
        <h1>Escolha um tema</h1>
      </div>

      <div className="theme-grid">
        {themes.map((theme) => (
          <Link className="theme-card" key={theme} to={`/treino/${encodeURIComponent(theme)}`}>
            {theme}
          </Link>
        ))}
      </div>
    </section>
  );
}
