package rest

import (
	"context"

	"github.com/gin-gonic/gin"
	"github.com/shampsdev/go-telegram-template/docs"
	"github.com/shampsdev/go-telegram-template/pkg/config"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/admin_admins"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/admin_auth"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/admin_clubs"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/admin_courts"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/admin_loyalties"

	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/admin_users"

	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/club"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/courts"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/image"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/loyalty"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/middlewares"

	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/user"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/webhook"
	"github.com/shampsdev/go-telegram-template/pkg/notifications"
	"github.com/shampsdev/go-telegram-template/pkg/usecase"
	swaggerfiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

func setupRouter(ctx context.Context, r *gin.Engine, useCases usecase.Cases, cfg *config.Config, notificationService *notifications.NotificationService) {
	r.HandleMethodNotAllowed = true
	r.Use(middlewares.AllowOrigin())
	r.Use(middlewares.Logger(ctx))

	v1 := r.Group("/api/v1")
	docs.SwaggerInfo.BasePath = "/api/v1"
	v1.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerfiles.Handler))

	user.Setup(v1, useCases)
	courts.Setup(v1, useCases)
	club.Setup(v1, useCases)
	image.Setup(v1, useCases)

	loyalty.Setup(v1, useCases)
	webhook.Setup(v1, useCases, cfg, notificationService)
	admin_auth.Setup(v1, useCases)
	admin_clubs.Setup(v1, useCases)
	admin_users.Setup(v1, useCases)
	admin_admins.Setup(v1, useCases)
	admin_loyalties.Setup(v1, useCases)
	admin_courts.Setup(v1, useCases)
}
