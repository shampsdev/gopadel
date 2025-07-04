package admin_courts

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/shampsdev/go-telegram-template/pkg/domain"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/ginerr"
	"github.com/shampsdev/go-telegram-template/pkg/usecase"
)

type Handler struct {
	courtCase *usecase.Court
}

func NewHandler(courtCase *usecase.Court) *Handler {
	return &Handler{
		courtCase: courtCase,
	}
}

// GetCourts получает все корты для админов
// @Summary Get all courts (Admin)
// @Description Get all courts. Available for any admin.
// @Tags admin-courts
// @Produce json
// @Security BearerAuth
// @Success 200 {array} domain.Court
// @Failure 401 {object} domain.ErrorResponse
// @Failure 500 {object} domain.ErrorResponse
// @Router /admin/courts [get]
func (h *Handler) GetCourts(c *gin.Context) {
	filter := &domain.FilterCourt{}
	courts, err := h.courtCase.GetAll(usecase.NewContext(c, nil), filter)
	if ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "Failed to get courts") {
		return
	}

	if courts == nil {
		courts = []*domain.Court{}
	}

	c.JSON(http.StatusOK, courts)
}

// CreateCourt создает новый корт
// @Summary Create court (Admin)
// @Description Create a new court. Available only for superuser.
// @Tags admin-courts
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param court body domain.CreateCourt true "Court data"
// @Success 201 {object} domain.Court
// @Failure 400 {object} domain.ErrorResponse
// @Failure 401 {object} domain.ErrorResponse
// @Failure 403 {object} domain.ErrorResponse
// @Failure 500 {object} domain.ErrorResponse
// @Router /admin/courts [post]
func (h *Handler) CreateCourt(c *gin.Context) {
	var createData domain.CreateCourt
	if err := c.ShouldBindJSON(&createData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	id, err := h.courtCase.Create(usecase.NewContext(c, nil), &createData)
	if ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "Failed to create court") {
		return
	}

	// Возвращаем созданный корт
	court, err := h.courtCase.GetByID(usecase.NewContext(c, nil), id)
	if ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "Failed to get created court") {
		return
	}

	c.JSON(http.StatusCreated, court)
}

// GetCourt получает корт по ID
// @Summary Get court (Admin)
// @Description Get court by ID. Available for any admin.
// @Tags admin-courts
// @Produce json
// @Security BearerAuth
// @Param id path string true "Court ID"
// @Success 200 {object} domain.Court
// @Failure 400 {object} domain.ErrorResponse
// @Failure 401 {object} domain.ErrorResponse
// @Failure 404 {object} domain.ErrorResponse
// @Failure 500 {object} domain.ErrorResponse
// @Router /admin/courts/{id} [get]
func (h *Handler) GetCourt(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Court ID is required"})
		return
	}

	court, err := h.courtCase.GetByID(usecase.NewContext(c, nil), id)
	if err != nil {
		if err.Error() == fmt.Sprintf("court with id %s not found", id) {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "Failed to get court")
		return
	}

	c.JSON(http.StatusOK, court)
}

// UpdateCourt обновляет корт
// @Summary Update court (Admin)
// @Description Update court data. Available only for superuser.
// @Tags admin-courts
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Court ID"
// @Param court body domain.PatchCourt true "Court update data"
// @Success 200 {object} domain.Court
// @Failure 400 {object} domain.ErrorResponse
// @Failure 401 {object} domain.ErrorResponse
// @Failure 403 {object} domain.ErrorResponse
// @Failure 404 {object} domain.ErrorResponse
// @Failure 500 {object} domain.ErrorResponse
// @Router /admin/courts/{id} [patch]
func (h *Handler) UpdateCourt(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Court ID is required"})
		return
	}

	var patchData domain.PatchCourt
	if err := c.ShouldBindJSON(&patchData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.courtCase.Update(usecase.NewContext(c, nil), id, &patchData)
	if err != nil {
		if err.Error() == fmt.Sprintf("court with id %s not found", id) {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "Failed to update court")
		return
	}

	// Возвращаем обновленный корт
	court, err := h.courtCase.GetByID(usecase.NewContext(c, nil), id)
	if ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "Failed to get updated court") {
		return
	}

	c.JSON(http.StatusOK, court)
}

// DeleteCourt удаляет корт
// @Summary Delete court (Admin)
// @Description Delete court. Available only for superuser.
// @Tags admin-courts
// @Produce json
// @Security BearerAuth
// @Param id path string true "Court ID"
// @Success 200 {object} domain.MessageResponse
// @Failure 400 {object} domain.ErrorResponse
// @Failure 401 {object} domain.ErrorResponse
// @Failure 403 {object} domain.ErrorResponse
// @Failure 404 {object} domain.ErrorResponse
// @Failure 500 {object} domain.ErrorResponse
// @Router /admin/courts/{id} [delete]
func (h *Handler) DeleteCourt(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Court ID is required"})
		return
	}

	err := h.courtCase.Delete(usecase.NewContext(c, nil), id)
	if err != nil {
		if err.Error() == fmt.Sprintf("court with id %s not found", id) {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "Failed to delete court")
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Court deleted successfully"})
} 