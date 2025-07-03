package webhook

import (
	"github.com/gin-gonic/gin"
	"github.com/shampsdev/go-telegram-template/pkg/config"
	"github.com/shampsdev/go-telegram-template/pkg/usecase"
)

func Setup(r *gin.RouterGroup, cases usecase.Cases, cfg *config.Config) {
	r.POST("/yookassa_webhook", YooKassaWebhook(cases.Payment, cases.Registration, cfg))
} 