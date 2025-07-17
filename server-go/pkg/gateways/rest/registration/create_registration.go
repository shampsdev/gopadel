package registration

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/shampsdev/go-telegram-template/pkg/domain"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/ginerr"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/middlewares"
)

// @Summary Create event registration
// @Description Creates a new registration for an event with PENDING status
// @Tags registrations
// @Security ApiKeyAuth
// @Param event_id path string true "Event ID"
// @Success 201 {object} domain.Registration "Created registration"
// @Failure 400 "Bad request"
// @Failure 401 "Unauthorized"
// @Failure 403 "Forbidden - user already registered or validation failed"
// @Failure 404 "Event not found"
// @Failure 500 "Internal server error"
// @Router /registrations/{event_id} [post]
func (h *Handler) createRegistration(c *gin.Context) {
	eventID := c.Param("event_id")
	if eventID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "event_id is required"})
		return
	}

	// Получаем пользователя из контекста
	user := middlewares.MustGetUser(c)

	// Проверяем, не зарегистрирован ли уже пользователь
	existingRegistrations, err := h.cases.Registration.GetRegistrationsByUserAndEvent(c, user.ID, eventID)
	if err == nil && len(existingRegistrations) > 0 {
		// Проверяем есть ли активная регистрация
		for _, reg := range existingRegistrations {
			if reg.Status == domain.RegistrationStatusConfirmed || reg.Status == domain.RegistrationStatusPending {
				c.JSON(http.StatusForbidden, gin.H{"error": "user already has active registration for this event"})
				return
			}
		}
	}

	// Используем метод RegisterForEvent который включает все проверки и стратегии
	registration, err := h.cases.Registration.RegisterForEvent(c, user, eventID)
	if ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "failed to create registration") {
		return
	}

	c.JSON(http.StatusCreated, registration)
} 