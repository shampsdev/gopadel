package club

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/shampsdev/go-telegram-template/pkg/domain"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/ginerr"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/middlewares"
	"github.com/shampsdev/go-telegram-template/pkg/usecase"
)

// FilterClubs godoc
// @Summary Filter clubs
// @Tags clubs
// @Accept json
// @Produce json
// @Schemes http https
// @Param filter body domain.FilterClub false "Filter parameters"
// @Success 200 {array} domain.Club "List of clubs"
// @Failure 400 "Bad Request"
// @Failure 401 "Unauthorized"
// @Failure 500 "Internal Server Error"
// @Security ApiKeyAuth
// @Router /clubs/filter [post]
func FilterClubs(clubCase *usecase.Club) gin.HandlerFunc {
	return func(c *gin.Context) {
		user := middlewares.MustGetUser(c)

		var filter domain.FilterClub
		if err := c.ShouldBindJSON(&filter); err != nil {
			// Если нет параметров фильтрации, используем пустой фильтр
			filter = domain.FilterClub{}
		}

		ctx := usecase.NewContext(c, user)
		clubs, err := clubCase.Filter(&ctx, &filter)
		if ginerr.AbortIfErr(c, err, http.StatusBadRequest, "failed to filter clubs") {
			return
		}

		c.JSON(http.StatusOK, clubs)
	}
} 