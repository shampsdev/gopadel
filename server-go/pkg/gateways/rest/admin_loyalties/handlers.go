package admin_loyalties

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/shampsdev/go-telegram-template/pkg/domain"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/ginerr"
	"github.com/shampsdev/go-telegram-template/pkg/usecase"
)

type Handler struct {
	loyaltyCase *usecase.Loyalty
}

func NewHandler(loyaltyCase *usecase.Loyalty) *Handler {
	return &Handler{
		loyaltyCase: loyaltyCase,
	}
}

// GetAllLoyalties получает все уровни лояльности для админов
// @Summary Get all loyalty levels (Admin)
// @Description Get all loyalty levels. Available for any admin.
// @Tags admin-loyalties
// @Produce json
// @Security BearerAuth
// @Success 200 {array} domain.Loyalty
// @Failure 401 {object} domain.ErrorResponse
// @Failure 500 {object} domain.ErrorResponse
// @Router /admin/loyalties [get]
func (h *Handler) GetAllLoyalties(c *gin.Context) {
	filter := &domain.FilterLoyalty{}
	loyalties, err := h.loyaltyCase.Filter(usecase.NewContext(c, nil), filter)
	if ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "Failed to get loyalties") {
		return
	}

	if loyalties == nil {
		loyalties = []*domain.Loyalty{}
	}

	c.JSON(http.StatusOK, loyalties)
} 