package admin_events

import (
	"github.com/gin-gonic/gin"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/middlewares"
	"github.com/shampsdev/go-telegram-template/pkg/usecase"
)

func Setup(r *gin.RouterGroup, useCases usecase.Cases) {
	handler := NewHandler(useCases.Event)
	
	adminEventsGroup := r.Group("/admin/events")
	{
		// Все эндпоинты требуют JWT авторизации
		adminEventsGroup.Use(middlewares.RequireAdminJWT(useCases.AdminUser))
		
		// POST /admin/events/filter - получить список событий с фильтрацией (любой админ)
		adminEventsGroup.POST("/filter", handler.FilterEvents)
		
		// POST /admin/events - создать новое событие (любой админ)
		adminEventsGroup.POST("", handler.CreateEvent)
		
		// PATCH /admin/events/:id - обновить событие (любой админ)
		adminEventsGroup.PATCH("/:id", handler.PatchEvent)
		
		// DELETE /admin/events/:id - удалить событие (любой админ)
		adminEventsGroup.DELETE("/:id", handler.DeleteEvent)
	}
} 