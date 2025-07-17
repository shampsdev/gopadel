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

	// Проверяем права доступа
	if !h.canDeleteEvent(c, domainUser, event) {
		c.JSON(http.StatusForbidden, gin.H{"error": "insufficient permissions to delete this event"})
		return
	}

	// Удаляем событие
	err = h.cases.Event.Delete(c, eventID)
	if ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "failed to delete event") {
		return
	}

	c.Status(http.StatusNoContent)
}

// canDeleteEvent проверяет, может ли пользователь удалить событие
// Правила:
// - Суперюзер может удалять любые события
// - Администратор может удалять свои турниры и любые игры  
// - Пользователи могут удалять только свои игры
func (h *Handler) canDeleteEvent(c *gin.Context, user *domain.User, event *domain.Event) bool {
	// Проверяем, является ли пользователь администратором
	adminUser, err := h.cases.AdminUser.GetByUserID(c, user.ID)
	if err == nil {
		// Пользователь является администратором
		
		// Если суперюзер - может удалять все
		if adminUser.IsSuperUser {
			return true
		}
		
		// Обычный администратор может удалять свои турниры
		if event.Type == domain.EventTypeTournament && event.Organizer.ID == user.ID {
			return true
		}
		
		// И любые игры
		if event.Type == domain.EventTypeGame {
			return true
		}
		
		return false
	}

	// Обычные пользователи могут удалять только свои игры
	return event.Type == domain.EventTypeGame && event.Organizer.ID == user.ID
} 