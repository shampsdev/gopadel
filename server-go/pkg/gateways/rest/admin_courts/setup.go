package admin_courts

import (
	"github.com/gin-gonic/gin"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/middlewares"
	"github.com/shampsdev/go-telegram-template/pkg/usecase"
)

func Setup(r *gin.RouterGroup, useCases usecase.Cases) {
	handler := NewHandler(useCases.Court)
	
	adminCourtsGroup := r.Group("/admin/courts")
	{
		adminCourtsGroup.Use(middlewares.RequireAdminJWT(useCases.AdminUser))
		
		adminCourtsGroup.GET("", handler.GetCourts)
		
		superUserGroup := adminCourtsGroup.Group("")
		superUserGroup.Use(middlewares.RequireAdminSuperuser())
		
		superUserGroup.POST("", handler.CreateCourt)
		superUserGroup.GET("/:id", handler.GetCourt)
		superUserGroup.PATCH("/:id", handler.UpdateCourt)
		superUserGroup.DELETE("/:id", handler.DeleteCourt)
	}
} 