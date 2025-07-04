package courts

import (
	"github.com/gin-gonic/gin"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/middlewares"
	"github.com/shampsdev/go-telegram-template/pkg/usecase"
)

func Setup(r *gin.RouterGroup, useCases usecase.Cases) {
	handler := NewHandler(useCases.Club)
	
	courtsGroup := r.Group("/courts")
	{
		// Применяем аутентификацию пользователя
		courtsGroup.Use(middlewares.ExtractUserTGData())
		courtsGroup.Use(middlewares.AuthUser(useCases.User))
		
		// Проверяем админские права через Telegram
		courtsGroup.Use(middlewares.RequireTelegramAdmin(useCases.AdminUser))
		
		// GET /courts - получить все корты (только для админов)
		courtsGroup.GET("", handler.GetCourts)
	}
} 