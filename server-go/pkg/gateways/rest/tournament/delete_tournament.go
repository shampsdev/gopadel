package tournament

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/ginerr"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/middlewares"
	"github.com/shampsdev/go-telegram-template/pkg/usecase"
)

// DeleteTournament godoc
// @Summary Delete tournament
// @Description Deletes a tournament. Only the tournament organizer can delete their tournament.
// @Tags tournaments
// @Accept json
// @Produce json
// @Param tournament_id path string true "Tournament ID"
// @Success 204 "Tournament deleted successfully"
// @Failure 400 {object} map[string]string "Invalid request data"
// @Failure 401 {object} map[string]string "User not authorized"
// @Failure 403 {object} map[string]string "Not tournament organizer or admin rights required"
// @Failure 404 {object} map[string]string "Tournament not found"
// @Failure 500 {object} map[string]string "Internal server error"
// @Security ApiKeyAuth
// @Router /tournaments/{tournament_id} [delete]
func DeleteTournament(tournamentCase *usecase.Tournament) gin.HandlerFunc {
	return func(c *gin.Context) {
		user := middlewares.MustGetUser(c)
		// Проверяем, что пользователь является Telegram админом
		admin := middlewares.MustGetTelegramAdmin(c)

		tournamentID := c.Param("tournament_id")
		if tournamentID == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "tournament_id is required"})
			return
		}

		// Суперпользователи могут удалять любые турниры
		// Обычные админы - только свои
		if !admin.IsSuperUser {
			err := tournamentCase.CheckOwnership(c.Request.Context(), tournamentID, user.ID)
			if err != nil {
				c.JSON(http.StatusForbidden, gin.H{"error": "you can only delete your own tournaments"})
				return
			}
		}

		err := tournamentCase.Delete(c.Request.Context(), tournamentID)
		if ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "failed to delete tournament") {
			return
		}

		c.Status(http.StatusNoContent)
	}
} 