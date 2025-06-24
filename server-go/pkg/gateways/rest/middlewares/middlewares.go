package middlewares

import (
	"context"
	"log/slog"

	"github.com/gin-gonic/gin"
	"github.com/shampsdev/go-telegram-template/pkg/utils/slogx"
)

func AllowOrigin() gin.HandlerFunc {
	return func(c *gin.Context) {
		allowHeaders := "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, X-Api-Token"

		c.Header("Access-Control-Allow-Origin", c.GetHeader("Origin"))
		c.Header("Access-Control-Allow-Credentials", "true")
		c.Header("Access-Control-Allow-Methods", "POST, PUT, PATCH, GET, DELETE")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")
		c.Header("Access-Control-Allow-Headers", allowHeaders)

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}

func Logger(ctx context.Context) gin.HandlerFunc {
	log := slogx.FromCtx(ctx)
	return func(c *gin.Context) {
		slogx.InjectGin(c, log)
		log.Info("Received request",
			slog.String("method", c.Request.Method),
			slog.String("path", c.Request.URL.Path),
			slog.String("query", c.Request.URL.RawQuery),
		)
	}
}
