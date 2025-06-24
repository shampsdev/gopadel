package cats

import (
	"github.com/gin-gonic/gin"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/middlewares"
	"github.com/shampsdev/go-telegram-template/pkg/usecase"
)

func Setup(r *gin.RouterGroup, cases usecase.Cases) {
	g := r.Group("/cats")
	g.GET("", GetAll(cases.Cat))

	gAuth := g.Group("")
	gAuth.Use(middlewares.ExtractUserTGData())
	gAuth.Use(middlewares.AuthUser(cases.User))
	gAuth.POST("", Create(cases.Cat))
	gAuth.GET("/me", MeCats(cases.Cat))
	gAuth.PATCH("/id/:id", Patch(cases.Cat))
}
