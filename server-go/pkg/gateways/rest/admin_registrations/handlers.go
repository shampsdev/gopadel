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
}

func NewHandler(registrationCase *usecase.Registration) *Handler {
	return &Handler{
		registrationCase: registrationCase,
	}
}

// FilterRegistrations получает список регистраций с фильтрацией
// @Summary Filter registrations (Admin)
// @Description Get filtered list of registrations with payment info. Available for any admin.
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

// UpdateRegistrationStatus обновляет статус регистрации
// @Summary Update registration status (Admin)
// @Description Update registration status. Available only for superuser.
// @Tags admin-registrations
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param user_id path string true "User ID"
// @Param event_id path string true "Event ID"
// @Param status body domain.RegistrationStatusUpdate true "New status"
// @Success 200 {object} domain.RegistrationWithPayments
// @Failure 400 {object} domain.ErrorResponse
// @Failure 401 {object} domain.ErrorResponse
// @Failure 403 {object} domain.ErrorResponse
// @Failure 404 {object} domain.ErrorResponse
// @Failure 500 {object} domain.ErrorResponse
// @Router /admin/registrations/{user_id}/{event_id}/status [patch]
func (h *Handler) UpdateRegistrationStatus(c *gin.Context) {
	userID := c.Param("user_id")
	eventID := c.Param("event_id")
	
	if userID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "user_id is required"})
		return
	}
	
	if eventID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "event_id is required"})
		return
	}

	var statusUpdate domain.RegistrationStatusUpdate
	
	if err := c.ShouldBindJSON(&statusUpdate); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Обновляем статус регистрации
	registration, err := h.registrationCase.AdminUpdateRegistrationStatus(
		c.Request.Context(), 
		userID, 
		eventID, 
		statusUpdate.Status,
	)
	if ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "Failed to update registration status") {
		return
	}

	c.JSON(http.StatusOK, registration)
} 