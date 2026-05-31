import {
  AlertTriangle,
  BookOpen,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Moon,
  Sun,
  Trophy,
  X,
} from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";

const navItems = [
  { to: "/dashboard", label: "Dashboard", mobileLabel: "Início", icon: LayoutDashboard },
  { to: "/treino", label: "Treino", mobileLabel: "Treino", icon: BookOpen },
  { to: "/simulado", label: "Simulado", mobileLabel: "Simulado", icon: ClipboardList },
  { to: "/meus-erros", label: "Meus erros", mobileLabel: "Erros", icon: AlertTriangle },
  { to: "/ranking", label: "Ranking", mobileLabel: "Ranking", icon: Trophy },
];

export function Layout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  const ThemeIcon = theme === "light" ? Moon : Sun;

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Navegação principal">
        <div className="sidebar-brand">
          <span className="brand-mark">GA</span>
          <div>
            <strong>Copa GA Treino</strong>
            <span>Treino oficial</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.to} to={item.to}>
                <Icon size={18} aria-hidden="true" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <span>{user?.name}</span>
        </div>
      </aside>

      <div className="content-shell">
        <header className="topbar">
          <div>
            <strong>Copa GA Treino</strong>
            <span>{user?.name}</span>
          </div>

          <div className="topbar-actions">
            <button
              className="icon-button"
              type="button"
              onClick={toggleTheme}
              aria-label={theme === "light" ? "Ativar modo escuro" : "Ativar modo claro"}
              title={theme === "light" ? "Modo escuro" : "Modo claro"}
            >
              <ThemeIcon size={18} aria-hidden="true" />
            </button>

            <button
              className="logout-button"
              type="button"
              onClick={() => setShowLogoutConfirm(true)}
            >
              <LogOut size={17} aria-hidden="true" />
              <span>Sair</span>
            </button>
          </div>
        </header>

        <main className="container">
          <Outlet />
        </main>
      </div>

      <nav className="mobile-tabbar" aria-label="Navegação principal">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink key={item.to} to={item.to}>
              <Icon size={20} aria-hidden="true" />
              <span>{item.mobileLabel}</span>
            </NavLink>
          );
        })}
      </nav>

      {showLogoutConfirm ? (
        <div className="modal-backdrop" role="presentation">
          <section className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="logout-title">
            <button
              className="dialog-close"
              type="button"
              onClick={() => setShowLogoutConfirm(false)}
              aria-label="Fechar"
            >
              <X size={18} aria-hidden="true" />
            </button>

            <div className="dialog-icon">
              <LogOut size={22} aria-hidden="true" />
            </div>

            <h2 id="logout-title">Sair da conta?</h2>
            <p>Você precisará entrar novamente para continuar treinando.</p>

            <div className="dialog-actions">
              <button className="secondary" type="button" onClick={() => setShowLogoutConfirm(false)}>
                Cancelar
              </button>
              <button type="button" onClick={handleLogout}>
                Sair
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
