package registration

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/ginerr"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/middlewares"
	"github.com/shampsdev/go-telegram-template/pkg/usecase"
)

// RegisterForTournament godoc
// @Summary Register for tournament
// @Description Creates new registration or updates existing CANCELED status to PENDING
// @Tags registration
// @Accept json
// @Produce json
// @Param tournament_id path string true "Tournament ID"
// @Success 200 {object} domain.Registration "Registration created or updated"
// @Failure 400 {object} map[string]string "Invalid request data"
// @Failure 401 {object} map[string]string "User not authorized"
// @Failure 404 {object} map[string]string "Tournament not found"
// @Failure 409 {object} map[string]string "Conflict (already registered or tournament full)"
// @Failure 500 {object} map[string]string "Internal server error"
// @Security ApiKeyAuth
// @Router /registrations/{tournament_id} [post]
func RegisterForTournament(registrationCase *usecase.Registration, userCase *usecase.User) gin.HandlerFunc {
	return func(c *gin.Context) {
		user := middlewares.MustGetUser(c)
		tournamentID := c.Param("tournament_id")
		if tournamentID == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "tournament_id is required"})
			return
		}

		registration, err := registrationCase.RegisterForTournament(c.Request.Context(), user, tournamentID)
		if err != nil {
			switch {
			case err.Error() == "tournament not found":
				c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			case err.Error() == "tournament has already ended":
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			case err.Error() == "user already has a pending registration for this tournament" ||
				 err.Error() == "user already has an active registration for this tournament":
				c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
			default:
				ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "failed to register for tournament")
			}
			return
		}

		c.JSON(http.StatusOK, registration)
	}
} 