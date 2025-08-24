package courts

import (
	"github.com/gin-gonic/gin"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/middlewares"
	"github.com/shampsdev/go-telegram-template/pkg/usecase"
)

func Setup(r *gin.RouterGroup, useCases usecase.Cases) {
	handler := NewHandler(useCases.Court)
	
	courtsGroup := r.Group("/courts")
	{
		// Применяем аутентификацию пользователя
		courtsGroup.Use(middlewares.ExtractUserTGData())
		courtsGroup.Use(middlewares.AuthUser(useCases.User))
		
		// GET /courts - получить все корты (для всех пользователей)
		courtsGroup.GET("", handler.GetCourts)
	}
} 