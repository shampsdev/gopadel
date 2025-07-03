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
import { MyProfile } from "../pages/profile/my-profile/my-profile";
import { TournamentPlayers } from "../pages/tournament-players";
import { NewEvent } from "../pages/new-event/new-event";
import { CreateTournament } from "../pages/new-event/create-tournament";
import { CreateGame } from "../pages/new-event/create-game";
import { EditProfile } from "../pages/profile/my-profile/edit";
import { UserProfile } from "../pages/profile/user-profile";
import { TournamentsHistory } from "../pages/profile/my-profile/tournaments-history";
import { Loyalty } from "../pages/loyalty";
import { StartDataChecker } from "../components/helpers/startdata-checker";

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
    path: "",
    element: <StartDataChecker />,

    children: [
      {
        path: "registration",
        element: (
          <div className="max-w-[90%] justify-between mx-auto">
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
              {
                path: "profile",
                children: [
                  { path: "", element: <MyProfile /> },
                  { path: "edit", element: <EditProfile /> },
                  { path: ":id", element: <UserProfile /> },
                  { path: "tournaments", element: <TournamentsHistory /> },
                ],
              },
              {
                path: "tournament",
                children: [
                  {
                    path: ":id",

                    children: [
                      { path: "", element: <Tournament /> },
                      { path: "players", element: <TournamentPlayers /> },
                    ],
                  },
                ],
              },
              {
                path: "new-event",
                children: [
                  { path: "", element: <NewEvent /> },
                  { path: "tournament", element: <CreateTournament /> },
                  { path: "game", element: <CreateGame /> },
                ],
              },
              {
                path: "loyalty",
                element: <Loyalty />,
              },
            ],
          },
        ],
      },
    ],
  },
];
