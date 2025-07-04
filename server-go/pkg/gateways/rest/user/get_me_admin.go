package user

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/middlewares"
	"github.com/shampsdev/go-telegram-template/pkg/repo"
	"github.com/shampsdev/go-telegram-template/pkg/usecase"
)

// GetMeAdmin godoc
// @Summary Check if user is admin
// @Tags users
// @Accept json
// @Produce json
// @Schemes http https
// @Success 200 {object} map[string]bool "Admin status"
// @Failure 400 "Bad Request"
// @Failure 500 "Internal Server Error"
// @Security ApiKeyAuth
// @Router /users/me/admin [get]
func GetMeAdmin(adminUserCase *usecase.AdminUser) gin.HandlerFunc {
	return func(c *gin.Context) {
		user := middlewares.MustGetUser(c)

		// Проверяем, является ли пользователь админом
		_, err := adminUserCase.GetByUserID(c.Request.Context(), user.ID)
		if err != nil {
			if err == repo.ErrNotFound {
				// Пользователь не админ
				c.JSON(http.StatusOK, gin.H{"admin": false})
				return
			}
			// Другая ошибка
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check admin status"})
			return
		}

		// Пользователь является админом
		c.JSON(http.StatusOK, gin.H{"admin": true})
	}
} 