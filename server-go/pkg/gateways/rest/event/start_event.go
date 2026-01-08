package event

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/shampsdev/go-telegram-template/pkg/domain"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/ginerr"
	"github.com/shampsdev/go-telegram-template/pkg/repo"
)

// StartEvent godoc
// @Summary Start event (set status to in_progress)
// @Description Set event status to in_progress. This action is irreversible and locks the participant list. Only organizer or admin can perform this action.
// @Tags events
// @Accept json
// @Produce json
// @Schemes http https
// @Param event_id path string true "Event ID"
// @Success 200 {object} domain.Event "Event with updated status"
// @Failure 400 "Bad Request"
// @Failure 401 "Unauthorized"
// @Failure 403 "Forbidden"
// @Failure 404 "Not Found"
// @Failure 500 "Internal Server Error"
// @Security ApiKeyAuth
// @Router /events/{event_id}/start [put]
func (h *Handler) startEvent(c *gin.Context) {
	eventID := c.Param("event_id")
	if eventID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "event_id is required"})
		return
	}

	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user not authenticated"})
		return
	}

	domainUser, ok := user.(*domain.User)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "invalid user type"})
		return
	}

	// Получаем событие
	event, err := h.cases.Event.GetEventByID(c, eventID)
	if err != nil {
		if err == repo.ErrNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "event not found"})
			return
		}
		ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "failed to get event")
		return
	}

	// Проверяем права доступа (только организатор или админ)
	if event.Organizer.ID != domainUser.ID {
		_, err := h.cases.AdminUser.GetByUserID(c, domainUser.ID)
		if err != nil {
			if err == repo.ErrNotFound {
				c.JSON(http.StatusForbidden, gin.H{"error": "only event organizer or admin can start events"})
				return
			}
			ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "failed to check admin status")
			return
		}
	}

	// Проверяем текущий статус события
	if event.Status == domain.EventStatusInProgress {
		c.JSON(http.StatusBadRequest, gin.H{"error": "event is already in progress"})
		return
	}

	if event.Status == domain.EventStatusCompleted {
		c.JSON(http.StatusBadRequest, gin.H{"error": "cannot start completed event"})
		return
	}

	if event.Status == domain.EventStatusCancelled {
		c.JSON(http.StatusBadRequest, gin.H{"error": "cannot start cancelled event"})
		return
	}

	// Проверяем, что событие в статусе "full" (полностью заполнено)
	if event.Status != domain.EventStatusFull {
		c.JSON(http.StatusBadRequest, gin.H{"error": "event must be full before starting (all participant slots must be filled)"})
		return
	}

	// Обновляем статус на in_progress
	inProgressStatus := domain.EventStatusInProgress
	patchEvent := &domain.PatchEvent{
		Status: &inProgressStatus,
	}

	updatedEvent, err := h.cases.Event.Patch(c, eventID, patchEvent)
	if ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "failed to start event") {
		return
	}

	c.JSON(http.StatusOK, updatedEvent)
}
