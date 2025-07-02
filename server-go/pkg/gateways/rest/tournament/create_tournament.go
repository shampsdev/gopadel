package tournament

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/shampsdev/go-telegram-template/pkg/domain"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/ginerr"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/middlewares"
	"github.com/shampsdev/go-telegram-template/pkg/usecase"
)

// CreateTournament godoc
// @Summary Create tournament
// @Description Creates a new tournament. Requires telegram admin rights.
// @Tags tournaments
// @Accept json
// @Produce json
// @Param tournament body domain.CreateTournament true "Tournament data"
// @Success 201 {object} domain.Tournament "Created tournament"
// @Failure 400 {object} map[string]string "Invalid request data"
// @Failure 401 {object} map[string]string "User not authorized"
// @Failure 403 {object} map[string]string "Telegram admin rights required"
// @Failure 500 {object} map[string]string "Internal server error"
// @Security ApiKeyAuth
// @Router /tournaments [post]
func CreateTournament(tournamentCase *usecase.Tournament) gin.HandlerFunc {
	return func(c *gin.Context) {
		user := middlewares.MustGetUser(c)
		// Проверяем, что пользователь является Telegram админом
		_ = middlewares.MustGetTelegramAdmin(c)

		var createTournament domain.CreateTournament
		if err := c.ShouldBindJSON(&createTournament); err != nil {
			ginerr.AbortIfErr(c, err, http.StatusBadRequest, "invalid request body")
			return
		}

		// Устанавливаем организатора как текущего пользователя-админа
		createTournament.OrganizatorID = user.ID

		tournament, err := tournamentCase.Create(c.Request.Context(), &createTournament)
		if ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "failed to create tournament") {
			return
		}

		c.JSON(http.StatusCreated, tournament)
	}
} 