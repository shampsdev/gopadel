package admin_auth

import (
	"github.com/gin-gonic/gin"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/middlewares"
	"github.com/shampsdev/go-telegram-template/pkg/usecase"
)

func Setup(r *gin.RouterGroup, useCases usecase.Cases) {
	handler := NewHandler(useCases.AdminUser)
	
	adminAuthGroup := r.Group("/admin/auth")
	{
		adminAuthGroup.POST("/login", handler.Login)
		
		protected := adminAuthGroup.Group("")
		protected.Use(middlewares.RequireAdminJWT(useCases.AdminUser))
		{
			protected.GET("/me", handler.Me)
			protected.POST("/change-password", handler.ChangePassword)
		}
	}
} 