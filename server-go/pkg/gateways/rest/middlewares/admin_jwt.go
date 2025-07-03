package middlewares

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/shampsdev/go-telegram-template/pkg/domain"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/ginerr"
	"github.com/shampsdev/go-telegram-template/pkg/usecase"
)

// RequireAdminJWT проверяет JWT токен и устанавливает админа в контекст
func RequireAdminJWT(adminUserCase *usecase.AdminUser) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header required"})
			c.Abort()
			return
		}

		// Проверяем формат "Bearer <token>"
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid authorization header format"})
			c.Abort()
			return
		}

		token := parts[1]
		admin, err := adminUserCase.GetCurrentAdmin(c.Request.Context(), token)
		if ginerr.AbortIfErr(c, err, http.StatusUnauthorized, "Invalid or expired token") {
			return
		}

		c.Set("admin", admin)
		c.Next()
	}
}

// RequireAdminSuperuser проверяет, что админ имеет права суперпользователя
func RequireAdminSuperuser() gin.HandlerFunc {
	return func(c *gin.Context) {
		admin := MustGetAdmin(c)
		
		if !admin.IsSuperUser {
			c.JSON(http.StatusForbidden, gin.H{"error": "Superuser rights required"})
			c.Abort()
			return
		}

		c.Next()
	}
}

// MustGetAdmin получает админа из контекста Gin
func MustGetAdmin(c *gin.Context) *domain.AdminUser {
	admin, ok := c.MustGet("admin").(*domain.AdminUser)
	if !ok {
		panic("admin not found in context")
	}
	return admin
} 