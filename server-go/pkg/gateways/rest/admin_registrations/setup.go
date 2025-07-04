package admin_registrations

import (
	"github.com/gin-gonic/gin"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/middlewares"
	"github.com/shampsdev/go-telegram-template/pkg/usecase"
)

func Setup(r *gin.RouterGroup, useCases usecase.Cases) {
	handler := NewHandler(useCases.Registration, useCases.Tournament, useCases.User)
	
	adminRegistrationsGroup := r.Group("/admin/registrations")
	{
		// Все эндпоинты требуют JWT авторизации
		adminRegistrationsGroup.Use(middlewares.RequireAdminJWT(useCases.AdminUser))
		
		// Эндпоинты для чтения данных (любой админ)
		adminRegistrationsGroup.POST("/filter", handler.FilterRegistrations)
		adminRegistrationsGroup.GET("/:id", handler.GetRegistration)
		adminRegistrationsGroup.GET("/tournaments", handler.GetTournamentOptions)
		adminRegistrationsGroup.POST("/users", handler.GetUserOptions)
		
		// Эндпоинты для изменения данных требуют права суперпользователя
		superUserGroup := adminRegistrationsGroup.Group("")
		superUserGroup.Use(middlewares.RequireAdminSuperuser())
		
		superUserGroup.PATCH("/:id/status", handler.UpdateRegistrationStatus)
	}
} 