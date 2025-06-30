import type { RouteObject } from "react-router";
import { ProtectedRoute } from "../../components/helpers/protected-route";
import { About } from "../../pages/about/about";
import { AnimatedOutlet } from "../../components/helpers/animated-outlet";
import { Registration } from "../../pages/registration/registration";

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

const mainRoutes: RouteObject[] = [
  {
    path: "",
    element: <div>Main Route</div>,
  },
];

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <AnimatedOutlet />,
    children: [
      { path: "registration", element: <Registration /> },
      ...authRoutes,
      { path: "", element: <ProtectedRoute />, children: mainRoutes },
    ],
  },
];
