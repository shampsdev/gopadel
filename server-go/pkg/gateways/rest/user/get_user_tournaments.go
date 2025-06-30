package user

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/shampsdev/go-telegram-template/pkg/domain"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/ginerr"
	"github.com/shampsdev/go-telegram-template/pkg/usecase"
)

// GetUserTournaments godoc
// @Summary Get tournaments by user ID
// @Tags users
// @Accept json
// @Produce json
// @Schemes http https
// @Param user_id path string true "User ID"
// @Success 200 {array} domain.Tournament "List of tournaments where user participated"
// @Failure 400 "Bad Request"
// @Failure 401 "Unauthorized"
// @Failure 500 "Internal Server Error"
// @Security ApiKeyAuth
// @Router /users/{user_id}/tournaments [get]
func GetUserTournaments(tournamentCase *usecase.Tournament) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.Param("user_id")
		if userID == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "user_id is required"})
			return
		}

		tournaments, err := tournamentCase.GetTournamentsByUserID(usecase.NewContext(c, nil), userID)
		if ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "failed to get user tournaments") {
			return
		}

		if tournaments == nil {
			tournaments = []*domain.Tournament{}
		}

		c.JSON(http.StatusOK, tournaments)
	}
} 