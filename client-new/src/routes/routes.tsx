import type { RouteObject } from "react-router";
import { ProtectedRoute } from "../components/helpers/protected-route";
import { About } from "../pages/about/about";
import { Registration } from "../pages/registration/registration";
import { Home } from "../pages/home/home";
import { MainLayout } from "../pages/main/layout";
import { AnimatedOutlet } from "../components/helpers/animated-outlet";
import { Players } from "../pages/home/players";
import { Tournaments } from "../pages/home/tournaments";
import { Competitions } from "../pages/home/competitions";
import { Tournament } from "../pages/tournament";

const authRoutes: RouteObject[] = [
  {
    path: "about",
    element: (
      <div className="max-w-[90%] mx-auto">
        <AnimatedOutlet />
      </div>
    ),
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
  {
    path: "registration",
    element: (
      <div className="max-w-[90%] mx-auto">
        <AnimatedOutlet />
      </div>
    ),
    children: [{ path: "", element: <Registration /> }],
  },
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
            children: [
              {
                path: "",
                element: <Competitions />,
              },
              {
                path: "tournaments",
                element: <Tournaments />,
              },
              {
                path: "games",
                element: <div>Games</div>,
              },
              {
                path: "training",
                element: <div>Training</div>,
              },
            ],
          },
          {
            path: "players",
            element: <Players />,
          },
          { path: "league", element: <div>League</div> },
          { path: "profile", element: <div>Profile</div> },
          {
            path: "tournament",
            children: [{ path: ":id", element: <Tournament /> }],
          },
        ],
      },
    ],
  },
];
