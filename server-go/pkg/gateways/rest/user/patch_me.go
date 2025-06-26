package user

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/shampsdev/go-telegram-template/pkg/domain"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/ginerr"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/middlewares"
	"github.com/shampsdev/go-telegram-template/pkg/usecase"
)

// PatchMe godoc
// @Summary Update current user data
// @Tags users
// @Accept json
// @Produce json
// @Schemes http https
// @Param user body domain.PatchUser true "User update data"
// @Success 200 {object} domain.User "Updated user data"
// @Failure 400 "Bad Request"
// @Failure 500 "Internal Server Error"
// @Security ApiKeyAuth
// @Router /users/me [patch]
func PatchMe(userCase *usecase.User) gin.HandlerFunc {
	return func(c *gin.Context) {
		user := middlewares.MustGetUser(c)

		var patchUser domain.PatchUser
		if err := c.ShouldBindJSON(&patchUser); err != nil {
			ginerr.AbortIfErr(c, err, http.StatusBadRequest, "invalid request body")
			return
		}

		updatedUser, err := userCase.PatchMe(usecase.NewContext(c, user), &patchUser)
		if ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "failed to update user") {
			return
		}

		c.JSON(http.StatusOK, updatedUser)
	}
}
