package registration

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/ginerr"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/middlewares"
)

// @Summary Create event registration
// @Description Creates a new registration for an event with PENDING status
// @Tags registrations
// @Security ApiKeyAuth
// @Param event_id path string true "Event ID"
// @Success 201 {object} domain.Registration "Created registration"
// @Failure 400 "Bad request"
// @Failure 401 "Unauthorized"
// @Failure 403 "Forbidden - user already registered or validation failed"
// @Failure 404 "Event not found"
// @Failure 500 "Internal server error"
// @Router /registrations/{event_id} [post]
func (h *Handler) createRegistration(c *gin.Context) {
	eventID := c.Param("event_id")
	if eventID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "event_id is required"})
		return
	}

	user := middlewares.MustGetUser(c)

	registration, err := h.cases.Registration.RegisterForEvent(c, user, eventID)
	if ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "failed to create registration") {
		return
	}

	c.JSON(http.StatusCreated, registration)
} 