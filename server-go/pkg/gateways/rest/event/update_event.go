package event

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/shampsdev/go-telegram-template/pkg/domain"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/ginerr"
	"github.com/shampsdev/go-telegram-template/pkg/repo"
)

// UpdateEvent godoc
// @Summary Update existing event
// @Tags events
// @Accept json
// @Produce json
// @Schemes http https
// @Param event_id path string true "Event ID"
// @Param event body domain.PatchEvent true "Event update data"
// @Success 200 {object} domain.Event "Updated event"
// @Failure 400 "Bad Request"
// @Failure 401 "Unauthorized"
// @Failure 403 "Forbidden"
// @Failure 404 "Not Found"
// @Failure 500 "Internal Server Error"
// @Security ApiKeyAuth
// @Router /events/{event_id} [patch]
func (h *Handler) updateEvent(c *gin.Context) {
	eventID := c.Param("event_id")
	if eventID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "event_id is required"})
		return
	}

	var patchEvent domain.PatchEvent
	if err := c.ShouldBindJSON(&patchEvent); err != nil {
		ginerr.AbortIfErr(c, err, http.StatusBadRequest, "invalid event data")
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

	// Получаем событие для проверки прав
	event, err := h.cases.Event.GetEventByID(c, eventID)
	if err != nil {
		if err == repo.ErrNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "event not found"})
			return
		}
		ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "failed to get event")
		return
	}

	// Проверяем права на обновление
	if event.Organizer.ID != domainUser.ID {
		// Если не организатор, проверяем является ли админом
		_, err := h.cases.AdminUser.GetByUserID(c, domainUser.ID)
		if err != nil {
			if err == repo.ErrNotFound {
				c.JSON(http.StatusForbidden, gin.H{"error": "only event organizer or admin can update events"})
				return
			}
			ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "failed to check admin status")
			return
		}
	}

	// Обновляем событие
	updatedEvent, err := h.cases.Event.Patch(c, eventID, &patchEvent)
	if ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "failed to update event") {
		return
	}

	c.JSON(http.StatusOK, updatedEvent)
} 