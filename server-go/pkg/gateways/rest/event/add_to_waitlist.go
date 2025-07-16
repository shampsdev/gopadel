package event

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/shampsdev/go-telegram-template/pkg/domain"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/ginerr"
)

// AddToWaitlist godoc
// @Summary Add current user to event waitlist
// @Tags events
// @Accept json
// @Produce json
// @Schemes http https
// @Param event_id path string true "Event ID"
// @Success 201 {object} domain.Waitlist "Waitlist entry created"
// @Failure 400 "Bad Request"
// @Failure 401 "Unauthorized"
// @Failure 500 "Internal Server Error"
// @Security ApiKeyAuth
// @Router /events/{event_id}/waitlist [post]
func (h *Handler) addToWaitlist(c *gin.Context) {
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

	waitlistEntry, err := h.cases.Waitlist.AddToWaitlist(c, domainUser.ID, eventID)
	if ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "failed to add to waitlist") {
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"data": waitlistEntry,
	})
} 