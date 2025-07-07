package webhook

import (
	"bytes"
	"crypto/sha256"
	"encoding/hex"
	"io"
	"net"
	"net/http"
	"strings"

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

// https://yookassa.ru/developers/using-api/webhooks#:~:text=Проверка%20подлинности%20уведомлений
func isYooKassaIP(clientIP string) bool {
	yooKassaRanges := []string{
		"185.71.76.0/27",
		"185.71.77.0/27", 
		"77.75.153.0/25",
		"77.75.156.11/32",
		"77.75.156.35/32",
		"2a02:5180:0:1509::/64",
		"2a02:5180:0:2655::/64",
	}

	ip := net.ParseIP(clientIP)
	if ip == nil {
		return false
	}

	for _, cidr := range yooKassaRanges {
		_, network, err := net.ParseCIDR(cidr)
		if err != nil {
			continue
		}
		if network.Contains(ip) {
			return true
		}
	}
	return false
}

func validateYooKassaSignature(body []byte, signature string, secretKey string) bool {
	if signature == "" {
		return false
	}
	
	signature = strings.TrimPrefix(signature, "sha256=")
	
	hash := sha256.New()
	hash.Write(body)
	hash.Write([]byte(secretKey))
	expectedSignature := hex.EncodeToString(hash.Sum(nil))
	
	return expectedSignature == signature
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
// @Failure 401 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /api/v1/yookassa_webhook [post]
func YooKassaWebhook(paymentUseCase *usecase.Payment, registrationUseCase *usecase.Registration, cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		body, err := io.ReadAll(c.Request.Body)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot read request body"})
			return
		}

		c.Request.Body = io.NopCloser(bytes.NewReader(body))

		signature := c.GetHeader("X-YooMoney-Signature")
		if !validateYooKassaSignature(body, signature, cfg.YooKassa.SecretKey) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid signature"})
			return
		}

		clientIP := c.ClientIP()
		if !isYooKassaIP(clientIP) {
			c.JSON(http.StatusForbidden, gin.H{"error": "Forbidden: Invalid source IP"})
			return
		}

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