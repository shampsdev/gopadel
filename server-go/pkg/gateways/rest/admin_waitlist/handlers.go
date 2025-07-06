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

// GetTournamentWaitlist получает список ожидания для турнира
// @Summary Get tournament waitlist (Admin)
// @Description Get waitlist users for a specific tournament. Available for any admin. Read-only access.
// @Tags admin-waitlist
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param tournamentId path string true "Tournament ID"
// @Success 200 {array} domain.WaitlistUser
// @Failure 400 {object} domain.ErrorResponse
// @Failure 401 {object} domain.ErrorResponse
// @Failure 500 {object} domain.ErrorResponse
// @Router /admin/waitlist/tournament/{tournamentId} [get]
func (h *Handler) GetTournamentWaitlist(c *gin.Context) {
	tournamentID := c.Param("tournamentId")
	if tournamentID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Tournament ID is required"})
		return
	}

	waitlistUsers, err := h.waitlistCase.GetTournamentWaitlistUsers(c.Request.Context(), tournamentID)
	if ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "Failed to get tournament waitlist") {
		return
	}

	if waitlistUsers == nil {
		waitlistUsers = []*domain.WaitlistUser{}
	}

	c.JSON(http.StatusOK, waitlistUsers)
} 