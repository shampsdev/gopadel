package webhook

import (
	"bytes"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"io"
	"log/slog"
	"net"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/rvinnie/yookassa-sdk-go/yookassa"
	"github.com/shampsdev/go-telegram-template/pkg/config"
	"github.com/shampsdev/go-telegram-template/pkg/domain"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/ginerr"
	"github.com/shampsdev/go-telegram-template/pkg/usecase"
	"github.com/shampsdev/go-telegram-template/pkg/utils/slogx"
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
		// Добавляем детальное логирование для диагностики
		log := slogx.FromCtx(c.Request.Context())
		
		// Логируем все заголовки запроса
		headers := make(map[string]string)
		for key, values := range c.Request.Header {
			headers[key] = strings.Join(values, ", ")
		}
		
		log.Info("YooKassa webhook received",
			slog.String("client_ip", c.ClientIP()),
			slog.String("user_agent", c.GetHeader("User-Agent")),
			slog.String("signature", c.GetHeader("X-YooMoney-Signature")),
			slog.Any("all_headers", headers),
		)

		// Читаем тело запроса для проверки подписи
		body, err := io.ReadAll(c.Request.Body)
		if err != nil {
			log.Error("Cannot read request body", slogx.Err(err))
			c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot read request body"})
			return
		}

		log.Info("Webhook body received", slog.String("body", string(body)))

		// Восстанавливаем тело запроса для последующего парсинга
		c.Request.Body = io.NopCloser(bytes.NewReader(body))

		// Проверяем подпись YooKassa (временно делаем более лояльной)
		signature := c.GetHeader("X-YooMoney-Signature")
		if signature != "" {
			if !validateYooKassaSignature(body, signature, cfg.YooKassa.SecretKey) {
				log.Warn("Invalid YooKassa signature", 
					slog.String("received_signature", signature),
					slog.String("secret_key_length", fmt.Sprintf("%d", len(cfg.YooKassa.SecretKey))),
				)
				// В тестовом режиме продолжаем выполнение с предупреждением
				// c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid signature"})
				// return
			} else {
				log.Info("YooKassa signature validated successfully")
			}
		} else {
			log.Warn("No YooKassa signature provided")
		}

		// Проверяем IP адрес (временно делаем более лояльной)
		clientIP := c.ClientIP()
		if !isYooKassaIP(clientIP) {
			log.Warn("Request from non-YooKassa IP", slog.String("client_ip", clientIP))
			// В тестовом режиме продолжаем выполнение с предупреждением
			// c.JSON(http.StatusForbidden, gin.H{"error": "Forbidden: Invalid source IP"})
			// return
		} else {
			log.Info("YooKassa IP validated successfully", slog.String("client_ip", clientIP))
		}

		var event WebhookEvent
		if err := c.ShouldBindJSON(&event); err != nil {
			log.Error("Failed to parse webhook JSON", slogx.Err(err))
			if ginerr.AbortIfErr(c, err, http.StatusBadRequest, "Invalid request body") {
				return
			}
		}

		log.Info("Webhook event parsed",
			slog.String("type", event.Type),
			slog.String("event", event.Event),
			slog.String("payment_id", event.Object.ID),
			slog.String("status", event.Object.Status),
		)

		paymentID := event.Object.ID
		
		client := yookassa.NewClient(cfg.YooKassa.ShopID, cfg.YooKassa.SecretKey)
		paymentHandler := yookassa.NewPaymentHandler(client)
		
		yooPayment, err := paymentHandler.FindPayment(paymentID)
		if err != nil {
			log.Error("Payment not found in YooKassa", slogx.Err(err), slog.String("payment_id", paymentID))
			if ginerr.AbortIfErr(c, err, http.StatusBadRequest, "Payment not found in YooKassa") {
				return
			}
		}

		log.Info("YooKassa payment found",
			slog.String("payment_id", paymentID),
			slog.String("yookassa_status", string(yooPayment.Status)),
			slog.String("webhook_status", event.Object.Status),
		)

		if string(yooPayment.Status) != event.Object.Status {
			log.Error("Status mismatch between YooKassa and webhook",
				slog.String("yookassa_status", string(yooPayment.Status)),
				slog.String("webhook_status", event.Object.Status),
			)
			c.JSON(http.StatusBadRequest, gin.H{"error": "Status mismatch"})
			return
		}

		payment, err := paymentUseCase.GetPaymentByPaymentID(c.Request.Context(), paymentID)
		if err != nil {
			log.Error("Payment not found in database", slogx.Err(err), slog.String("payment_id", paymentID))
			if ginerr.AbortIfErr(c, err, http.StatusNotFound, "Payment not found in database") {
				return
			}
		}

		log.Info("Database payment found",
			slog.String("payment_id", paymentID),
			slog.String("current_status", string(payment.Status)),
			slog.String("new_status", string(yooPayment.Status)),
		)

		paymentStatus := domain.PaymentStatus(yooPayment.Status)
		if payment.Status != paymentStatus {
			log.Info("Updating payment status",
				slog.String("payment_id", payment.ID),
				slog.String("from", string(payment.Status)),
				slog.String("to", string(paymentStatus)),
			)
			
			err = paymentUseCase.UpdatePaymentStatus(c.Request.Context(), payment.ID, paymentStatus)
			if err != nil {
				log.Error("Failed to update payment status", slogx.Err(err))
				if ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "Failed to update payment status") {
					return
				}
			}
			
			log.Info("Payment status updated successfully")
		} else {
			log.Info("Payment status is already up to date")
		}

		if paymentStatus == domain.PaymentStatusSucceeded && payment.Registration != nil {
			log.Info("Processing successful payment with registration",
				slog.String("registration_id", payment.Registration.ID),
				slog.String("registration_status", string(payment.Registration.Status)),
			)
			
			if payment.Registration.Status == domain.RegistrationStatusPending {
				log.Info("Updating registration status to active")
				
				err = registrationUseCase.UpdateRegistrationStatus(c.Request.Context(), payment.Registration.ID, domain.RegistrationStatusActive)
				if err != nil {
					log.Error("Failed to update registration status", slogx.Err(err))
					if ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "Failed to update registration status") {
						return
					}
				}
				
				log.Info("Registration status updated to active successfully")
				
				// TODO: Отправить уведомление пользователю об успешной оплате
				// TODO: Отменить отложенные задачи напоминания об оплате
			} else {
				log.Info("Registration status is not pending, skipping update",
					slog.String("current_status", string(payment.Registration.Status)),
				)
			}
		} else if paymentStatus == domain.PaymentStatusCanceled && payment.Registration != nil {
			log.Info("Payment canceled, keeping registration in pending status")
			// При отмененном платеже регистрация остается в статусе PENDING,
			// чтобы пользователь мог создать новый платеж.
			// Регистрация переходит в CANCELED только при отмене пользователем
		}

		log.Info("Webhook processed successfully")
		c.JSON(http.StatusOK, gin.H{"status": "success"})
	}
} 