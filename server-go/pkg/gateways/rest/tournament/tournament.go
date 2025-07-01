package tournament

import (
	"github.com/gin-gonic/gin"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/middlewares"
	"github.com/shampsdev/go-telegram-template/pkg/usecase"
)

func Setup(r *gin.RouterGroup, cases usecase.Cases) {
	tournaments := r.Group("/tournaments")
	middlewares.SetupAuth(tournaments, cases.User)

	tournaments.POST("/filter", Filter(cases.Tournament))
	tournaments.GET("/:tournament_id/participants", GetTournamentParticipants(cases.Tournament))
	tournaments.GET("/:tournament_id/waitlist", GetTournamentWaitlist(cases.Waitlist))
}
