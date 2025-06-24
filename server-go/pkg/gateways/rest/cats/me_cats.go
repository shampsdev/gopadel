package cats

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/ginerr"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/middlewares"
	"github.com/shampsdev/go-telegram-template/pkg/usecase"
)

// MeCats godoc
// @Summary Get my cats
// @Tags cats
// @Accept json
// @Produce json
// @Schemes http https
// @Success 200 {array} domain.Cat "List of user's cats"
// @Failure 400 "Bad Request"
// @Failure 500 "Internal Server Error"
// @Security ApiKeyAuth
// @Router /cats/me [get]
func MeCats(catCase *usecase.Cat) gin.HandlerFunc {
	return func(c *gin.Context) {
		user := middlewares.MustGetUser(c)

		cats, err := catCase.ListOwnedCats(c, user.ID)
		if ginerr.AbortIfErr(c, err, http.StatusBadRequest, "failed to get user cats") {
			return
		}

		c.JSON(http.StatusOK, cats)
	}
}
