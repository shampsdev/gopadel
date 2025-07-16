package event

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/shampsdev/go-telegram-template/pkg/domain"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/ginerr"
)

// FilterEvents godoc
// @Summary Filter events
// @Tags events
// @Accept json
// @Produce json
// @Schemes http https
// @Param filter body domain.FilterEvent false "Filter parameters"
// @Success 200 {array} domain.Event "List of events"
// @Failure 400 "Bad Request"
// @Failure 401 "Unauthorized"
// @Failure 500 "Internal Server Error"
// @Security ApiKeyAuth
// @Router /events/filter [post]
func (h *Handler) filterEvents(c *gin.Context) {
	var filter domain.FilterEvent
	if err := c.ShouldBindJSON(&filter); err != nil {
		ginerr.AbortIfErr(c, err, http.StatusBadRequest, "invalid filter parameters")
		return
	}

	events, err := h.cases.Event.Filter(c, &filter)
	if ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "failed to filter events") {
		return
	}

	c.JSON(http.StatusOK, events)
} 