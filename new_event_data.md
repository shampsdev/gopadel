pattern event.data abstract
```
{
  "domain": "tournament|game|training",

  "tournament": { },
  "game": { },
  "training": { },

  "tournamentEngine": { },
  "matchEngine": { },
  "sessionEngine": { },

  "result": { }
}
```

patter event.data tournament
```
{
  "domain": "tournament",

  "tournament": {
    "format": "AMERICANO",
    "mode": "SOLO"
  },

  "tournamentEngine": {
    "config": { "matchPoints": 16, "courtsCount": 1, "roundsCount": 5 },
    "state": { "status": "IN_PROGRESS", "currentRound": 2 },
    "participants": [],
    "matches": [],
    "leaderboard": []
  },

  "result": {
    "leaderboard": []
  }
}
```

pattern event.data game
{
  "domain": "game",
}