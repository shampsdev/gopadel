package admin_events

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/shampsdev/go-telegram-template/pkg/domain"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/ginerr"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/middlewares"
	"github.com/shampsdev/go-telegram-template/pkg/repo"
	"github.com/shampsdev/go-telegram-template/pkg/usecase"
)

type Handler struct {
	eventCase *usecase.Event
}

func NewHandler(eventCase *usecase.Event) *Handler {
	return &Handler{
		eventCase: eventCase,
	}
}

// FilterEvents получает список событий с административной фильтрацией
// @Summary Filter events (Admin)
// @Description Get filtered list of events with extended admin filters. Available for any admin.
// @Tags admin-events
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param filter body domain.AdminFilterEvent true "Event filter"
// @Success 200 {array} domain.Event
// @Failure 400 {object} domain.ErrorResponse
// @Failure 401 {object} domain.ErrorResponse
// @Failure 500 {object} domain.ErrorResponse
// @Router /admin/events/filter [post]
func (h *Handler) FilterEvents(c *gin.Context) {
	var filter domain.AdminFilterEvent
	if err := c.ShouldBindJSON(&filter); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Создаем контекст без конкретного пользователя, как в других админских эндпоинтах
	ctx := usecase.NewContext(c, nil)

	events, err := h.eventCase.AdminFilter(&ctx, &filter)
	if ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "Failed to filter events") {
		return
	}

	if events == nil {
		events = []*domain.Event{}
	}

	c.JSON(http.StatusOK, events)
}

// CreateEvent создает новое событие
// @Summary Create event (Admin)
// @Description Create a new event. Available for any admin.
// @Tags admin-events
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param event body domain.CreateEvent true "Event data"
// @Success 201 {object} domain.Event
// @Failure 400 {object} domain.ErrorResponse
// @Failure 401 {object} domain.ErrorResponse
// @Failure 500 {object} domain.ErrorResponse
// @Router /admin/events [post]
func (h *Handler) CreateEvent(c *gin.Context) {
	var createEvent domain.CreateEvent
	if err := c.ShouldBindJSON(&createEvent); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Получаем админа из контекста
	admin := middlewares.MustGetAdmin(c)
	
	// Если не указан организатор, устанавливаем текущего пользователя
	if createEvent.OrganizerID == "" {
		createEvent.OrganizerID = admin.UserID
	}

	// Создаем контекст с пользователем админа, если он есть
	ctx := usecase.NewContext(c, admin.User)

	event, err := h.eventCase.AdminCreate(&ctx, &createEvent)
	if ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "Failed to create event") {
		return
	}

	c.JSON(http.StatusCreated, event)
}

// PatchEvent обновляет событие
// @Summary Update event (Admin)
// @Description Update an existing event. Available for any admin.
// @Tags admin-events
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Event ID"
// @Param event body domain.AdminPatchEvent true "Event update data"
// @Success 200 {object} domain.Event
// @Failure 400 {object} domain.ErrorResponse
// @Failure 401 {object} domain.ErrorResponse
// @Failure 404 {object} domain.ErrorResponse
// @Failure 500 {object} domain.ErrorResponse
// @Router /admin/events/{id} [patch]
func (h *Handler) PatchEvent(c *gin.Context) {
	eventID := c.Param("id")
	if eventID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "event id is required"})
		return
	}

	var patchEvent domain.AdminPatchEvent
	if err := c.ShouldBindJSON(&patchEvent); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Получаем админа из контекста
	admin := middlewares.MustGetAdmin(c)
	
	// Создаем контекст с пользователем админа
	ctx := usecase.NewContext(c, admin.User)

	event, err := h.eventCase.AdminPatch(&ctx, eventID, &patchEvent)
	if err != nil {
		if err == repo.ErrNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "event not found"})
			return
		}
		ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "Failed to update event")
		return
	}

	c.JSON(http.StatusOK, event)
}

// DeleteEvent удаляет событие
// @Summary Delete event (Admin)
// @Description Delete an existing event. Available for any admin.
// @Tags admin-events
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Event ID"
// @Success 204 "Event deleted successfully"
// @Failure 400 {object} domain.ErrorResponse
// @Failure 401 {object} domain.ErrorResponse
// @Failure 404 {object} domain.ErrorResponse
// @Failure 500 {object} domain.ErrorResponse
// @Router /admin/events/{id} [delete]
func (h *Handler) DeleteEvent(c *gin.Context) {
	eventID := c.Param("id")
	if eventID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "event id is required"})
		return
	}

	// Получаем админа из контекста
	admin := middlewares.MustGetAdmin(c)
	
	// Создаем контекст с пользователем админа
	ctx := usecase.NewContext(c, admin.User)

	err := h.eventCase.AdminDelete(&ctx, eventID)
	if err != nil {
		if err == repo.ErrNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "event not found"})
			return
		}
		ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "Failed to delete event")
		return
	}

	c.Status(http.StatusNoContent)
} 