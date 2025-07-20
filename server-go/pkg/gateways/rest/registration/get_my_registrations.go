package registration

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/shampsdev/go-telegram-template/pkg/domain"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/ginerr"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/middlewares"
)

// GetMyRegistrations godoc
// @Summary Get my registrations
// @Tags registrations
// @Accept json
// @Produce json
// @Schemes http https
// @Success 200 {array} domain.RegistrationWithEvent "List of user's registrations with event details"
// @Failure 401 "Unauthorized"
// @Failure 500 "Internal Server Error"
// @Security ApiKeyAuth
// @Router /registrations/my [get]
func (h *Handler) getMyRegistrations(c *gin.Context) {
	user := middlewares.MustGetUser(c)

	registrations, err := h.cases.Registration.GetUserRegistrationsWithEvent(c, user.ID)
	if ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "failed to get user registrations") {
		return
	}

	if registrations == nil {
		registrations = []*domain.RegistrationWithEvent{}
	}

	c.JSON(http.StatusOK, registrations)
} 