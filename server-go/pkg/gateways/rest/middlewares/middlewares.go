package middlewares

import (
	"context"
	"log/slog"
	"slices"

	"github.com/gin-gonic/gin"
	"github.com/shampsdev/go-telegram-template/pkg/config"
	"github.com/shampsdev/go-telegram-template/pkg/utils/slogx"
)

func AllowOrigin(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		allowHeaders := "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, X-Api-Token"
		origin := c.GetHeader("Origin")

		var allowedOrigin string
		if origin != "" && slices.Contains(cfg.CORS.AllowedOrigins, origin) {
			allowedOrigin = origin
		} else if len(cfg.CORS.AllowedOrigins) > 0 {
			allowedOrigin = cfg.CORS.AllowedOrigins[0]
		}

		if allowedOrigin != "" {
			c.Header("Access-Control-Allow-Origin", allowedOrigin)
		}

		if origin != "" && slices.Contains(cfg.CORS.AllowedOrigins, origin) && cfg.CORS.AllowCredentials {
			c.Header("Access-Control-Allow-Credentials", "true")
		}

		c.Header("Access-Control-Allow-Methods", "POST, PUT, PATCH, GET, DELETE")
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
