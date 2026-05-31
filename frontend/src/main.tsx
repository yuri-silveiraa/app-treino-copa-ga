import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Navigate, RouterProvider, createBrowserRouter } from "react-router-dom";
import { Layout } from "./components/Layout";
import { PrivateRoute } from "./components/PrivateRoute";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { MyErrorsPage } from "./pages/MyErrorsPage";
import { RankingPage } from "./pages/RankingPage";
import { SimulationPage } from "./pages/SimulationPage";
import { TrainingPage } from "./pages/TrainingPage";
import { TrainingSessionPage } from "./pages/TrainingSessionPage";
import "./styles.css";

const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/dashboard" replace /> },
  { path: "/login", element: <LoginPage /> },
  {
    element: <PrivateRoute />,
    children: [
      {
        element: <Layout />,
        children: [
          { path: "/dashboard", element: <DashboardPage /> },
          { path: "/treino", element: <TrainingPage /> },
          { path: "/treino/:tema", element: <TrainingSessionPage /> },
          { path: "/simulado", element: <SimulationPage /> },
          { path: "/meus-erros", element: <MyErrorsPage /> },
          { path: "/ranking", element: <RankingPage /> },
        ],
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
);
