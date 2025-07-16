package event

import (
	"github.com/gin-gonic/gin"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/middlewares"
	"github.com/shampsdev/go-telegram-template/pkg/usecase"
)

type Handler struct {
	cases *usecase.Cases
}

func NewHandler(cases *usecase.Cases) *Handler {
	return &Handler{
		cases: cases,
	}
}

func Setup(r *gin.RouterGroup, cases usecase.Cases) {
	handler := NewHandler(&cases)
	
	g := r.Group("/events")
	middlewares.SetupAuth(g, cases.User)

	g.POST("", handler.createEvent)                           // создание события (игры - всем, турниры - админам)
	g.POST("/filter", handler.filterEvents)                       // фильтрация событий
	g.GET("/:event_id/waitlist", handler.getWaitlist)            // получить список ожидания
	g.POST("/:event_id/waitlist", handler.addToWaitlist)         // добавить себя в список ожидания
	g.DELETE("/:event_id/waitlist", handler.removeFromWaitlist)  // убрать себя из списка ожидания
} 