package registration

import (
	"github.com/gin-gonic/gin"
	"github.com/shampsdev/go-telegram-template/pkg/config"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/middlewares"
	"github.com/shampsdev/go-telegram-template/pkg/usecase"
)

type Handler struct {
	cases  *usecase.Cases
	config *config.Config
}

func NewHandler(cases *usecase.Cases, cfg *config.Config) *Handler {
	return &Handler{
		cases:  cases,
		config: cfg,
	}
}

func Setup(r *gin.RouterGroup, cases usecase.Cases, cfg *config.Config) {
	handler := NewHandler(&cases, cfg)
	
	g := r.Group("/registrations")
	middlewares.SetupAuth(g, cases.User)

	g.POST("/:event_id", handler.createRegistration)                    // создание регистрации (статус PENDING)
	g.POST("/:event_id/payment", handler.createPayment)                 // создание платежа (получение ссылки)
	g.POST("/:event_id/cancel", handler.cancelRegistration)             // отмена до оплаты (CANCELLED_BEFORE_PAYMENT)
	g.POST("/:event_id/cancel-paid", handler.cancelPaidRegistration)    // отмена после оплаты (CANCELLED_AFTER_PAYMENT)
	g.POST("/:event_id/reactivate", handler.reactivateRegistration)     // повторная активация
} 