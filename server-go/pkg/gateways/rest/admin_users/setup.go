package admin_users

import (
	"github.com/gin-gonic/gin"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/middlewares"
	"github.com/shampsdev/go-telegram-template/pkg/usecase"
)

func Setup(r *gin.RouterGroup, useCases usecase.Cases) {
	handler := NewHandler(useCases.User)
	
	adminUsersGroup := r.Group("/admin/users")
	{
		// Все эндпоинты требуют JWT авторизации
		adminUsersGroup.Use(middlewares.RequireAdminJWT(useCases.AdminUser))
		
		// GET /admin/users - получить список пользователей (любой админ)
		adminUsersGroup.POST("/filter", handler.FilterUsers)
		
		// PATCH /admin/users/:id - обновить пользователя (только суперюзер)
		adminUsersGroup.PATCH("/:id", middlewares.RequireAdminSuperuser(), handler.PatchUser)
	}
} 