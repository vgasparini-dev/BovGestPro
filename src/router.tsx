import BoviGest from "./pages/BoviGest";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";

export const routers = [
  {
    path: "/",
    name: "app",
    element: <ProtectedRoute><BoviGest /></ProtectedRoute>,
  },
  {
    path: "/login",
    name: "login",
    element: <Login />,
  },
  /* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */
  {
    path: "*",
    name: "404",
    element: <NotFound />,
  },
];

declare global {
  interface Window {
    __routers__: typeof routers;
  }
}

window.__routers__ = routers;
