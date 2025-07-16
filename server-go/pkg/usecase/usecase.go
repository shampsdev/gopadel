package usecase

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/shampsdev/go-telegram-template/pkg/config"
	"github.com/shampsdev/go-telegram-template/pkg/repo/pg"
	"github.com/shampsdev/go-telegram-template/pkg/repo/s3"
)

type Cases struct {
	User         *User
	AdminUser    *AdminUser
	Image        *Image
	Court        *Court
	Club         *Club
	Loyalty      *Loyalty
	Event        *Event
	Registration *Registration
	Payment      *Payment
	Waitlist     *Waitlist
}

func Setup(ctx context.Context, cfg *config.Config, db *pgxpool.Pool) Cases {
	userRepo := pg.NewUserRepo(db)
	adminUserRepo := pg.NewAdminUserRepo(db)
	courtRepo := pg.NewCourtRepo(db)
	clubRepo := pg.NewClubRepo(db)
	loyaltyRepo := pg.NewLoyaltyRepo(db)
	registrationRepo := pg.NewRegistrationRepo(db)
	paymentRepo := pg.NewPaymentRepo(db)
	waitlistRepo := pg.NewWaitlistRepo(db)
	eventRepo := pg.NewEventRepo(db)
	storage, err := s3.NewStorage(cfg.S3)
	if err != nil {
		panic(err)
	}

	// NATS и уведомления пока не используются
	_ = cfg

	cases := &Cases{}

	userCase := NewUser(ctx, userRepo, storage)
	adminUserCase := NewAdminUser(ctx, adminUserRepo, cfg)
	imageCase := NewImage(ctx, storage)
	courtCase := NewCourt(ctx, courtRepo)
	clubCase := NewClub(ctx, clubRepo)
	loyaltyCase := NewLoyalty(ctx, loyaltyRepo)

	eventCase := NewEvent(ctx, eventRepo, cases)           // нужен Registration
	registrationCase := NewRegistration(ctx, registrationRepo, cases) // нужен Payment
	paymentCase := NewPayment(ctx, paymentRepo, cfg, cases)           // нужен Event, Registration
	waitlistCase := NewWaitlist(ctx, waitlistRepo, cases)             // нужен Event

	*cases = Cases{
		User:         userCase,
		AdminUser:    adminUserCase,
		Image:        imageCase,
		Court:        courtCase,
		Club:         clubCase,
		Loyalty:      loyaltyCase,
		Event:        eventCase,
		Registration: registrationCase,
		Payment:      paymentCase,
		Waitlist:     waitlistCase,
	}

	return *cases
}
