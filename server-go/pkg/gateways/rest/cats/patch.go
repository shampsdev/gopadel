package cats

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/shampsdev/go-telegram-template/pkg/domain"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/ginerr"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/middlewares"
	"github.com/shampsdev/go-telegram-template/pkg/usecase"
)

// Patch godoc
// @Summary Update cat
// @Tags cats
// @Accept json
// @Produce json
// @Schemes http https
// @Param id path string true "Cat ID"
// @Param cat body domain.PatchCat true "Cat data to update"
// @Success 200 "Cat updated successfully"
// @Failure 400 "Bad Request"
// @Failure 500 "Internal Server Error"
// @Security ApiKeyAuth
// @Router /cats/id/{id} [patch]
func Patch(catCase *usecase.Cat) gin.HandlerFunc {
	return func(c *gin.Context) {
		user := middlewares.MustGetUser(c)
		catID := c.Param("id")

		var patchCat domain.PatchCat
		if err := c.ShouldBindJSON(&patchCat); err != nil {
			ginerr.AbortIfErr(c, err, http.StatusBadRequest, "invalid request body")
			return
		}

		err := catCase.PatchCat(usecase.NewContext(c, user), catID, &patchCat)
		if ginerr.AbortIfErr(c, err, http.StatusBadRequest, "failed to update cat") {
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "cat updated successfully"})
	}
}
