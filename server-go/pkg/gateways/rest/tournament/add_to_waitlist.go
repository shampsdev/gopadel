package tournament

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/ginerr"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/middlewares"
	"github.com/shampsdev/go-telegram-template/pkg/usecase"
)

// AddToTournamentWaitlist godoc
// @Summary Add user to tournament waitlist
// @Description Add authenticated user to tournament waitlist. Checks that tournament has not ended.
// @Tags tournaments
// @Accept json
// @Produce json
// @Param tournament_id path string true "Tournament ID"
// @Success 200 {object} domain.Waitlist "User added to waitlist"
// @Failure 400 {object} map[string]string "Invalid tournament ID or tournament has ended"
// @Failure 401 {object} map[string]string "User not authorized"
// @Failure 404 {object} map[string]string "Tournament not found"
// @Failure 409 {object} map[string]string "User already in waitlist"
// @Failure 500 {object} map[string]string "Internal server error"
// @Security ApiKeyAuth
// @Router /tournaments/{tournament_id}/waitlist [post]
func AddToTournamentWaitlist(waitlistCase *usecase.Waitlist) gin.HandlerFunc {
	return func(c *gin.Context) {
		user := middlewares.MustGetUser(c)
		tournamentID := c.Param("tournament_id")
		if tournamentID == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "tournament_id is required"})
			return
		}

		waitlistEntry, err := waitlistCase.AddToWaitlist(c.Request.Context(), user.ID, tournamentID)
		if err != nil {
			switch {
			case err.Error() == "tournament not found":
				c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			case err.Error() == "tournament has already ended":
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			case err.Error() == "user is already in the waitlist for this tournament":
				c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
			default:
				ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "failed to add user to waitlist")
			}
			return
		}

		c.JSON(http.StatusOK, waitlistEntry)
	}
} 