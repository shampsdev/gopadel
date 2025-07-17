package registration

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/ginerr"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/middlewares"
	"github.com/shampsdev/go-telegram-template/pkg/repo"
)

// PaymentResponse представляет ответ с ссылкой на платеж
type PaymentResponse struct {
	PaymentURL string `json:"payment_url"`
	PaymentID  string `json:"payment_id"`
}

// @Summary Create payment for registration
// @Description Creates a payment for event registration and returns payment URL
// @Tags registrations
// @Security ApiKeyAuth
// @Param event_id path string true "Event ID"
// @Success 201 {object} PaymentResponse "Payment URL and ID"
// @Failure 400 "Bad request"
// @Failure 401 "Unauthorized"
// @Failure 403 "Forbidden - no pending registration found"
// @Failure 404 "Event not found"
// @Failure 500 "Internal server error"
// @Router /registrations/{event_id}/payment [post]
func (h *Handler) createPayment(c *gin.Context) {
	eventID := c.Param("event_id")
	if eventID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "event_id is required"})
		return
	}

	// Получаем пользователя из контекста
	user := middlewares.MustGetUser(c)

	// Получаем событие для проверки цены
	event, err := h.cases.Event.GetEventByID(c, eventID)
	if err != nil {
		if err == repo.ErrNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "event not found"})
			return
		}
		ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "failed to get event")
		return
	}

	// Проверяем, что событие платное
	if event.Price == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "event is free, payment not required"})
		return
	}

	// Ищем PENDING регистрацию пользователя для проверки
	_, err = h.cases.Registration.FindPendingRegistration(c, user.ID, eventID)
	if err != nil {
		if err == repo.ErrNotFound {
			c.JSON(http.StatusForbidden, gin.H{"error": "no pending registration found for this event"})
			return
		}
		ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "failed to find pending registration")
		return
	}

	// Используем готовый метод для создания платежа через ЮKassa
	// Он создает платеж и возвращает ссылку на оплату
	// Формируем return URL для Telegram Web App
	returnURL := fmt.Sprintf("https://t.me/%s/%s?startapp=%s", h.config.TG.BotUsername, h.config.TG.WebAppName, eventID)
	payment, err := h.cases.Payment.CreateYooKassaPayment(c, user, eventID, returnURL)
	if ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "failed to create payment") {
		return
	}

	response := PaymentResponse{
		PaymentURL: payment.PaymentLink, // PaymentLink содержит URL для оплаты
		PaymentID:  payment.ID,
	}

	c.JSON(http.StatusCreated, response)
} 