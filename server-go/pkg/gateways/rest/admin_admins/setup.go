package admin_admins

import (
	"github.com/gin-gonic/gin"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/middlewares"
	"github.com/shampsdev/go-telegram-template/pkg/usecase"
)

func Setup(r *gin.RouterGroup, useCases usecase.Cases) {
	handler := NewHandler(useCases.AdminUser)
	
	adminAdminsGroup := r.Group("/admin")
	{
		// Все эндпоинты требуют JWT авторизации и права суперпользователя
		adminAdminsGroup.Use(middlewares.RequireAdminJWT(useCases.AdminUser))
		adminAdminsGroup.Use(middlewares.RequireAdminSuperuser())
		
		// POST /admin/admins/filter - получить список админов с фильтрацией
		adminAdminsGroup.POST("/filter", handler.FilterAdmins)
		
		// POST /admin/admins - создать нового админа
		adminAdminsGroup.POST("", handler.CreateAdmin)
		
		// PATCH /admin/admins/:id - обновить админа
		adminAdminsGroup.PATCH("/:id", handler.PatchAdmin)
		
		// DELETE /admin/admins/:id - удалить админа
		adminAdminsGroup.DELETE("/:id", handler.DeleteAdmin)
	}
} 