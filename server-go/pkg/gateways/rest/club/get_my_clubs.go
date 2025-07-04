package club

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/ginerr"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/middlewares"
	"github.com/shampsdev/go-telegram-template/pkg/usecase"
)

// GetMyClubs godoc
// @Summary Get my clubs
// @Tags clubs
// @Accept json
// @Produce json
// @Schemes http https
// @Success 200 {array} domain.Club "List of user's clubs"
// @Failure 400 "Bad Request"
// @Failure 401 "Unauthorized"
// @Failure 500 "Internal Server Error"
// @Security ApiKeyAuth
// @Router /clubs/my [get]
func GetMyClubs(clubCase *usecase.Club) gin.HandlerFunc {
	return func(c *gin.Context) {
		user := middlewares.MustGetUser(c)

		ctx := usecase.NewContext(c, user)
		clubs, err := clubCase.GetUserClubs(&ctx)
		if ginerr.AbortIfErr(c, err, http.StatusBadRequest, "failed to get user clubs") {
			return
		}

		c.JSON(http.StatusOK, clubs)
	}
} 