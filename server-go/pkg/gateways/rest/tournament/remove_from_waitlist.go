package tournament

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/ginerr"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/middlewares"
	"github.com/shampsdev/go-telegram-template/pkg/usecase"
)

// RemoveFromTournamentWaitlist godoc
// @Summary Remove user from tournament waitlist
// @Description Remove authenticated user from tournament waitlist
// @Tags tournaments
// @Accept json
// @Produce json
// @Param tournament_id path string true "Tournament ID"
// @Success 200 {object} map[string]string "User removed from waitlist"
// @Failure 400 {object} map[string]string "Invalid tournament ID"
// @Failure 401 {object} map[string]string "User not authorized"
// @Failure 404 {object} map[string]string "Tournament not found or user not in waitlist"
// @Failure 500 {object} map[string]string "Internal server error"
// @Security ApiKeyAuth
// @Router /tournaments/{tournament_id}/waitlist [delete]
func RemoveFromTournamentWaitlist(waitlistCase *usecase.Waitlist) gin.HandlerFunc {
	return func(c *gin.Context) {
		user := middlewares.MustGetUser(c)
		tournamentID := c.Param("tournament_id")
		if tournamentID == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "tournament_id is required"})
			return
		}

		err := waitlistCase.RemoveFromWaitlist(c.Request.Context(), user.ID, tournamentID)
		if err != nil {
			switch {
			case err.Error() == "tournament not found":
				c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			case err.Error() == "user is not in the waitlist for this tournament":
				c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			default:
				ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "failed to remove user from waitlist")
			}
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Successfully removed from waitlist"})
	}
} 