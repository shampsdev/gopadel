package registration

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/ginerr"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/middlewares"
	"github.com/shampsdev/go-telegram-template/pkg/usecase"
)

// CancelAfterPayment godoc
// @Summary Cancel registration after payment
// @Description Cancels registration with ACTIVE status (after payment)
// @Tags registration
// @Accept json
// @Produce json
// @Param tournament_id path string true "Tournament ID"
// @Success 200 {object} domain.Registration "Registration canceled"
// @Failure 400 {object} map[string]string "Invalid request data"
// @Failure 401 {object} map[string]string "User not authorized"
// @Failure 404 {object} map[string]string "Registration not found"
// @Failure 500 {object} map[string]string "Internal server error"
// @Security ApiKeyAuth
// @Router /registrations/{tournament_id}/cancel-paid [post]
func CancelAfterPayment(registrationCase *usecase.Registration, userCase *usecase.User) gin.HandlerFunc {
	return func(c *gin.Context) {
		user := middlewares.MustGetUser(c)
		tournamentID := c.Param("tournament_id")
		if tournamentID == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "tournament_id is required"})
			return
		}

		registration, err := registrationCase.CancelAfterPayment(c.Request.Context(), user, tournamentID)
		if err != nil {
			switch {
			case err.Error() == "no registration found for this tournament":
				c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			case err.Error() == "tournament has already ended":
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			case err.Error() == "can only cancel active (paid) registrations":
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			default:
				ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "failed to cancel paid registration")
			}
			return
		}

		c.JSON(http.StatusOK, registration)
	}
} 