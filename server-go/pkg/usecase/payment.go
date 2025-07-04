package usecase

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/rvinnie/yookassa-sdk-go/yookassa"
	yoocommon "github.com/rvinnie/yookassa-sdk-go/yookassa/common"
	yoopayment "github.com/rvinnie/yookassa-sdk-go/yookassa/payment"
	"github.com/shampsdev/go-telegram-template/pkg/config"
	"github.com/shampsdev/go-telegram-template/pkg/domain"
	"github.com/shampsdev/go-telegram-template/pkg/repo"
)

type Payment struct {
	paymentRepo      repo.Payment
	registrationRepo repo.Registration
	tournamentRepo   repo.Tournament
	config           *config.Config
}

func NewPayment(ctx context.Context, paymentRepo repo.Payment, registrationRepo repo.Registration, tournamentRepo repo.Tournament, cfg *config.Config) *Payment {
	return &Payment{
		paymentRepo:      paymentRepo,
		registrationRepo: registrationRepo,
		tournamentRepo:   tournamentRepo,
		config:           cfg,
	}
}

func (p *Payment) CreatePayment(ctx context.Context, payment *domain.CreatePayment) (*domain.Payment, error) {
	id, err := p.paymentRepo.Create(ctx, payment)
	if err != nil {
		return nil, fmt.Errorf("failed to create payment: %w", err)
	}

	filter := &domain.FilterPayment{ID: &id}
	payments, err := p.paymentRepo.Filter(ctx, filter)
	if err != nil {
		return nil, fmt.Errorf("failed to get created payment: %w", err)
	}

	if len(payments) == 0 {
		return nil, fmt.Errorf("created payment not found")
	}

	return payments[0], nil
}

func (p *Payment) UpdatePaymentStatus(ctx context.Context, paymentID string, status domain.PaymentStatus) error {
	patch := &domain.PatchPayment{
		Status: &status,
	}

	return p.paymentRepo.Patch(ctx, paymentID, patch)
}

func (p *Payment) GetPaymentsByRegistration(ctx context.Context, registrationID string) ([]*domain.Payment, error) {
	filter := &domain.FilterPayment{
		RegistrationID: &registrationID,
	}

	return p.paymentRepo.Filter(ctx, filter)
}

func (p *Payment) GetPaymentByPaymentID(ctx context.Context, paymentID string) (*domain.Payment, error) {
	filter := &domain.FilterPayment{
		PaymentID: &paymentID,
	}

	payments, err := p.paymentRepo.Filter(ctx, filter)
	if err != nil {
		return nil, fmt.Errorf("failed to get payment: %w", err)
	}

	if len(payments) == 0 {
		return nil, fmt.Errorf("payment not found")
	}

	return payments[0], nil
}

// CreateYooKassaPayment создает платеж в YooKassa для регистрации на турнир
func (p *Payment) CreateYooKassaPayment(ctx context.Context, user *domain.User, tournamentID string, returnURL string) (*domain.Payment, error) {
	registration, err := p.findPendingRegistration(ctx, user.ID, tournamentID)
	if err != nil {
		return nil, err
	}

	existingPayments, err := p.GetPaymentsByRegistration(ctx, registration.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to get existing payments: %w", err)
	}

	// Если есть платеж в статусе success/pending, возвращаем его
	for _, payment := range existingPayments {
		if payment.Status == domain.PaymentStatusSucceeded || payment.Status == domain.PaymentStatusPending {
			return payment, nil
		}
	}

	tournament, err := p.getTournamentByID(ctx, tournamentID)
	if err != nil {
		return nil, fmt.Errorf("failed to get tournament: %w", err)
	}

	yooPayment, err := p.createYooKassaPayment(tournament, user, returnURL)
	if err != nil {
		return nil, fmt.Errorf("failed to create YooKassa payment: %w", err)
	}

	client := yookassa.NewClient(p.config.YooKassa.ShopID, p.config.YooKassa.SecretKey)
	paymentHandler := yookassa.NewPaymentHandler(client)
	paymentLink, err := paymentHandler.ParsePaymentLink(yooPayment)
	if err != nil {
		return nil, fmt.Errorf("failed to parse payment link: %w", err)
	}

	finalPrice := p.calculateFinalPrice(tournament.Price, user)
	
	// Сохраняем платеж в базе данных
	createPayment := &domain.CreatePayment{
		PaymentID:         yooPayment.ID,
		Amount:            finalPrice,
		Status:            domain.PaymentStatus(yooPayment.Status),
		PaymentLink:       paymentLink,
		ConfirmationToken: "", // YooKassa SDK не предоставляет токен подтверждения
		RegistrationID:    &registration.ID,
	}

	return p.CreatePayment(ctx, createPayment)
}

func (p *Payment) findPendingRegistration(ctx context.Context, userID, tournamentID string) (*domain.Registration, error) {
	pendingStatus := domain.RegistrationStatusPending
	filter := &domain.FilterRegistration{
		UserID:       &userID,
		TournamentID: &tournamentID,
		Status:       &pendingStatus,
	}

	registrations, err := p.registrationRepo.Filter(ctx, filter)
	if err != nil {
		return nil, fmt.Errorf("failed to find registration: %w", err)
	}

	if len(registrations) == 0 {
		return nil, fmt.Errorf("no pending registration found for this tournament")
	}

	return registrations[0], nil
}

func (p *Payment) getTournamentByID(ctx context.Context, tournamentID string) (*domain.Tournament, error) {
	filter := &domain.FilterTournament{ID: tournamentID}
	tournaments, err := p.tournamentRepo.Filter(ctx, filter)
	if err != nil {
		return nil, fmt.Errorf("failed to get tournament: %w", err)
	}

	if len(tournaments) == 0 {
		return nil, fmt.Errorf("tournament not found")
	}

	return tournaments[0], nil
}

func (p *Payment) createYooKassaPayment(tournament *domain.Tournament, user *domain.User, returnURL string) (*yoopayment.Payment, error) {
	client := yookassa.NewClient(p.config.YooKassa.ShopID, p.config.YooKassa.SecretKey)
	paymentHandler := yookassa.NewPaymentHandler(client)

	// Рассчитываем финальную цену с учетом скидки
	finalPrice := p.calculateFinalPrice(tournament.Price, user)

	paymentData := &yoopayment.Payment{
		Amount: &yoocommon.Amount{
			Value:    fmt.Sprintf("%.2f", float64(finalPrice)),
			Currency: "RUB",
		},
		Confirmation: &yoopayment.Redirect{
			Type:      yoopayment.TypeRedirect,
			ReturnURL: returnURL,
		},
		Capture:     true,
		Description: fmt.Sprintf("Оплата турнира `%s`", tournament.Name),
		Receipt: &yoopayment.Receipt{
			Customer: &yoocommon.Customer{
				Email: "tournament@gopadel.com", // TODO: использовать email пользователя
			},
			Items: []*yoocommon.Item{
				{
					Description: fmt.Sprintf("GoPadel Tournament %s", tournament.Name),
					Quantity:    "1",
					Amount: &yoocommon.Amount{
						Value:    fmt.Sprintf("%.2f", float64(finalPrice)),
						Currency: "RUB",
					},
					VatCode: "1",
				},
			},
		},
	}

	idempotencyKey := uuid.New().String()
	createdPayment, err := paymentHandler.WithIdempotencyKey(idempotencyKey).CreatePayment(paymentData)
	if err != nil {
		return nil, fmt.Errorf("failed to create payment in YooKassa: %w", err)
	}

	return createdPayment, nil
}

func (p *Payment) calculateFinalPrice(originalPrice int, user *domain.User) int {
	if user.Loyalty == nil {
		return originalPrice
	}

	discount := user.Loyalty.Discount
	if discount <= 0 {
		return originalPrice
	}

	finalPrice := float64(originalPrice) * (1 - float64(discount)/100)
	
	return int(finalPrice + 0.5)
}
