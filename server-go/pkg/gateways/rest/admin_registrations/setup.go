package admin_registrations

import (
	"github.com/gin-gonic/gin"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/middlewares"
	"github.com/shampsdev/go-telegram-template/pkg/usecase"
)

func Setup(r *gin.RouterGroup, useCases usecase.Cases) {
	handler := NewHandler(useCases.Registration)
	
	adminRegistrationsGroup := r.Group("/admin/registrations")
	{
		// Все эндпоинты требуют JWT авторизации
		adminRegistrationsGroup.Use(middlewares.RequireAdminJWT(useCases.AdminUser))
		
		// POST /admin/registrations/filter - получить список регистраций с фильтрацией (любой админ)
		adminRegistrationsGroup.POST("/filter", handler.FilterRegistrations)
		
		// Эндпоинты для изменения статусов требуют права суперпользователя
		superUserGroup := adminRegistrationsGroup.Group("")
		superUserGroup.Use(middlewares.RequireAdminSuperuser())
		
		// PATCH /admin/registrations/:user_id/:event_id/status - обновить статус регистрации (только суперпользователь)
		superUserGroup.PATCH("/:user_id/:event_id/status", handler.UpdateRegistrationStatus)
	}
} 