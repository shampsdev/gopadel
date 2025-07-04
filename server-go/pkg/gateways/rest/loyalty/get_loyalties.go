package loyalty

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/shampsdev/go-telegram-template/pkg/domain"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/ginerr"
	"github.com/shampsdev/go-telegram-template/pkg/usecase"
)

// GetLoyalties godoc
// @Summary Get all loyalty programs
// @Tags loyalties
// @Accept json
// @Produce json
// @Schemes http https
// @Success 200 {array} domain.Loyalty "List of loyalty programs"
// @Failure 401 "Unauthorized"
// @Failure 500 "Internal Server Error"
// @Security ApiKeyAuth
// @Router /loyalties [get]
func GetLoyalties(loyaltyCase *usecase.Loyalty) gin.HandlerFunc {
	return func(c *gin.Context) {
		filter := &domain.FilterLoyalty{}
		loyalties, err := loyaltyCase.Filter(usecase.NewContext(c, nil), filter)
		if ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "failed to get loyalties") {
			return
		}

		if loyalties == nil {
			loyalties = []*domain.Loyalty{}
		}

		c.JSON(http.StatusOK, loyalties)
	}
} 