package event

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/shampsdev/go-telegram-template/pkg/domain"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/ginerr"
	"github.com/shampsdev/go-telegram-template/pkg/repo"
)

// CreateEvent godoc
// @Summary Create new event
// @Tags events
// @Accept json
// @Produce json
// @Schemes http https
// @Param event body domain.CreateEvent true "Event data"
// @Success 201 {object} domain.Event "Created event"
// @Failure 400 "Bad Request"
// @Failure 401 "Unauthorized"
// @Failure 403 "Forbidden"
// @Failure 500 "Internal Server Error"
// @Security ApiKeyAuth
// @Router /events [post]
func (h *Handler) createEvent(c *gin.Context) {
	var createEvent domain.CreateEvent
	if err := c.ShouldBindJSON(&createEvent); err != nil {
		ginerr.AbortIfErr(c, err, http.StatusBadRequest, "invalid event data")
		return
	}

	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user not authenticated"})
		return
	}

	domainUser, ok := user.(*domain.User)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "invalid user type"})
		return
	}

	if createEvent.Type == domain.EventTypeTournament {
		_, err := h.cases.AdminUser.GetByUserID(c, domainUser.ID)
		if err != nil {
			if err == repo.ErrNotFound {
				c.JSON(http.StatusForbidden, gin.H{"error": "only admins can create tournaments"})
				return
			}
			ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "failed to check admin status")
			return
		}
	}

	event, err := h.cases.Event.CreateEventWithPermissionCheck(c, &createEvent, domainUser)
	if ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "failed to create event") {
		return
	}

	c.JSON(http.StatusCreated, event)
} 