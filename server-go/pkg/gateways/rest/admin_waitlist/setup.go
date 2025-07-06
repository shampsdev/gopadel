package admin_waitlist

import (
	"github.com/gin-gonic/gin"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/middlewares"
	"github.com/shampsdev/go-telegram-template/pkg/usecase"
)

func Setup(r *gin.RouterGroup, useCases usecase.Cases) {
	handler := NewHandler(useCases.Waitlist)

	adminWaitlistGroup := r.Group("/admin/waitlist")
	{
		// Все эндпоинты требуют JWT авторизации
		adminWaitlistGroup.Use(middlewares.RequireAdminJWT(useCases.AdminUser))
		
		// GET /admin/waitlist/tournament/:tournamentId - получить список ожидания турнира (любой админ, только чтение)
		adminWaitlistGroup.GET("/tournament/:tournamentId", handler.GetTournamentWaitlist)
	}
} 