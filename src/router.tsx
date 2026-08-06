import BoviGest from "./pages/BoviGest";
import Login from "./pages/Login";
import FirebaseSetup from "./pages/FirebaseSetup";
import NotFound from "./pages/NotFound";

export const routers = [
  {
    path: "/",
    name: "app",
    element: <BoviGest />,
  },
  {
    path: "/login",
    name: "login",
    element: <Login />,
  },
  {
    path: "/firebase-setup",
    name: "firebase-setup",
    element: <FirebaseSetup />,
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
