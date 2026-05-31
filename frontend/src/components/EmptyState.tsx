import { Link } from "react-router-dom";

export function EmptyState({ message }: { message: string }) {
  return (
    <section className="empty-state">
      <h2>{message}</h2>
      <Link className="button" to="/dashboard">
        Voltar ao dashboard
      </Link>
    </section>
  );
}
