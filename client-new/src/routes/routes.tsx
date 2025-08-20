import type { RouteObject } from "react-router";
import { ProtectedRoute } from "../components/helpers/protected-route";
import { About } from "../pages/about/about";
import { Registration } from "../pages/registration/registration";
import { Home } from "../pages/home/home";
import { MainLayout } from "../pages/main/layout";
import { AnimatedOutlet } from "../components/helpers/animated-outlet";
import { Players } from "../pages/home/players";
import { Tournaments } from "../pages/home/tournaments";
import { Events } from "../pages/home/events";
import { Tournament } from "../pages/tournament/tournament";
import { MyProfile } from "../pages/profile/my-profile/my-profile";
import { TournamentPlayers } from "../pages/tournament/tournament-players";
import { NewEvent } from "../pages/new-event/new-event";
import { CreateTournament } from "../pages/new-event/create-tournament";
import { CreateGame } from "../pages/new-event/create-game";
import { EditProfile } from "../pages/profile/my-profile/edit";
import { UserProfile } from "../pages/profile/user-profile";
import { Loyalty } from "../pages/loyalty";
import { StartDataChecker } from "../components/helpers/startdata-checker";
import { TournamentWaitlist } from "../pages/tournament/tournament-waitlist";
import { League } from "../pages/league";
import { Games } from "../pages/home/games";
import { Trainings } from "../pages/home/trainings";
import { TournamentEdit } from "../pages/tournament/edit/tournament-edit";
import { TournamentLeaderboardEdit } from "../pages/tournament/edit/tournament-leaderboard-edit";
import { TournamentLeaderboard } from "../pages/tournament/edit/tournament-leaderboard";
import { Game } from "../pages/game/game";
import { GamePlayers } from "../pages/game/game-players";
import { GameEdit } from "../pages/game/edit/game-edit";
import { GameLeaderboardEdit } from "../pages/game/edit/game-leaderboard-edit";
import { EventsHistory } from "../pages/profile/my-profile/events-history";
import { GameLeaderboard } from "../pages/game/edit/game-leaderboard";
import { GameWaitlist } from "../pages/game/game-waitlist";
import { TournamentCalendar } from "../pages/tournament/edit/date/tournament-calendar";
import { TournamentYearMonthPick } from "../pages/tournament/edit/date/tournament-year-month-pick";
import { GameCalendar } from "../pages/game/edit/date/game-calendar";
import { GameYearMonthPick } from "../pages/game/edit/date/game-year-month-picker";
import { CreateTournamentCalendar } from "../pages/new-event/date/tournament/create-tournament-calendar";
import { CreateTournamentYearMonthPick } from "../pages/new-event/date/tournament/create-tournament-picker";
import { CreateGameCalendar } from "../pages/new-event/date/game/create-game-calendar";
import { CreateGameYearMonthPick } from "../pages/new-event/date/game/create-game-picker";

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
                    element: <Events />,
                  },
                  {
                    path: "tournaments",
                    element: <Tournaments />,
                  },
                  {
                    path: "games",
                    element: <Games />,
                  },
                  {
                    path: "training",
                    element: <Trainings />,
                  },
                ],
              },
              {
                path: "players",
                element: <Players />,
              },
              { path: "league", element: <League /> },
              {
                path: "profile",
                children: [
                  { path: "", element: <MyProfile /> },
                  { path: "edit", element: <EditProfile /> },
                  { path: ":id", element: <UserProfile /> },
                  { path: "events", element: <EventsHistory /> },
                ],
              },
              {
                path: "tournament",
                children: [
                  {
                    path: ":id",
                    children: [
                      {
                        path: "",
                        children: [
                          { path: "", element: <Tournament /> },
                          {
                            path: "edit",
                            children: [
                              {
                                path: "",
                                element: <TournamentEdit />,
                              },
                              {
                                path: "calendar",
                                element: <TournamentCalendar />,
                              },
                              {
                                path: "year-month-pick",
                                element: <TournamentYearMonthPick />,
                              },
                              {
                                path: "leaderboard",
                                element: <TournamentLeaderboardEdit />,
                              },
                            ],
                          },
                          {
                            path: "leaderboard",
                            element: <TournamentLeaderboard />,
                          },
                        ],
                      },
                      { path: "players", element: <TournamentPlayers /> },
                      { path: "waitlist", element: <TournamentWaitlist /> },
                    ],
                  },
                ],
              },
              {
                path: "game",
                children: [
                  {
                    path: ":id",

                    children: [
                      {
                        path: "",
                        children: [
                          { path: "", element: <Game /> },
                          {
                            path: "edit",
                            children: [
                              {
                                path: "",
                                element: <GameEdit />,
                              },
                              {
                                path: "calendar",
                                element: <GameCalendar />,
                              },
                              {
                                path: "year-month-pick",
                                element: <GameYearMonthPick />,
                              },
                              {
                                path: "leaderboard",
                                element: <GameLeaderboardEdit />,
                              },
                            ],
                          },
                          {
                            path: "leaderboard",
                            element: <GameLeaderboard />,
                          },
                        ],
                      },
                      { path: "players", element: <GamePlayers /> },
                      { path: "waitlist", element: <GameWaitlist /> },
                    ],
                  },
                ],
              },
              {
                path: "new-event",
                children: [
                  { path: "", element: <NewEvent /> },
                  {
                    path: "tournament",
                    children: [
                      {
                        path: "",
                        element: <CreateTournament />,
                      },
                      {
                        path: "calendar",
                        element: <CreateTournamentCalendar />,
                      },
                      {
                        path: "year-month-pick",
                        element: <CreateTournamentYearMonthPick />,
                      },
                    ],
                  },
                  {
                    path: "game",
                    children: [
                      {
                        path: "",
                        element: <CreateGame />,
                      },
                      { path: "calendar", element: <CreateGameCalendar /> },
                      {
                        path: "year-month-pick",
                        element: <CreateGameYearMonthPick />,
                      },
                    ],
                  },
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
