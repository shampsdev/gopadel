package middlewares

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/shampsdev/go-telegram-template/pkg/domain"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/ginerr"
	"github.com/shampsdev/go-telegram-template/pkg/repo"
	"github.com/shampsdev/go-telegram-template/pkg/usecase"
)

func RequireTelegramAdmin(adminUserCase *usecase.AdminUser) gin.HandlerFunc {
	return func(c *gin.Context) {
		user := MustGetUser(c)
		
		adminUser, err := adminUserCase.GetByUserID(c.Request.Context(), user.ID)
		if err != nil {
			if err == repo.ErrNotFound {
				ginerr.AbortIfErr(c, err, http.StatusForbidden, "user is not a telegram admin")
				return
			}
			ginerr.AbortIfErr(c, err, http.StatusInternalServerError, fmt.Sprintf("failed to check admin status for user %s", user.ID))
			return
		}

		c.Set("telegram_admin", adminUser)
		c.Next()
	}
}

func RequireTelegramSuperAdmin(adminUserCase *usecase.AdminUser) gin.HandlerFunc {
	return func(c *gin.Context) {
		user := MustGetUser(c)
		
		adminUser, err := adminUserCase.GetByUserID(c.Request.Context(), user.ID)
		if err != nil {
			if err == repo.ErrNotFound {
				ginerr.AbortIfErr(c, err, http.StatusForbidden, "user is not a telegram admin")
				return
			}
			ginerr.AbortIfErr(c, err, http.StatusInternalServerError, fmt.Sprintf("failed to check admin status for user %s", user.ID))
			return
		}

		if !adminUser.IsSuperUser {
			c.JSON(http.StatusForbidden, gin.H{"error": "telegram super admin rights required"})
			c.Abort()
			return
		}

		c.Set("telegram_admin", adminUser)
		c.Next()
	}
}

func MustGetTelegramAdmin(c *gin.Context) *domain.AdminUser {
	adminUser, ok := c.MustGet("telegram_admin").(*domain.AdminUser)
	if !ok {
		panic("telegram admin not found")
	}
	return adminUser
} 