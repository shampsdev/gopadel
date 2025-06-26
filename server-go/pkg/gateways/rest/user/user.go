package user

import (
	"github.com/gin-gonic/gin"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/middlewares"
	"github.com/shampsdev/go-telegram-template/pkg/usecase"
)

func Setup(r *gin.RouterGroup, cases usecase.Cases) {
	g := r.Group("/users")
	g.Use(middlewares.ExtractUserTGData())
	g.POST("/me", CreateMe(cases.User))

	gAuth := g.Group("")
	gAuth.Use(middlewares.AuthUser(cases.User))
	gAuth.Group("/me").
		GET("", GetMe(cases.User))
	gAuth.Group("/me").GET("/bio", GetUserBio(cases.User))
}
