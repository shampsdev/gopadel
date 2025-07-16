package event

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/ginerr"
)

// GetWaitlist godoc
// @Summary Get event waitlist
// @Tags events
// @Accept json
// @Produce json
// @Schemes http https
// @Param event_id path string true "Event ID"
// @Success 200 {array} domain.WaitlistUser "List of waitlist users"
// @Failure 400 "Bad Request"
// @Failure 401 "Unauthorized"
// @Failure 500 "Internal Server Error"
// @Security ApiKeyAuth
// @Router /events/{event_id}/waitlist [get]
func (h *Handler) getWaitlist(c *gin.Context) {
	eventID := c.Param("event_id")
	if eventID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "event_id is required"})
		return
	}

	waitlist, err := h.cases.Waitlist.GetEventWaitlistUsers(c, eventID)
	if ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "failed to get waitlist") {
		return
	}

	c.JSON(http.StatusOK, waitlist)
} 