package webhook

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/rvinnie/yookassa-sdk-go/yookassa"
	"github.com/shampsdev/go-telegram-template/pkg/config"
	"github.com/shampsdev/go-telegram-template/pkg/domain"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/ginerr"
	"github.com/shampsdev/go-telegram-template/pkg/usecase"
)

type WebhookEventObject struct {
	ID     string `json:"id"`
	Status string `json:"status"`
}

type WebhookEvent struct {
	Type   string             `json:"type"`
	Event  string             `json:"event"`
	Object WebhookEventObject `json:"object"`
}

// YooKassaWebhook godoc
// @Summary YooKassa webhook for payment notifications
// @Description Handles payment status updates from YooKassa
// @Tags webhook
// @Accept json
// @Produce json
// @Param event body WebhookEvent true "Webhook event"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /api/v1/yookassa_webhook [post]
func YooKassaWebhook(paymentUseCase *usecase.Payment, registrationUseCase *usecase.Registration, cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		var event WebhookEvent
		if err := c.ShouldBindJSON(&event); err != nil {
			if ginerr.AbortIfErr(c, err, http.StatusBadRequest, "Invalid request body") {
				return
			}
		}

		paymentID := event.Object.ID
		
		client := yookassa.NewClient(cfg.YooKassa.ShopID, cfg.YooKassa.SecretKey)
		paymentHandler := yookassa.NewPaymentHandler(client)
		
		yooPayment, err := paymentHandler.FindPayment(paymentID)
		if err != nil {
			if ginerr.AbortIfErr(c, err, http.StatusBadRequest, "Payment not found in YooKassa") {
				return
			}
		}

		if string(yooPayment.Status) != event.Object.Status {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Status mismatch"})
			return
		}

		payment, err := paymentUseCase.GetPaymentByPaymentID(c.Request.Context(), paymentID)
		if err != nil {
			if ginerr.AbortIfErr(c, err, http.StatusNotFound, "Payment not found in database") {
				return
			}
		}

		paymentStatus := domain.PaymentStatus(yooPayment.Status)
		if payment.Status != paymentStatus {
			err = paymentUseCase.UpdatePaymentStatus(c.Request.Context(), payment.ID, paymentStatus)
			if err != nil {
				if ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "Failed to update payment status") {
					return
				}
			}
		}

		if paymentStatus == domain.PaymentStatusSucceeded && payment.Registration != nil {
			if payment.Registration.Status == domain.RegistrationStatusPending {
				err = registrationUseCase.UpdateRegistrationStatus(c.Request.Context(), payment.Registration.ID, domain.RegistrationStatusActive)
				if err != nil {
					if ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "Failed to update registration status") {
						return
					}
				}
				
				// TODO: Отправить уведомление пользователю об успешной оплате
				// TODO: Отменить отложенные задачи напоминания об оплате
			}
		} else if paymentStatus == domain.PaymentStatusCanceled && payment.Registration != nil {
			// При отмененном платеже регистрация остается в статусе PENDING,
			// чтобы пользователь мог создать новый платеж.
			// Регистрация переходит в CANCELED только при отмене пользователем
		}

		c.JSON(http.StatusOK, gin.H{"status": "success"})
	}
} 