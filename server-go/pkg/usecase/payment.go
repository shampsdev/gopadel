package usecase

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"regexp"
	"time"

	"github.com/google/uuid"
	"github.com/shampsdev/go-telegram-template/pkg/config"
	"github.com/shampsdev/go-telegram-template/pkg/domain"
	"github.com/shampsdev/go-telegram-template/pkg/notifications"
	"github.com/shampsdev/go-telegram-template/pkg/repo"
)

type Payment struct {
	paymentRepo         repo.Payment
	registrationRepo    repo.Registration
	tournamentRepo      repo.Tournament
	config              *config.Config
	notificationService *notifications.NotificationService
}

type YooKassaAmount struct {
	Value    string `json:"value"`
	Currency string `json:"currency"`
}

type YooKassaConfirmation struct {
	Type      string `json:"type"`
	ReturnURL string `json:"return_url"`
}

type YooKassaCustomer struct {
	Email string `json:"email"`
}

type YooKassaItem struct {
	Description    string         `json:"description"`
	PaymentSubject string         `json:"payment_subject"`
	Amount         YooKassaAmount `json:"amount"`
	VatCode        int            `json:"vat_code"`
	Quantity       int            `json:"quantity"`
	Measure        string         `json:"measure"`
	PaymentMode    string         `json:"payment_mode"`
}

type YooKassaReceipt struct {
	Customer YooKassaCustomer `json:"customer"`
	Items    []YooKassaItem   `json:"items"`
}

type YooKassaPaymentRequest struct {
	Amount       YooKassaAmount       `json:"amount"`
	Confirmation YooKassaConfirmation `json:"confirmation"`
	Capture      bool                 `json:"capture"`
	Description  string               `json:"description"`
	Receipt      YooKassaReceipt      `json:"receipt"`
}

type YooKassaPaymentResponse struct {
	ID           string                   `json:"id"`
	Status       string                   `json:"status"`
	Confirmation YooKassaConfirmationResp `json:"confirmation"`
}

type YooKassaConfirmationResp struct {
	ConfirmationURL string `json:"confirmation_url"`
}

func NewPayment(ctx context.Context, paymentRepo repo.Payment, registrationRepo repo.Registration, tournamentRepo repo.Tournament, cfg *config.Config, notificationService *notifications.NotificationService) *Payment {
	return &Payment{
		paymentRepo:         paymentRepo,
		registrationRepo:    registrationRepo,
		tournamentRepo:      tournamentRepo,
		config:              cfg,
		notificationService: notificationService,
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
	tournament, err := p.getTournamentByID(ctx, tournamentID)
	if err != nil {
		return nil, fmt.Errorf("failed to get tournament: %w", err)
	}

	if tournament.Price == 0 {
		return nil, fmt.Errorf("tournament is free, no payment required")
	}

	registration, err := p.findPendingRegistration(ctx, user.ID, tournamentID)
	if err != nil {
		return nil, err
	}

	existingPayments, err := p.GetPaymentsByRegistration(ctx, registration.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to get existing payments: %w", err)
	}

	// если есть пендинг или успешный, то его
	for _, payment := range existingPayments {
		if payment.Status == domain.PaymentStatusSucceeded || payment.Status == domain.PaymentStatusPending {
			return payment, nil
		}
	}

	yooPayment, err := p.createYooKassaPayment(tournament, user, returnURL)
	if err != nil {
		return nil, fmt.Errorf("failed to create YooKassa payment: %w", err)
	}

	finalPrice := p.calculateFinalPrice(tournament.Price, user)
	
	// сохраняем в бд
	createPayment := &domain.CreatePayment{
		PaymentID:         yooPayment.ID,
		Amount:            finalPrice,
		Status:            domain.PaymentStatus(yooPayment.Status),
		PaymentLink:       yooPayment.Confirmation.ConfirmationURL,
		ConfirmationToken: "",
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

func (p *Payment) createYooKassaPayment(tournament *domain.Tournament, user *domain.User, returnURL string) (*YooKassaPaymentResponse, error) {
	finalPrice := p.calculateFinalPrice(tournament.Price, user)
	
	if finalPrice <= 0 {
		return nil, fmt.Errorf("invalid payment amount: %d", finalPrice)
	}

	customerEmail := p.generateCustomerEmail(user)
	
	amountStr := fmt.Sprintf("%d.00", finalPrice)

	paymentData := YooKassaPaymentRequest{
		Amount: YooKassaAmount{
			Value:    amountStr,
			Currency: "RUB",
		},
		Confirmation: YooKassaConfirmation{
			Type:      "redirect",
			ReturnURL: returnURL,
		},
		Capture:     true,
		Description: fmt.Sprintf("Оплата турнира `%s`", tournament.Name),
		Receipt: YooKassaReceipt{
			Customer: YooKassaCustomer{
				Email: customerEmail,
			},
			Items: []YooKassaItem{
				{
					Description:    "GoPadel Tournament",
					PaymentSubject: "service",
					Amount: YooKassaAmount{
						Value:    amountStr,
						Currency: "RUB",
					},
					VatCode:     1,
					Quantity:    1,
					Measure:     "piece",
					PaymentMode: "full_payment",
				},
			},
		},
	}

	jsonData, err := json.Marshal(paymentData)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal payment data: %w", err)
	}

	req, err := http.NewRequest("POST", "https://api.yookassa.ru/v3/payments", bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	idempotencyKey := uuid.New().String()
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Idempotence-Key", idempotencyKey)
	
	auth := base64.StdEncoding.EncodeToString([]byte(p.config.YooKassa.ShopID + ":" + p.config.YooKassa.SecretKey))
	req.Header.Set("Authorization", "Basic "+auth)

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		slog.Error("Failed to send request to YooKassa", 
			"error", err.Error(),
			"shop_id", p.config.YooKassa.ShopID,
			"amount", amountStr,
			"email", customerEmail,
		)
		return nil, fmt.Errorf("failed to send request to YooKassa: %w", err)
	}
	defer resp.Body.Close()

	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %w", err)
	}

	// Проверяем статус ответа
	if resp.StatusCode != http.StatusOK {
		slog.Error("YooKassa API returned error", 
			"status_code", resp.StatusCode,
			"response_body", string(bodyBytes),
			"shop_id", p.config.YooKassa.ShopID,
			"amount", amountStr,
			"email", customerEmail,
		)
		return nil, fmt.Errorf("YooKassa API error (status %d): %s", resp.StatusCode, string(bodyBytes))
	}

	var paymentResponse YooKassaPaymentResponse
	if err := json.Unmarshal(bodyBytes, &paymentResponse); err != nil {
		return nil, fmt.Errorf("failed to unmarshal response: %w", err)
	}

	slog.Info("YooKassa payment created successfully", 
		"payment_id", paymentResponse.ID,
		"status", paymentResponse.Status,
		"confirmation_url", paymentResponse.Confirmation.ConfirmationURL,
	)

	return &paymentResponse, nil
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

func (p *Payment) isValidEmail(email string) bool {
	if email == "" {
		return false
	}
	
	emailRegex := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
	return emailRegex.MatchString(email)
}

// generateCustomerEmail создает email для клиента в зависимости от доступных данных
func (p *Payment) generateCustomerEmail(user *domain.User) string {
	if user.TelegramUsername != "" {
		email := fmt.Sprintf("%s@telegram.gopadel.com", user.TelegramUsername)
		if p.isValidEmail(email) {
			return email
		}
	}
	
	if user.ID != "" {
		email := fmt.Sprintf("user%s@gopadel.com", user.ID)
		if p.isValidEmail(email) {
			return email
		}
	}
	
	return "tournament@gopadel.com"
}
