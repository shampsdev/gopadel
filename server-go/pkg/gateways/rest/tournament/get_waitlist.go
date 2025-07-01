package tournament

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/ginerr"
	"github.com/shampsdev/go-telegram-template/pkg/usecase"
)

// GetTournamentWaitlist godoc
// @Summary Get tournament waitlist
// @Description Get list of users in tournament waitlist
// @Tags tournaments
// @Accept json
// @Produce json
// @Param tournament_id path string true "Tournament ID"
// @Success 200 {array} domain.Waitlist "Tournament waitlist"
// @Failure 400 {object} map[string]string "Invalid tournament ID"
// @Failure 404 {object} map[string]string "Tournament not found"
// @Failure 500 {object} map[string]string "Internal server error"
// @Security ApiKeyAuth
// @Router /tournaments/{tournament_id}/waitlist [get]
func GetTournamentWaitlist(waitlistCase *usecase.Waitlist) gin.HandlerFunc {
	return func(c *gin.Context) {
		tournamentID := c.Param("tournament_id")
		if tournamentID == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "tournament_id is required"})
			return
		}

		waitlists, err := waitlistCase.GetTournamentWaitlist(c.Request.Context(), tournamentID)
		if ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "failed to get tournament waitlist") {
			return
		}

		c.JSON(http.StatusOK, waitlists)
	}
}
