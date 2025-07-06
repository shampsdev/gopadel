package admin_clubs

import (
	"github.com/gin-gonic/gin"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/middlewares"
	"github.com/shampsdev/go-telegram-template/pkg/usecase"
)

func Setup(r *gin.RouterGroup, useCases usecase.Cases) {
	handler := NewHandler(useCases.Club)
	
	adminClubsGroup := r.Group("/admin/clubs")
	{
		// Все эндпоинты требуют JWT авторизации
		adminClubsGroup.Use(middlewares.RequireAdminJWT(useCases.AdminUser))
		
		// GET /admin/clubs - получить все клубы (любой админ)
		adminClubsGroup.GET("", handler.GetAllClubs)
		
		// Эндпоинты для изменения данных требуют права суперпользователя
		superUserGroup := adminClubsGroup.Group("")
		superUserGroup.Use(middlewares.RequireAdminSuperuser())
		
		// POST /admin/clubs - создать новый клуб (только суперпользователь)
		superUserGroup.POST("", handler.CreateClub)
		
		// PATCH /admin/clubs/:id - обновить клуб (только суперпользователь)
		superUserGroup.PATCH("/:id", handler.PatchClub)
		
		// DELETE /admin/clubs/:id - удалить клуб (только суперпользователь)
		superUserGroup.DELETE("/:id", handler.DeleteClub)
	}
}
