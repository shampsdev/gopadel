package registration

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/ginerr"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/middlewares"
)

// @Summary Reactivate cancelled registration
// @Description Reactivates a cancelled registration if event has available slots
// @Tags registrations
// @Security ApiKeyAuth
// @Param event_id path string true "Event ID"
// @Success 200 {object} domain.Registration "Reactivated registration"
// @Failure 400 "Bad request"
// @Failure 401 "Unauthorized"
// @Failure 403 "Forbidden - no cancelled registration or cannot reactivate"
// @Failure 404 "Event not found"
// @Failure 500 "Internal server error"
// @Router /registrations/{event_id}/reactivate [post]
func (h *Handler) reactivateRegistration(c *gin.Context) {
	eventID := c.Param("event_id")
	if eventID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "event_id is required"})
		return
	}

	// Получаем пользователя из контекста
	user := middlewares.MustGetUser(c)

	// Используем метод ReactivateRegistration из usecase
	registration, err := h.cases.Registration.ReactivateRegistration(c, user, eventID)
	if ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "failed to reactivate registration") {
		return
	}

	c.JSON(http.StatusOK, registration)
} 