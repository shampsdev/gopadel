package admin_courts

import (
	"github.com/gin-gonic/gin"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/middlewares"
	"github.com/shampsdev/go-telegram-template/pkg/usecase"
)

func Setup(r *gin.RouterGroup, useCases usecase.Cases) {
	handler := NewHandler(useCases.Club)
	
	adminCourtsGroup := r.Group("/admin/courts")
	{
		adminCourtsGroup.Use(middlewares.RequireAdminJWT(useCases.AdminUser))
		
		// GET /admin/courts - получить все корты (любой админ)
		adminCourtsGroup.GET("", handler.GetAllCourts)
		
		// Эндпоинты для изменения данных требуют права суперпользователя
		superUserGroup := adminCourtsGroup.Group("")
		superUserGroup.Use(middlewares.RequireAdminSuperuser())
		
		superUserGroup.POST("", handler.CreateCourt)
		
		superUserGroup.PATCH("/:id", handler.PatchCourt)
		
		superUserGroup.DELETE("/:id", handler.DeleteCourt)
	}
} 