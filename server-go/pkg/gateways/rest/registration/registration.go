package registration

import (
	"github.com/gin-gonic/gin"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/middlewares"
	"github.com/shampsdev/go-telegram-template/pkg/usecase"
)

func Setup(r *gin.RouterGroup, cases usecase.Cases) {
	g := r.Group("/registrations")
	
	// Применяем middleware для аутентификации ко всем эндпоинтам
	g.Use(middlewares.ExtractUserTGData())
	g.Use(middlewares.AuthUser(cases.User))

	// Create PENDING registration or update CANCELED -> PENDING
	g.POST("/:tournament_id", RegisterForTournament(cases.Registration, cases.User))
	
	// Cancel registration before payment (PENDING -> CANCELED)
	g.POST("/:tournament_id/cancel", CancelBeforePayment(cases.Registration, cases.User))
	
	// Cancel registration after payment (ACTIVE -> CANCELED_BY_USER)
	g.POST("/:tournament_id/cancel-paid", CancelAfterPayment(cases.Registration, cases.User))
	
	// Reactivate canceled registration (CANCELED_BY_USER -> ACTIVE)
	g.POST("/:tournament_id/reactivate", ReactivateRegistration(cases.Registration, cases.User))
	
	// Get user registrations
	g.GET("/my", GetMyRegistrations(cases.Registration, cases.User))
} 