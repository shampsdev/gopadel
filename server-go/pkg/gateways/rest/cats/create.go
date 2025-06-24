package cats

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/shampsdev/go-telegram-template/pkg/domain"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/ginerr"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/middlewares"
	"github.com/shampsdev/go-telegram-template/pkg/usecase"
)

// Create godoc
// @Summary Create cat
// @Tags cats
// @Accept json
// @Produce json
// @Schemes http https
// @Param cat body domain.CreateCat true "Cat data"
// @Success 201 {object} domain.Cat "Created cat"
// @Failure 400 "Bad Request"
// @Failure 500 "Internal Server Error"
// @Security ApiKeyAuth
// @Router /cats [post]
func Create(catCase *usecase.Cat) gin.HandlerFunc {
	return func(c *gin.Context) {
		user := middlewares.MustGetUser(c)

		var createCat domain.CreateCat
		if err := c.ShouldBindJSON(&createCat); err != nil {
			ginerr.AbortIfErr(c, err, http.StatusBadRequest, "invalid request body")
			return
		}

		cat, err := catCase.CreateCat(usecase.NewContext(c, user), &createCat)
		if ginerr.AbortIfErr(c, err, http.StatusBadRequest, "failed to create cat") {
			return
		}

		c.JSON(http.StatusCreated, cat)
	}
}
