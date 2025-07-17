package pg

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"math/rand"

	sq "github.com/Masterminds/squirrel"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/shampsdev/go-telegram-template/pkg/domain"
)

type EventRepo struct {
	db   *pgxpool.Pool
	psql sq.StatementBuilderType
	rand *rand.Rand
}

var letterRunes = []rune("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ")

func (r *EventRepo) generateID(eventType domain.EventType) string {
	var prefix string
	switch eventType {
	case domain.EventTypeGame:
		prefix = "game-"
	case domain.EventTypeTournament:
		prefix = "tour-"
	case domain.EventTypeTraining:
		prefix = "train-"
	default:
		prefix = "event-"
	}

	b := make([]rune, 10)
	for i := range b {
		b[i] = letterRunes[r.rand.Intn(len(letterRunes))]
	}
	return prefix + string(b)
}

func NewEventRepo(db *pgxpool.Pool) *EventRepo {
	return &EventRepo{
		db:   db,
		psql: sq.StatementBuilder.PlaceholderFormat(sq.Dollar),
		rand: rand.New(rand.NewSource(rand.Int63())),
	}
}

func (r *EventRepo) Create(ctx context.Context, event *domain.CreateEvent) (string, error) {
	id := r.generateID(event.Type)
	
	s := r.psql.Insert(`"event"`).
		Columns("id", "name", "description", "start_time", "end_time", "rank_min", "rank_max", "price", "max_users", "type", "court_id", "organizer_id", "club_id", "data").
		Values(id, event.Name, event.Description, event.StartTime, event.EndTime, event.RankMin, event.RankMax, event.Price, event.MaxUsers, event.Type, event.CourtID, event.OrganizerID, event.ClubID, event.Data)

	sql, args, err := s.ToSql()
	if err != nil {
		return "", fmt.Errorf("failed to build SQL: %w", err)
	}

	_, err = r.db.Exec(ctx, sql, args...)
	if err != nil {
		return "", fmt.Errorf("failed to create event: %w", err)
	}

	return id, nil
}

func (r *EventRepo) Filter(ctx context.Context, filter *domain.FilterEvent) ([]*domain.Event, error) {
	s := r.psql.Select(
		`"e"."id"`, `"e"."name"`, `"e"."description"`, `"e"."start_time"`, `"e"."end_time"`, `"e"."rank_min"`, `"e"."rank_max"`,
		`"e"."price"`, `"e"."max_users"`, `"e"."status"`, `"e"."type"`, `"e"."club_id"`, `"e"."data"`, `"e"."created_at"`, `"e"."updated_at"`,
		`"c"."id"`, `"c"."name"`, `"c"."address"`,
		`"u"."id"`, `"u"."telegram_id"`, `"u"."telegram_username"`, `"u"."first_name"`, `"u"."last_name"`, `"u"."avatar"`,
		`"u"."bio"`, `"u"."rank"`, `"u"."city"`, `"u"."birth_date"`, `"u"."playing_position"`, `"u"."padel_profiles"`, `"u"."is_registered"`,
		`COUNT(CASE WHEN "r"."status" IN ('PENDING', 'CONFIRMED') THEN 1 END) AS active_registrations`,
	).
		From(`"event" AS e`).
		Join(`"courts" AS c ON "e"."court_id" = "c"."id"`).
		Join(`"users" AS u ON "e"."organizer_id" = "u"."id"`).
		LeftJoin(`"registrations" AS r ON "e"."id" = "r"."event_id"`).
		GroupBy(`"e"."id"`, `"c"."id"`, `"u"."id"`)

	if filter.ID != nil {
		s = s.Where(sq.Eq{`"e"."id"`: *filter.ID})
	}

	if filter.Name != nil {
		s = s.Where(sq.ILike{`"e"."name"`: "%" + *filter.Name + "%"})
	}

	if filter.Status != nil {
		s = s.Where(sq.Eq{`"e"."status"`: *filter.Status})
	}

	if filter.Type != nil {
		s = s.Where(sq.Eq{`"e"."type"`: *filter.Type})
	}

	if filter.OrganizerID != nil {
		s = s.Where(sq.Eq{`"e"."organizer_id"`: *filter.OrganizerID})
	}

	if filter.ClubID != nil {
		s = s.Where(sq.Eq{`"e"."club_id"`: *filter.ClubID})
	}

	if filter.NotFull != nil && *filter.NotFull {
		s = s.Having(`COUNT(CASE WHEN "r"."status" IN ('PENDING', 'CONFIRMED') THEN 1 END) < "e"."max_users"`)
	}

	if filter.NotCompleted != nil && *filter.NotCompleted {
		s = s.Where(sq.NotEq{`"e"."status"`: domain.EventStatusCompleted})
	}

	// Фильтрация по клубам пользователя
	if filter.FilterByUserClubs != nil {
		s = s.Join(`"clubs_users" AS cu ON "e"."club_id" = "cu"."club_id"`).
			Where(sq.Eq{`"cu"."user_id"`: *filter.FilterByUserClubs})
	}

	s = s.OrderBy(`"e"."start_time" DESC`)

	sql, args, err := s.ToSql()
	if err != nil {
		return nil, fmt.Errorf("failed to build SQL: %w", err)
	}

	rows, err := r.db.Query(ctx, sql, args...)
	if errors.Is(err, pgx.ErrNoRows) {
		return []*domain.Event{}, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to execute SQL: %w", err)
	}
	defer rows.Close()

	events := []*domain.Event{}
	for rows.Next() {
		event, err := r.scanEvent(rows)
		if err != nil {
			return nil, err
		}
		events = append(events, event)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating rows: %w", err)
	}

	return events, nil
}

func (r *EventRepo) GetEventsByUserID(ctx context.Context, userID string) ([]*domain.Event, error) {
	s := r.psql.Select(
		`"e"."id"`, `"e"."name"`, `"e"."description"`, `"e"."start_time"`, `"e"."end_time"`, `"e"."rank_min"`, `"e"."rank_max"`,
		`"e"."price"`, `"e"."max_users"`, `"e"."status"`, `"e"."type"`, `"e"."club_id"`, `"e"."data"`, `"e"."created_at"`, `"e"."updated_at"`,
		`"c"."id"`, `"c"."name"`, `"c"."address"`,
		`"u"."id"`, `"u"."telegram_id"`, `"u"."telegram_username"`, `"u"."first_name"`, `"u"."last_name"`, `"u"."avatar"`,
		`"u"."bio"`, `"u"."rank"`, `"u"."city"`, `"u"."birth_date"`, `"u"."playing_position"`, `"u"."padel_profiles"`, `"u"."is_registered"`,
		`COUNT(CASE WHEN "r"."status" IN ('PENDING', 'CONFIRMED') THEN 1 END) AS active_registrations`,
	).
		From(`"event" AS e`).
		Join(`"courts" AS c ON "e"."court_id" = "c"."id"`).
		Join(`"users" AS u ON "e"."organizer_id" = "u"."id"`).
		LeftJoin(`"registrations" AS r ON "e"."id" = "r"."event_id"`).
		Join(`"registrations" AS ur ON "e"."id" = "ur"."event_id" AND "ur"."user_id" = ?`, userID).
		GroupBy(`"e"."id"`, `"c"."id"`, `"u"."id"`)

	s = s.OrderBy(`"e"."start_time" DESC`)

	sql, args, err := s.ToSql()
	if err != nil {
		return nil, fmt.Errorf("failed to build SQL: %w", err)
	}

	rows, err := r.db.Query(ctx, sql, args...)
	if errors.Is(err, pgx.ErrNoRows) {
		return []*domain.Event{}, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to execute SQL: %w", err)
	}
	defer rows.Close()

	events := []*domain.Event{}
	for rows.Next() {
		event, err := r.scanEvent(rows)
		if err != nil {
			return nil, err
		}
		events = append(events, event)
	}

	return events, nil
}

func (r *EventRepo) Patch(ctx context.Context, id string, event *domain.PatchEvent) error {
	s := r.psql.Update(`"event"`).Where(sq.Eq{"id": id})

	hasUpdates := false

	if event.Name != nil {
		s = s.Set("name", *event.Name)
		hasUpdates = true
	}

	if event.Description != nil {
		s = s.Set("description", *event.Description)
		hasUpdates = true
	}

	if event.StartTime != nil {
		s = s.Set("start_time", *event.StartTime)
		hasUpdates = true
	}

	if event.EndTime != nil {
		s = s.Set("end_time", *event.EndTime)
		hasUpdates = true
	}

	if event.RankMin != nil {
		s = s.Set("rank_min", *event.RankMin)
		hasUpdates = true
	}

	if event.RankMax != nil {
		s = s.Set("rank_max", *event.RankMax)
		hasUpdates = true
	}

	if event.Price != nil {
		s = s.Set("price", *event.Price)
		hasUpdates = true
	}

	if event.MaxUsers != nil {
		s = s.Set("max_users", *event.MaxUsers)
		hasUpdates = true
	}

	if event.Status != nil {
		s = s.Set("status", *event.Status)
		hasUpdates = true
	}

	if event.Type != nil {
		s = s.Set("type", *event.Type)
		hasUpdates = true
	}

	if event.CourtID != nil {
		s = s.Set("court_id", *event.CourtID)
		hasUpdates = true
	}

	if event.ClubID != nil {
		s = s.Set("club_id", *event.ClubID)
		hasUpdates = true
	}

	if event.Data != nil {
		s = s.Set("data", event.Data)
		hasUpdates = true
	}

	if !hasUpdates {
		return fmt.Errorf("no fields to update")
	}

	s = s.Set("updated_at", "NOW()")

	sql, args, err := s.ToSql()
	if err != nil {
		return fmt.Errorf("failed to build SQL: %w", err)
	}

	result, err := r.db.Exec(ctx, sql, args...)
	if err != nil {
		return fmt.Errorf("failed to update event: %w", err)
	}

	if result.RowsAffected() == 0 {
		return fmt.Errorf("event with id %s not found", id)
	}

	return nil
}

func (r *EventRepo) Delete(ctx context.Context, id string) error {
	s := r.psql.Delete(`"event"`).Where(sq.Eq{"id": id})

	sql, args, err := s.ToSql()
	if err != nil {
		return fmt.Errorf("failed to build SQL: %w", err)
	}

	result, err := r.db.Exec(ctx, sql, args...)
	if err != nil {
		return fmt.Errorf("failed to delete event: %w", err)
	}

	if result.RowsAffected() == 0 {
		return fmt.Errorf("event with id %s not found", id)
	}

	return nil
}

// Админские методы

func (r *EventRepo) AdminFilter(ctx context.Context, filter *domain.AdminFilterEvent) ([]*domain.Event, error) {
	s := r.psql.Select(
		`"e"."id"`, `"e"."name"`, `"e"."description"`, `"e"."start_time"`, `"e"."end_time"`, `"e"."rank_min"`, `"e"."rank_max"`,
		`"e"."price"`, `"e"."max_users"`, `"e"."status"`, `"e"."type"`, `"e"."club_id"`, `"e"."data"`, `"e"."created_at"`, `"e"."updated_at"`,
		`"c"."id"`, `"c"."name"`, `"c"."address"`,
		`"u"."id"`, `"u"."telegram_id"`, `"u"."telegram_username"`, `"u"."first_name"`, `"u"."last_name"`, `"u"."avatar"`,
		`"u"."bio"`, `"u"."rank"`, `"u"."city"`, `"u"."birth_date"`, `"u"."playing_position"`, `"u"."padel_profiles"`, `"u"."is_registered"`,
		`COUNT(CASE WHEN "r"."status" IN ('PENDING', 'CONFIRMED') THEN 1 END) AS active_registrations`,
	).
		From(`"event" AS e`).
		Join(`"courts" AS c ON "e"."court_id" = "c"."id"`).
		Join(`"users" AS u ON "e"."organizer_id" = "u"."id"`).
		LeftJoin(`"registrations" AS r ON "e"."id" = "r"."event_id"`).
		GroupBy(`"e"."id"`, `"c"."id"`, `"u"."id"`)

	if filter.ID != nil {
		s = s.Where(sq.Eq{`"e"."id"`: *filter.ID})
	}

	if filter.Name != nil {
		s = s.Where(sq.ILike{`"e"."name"`: "%" + *filter.Name + "%"})
	}

	if filter.Status != nil {
		s = s.Where(sq.Eq{`"e"."status"`: *filter.Status})
	}

	if filter.Type != nil {
		s = s.Where(sq.Eq{`"e"."type"`: *filter.Type})
	}

	if filter.ClubID != nil {
		s = s.Where(sq.Eq{`"e"."club_id"`: *filter.ClubID})
	}

	if filter.OrganizerID != nil {
		s = s.Where(sq.Eq{`"e"."organizer_id"`: *filter.OrganizerID})
	}

	if filter.OrganizerTelegramID != nil {
		s = s.Where(sq.Eq{`"u"."telegram_id"`: *filter.OrganizerTelegramID})
	}

	if filter.OrganizerFirstName != nil {
		s = s.Where(sq.ILike{`"u"."first_name"`: "%" + *filter.OrganizerFirstName + "%"})
	}

	if filter.ClubName != nil {
		s = s.Join(`"clubs" AS cl ON "e"."club_id" = "cl"."id"`).
			Where(sq.ILike{`"cl"."name"`: "%" + *filter.ClubName + "%"})
	}

	s = s.OrderBy(`"e"."start_time" DESC`)

	sql, args, err := s.ToSql()
	if err != nil {
		return nil, fmt.Errorf("failed to build SQL: %w", err)
	}

	rows, err := r.db.Query(ctx, sql, args...)
	if errors.Is(err, pgx.ErrNoRows) {
		return []*domain.Event{}, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to execute SQL: %w", err)
	}
	defer rows.Close()

	events := []*domain.Event{}
	for rows.Next() {
		event, err := r.scanEvent(rows)
		if err != nil {
			return nil, err
		}
		events = append(events, event)
	}

	return events, nil
}

func (r *EventRepo) AdminPatch(ctx context.Context, id string, event *domain.AdminPatchEvent) error {
	s := r.psql.Update(`"event"`).Where(sq.Eq{"id": id})

	hasUpdates := false

	if event.Name != nil {
		s = s.Set("name", *event.Name)
		hasUpdates = true
	}

	if event.Description != nil {
		s = s.Set("description", *event.Description)
		hasUpdates = true
	}

	if event.StartTime != nil {
		s = s.Set("start_time", *event.StartTime)
		hasUpdates = true
	}

	if event.EndTime != nil {
		s = s.Set("end_time", *event.EndTime)
		hasUpdates = true
	}

	if event.RankMin != nil {
		s = s.Set("rank_min", *event.RankMin)
		hasUpdates = true
	}

	if event.RankMax != nil {
		s = s.Set("rank_max", *event.RankMax)
		hasUpdates = true
	}

	if event.Price != nil {
		s = s.Set("price", *event.Price)
		hasUpdates = true
	}

	if event.MaxUsers != nil {
		s = s.Set("max_users", *event.MaxUsers)
		hasUpdates = true
	}

	if event.Status != nil {
		s = s.Set("status", *event.Status)
		hasUpdates = true
	}

	if event.Type != nil {
		s = s.Set("type", *event.Type)
		hasUpdates = true
	}

	if event.CourtID != nil {
		s = s.Set("court_id", *event.CourtID)
		hasUpdates = true
	}

	if event.OrganizerID != nil {
		s = s.Set("organizer_id", *event.OrganizerID)
		hasUpdates = true
	}

	if event.ClubID != nil {
		s = s.Set("club_id", *event.ClubID)
		hasUpdates = true
	}

	if event.Data != nil {
		s = s.Set("data", event.Data)
		hasUpdates = true
	}

	if !hasUpdates {
		return fmt.Errorf("no fields to update")
	}

	s = s.Set("updated_at", "NOW()")

	sql, args, err := s.ToSql()
	if err != nil {
		return fmt.Errorf("failed to build SQL: %w", err)
	}

	result, err := r.db.Exec(ctx, sql, args...)
	if err != nil {
		return fmt.Errorf("failed to update event: %w", err)
	}

	if result.RowsAffected() == 0 {
		return fmt.Errorf("event with id %s not found", id)
	}

	return nil
}

func (r *EventRepo) AdminDelete(ctx context.Context, id string) error {
	return r.Delete(ctx, id)
}

// scanEvent сканирует строку результата в структуру Event
func (r *EventRepo) scanEvent(rows pgx.Rows) (*domain.Event, error) {
	var event domain.Event
	var court domain.Court
	var organizer domain.User

	var description pgtype.Text
	var clubID pgtype.Text
	var data []byte
	var telegramUsername, avatar, bio, city, padelProfiles pgtype.Text
	var birthDate pgtype.Date
	var playingPosition pgtype.Text
	var rank pgtype.Float8
	var isRegistered pgtype.Bool
	var activeRegistrations int64

	err := rows.Scan(
		&event.ID, &event.Name, &description, &event.StartTime, &event.EndTime, &event.RankMin, &event.RankMax,
		&event.Price, &event.MaxUsers, &event.Status, &event.Type, &clubID, &data, &event.CreatedAt, &event.UpdatedAt,
		&court.ID, &court.Name, &court.Address,
		&organizer.ID, &organizer.TelegramID, &telegramUsername, &organizer.FirstName, &organizer.LastName, &avatar,
		&bio, &rank, &city, &birthDate, &playingPosition, &padelProfiles, &isRegistered,
		&activeRegistrations,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to scan row: %w", err)
	}

	// Обработка nullable полей
	if description.Valid {
		event.Description = &description.String
	}

	if clubID.Valid {
		event.ClubID = &clubID.String
	}

	if len(data) > 0 {
		event.Data = json.RawMessage(data)
	}

	if telegramUsername.Valid {
		organizer.TelegramUsername = telegramUsername.String
	}
	if avatar.Valid {
		organizer.Avatar = avatar.String
	}
	if bio.Valid {
		organizer.Bio = bio.String
	}
	if rank.Valid {
		organizer.Rank = rank.Float64
	}
	if city.Valid {
		organizer.City = city.String
	}
	if birthDate.Valid {
		organizer.BirthDate = birthDate.Time.Format("2006-01-02")
	}
	if playingPosition.Valid {
		organizer.PlayingPosition = domain.PlayingPosition(playingPosition.String)
	}
	if padelProfiles.Valid {
		organizer.PadelProfiles = padelProfiles.String
	}
	if isRegistered.Valid {
		organizer.IsRegistered = isRegistered.Bool
	}

	event.Court = court
	event.Organizer = organizer

	return &event, nil
} 