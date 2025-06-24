package cats

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/ginerr"
	"github.com/shampsdev/go-telegram-template/pkg/usecase"
)

// GetAll godoc
// @Summary Get all cats
// @Tags cats
// @Accept json
// @Produce json
// @Schemes http https
// @Success 200 {array} domain.Cat "List of cats"
// @Failure 400 "Bad Request"
// @Failure 500 "Internal Server Error"
// @Router /cats [get]
func GetAll(catCase *usecase.Cat) gin.HandlerFunc {
	return func(c *gin.Context) {
		cats, err := catCase.ListAllCats(c)
		if ginerr.AbortIfErr(c, err, http.StatusBadRequest, "failed to get cats") {
			return
		}

		c.JSON(http.StatusOK, cats)
	}
}
