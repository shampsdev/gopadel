import type { RouteObject } from "react-router";
import { ProtectedRoute } from "../../components/routes/protected-route";

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <div>main</div>,
    children: [
      {
        path: "about",
        children: [
          {
            path: "",
          },
          { path: "second" },
          {
            path: "policy",
            children: [
              { path: "first" },
              { path: "decline" },
              { path: "read" },
            ],
          },
        ],
      },
      { path: "registration" },
      { path: "", element: <ProtectedRoute /> },
    ],
  },
];
