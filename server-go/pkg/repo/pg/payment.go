package pg

import (
	"context"
	"errors"
	"fmt"

	sq "github.com/Masterminds/squirrel"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/shampsdev/go-telegram-template/pkg/domain"
)

type PaymentRepo struct {
	db   *pgxpool.Pool
	psql sq.StatementBuilderType
}

func NewPaymentRepo(db *pgxpool.Pool) *PaymentRepo {
	return &PaymentRepo{
		db:   db,
		psql: sq.StatementBuilder.PlaceholderFormat(sq.Dollar),
	}
}

func (r *PaymentRepo) Create(ctx context.Context, payment *domain.CreatePayment) (string, error) {
	s := r.psql.Insert(`"payments"`).
		Columns("payment_id", "amount", "status", "payment_link", "confirmation_token", "registration_id").
		Values(payment.PaymentID, payment.Amount, payment.Status, payment.PaymentLink, payment.ConfirmationToken, payment.RegistrationID).
		Suffix("RETURNING id")

	sql, args, err := s.ToSql()
	if err != nil {
		return "", fmt.Errorf("failed to build SQL: %w", err)
	}

	var id string
	err = r.db.QueryRow(ctx, sql, args...).Scan(&id)
	return id, err
}

func (r *PaymentRepo) Filter(ctx context.Context, filter *domain.FilterPayment) ([]*domain.Payment, error) {
	s := r.psql.Select(
		`"p"."id"`, `"p"."payment_id"`, `"p"."date"`, `"p"."amount"`, `"p"."status"`,
		`"p"."payment_link"`, `"p"."confirmation_token"`, `"p"."registration_id"`,
		`"reg"."id"`, `"reg"."user_id"`, `"reg"."tournament_id"`, `"reg"."date"`, `"reg"."status"`,
		`"u"."id"`, `"u"."telegram_id"`, `"u"."telegram_username"`, `"u"."first_name"`, `"u"."last_name"`, `"u"."avatar"`,
		`"t"."id"`, `"t"."name"`, `"t"."start_time"`, `"t"."end_time"`, `"t"."price"`,
		`"t"."rank_min"`, `"t"."rank_max"`, `"t"."max_users"`, `"t"."description"`, `"t"."tournament_type"`,
	).
		From(`"payments" AS p`).
		LeftJoin(`"registrations" AS reg ON "p"."registration_id" = "reg"."id"`).
		LeftJoin(`"users" AS u ON "reg"."user_id" = "u"."id"`).
		LeftJoin(`"tournaments" AS t ON "reg"."tournament_id" = "t"."id"`)

	if filter.ID != nil {
		s = s.Where(sq.Eq{`"p"."id"`: *filter.ID})
	}

	if filter.PaymentID != nil {
		s = s.Where(sq.Eq{`"p"."payment_id"`: *filter.PaymentID})
	}

	if filter.Status != nil {
		s = s.Where(sq.Eq{`"p"."status"`: *filter.Status})
	}

	if filter.RegistrationID != nil {
		s = s.Where(sq.Eq{`"p"."registration_id"`: *filter.RegistrationID})
	}

	s = s.OrderBy(`"p"."date" DESC`)

	sql, args, err := s.ToSql()
	if err != nil {
		return nil, fmt.Errorf("failed to build SQL: %w", err)
	}

	rows, err := r.db.Query(ctx, sql, args...)
	if errors.Is(err, pgx.ErrNoRows) {
		return []*domain.Payment{}, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to execute SQL: %w", err)
	}
	defer rows.Close()

	payments := []*domain.Payment{}
	for rows.Next() {
		var payment domain.Payment
		var registration domain.Registration
		var user domain.User
		var tournament domain.Tournament

		var registrationID pgtype.Text
		var regID, regUserID, regTournamentID pgtype.Text
		var regDate pgtype.Timestamp
		var regStatus pgtype.Text

		var userID pgtype.Text
		var userTelegramID pgtype.Int8
		var userTelegramUsername, userFirstName, userLastName, userAvatar pgtype.Text

		var tournamentID pgtype.Text
		var tournamentName pgtype.Text
		var tournamentStartTime, tournamentEndTime pgtype.Timestamp
		var tournamentPrice pgtype.Int4
		var tournamentRankMin, tournamentRankMax pgtype.Float8
		var tournamentMaxUsers pgtype.Int4
		var tournamentDescription, tournamentType pgtype.Text

		err := rows.Scan(
			&payment.ID,
			&payment.PaymentID,
			&payment.Date,
			&payment.Amount,
			&payment.Status,
			&payment.PaymentLink,
			&payment.ConfirmationToken,
			&registrationID,
			&regID,
			&regUserID,
			&regTournamentID,
			&regDate,
			&regStatus,
			&userID,
			&userTelegramID,
			&userTelegramUsername,
			&userFirstName,
			&userLastName,
			&userAvatar,
			&tournamentID,
			&tournamentName,
			&tournamentStartTime,
			&tournamentEndTime,
			&tournamentPrice,
			&tournamentRankMin,
			&tournamentRankMax,
			&tournamentMaxUsers,
			&tournamentDescription,
			&tournamentType,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan row: %w", err)
		}

		if registrationID.Valid {
			payment.RegistrationID = &registrationID.String
		}

		if regID.Valid {
			registration.ID = regID.String
			if regUserID.Valid {
				registration.UserID = regUserID.String
			}
			if regTournamentID.Valid {
				registration.TournamentID = regTournamentID.String
			}
			if regDate.Valid {
				registration.Date = regDate.Time
			}
			if regStatus.Valid {
				registration.Status = domain.RegistrationStatus(regStatus.String)
			}

			if userID.Valid {
				user.ID = userID.String
				if userTelegramID.Valid {
					user.TelegramID = userTelegramID.Int64
				}
				if userTelegramUsername.Valid {
					user.TelegramUsername = userTelegramUsername.String
				}
				if userFirstName.Valid {
					user.FirstName = userFirstName.String
				}
				if userLastName.Valid {
					user.LastName = userLastName.String
				}
				if userAvatar.Valid {
					user.Avatar = userAvatar.String
				}
				registration.User = &user
			}

			if tournamentID.Valid {
				tournament.ID = tournamentID.String
				if tournamentName.Valid {
					tournament.Name = tournamentName.String
				}
				if tournamentStartTime.Valid {
					tournament.StartTime = tournamentStartTime.Time
				}
				if tournamentEndTime.Valid {
					tournament.EndTime = tournamentEndTime.Time
				}
				if tournamentPrice.Valid {
					tournament.Price = int(tournamentPrice.Int32)
				}
				if tournamentRankMin.Valid {
					tournament.RankMin = tournamentRankMin.Float64
				}
				if tournamentRankMax.Valid {
					tournament.RankMax = tournamentRankMax.Float64
				}
				if tournamentMaxUsers.Valid {
					tournament.MaxUsers = int(tournamentMaxUsers.Int32)
				}
				if tournamentDescription.Valid {
					tournament.Description = tournamentDescription.String
				}
				if tournamentType.Valid {
					tournament.TournamentType = tournamentType.String
				}
				registration.Tournament = &tournament
			}

			payment.Registration = &registration
		}

		payments = append(payments, &payment)
	}

	return payments, nil
}

func (r *PaymentRepo) Patch(ctx context.Context, id string, payment *domain.PatchPayment) error {
	s := r.psql.Update(`"payments"`).Where(sq.Eq{"id": id})

	if payment.Status != nil {
		s = s.Set("status", *payment.Status)
	}

	if payment.PaymentLink != nil {
		s = s.Set("payment_link", *payment.PaymentLink)
	}

	if payment.ConfirmationToken != nil {
		s = s.Set("confirmation_token", *payment.ConfirmationToken)
	}

	sql, args, err := s.ToSql()
	if err != nil {
		return fmt.Errorf("failed to build SQL: %w", err)
	}

	_, err = r.db.Exec(ctx, sql, args...)
	return err
}

func (r *PaymentRepo) Delete(ctx context.Context, id string) error {
	s := r.psql.Delete(`"payments"`).
		Where(sq.Eq{"id": id})

	sql, args, err := s.ToSql()
	if err != nil {
		return fmt.Errorf("failed to build SQL: %w", err)
	}

	_, err = r.db.Exec(ctx, sql, args...)
	return err
} 