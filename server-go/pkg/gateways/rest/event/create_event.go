package event

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/shampsdev/go-telegram-template/pkg/domain"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/ginerr"
	"github.com/shampsdev/go-telegram-template/pkg/usecase"
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

	// Получаем админского пользователя, если он есть
	adminUser, _ := h.cases.AdminUser.GetByUserID(c, domainUser.ID)
	
	// Проверяем права на создание через стратегию
	strategy := h.cases.Event.GetStrategy(createEvent.Type)
	if err := strategy.CanCreate(domainUser, adminUser); err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	// Устанавливаем организатора
	createEvent.OrganizerID = domainUser.ID
	
	// Создаем событие (используем AdminCreate для турниров если пользователь админ)
	var event *domain.Event
	var err error
	
	if createEvent.Type == domain.EventTypeTournament && adminUser != nil {
		ctx := usecase.NewContext(c, domainUser)
		event, err = h.cases.Event.AdminCreate(&ctx, &createEvent)
	} else {
		event, err = h.cases.Event.Create(c, &createEvent)
	}
	if ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "failed to create event") {
		return
	}

	c.JSON(http.StatusCreated, event)
} 