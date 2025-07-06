package admin_tournaments

import (
	"github.com/gin-gonic/gin"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/middlewares"
	"github.com/shampsdev/go-telegram-template/pkg/usecase"
)

func Setup(r *gin.RouterGroup, useCases usecase.Cases) {
	handler := NewHandler(useCases.Tournament)

	adminTournamentsGroup := r.Group("/admin/tournaments")
	{
		// Все эндпоинты требуют JWT авторизации
		adminTournamentsGroup.Use(middlewares.RequireAdminJWT(useCases.AdminUser))
		
		// POST /admin/tournaments/filter - получить турниры с фильтрацией (любой админ)
		adminTournamentsGroup.POST("/filter", handler.GetAllTournaments)
		
		// POST /admin/tournaments - создать новый турнир (любой админ)
		adminTournamentsGroup.POST("", handler.CreateTournament)
		
		// PATCH /admin/tournaments/:id - обновить турнир (любой админ)
		adminTournamentsGroup.PATCH("/:id", handler.PatchTournament)
		
		// DELETE /admin/tournaments/:id - удалить турнир (любой админ)
		adminTournamentsGroup.DELETE("/:id", handler.DeleteTournament)
	}
} 