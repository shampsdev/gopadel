package admin_loyalties

import (
	"github.com/gin-gonic/gin"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/middlewares"
	"github.com/shampsdev/go-telegram-template/pkg/usecase"
)

func Setup(r *gin.RouterGroup, useCases usecase.Cases) {
	handler := NewHandler(useCases.Loyalty)
	
	adminLoyaltiesGroup := r.Group("/admin/loyalties")
	{
		// Все эндпоинты требуют JWT авторизации
		adminLoyaltiesGroup.Use(middlewares.RequireAdminJWT(useCases.AdminUser))
		
		// GET /admin/loyalties - получить все уровни лояльности (любой админ)
		adminLoyaltiesGroup.GET("", handler.GetAllLoyalties)
		
		// Эндпоинты для изменения данных требуют права суперпользователя
		superUserGroup := adminLoyaltiesGroup.Group("")
		superUserGroup.Use(middlewares.RequireAdminSuperuser())
		
		// POST /admin/loyalties - создать новый уровень лояльности (только суперпользователь)
		superUserGroup.POST("", handler.CreateLoyalty)
		
		// PATCH /admin/loyalties/:id - обновить уровень лояльности (только суперпользователь)
		superUserGroup.PATCH("/:id", handler.PatchLoyalty)
		
		// DELETE /admin/loyalties/:id - удалить уровень лояльности (только суперпользователь)
		superUserGroup.DELETE("/:id", handler.DeleteLoyalty)
	}
} 