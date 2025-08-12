package registration

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/ginerr"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/middlewares"
)

// @Summary Cancel event registration before payment
// @Description Cancels a registration with PENDING status (before payment)
// @Tags registrations
// @Security ApiKeyAuth
// @Param event_id path string true "Event ID"
// @Success 200 {object} domain.Registration "Cancelled registration"
// @Failure 400 "Bad request"
// @Failure 401 "Unauthorized"
// @Failure 403 "Forbidden - no pending registration or cannot cancel"
// @Failure 404 "Event not found"
// @Failure 500 "Internal server error"
// @Router /registrations/{event_id}/cancel [post]
func (h *Handler) cancelRegistration(c *gin.Context) {
	eventID := c.Param("event_id")
	if eventID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "event_id is required"})
		return
	}

	// Получаем пользователя из контекста
	user := middlewares.MustGetUser(c)

	// Используем метод CancelEventRegistration, который обрабатывает отмену
	// и автоматически устанавливает правильный статус через стратегии
	registration, err := h.cases.Registration.CancelEventRegistration(c, user, eventID)
	if ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "failed to cancel registration") {
		return
	}

	c.JSON(http.StatusOK, registration)
} 