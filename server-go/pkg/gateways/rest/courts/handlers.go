package courts

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/shampsdev/go-telegram-template/pkg/domain"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/ginerr"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/middlewares"
	"github.com/shampsdev/go-telegram-template/pkg/usecase"
)

type Handler struct {
	courtCase *usecase.Court
}

func NewHandler(courtCase *usecase.Court) *Handler {
	return &Handler{
		courtCase: courtCase,
	}
}

// GetCourts godoc
// @Summary Get all courts
// @Description Returns a list of all courts. Only available for authenticated Telegram admins.
// @Tags courts
// @Accept json
// @Produce json
// @Success 200 {array} domain.Court "List of courts"
// @Failure 401 {object} map[string]string "User not authorized"
// @Failure 403 {object} map[string]string "Admin rights required"
// @Failure 500 {object} map[string]string "Internal server error"
// @Security ApiKeyAuth
// @Router /courts [get]
func (h *Handler) GetCourts(c *gin.Context) {
	user := middlewares.MustGetUser(c)

	filter := &domain.FilterCourt{}
	courts, err := h.courtCase.GetAll(usecase.NewContext(c, user), filter)
	if ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "Failed to get courts") {
		return
	}

	if courts == nil {
		courts = []*domain.Court{}
	}

	c.JSON(http.StatusOK, courts)
} 