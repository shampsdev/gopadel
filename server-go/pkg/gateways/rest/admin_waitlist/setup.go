package admin_waitlist

import (
	"github.com/gin-gonic/gin"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/middlewares"
	"github.com/shampsdev/go-telegram-template/pkg/usecase"
)

func Setup(r *gin.RouterGroup, useCases usecase.Cases) {
	handler := NewHandler(useCases.Waitlist)
	
	adminEventsGroup := r.Group("/admin/events")
	{
		// Все эндпоинты требуют JWT авторизации
		adminEventsGroup.Use(middlewares.RequireAdminJWT(useCases.AdminUser))
		
		// GET /admin/events/:event_id/waitlist - получить вейтлист события (любой админ)
		adminEventsGroup.GET("/:event_id/waitlist", handler.GetEventWaitlist)
	}
} 