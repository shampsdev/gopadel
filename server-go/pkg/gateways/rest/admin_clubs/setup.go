package admin_clubs

import (
	"github.com/gin-gonic/gin"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/middlewares"
	"github.com/shampsdev/go-telegram-template/pkg/usecase"
)

func Setup(r *gin.RouterGroup, useCases usecase.Cases) {
	handler := NewHandler(useCases.Club)
	
	adminClubsGroup := r.Group("/admin/clubs")
	{
		adminClubsGroup.Use(middlewares.RequireAdminJWT(useCases.AdminUser))
		
		adminClubsGroup.GET("", handler.GetAllClubs)
		
		superUserGroup := adminClubsGroup.Group("")
		superUserGroup.Use(middlewares.RequireAdminSuperuser())
		
		superUserGroup.POST("", handler.CreateClub)
		superUserGroup.PATCH("/:id", handler.PatchClub)
		superUserGroup.DELETE("/:id", handler.DeleteClub)
	}
}
