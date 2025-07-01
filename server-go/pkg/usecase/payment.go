package usecase

import (
	"context"
	"fmt"

	"github.com/shampsdev/go-telegram-template/pkg/domain"
	"github.com/shampsdev/go-telegram-template/pkg/repo"
)

type Payment struct {
	paymentRepo repo.Payment
}

func NewPayment(ctx context.Context, paymentRepo repo.Payment) *Payment {
	return &Payment{
		paymentRepo: paymentRepo,
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