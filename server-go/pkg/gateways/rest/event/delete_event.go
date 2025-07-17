package event

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/shampsdev/go-telegram-template/pkg/domain"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/ginerr"
	"github.com/shampsdev/go-telegram-template/pkg/repo"
)

// @Summary Delete event
// @Description Deletes an event with access rights verification
// @Tags events
// @Security BearerAuth
// @Param event_id path string true "Event ID"
// @Success 204 "Event successfully deleted"
// @Failure 400 "Bad request"
// @Failure 403 "Insufficient permissions"
// @Failure 404 "Event not found"
// @Failure 500 "Internal server error"
// @Router /events/{event_id} [delete]
func (h *Handler) deleteEvent(c *gin.Context) {
	eventID := c.Param("event_id")
	if eventID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "event_id is required"})
		return
	}

	// Получаем пользователя из контекста
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

	// Получаем админского пользователя, если он есть
	adminUser, _ := h.cases.AdminUser.GetByUserID(c, domainUser.ID)
	
	// Проверяем права на удаление через стратегию
	strategy := h.cases.Event.GetStrategy(event.Type)
	if err := strategy.CanDelete(domainUser, adminUser, event); err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	// Удаляем событие
	err = h.cases.Event.Delete(c, eventID)
	if ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "failed to delete event") {
		return
	}

	c.Status(http.StatusNoContent)
}
