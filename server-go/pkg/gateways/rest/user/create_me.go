package user

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/ginerr"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/middlewares"
	"github.com/shampsdev/go-telegram-template/pkg/usecase"
)

// CreateMe godoc
// @Summary Create me
// @Tags users
// @Accept json
// @Produce json
// @Schemes http https
// @Success 200 {object} domain.User "User data"
// @Failure 400 "Bad Request"
// @Failure 500 "Internal Server Error"
// @Security ApiKeyAuth
// @Router /users/me [post]
func CreateMe(userCase *usecase.User) gin.HandlerFunc {
	return func(c *gin.Context) {
		userTGData := middlewares.MustGetUserTGData(c)

		user, err := userCase.Create(c, userTGData)
		if ginerr.AbortIfErr(c, err, http.StatusBadRequest, "failed to create user") {
			return
		}

		c.JSON(http.StatusCreated, user)
	}
}
