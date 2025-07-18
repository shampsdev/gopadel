package registration

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/shampsdev/go-telegram-template/pkg/domain"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/ginerr"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/middlewares"
	"github.com/shampsdev/go-telegram-template/pkg/usecase"
)

// @Summary Approve registration
// @Description Approve a pending registration (organizer only)
// @Tags registrations
// @Security ApiKeyAuth
// @Param event_id path string true "Event ID"
// @Param user_id path string true "User ID"
// @Success 200 {object} domain.Registration "Approved registration"
// @Failure 400 "Bad request"
// @Failure 401 "Unauthorized"
// @Failure 403 "Forbidden - only organizer can approve"
// @Failure 404 "Registration not found"
// @Failure 500 "Internal server error"
// @Router /registrations/{event_id}/{user_id}/approve [put]
func (h *Handler) approveRegistration(c *gin.Context) {
	eventID := c.Param("event_id")
	userID := c.Param("user_id")
	
	if eventID == "" || userID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "event_id and user_id are required"})
		return
	}

	// Получаем текущего пользователя (организатора)
	organizer := middlewares.MustGetUser(c)

	// Получаем событие
	events, err := h.cases.Event.Filter(c, &domain.FilterEvent{ID: &eventID})
	if ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "failed to get event") {
		return
	}
	if len(events) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "event not found"})
		return
	}
	event := events[0]

	// Получаем регистрацию
	registrations, err := h.cases.Registration.GetRegistrationsByUserAndEvent(c, userID, eventID)
	if ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "failed to get registration") {
		return
	}
	if len(registrations) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "registration not found"})
		return
	}
	registration := registrations[0]

	// Проверяем, что это игра - approve/reject работают только для игр
	if event.Type != domain.EventTypeGame {
		c.JSON(http.StatusBadRequest, gin.H{"error": "approve/reject functionality is only available for games"})
		return
	}

	// Проверяем права через GameStrategy
	gameStrategy := &usecase.GameEventStrategy{}
	err = gameStrategy.CanApprove(organizer, event, registration)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	confirmStatus := domain.RegistrationStatusConfirmed
	updatedReg, err := h.cases.Registration.AdminUpdateRegistrationStatus(c, userID, eventID, confirmStatus)
	if ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "failed to approve registration") {
		return
	}

	c.JSON(http.StatusOK, updatedReg)
} 