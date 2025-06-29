package tournament

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/shampsdev/go-telegram-template/pkg/domain"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/ginerr"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/middlewares"
	"github.com/shampsdev/go-telegram-template/pkg/usecase"
)

// Filter godoc
// @Summary Filter tournaments
// @Tags tournaments
// @Accept json
// @Produce json
// @Schemes http https
// @Param filter body domain.FilterTournament true "Tournament filter"
// @Success 200 {array} domain.Tournament "List of tournaments"
// @Failure 400 "Bad Request"
// @Failure 401 "Unauthorized"
// @Failure 500 "Internal Server Error"
// @Security ApiKeyAuth
// @Router /tournaments/filter [post]
func Filter(tournamentCase *usecase.Tournament) gin.HandlerFunc {
	return func(c *gin.Context) {
		user := middlewares.MustGetUser(c)

		var filterTournament domain.FilterTournament
		if err := c.ShouldBindJSON(&filterTournament); err != nil {
			ginerr.AbortIfErr(c, err, http.StatusBadRequest, "invalid request body")
			return
		}

		tournaments, err := tournamentCase.Filter(usecase.NewContext(c, user), &filterTournament)
		if err != nil {
			ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "failed to filter tournaments")
			return
		}

		c.JSON(http.StatusOK, tournaments)
	}
}
