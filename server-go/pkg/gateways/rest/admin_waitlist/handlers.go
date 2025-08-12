package admin_waitlist

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/shampsdev/go-telegram-template/pkg/domain"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/ginerr"
	"github.com/shampsdev/go-telegram-template/pkg/usecase"
)

type Handler struct {
	waitlistCase *usecase.Waitlist
}

func NewHandler(waitlistCase *usecase.Waitlist) *Handler {
	return &Handler{
		waitlistCase: waitlistCase,
	}
}

// GetEventWaitlist получает вейтлист для события
// @Summary Get event waitlist (Admin)
// @Description Get waitlist for specific event. Available for any admin.
// @Tags admin-waitlist
// @Produce json
// @Security BearerAuth
// @Param event_id path string true "Event ID"
// @Success 200 {array} domain.WaitlistUser "List of waitlist users"
// @Failure 400 {object} domain.ErrorResponse "Bad Request"
// @Failure 401 {object} domain.ErrorResponse "Unauthorized"
// @Failure 500 {object} domain.ErrorResponse "Internal Server Error"
// @Router /admin/events/{event_id}/waitlist [get]
func (h *Handler) GetEventWaitlist(c *gin.Context) {
	eventID := c.Param("event_id")
	if eventID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "event_id is required"})
		return
	}

	waitlist, err := h.waitlistCase.GetEventWaitlistUsers(c, eventID)
	if ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "failed to get waitlist") {
		return
	}

	if waitlist == nil {
		waitlist = []*domain.WaitlistUser{}
	}

	c.JSON(http.StatusOK, waitlist)
} 