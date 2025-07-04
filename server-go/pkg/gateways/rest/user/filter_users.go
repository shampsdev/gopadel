package user

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/shampsdev/go-telegram-template/pkg/domain"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/ginerr"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/middlewares"
	"github.com/shampsdev/go-telegram-template/pkg/usecase"
)

// FilterUsers godoc
// @Summary Filter users
// @Tags users
// @Accept json
// @Produce json
// @Schemes http https
// @Param filter body domain.FilterUser true "User filter"
// @Success 200 {array} domain.User "List of users"
// @Failure 400 "Bad Request"
// @Failure 401 "Unauthorized"
// @Failure 500 "Internal Server Error"
// @Security ApiKeyAuth
// @Router /users/filter [post]
func FilterUsers(userCase *usecase.User) gin.HandlerFunc {
	return func(c *gin.Context) {
		user := middlewares.MustGetUser(c)

		var filterUser domain.FilterUser
		if err := c.ShouldBindJSON(&filterUser); err != nil {
			ginerr.AbortIfErr(c, err, http.StatusBadRequest, "invalid request body")
			return
		}

		ctx := usecase.NewContext(c, user)
		users, err := userCase.FilterForUser(&ctx, &filterUser)
		if err != nil {
			ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "failed to filter users")
			return
		}

		c.JSON(http.StatusOK, users)
	}
} 