
# Спецификация турнирных форматов Padel
## Турнирный счетчик (Americano / Mexicano)

Интегрированный счетчик для событий GoPadel · автоматический дорасчёт результатов · сохранение в БД

---

## 1. Интеграция с базой данных

### 1.1 Структура события (Event)
Турниры Паримекано создаются как события типа `tournament` со статусом `in_progress`:

```sql
-- Таблица event
id VARCHAR(255) PRIMARY KEY
name VARCHAR(255) NOT NULL
type event_type = 'tournament'
status event_status = 'in_progress'  -- Когда турнир активен
data JSONB  -- Основные данные турнира
max_users INTEGER  -- Максимальное количество участников
organizer_id UUID  -- Организатор турнира
court_id UUID  -- Корт проведения
```

### 1.2 Структура данных в JSONB поле
Все данные турнирного счетчика хранятся в поле `data`:

```json
{
  "counter": {
    "format": "AMERICANO" | "MEXICANO",
    "mode": "SOLO" | "PAIR", 
    "matchPoints": 8 | 16 | 24 | 32 | number,
    "courtsCount": number,
    "roundsCount": number,
    "currentRound": number,
    "participants": [
      {
        "id": "user_uuid",
        "name": "string",
        "rank": number,
        "seed": number,
        "stats": {
          "wins": number,
          "draws": number, 
          "losses": number,
          "scored": number,
          "conceded": number,
          "diff": number,
          "tablePoints": number,
          "wdlPoints": number
        }
      }
    ],
    "matches": [
      {
        "id": "match_uuid",
        "round": number,
        "court": number,
        "teamA": {
          "player1": "user_uuid",
          "player2": "user_uuid", 
          "score": number
        },
        "teamB": {
          "player1": "user_uuid",
          "player2": "user_uuid",
          "score": number
        },
        "status": "pending" | "in_progress" | "completed",
        "startTime": "timestamp",
        "endTime": "timestamp"
      }
    ],
    "leaderboard": [
      {
        "position": number,
        "userId": "user_uuid",
        "stats": "PlayerStats"
      }
    ]
  }
}
```

### 1.3 Связь с участниками
Участники турнира берутся из таблицы `registrations`:

```sql
-- Получение участников турнира
SELECT u.* FROM users u
JOIN registrations r ON u.id = r.user_id  
WHERE r.event_id = 'tournament_id' 
AND r.status = 'CONFIRMED'
```

## 2. Правила турнира

### 2.1 Параметры турнира
- **format**: AMERICANO | MEXICANO  
- **mode**: SOLO | PAIR  
- **matchPoints**: 8 | 16 | 24 | 32 | custom  
- **courtsCount**: 1..N (из настроек корта)
- **participants**: Подтягиваются из registrations
- **roundsCount**:
  - AMERICANO — фиксированное
  - MEXICANO — гибкое

### 2.2 Ввод счёта
Инвариант:
```
scoreA + scoreB = matchPoints
```

### 2.3 Начисление очков
SOLO:
```
O_i = очки пары игрока
```
PAIR:
```
O_i = очки команды
```

### 2.4 Таблица лидеров
Храним в `participants[].stats`:
- wins / draws / losses
- scored / conceded / diff
- tablePoints = scored
- wdlPoints = wins*2 + draws

Сортировка:
1. wdlPoints
2. diff
3. tablePoints
4. seed

---

## 3. AMERICANO

### 3.1 Суть
- Фиксированные раунды
- Максимум разнообразия партнёров
- Финальный матч 1+4 vs 2+3

### 3.2 Americano SOLO
- Игроков ≥ 4
- Кратно courtsCount*4 (MVP)
- Генерация:
  - один seed‑shuffle
  - round‑robin карусель
  - пары: (1+2) vs (3+4)

### 3.3 Americano PAIR
- Участники = команды
- Round‑robin команд

### 3.4 Финал
- Топ‑4 по таблице
- Очки финала в таблицу не идут

---

## 4. MEXICANO

### 4.1 Суть
- Раунд 1 — случайный
- Далее — строго по лидерборду
- Формула:
```
1 + 4 vs 2 + 3
```

### 4.2 Mexicano SOLO
- Перед каждым раундом сортировка таблицы
- Формирование матчей по 4 игрока подряд

### 4.3 Mexicano PAIR
- То же, но участники = команды

---

## 5. API Endpoints

### 5.1 Создание турнирного счетчика
```http
POST /api/events/{eventId}/counter/initialize
Content-Type: application/json

{
  "format": "AMERICANO" | "MEXICANO",
  "mode": "SOLO" | "PAIR",
  "matchPoints": number,
  "courtsCount": number
}
```

### 5.2 Получение состояния турнира
```http
GET /api/events/{eventId}/counter
Response: {
  "format": string,
  "currentRound": number,
  "totalRounds": number,
  "participants": ParticipantStats[],
  "matches": Match[],
  "leaderboard": LeaderboardEntry[]
}
```

### 5.3 Ввод результата матча
```http
PUT /api/events/{eventId}/counter/matches/{matchId}/score
Content-Type: application/json

{
  "teamA": { "score": number },
  "teamB": { "score": number }
}
```

### 5.4 Генерация следующего раунда
```http
POST /api/events/{eventId}/counter/next-round
Response: {
  "round": number,
  "matches": Match[]
}
```

### 5.5 Завершение турнира
```http
POST /api/events/{eventId}/counter/finish
Response: {
  "finalLeaderboard": LeaderboardEntry[],
  "winner": ParticipantStats
}
```

---

## 6. Авто‑пересчёт результатов

### 6.1 Алгоритм обновления
1. Валидация: `scoreA + scoreB = matchPoints`
2. Обновление `data.counter.matches[].teamA/B.score`
3. Пересчёт статистики участников в `data.counter.participants[].stats`
4. Обновление лидерборда в `data.counter.leaderboard`
5. Сохранение в БД: `UPDATE event SET data = ? WHERE id = ?`
6. WebSocket уведомление клиентов

### 6.2 Формулы пересчёта
```javascript
// Для каждого участника после матча
participant.stats.scored += playerScore
participant.stats.conceded += opponentScore
participant.stats.diff = scored - conceded
participant.stats.tablePoints = scored

if (playerScore > opponentScore) {
  participant.stats.wins++
  participant.stats.wdlPoints += 2
} else if (playerScore === opponentScore) {
  participant.stats.draws++
  participant.stats.wdlPoints += 1
} else {
  participant.stats.losses++
}
```

---

## 7. UI Компоненты

### 7.1 Счетчик матча (MatchScoreCard)
```typescript
interface MatchScoreCardProps {
  match: Match
  onScoreUpdate: (matchId: string, teamA: number, teamB: number) => void
  maxPoints: number
}
```

### 7.2 Таблица лидеров (Leaderboard)
```typescript
interface LeaderboardProps {
  participants: ParticipantStats[]
  format: 'AMERICANO' | 'MEXICANO'
}
```

### 7.3 Управление раундами (RoundManager)
```typescript
interface RoundManagerProps {
  currentRound: number
  totalRounds: number
  canStartNextRound: boolean
  onNextRound: () => void
  onFinishTournament: () => void
}
```

### 7.4 Сетка матчей (MatchGrid)
```typescript
interface MatchGridProps {
  matches: Match[]
  courtsCount: number
  onMatchStart: (matchId: string) => void
}
```

---

## 8. UI‑инварианты
- «Следующий раунд» активен только при заполненных счётах текущего раунда
- Таблица лидеров обновляется мгновенно после ввода счёта
- Статус события меняется на `completed` после завершения турнира
- Экспорт результатов в PNG и возможность создания нового турнира
- WebSocket обновления для всех подключенных клиентов

---

## 9. Техническая реализация

### 9.1 Backend (Go)
- Обновление существующих handlers в `server-go/pkg/handlers/event.go`
- Новые методы для работы со счетчиком в `CounterService`
- Валидация данных и бизнес-логика в `domain` слое
- WebSocket уведомления через существующую систему

### 9.2 Frontend (React/TypeScript)
- Новые компоненты в `client-new/src/components/counter/`
- Интеграция с существующей системой событий
- Real-time обновления через WebSocket
- Адаптивный дизайн для мобильных устройств

### 9.3 Admin Panel
- Панель управления турниром в `admin/src/pages/events/`
- Мониторинг прогресса турнира
- Возможность корректировки результатов

---

Документ предназначен для передачи в разработку (backend + frontend + admin).
