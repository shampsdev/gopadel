package club

import (
	"github.com/gin-gonic/gin"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/middlewares"
	"github.com/shampsdev/go-telegram-template/pkg/usecase"
)

func Setup(r *gin.RouterGroup, cases usecase.Cases) {
	g := r.Group("/clubs")
	middlewares.SetupAuth(g, cases.User)

	g.POST("/filter", FilterClubs(cases.Club))
	g.GET("/my", GetMyClubs(cases.Club))
	g.POST("/:url/join", JoinClub(cases.Club))
} 