package tournament

import (
	"github.com/gin-gonic/gin"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/middlewares"
	"github.com/shampsdev/go-telegram-template/pkg/usecase"
)

func Setup(r *gin.RouterGroup, cases usecase.Cases) {
	tournaments := r.Group("/tournaments")
	middlewares.SetupAuth(tournaments, cases.User)

	// Публичные endpoints для турниров
	tournaments.POST("/filter", Filter(cases.Tournament))
	tournaments.GET("/:tournament_id/waitlist", GetTournamentWaitlist(cases.Waitlist))
	tournaments.POST("/:tournament_id/waitlist", AddToTournamentWaitlist(cases.Waitlist))
	tournaments.DELETE("/:tournament_id/waitlist", RemoveFromTournamentWaitlist(cases.Waitlist))

	// Админские endpoints для управления турнирами
	adminTournaments := tournaments.Group("")
	adminTournaments.Use(middlewares.RequireTelegramAdmin(cases.AdminUser))
	adminTournaments.POST("", CreateTournament(cases.Tournament))
	adminTournaments.PATCH("/:tournament_id", PatchTournament(cases.Tournament))
	adminTournaments.DELETE("/:tournament_id", DeleteTournament(cases.Tournament))
}
