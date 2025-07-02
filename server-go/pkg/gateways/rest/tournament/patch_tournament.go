package tournament

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/shampsdev/go-telegram-template/pkg/domain"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/ginerr"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/middlewares"
	"github.com/shampsdev/go-telegram-template/pkg/usecase"
)

// PatchTournament godoc
// @Summary Update tournament
// @Description Updates tournament data. Only the tournament organizer can update their tournament.
// @Tags tournaments
// @Accept json
// @Produce json
// @Param tournament_id path string true "Tournament ID"
// @Param tournament body domain.PatchTournament true "Tournament update data"
// @Success 200 {object} domain.Tournament "Updated tournament"
// @Failure 400 {object} map[string]string "Invalid request data"
// @Failure 401 {object} map[string]string "User not authorized"
// @Failure 403 {object} map[string]string "Not tournament organizer or admin rights required"
// @Failure 404 {object} map[string]string "Tournament not found"
// @Failure 500 {object} map[string]string "Internal server error"
// @Security ApiKeyAuth
// @Router /tournaments/{tournament_id} [patch]
func PatchTournament(tournamentCase *usecase.Tournament) gin.HandlerFunc {
	return func(c *gin.Context) {
		user := middlewares.MustGetUser(c)
		// Проверяем, что пользователь является Telegram админом
		_ = middlewares.MustGetTelegramAdmin(c)

		tournamentID := c.Param("tournament_id")
		if tournamentID == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "tournament_id is required"})
			return
		}

		// Проверяем, что турнир принадлежит данному админу
		err := tournamentCase.CheckOwnership(c.Request.Context(), tournamentID, user.ID)
		if err != nil {
			c.JSON(http.StatusForbidden, gin.H{"error": "you can only update your own tournaments"})
			return
		}

		var patchTournament domain.PatchTournament
		if err := c.ShouldBindJSON(&patchTournament); err != nil {
			ginerr.AbortIfErr(c, err, http.StatusBadRequest, "invalid request body")
			return
		}

		tournament, err := tournamentCase.Patch(c.Request.Context(), tournamentID, &patchTournament)
		if ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "failed to update tournament") {
			return
		}

		c.JSON(http.StatusOK, tournament)
	}
} 