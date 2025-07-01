package tournament

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/shampsdev/go-telegram-template/pkg/domain"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/ginerr"
	"github.com/shampsdev/go-telegram-template/pkg/usecase"
)

// GetTournamentParticipants godoc
// @Summary Get tournament participants
// @Description Get all participants of a tournament with status ACTIVE, PENDING, or CANCELED_BY_USER
// @Tags tournaments
// @Accept json
// @Produce json
// @Schemes http https
// @Param tournament_id path string true "Tournament ID"
// @Success 200 {array} domain.Registration "List of tournament participants"
// @Failure 400 "Bad Request"
// @Failure 401 "Unauthorized"
// @Failure 404 "Tournament not found"
// @Failure 500 "Internal Server Error"
// @Security ApiKeyAuth
// @Router /tournaments/{tournament_id}/participants [get]
func GetTournamentParticipants(tournamentCase *usecase.Tournament) gin.HandlerFunc {
	return func(c *gin.Context) {
		tournamentID := c.Param("tournament_id")
		if tournamentID == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "tournament_id is required"})
			return
		}

		participants, err := tournamentCase.GetTournamentParticipants(c.Request.Context(), tournamentID)
		if ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "failed to get tournament participants") {
			return
		}

		if participants == nil {
			participants = []*domain.Registration{}
		}

		c.JSON(http.StatusOK, participants)
	}
} 