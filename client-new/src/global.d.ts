declare global {
  interface Window {
    api: {
      BOT_USERNAME: string;
      API_URL: string;
      VIDEOS: {
        LEAGUE_MAIN: string;
      };
    };
  }
}

export {};
