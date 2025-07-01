import type { RouteObject } from "react-router";
import { ProtectedRoute } from "../components/helpers/protected-route";
import { About } from "../pages/about/about";
import { Registration } from "../pages/registration/registration";
import { Home } from "../pages/home";
import { MainLayout } from "../pages/main/layout";

const authRoutes: RouteObject[] = [
  {
    path: "about",
    children: [
      {
        path: "",
        element: <About.First />,
      },
      { path: "second", element: <About.Second /> },
      {
        path: "policy",
        children: [
          { path: "", element: <About.Policy.First /> },
          { path: "decline", element: <About.Policy.Decline /> },
          { path: "read", element: <About.Policy.Read /> },
        ],
      },
    ],
  },
];

export const routes: RouteObject[] = [
  { path: "registration", element: <Registration /> },
  ...authRoutes,
  {
    path: "",
    element: <ProtectedRoute />,
    children: [
      {
        path: "",
        element: <MainLayout />,
        children: [
          {
            path: "",
            element: <Home />,
          },
          {
            path: "players",
            element: <div>Players</div>,
          },
          { path: "league", element: <div>League</div> },
          { path: "profile", element: <div>Profile</div> },
        ],
      },
    ],
  },
];
