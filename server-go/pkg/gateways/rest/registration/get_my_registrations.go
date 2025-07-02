package registration

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/ginerr"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/middlewares"
	"github.com/shampsdev/go-telegram-template/pkg/usecase"
)

// GetMyRegistrations godoc
// @Summary Get my registrations
// @Description Returns all registrations for the current user with tournament information
// @Tags registration
// @Accept json
// @Produce json
// @Success 200 {array} domain.RegistrationWithTournament "List of registrations with tournament details"
// @Failure 401 {object} map[string]string "User not authorized"
// @Failure 500 {object} map[string]string "Internal server error"
// @Security ApiKeyAuth
// @Router /registrations/my [get]
func GetMyRegistrations(registrationCase *usecase.Registration, userCase *usecase.User) gin.HandlerFunc {
	return func(c *gin.Context) {
		user := middlewares.MustGetUser(c)

		registrations, err := registrationCase.GetUserRegistrationsWithTournament(c.Request.Context(), user.ID)
		if ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "failed to get user registrations") {
			return
		}

		c.JSON(http.StatusOK, registrations)
	}
} 