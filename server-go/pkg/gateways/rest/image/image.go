package image

import (
	"github.com/gin-gonic/gin"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/middlewares"
	"github.com/shampsdev/go-telegram-template/pkg/usecase"
)

func Setup(r *gin.RouterGroup, cases usecase.Cases) {
	g := r.Group("/images")
	g.Use(middlewares.ExtractUserTGData())

	gAuth := g.Group("")
	gAuth.Use(middlewares.AuthUser(cases.User))
	gAuth.POST("/upload/avatar", UploadByFile(cases.Image))
}
