package admin_registrations

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/shampsdev/go-telegram-template/pkg/domain"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/ginerr"
	"github.com/shampsdev/go-telegram-template/pkg/usecase"
)

type Handler struct {
	registrationCase *usecase.Registration
	tournamentCase   *usecase.Tournament
	userCase         *usecase.User
}

func NewHandler(registrationCase *usecase.Registration, tournamentCase *usecase.Tournament, userCase *usecase.User) *Handler {
	return &Handler{
		registrationCase: registrationCase,
		tournamentCase:   tournamentCase,
		userCase:         userCase,
	}
}

// FilterRegistrations получает список регистраций с фильтрацией
// @Summary Filter registrations (Admin)
// @Description Get filtered list of registrations with payments and tournament info. Available for any admin.
// @Tags admin-registrations
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param filter body domain.AdminFilterRegistration true "Registration filter"
// @Success 200 {array} domain.RegistrationWithPayments
// @Failure 400 {object} domain.ErrorResponse
// @Failure 401 {object} domain.ErrorResponse
// @Failure 500 {object} domain.ErrorResponse
// @Router /admin/registrations/filter [post]
func (h *Handler) FilterRegistrations(c *gin.Context) {
	var filter domain.AdminFilterRegistration
	if err := c.ShouldBindJSON(&filter); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	registrations, err := h.registrationCase.AdminFilter(c.Request.Context(), &filter)
	if ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "Failed to filter registrations") {
		return
	}

	if registrations == nil {
		registrations = []*domain.RegistrationWithPayments{}
	}

	c.JSON(http.StatusOK, registrations)
}

// GetRegistration получает конкретную регистрацию с платежами
// @Summary Get registration (Admin)
// @Description Get registration with payments and tournament info. Available for any admin.
// @Tags admin-registrations
// @Produce json
// @Security BearerAuth
// @Param id path string true "Registration ID"
// @Success 200 {object} domain.RegistrationWithPayments
// @Failure 400 {object} domain.ErrorResponse
// @Failure 401 {object} domain.ErrorResponse
// @Failure 404 {object} domain.ErrorResponse
// @Failure 500 {object} domain.ErrorResponse
// @Router /admin/registrations/{id} [get]
func (h *Handler) GetRegistration(c *gin.Context) {
	registrationID := c.Param("id")
	if registrationID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Registration ID is required"})
		return
	}

	registration, err := h.registrationCase.GetRegistrationWithPayments(c.Request.Context(), registrationID)
	if err != nil {
		if err.Error() == "registration not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": "Registration not found"})
			return
		}
		if ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "Failed to get registration") {
			return
		}
	}

	c.JSON(http.StatusOK, registration)
}

// UpdateRegistrationStatus обновляет статус регистрации
// @Summary Update registration status (Admin)
// @Description Update registration status. Available only for superuser.
// @Tags admin-registrations
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Registration ID"
// @Param body body object{status=string} true "Status update data"
// @Success 200 {object} domain.RegistrationWithPayments
// @Failure 400 {object} domain.ErrorResponse
// @Failure 401 {object} domain.ErrorResponse
// @Failure 403 {object} domain.ErrorResponse
// @Failure 404 {object} domain.ErrorResponse
// @Failure 500 {object} domain.ErrorResponse
// @Router /admin/registrations/{id}/status [patch]
func (h *Handler) UpdateRegistrationStatus(c *gin.Context) {
	registrationID := c.Param("id")
	if registrationID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Registration ID is required"})
		return
	}

	var body struct {
		Status domain.RegistrationStatus `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Валидация статуса
	validStatuses := []domain.RegistrationStatus{
		domain.RegistrationStatusPending,
		domain.RegistrationStatusActive,
		domain.RegistrationStatusCanceled,
		domain.RegistrationStatusCanceledByUser,
	}
	
	isValidStatus := false
	for _, status := range validStatuses {
		if body.Status == status {
			isValidStatus = true
			break
		}
	}
	
	if !isValidStatus {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid registration status"})
		return
	}

	registration, err := h.registrationCase.AdminUpdateRegistrationStatus(c.Request.Context(), registrationID, body.Status)
	if err != nil {
		if err.Error() == "updated registration not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": "Registration not found"})
			return
		}
		if ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "Failed to update registration status") {
			return
		}
	}

	c.JSON(http.StatusOK, registration)
}

// GetTournamentOptions получает список турниров для фильтрации
// @Summary Get tournament options (Admin)
// @Description Get list of tournaments for filtering. Available for any admin.
// @Tags admin-registrations
// @Produce json
// @Security BearerAuth
// @Success 200 {array} object{id=string,name=string}
// @Failure 401 {object} domain.ErrorResponse
// @Failure 500 {object} domain.ErrorResponse
// @Router /admin/registrations/tournaments [get]
func (h *Handler) GetTournamentOptions(c *gin.Context) {
	filter := &domain.FilterTournament{}
	tournaments, err := h.tournamentCase.Filter(c.Request.Context(), filter)
	if ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "Failed to get tournaments") {
		return
	}

	// Возвращаем только ID и название
	options := make([]map[string]interface{}, len(tournaments))
	for i, tournament := range tournaments {
		options[i] = map[string]interface{}{
			"id":   tournament.ID,
			"name": tournament.Name,
		}
	}

	c.JSON(http.StatusOK, options)
}

// GetUserOptions получает список пользователей для фильтрации по telegram username
// @Summary Get user options (Admin)
// @Description Get list of users for filtering by telegram username only. Available for any admin.
// @Tags admin-registrations
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param filter body object{telegramUsername=string} true "User filter (telegram username only)"
// @Success 200 {array} object{id=string,firstName=string,lastName=string,telegramUsername=string}
// @Failure 400 {object} domain.ErrorResponse
// @Failure 401 {object} domain.ErrorResponse
// @Failure 500 {object} domain.ErrorResponse
// @Router /admin/registrations/users [post]
func (h *Handler) GetUserOptions(c *gin.Context) {
	var body struct {
		TelegramUsername string `json:"telegramUsername"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Проверяем, что передан telegram username
	if body.TelegramUsername == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Telegram username is required"})
		return
	}

	// Создаем фильтр только по telegram username
	filter := &domain.FilterUser{
		TelegramUsername: &body.TelegramUsername,
	}

	users, err := h.userCase.AdminFilter(c.Request.Context(), filter)
	if ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "Failed to get users") {
		return
	}

	// Возвращаем только нужные поля
	options := make([]map[string]interface{}, len(users))
	for i, user := range users {
		options[i] = map[string]interface{}{
			"id":               user.ID,
			"firstName":        user.FirstName,
			"lastName":         user.LastName,
			"telegramUsername": user.TelegramUsername,
			"telegramId":       user.TelegramID,
		}
	}

	c.JSON(http.StatusOK, options)
} 