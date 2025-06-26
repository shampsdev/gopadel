package user

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/ginerr"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/middlewares"
	"github.com/shampsdev/go-telegram-template/pkg/usecase"
)

// GetUserBio godoc
// @Summary Get current user bio
// @Tags users
// @Accept json
// @Produce json
// @Schemes http https
// @Success 200 {object} map[string]string "User bio data"
// @Failure 400 "Bad Request"
// @Failure 404 "User bio not found"
// @Failure 500 "Internal Server Error"
// @Security ApiKeyAuth
// @Router /users/me/bio [get]
func GetUserBio(userCase *usecase.User) gin.HandlerFunc {
	return func(c *gin.Context) {
		user := middlewares.MustGetUser(c)

		bio, err := userCase.GetUserBio(c, user.TelegramUsername)
		if ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "failed to get user bio") {
			return
		}

		if bio == "" {
			c.JSON(http.StatusNotFound, gin.H{"error": "User bio not found"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"telegram_username": user.TelegramUsername,
			"bio": bio,
		})
	}
}
