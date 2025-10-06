package middlewares

import (
	"context"
	"log/slog"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/shampsdev/go-telegram-template/pkg/domain"
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
		
		start := time.Now()
		path := c.Request.URL.Path
		query := c.Request.URL.RawQuery
		
		// Обрабатываем запрос
		c.Next()
		
		// Собираем информацию после обработки
		duration := time.Since(start)
		statusCode := c.Writer.Status()
		clientIP := c.ClientIP()
		method := c.Request.Method
		
		// Подготавливаем атрибуты для логирования
		attrs := []any{
			slog.String("method", method),
			slog.String("path", path),
			slog.Int("status", statusCode),
			slog.Duration("duration", duration),
			slog.String("ip", clientIP),
		}
		
		if query != "" {
			attrs = append(attrs, slog.String("query", query))
		}
		
		// Добавляем информацию о пользователе если доступна
		if userTGData, exists := c.Get("user_tg_data"); exists {
			if tgData, ok := userTGData.(*domain.UserTGData); ok {
				attrs = append(attrs, 
					slog.Int64("tg_id", tgData.TelegramID),
					slog.String("tg_username", tgData.TelegramUsername),
					slog.String("user_name", tgData.FirstName+" "+tgData.LastName),
				)
			}
		}
		
		// Добавляем информацию об админе если доступна
		if admin, exists := c.Get("admin"); exists {
			if adminUser, ok := admin.(*domain.AdminUser); ok {
				attrs = append(attrs,
					slog.String("admin", adminUser.Username),
					slog.Bool("superuser", adminUser.IsSuperUser),
				)
			}
		}
		
		// Логируем с соответствующим уровнем в зависимости от статуса
		if statusCode >= 500 {
			log.Error("Request completed", attrs...)
		} else if statusCode >= 400 {
			log.Warn("Request completed", attrs...)
		} else {
			log.Info("Request completed", attrs...)
		}
	}
}
