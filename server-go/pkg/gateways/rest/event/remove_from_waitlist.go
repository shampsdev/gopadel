package event

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/shampsdev/go-telegram-template/pkg/domain"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/ginerr"
)

// RemoveFromWaitlist godoc
// @Summary Remove current user from event waitlist
// @Tags events
// @Accept json
// @Produce json
// @Schemes http https
// @Param event_id path string true "Event ID"
// @Success 200 {array} domain.WaitlistUser "Updated waitlist after removal"
// @Failure 400 "Bad Request"
// @Failure 401 "Unauthorized"
// @Failure 500 "Internal Server Error"
// @Security ApiKeyAuth
// @Router /events/{event_id}/waitlist [delete]
func (h *Handler) removeFromWaitlist(c *gin.Context) {
	eventID := c.Param("event_id")
	if eventID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "event_id is required"})
		return
	}

	// Получаем пользователя из контекста (должен быть установлен middleware)
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

	err := h.cases.Waitlist.RemoveFromWaitlist(c, domainUser.ID, eventID)
	if ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "failed to remove from waitlist") {
		return
	}

	waitlist, err := h.cases.Waitlist.GetEventWaitlistUsers(c, eventID)
	if ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "failed to get updated waitlist") {
		return
	}

	c.JSON(http.StatusOK, waitlist)
} 