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
	clubCase *usecase.Club
}

func NewHandler(clubCase *usecase.Club) *Handler {
	return &Handler{
		clubCase: clubCase,
	}
}

// GetAllCourts получает все корты для админов
// @Summary Get all courts (Admin)
// @Description Get all courts. Available for any admin.
// @Tags admin-courts
// @Produce json
// @Security BearerAuth
// @Success 200 {array} domain.Club
// @Failure 401 {object} domain.ErrorResponse
// @Failure 500 {object} domain.ErrorResponse
// @Router /admin/courts [get]
func (h *Handler) GetAllCourts(c *gin.Context) {
	filter := &domain.FilterClub{}
	courts, err := h.clubCase.GetAll(usecase.NewContext(c, nil), filter)
	if ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "Failed to get courts") {
		return
	}

	if courts == nil {
		courts = []*domain.Club{}
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
// @Param court body domain.CreateClub true "Court data"
// @Success 201 {object} domain.Club
// @Failure 400 {object} domain.ErrorResponse
// @Failure 401 {object} domain.ErrorResponse
// @Failure 403 {object} domain.ErrorResponse
// @Failure 500 {object} domain.ErrorResponse
// @Router /admin/courts [post]
func (h *Handler) CreateCourt(c *gin.Context) {
	var createData domain.CreateClub
	if err := c.ShouldBindJSON(&createData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	id, err := h.clubCase.Create(usecase.NewContext(c, nil), &createData)
	if ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "Failed to create court") {
		return
	}

	// Возвращаем созданный корт
	court, err := h.clubCase.GetByID(usecase.NewContext(c, nil), id)
	if ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "Failed to get created court") {
		return
	}

	c.JSON(http.StatusCreated, court)
}

// PatchCourt обновляет корт
// @Summary Update court (Admin)
// @Description Update court data. Available only for superuser.
// @Tags admin-courts
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Court ID"
// @Param court body domain.PatchClub true "Court update data"
// @Success 200 {object} domain.Club
// @Failure 400 {object} domain.ErrorResponse
// @Failure 401 {object} domain.ErrorResponse
// @Failure 403 {object} domain.ErrorResponse
// @Failure 404 {object} domain.ErrorResponse
// @Failure 500 {object} domain.ErrorResponse
// @Router /admin/courts/{id} [patch]
func (h *Handler) PatchCourt(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Court ID is required"})
		return
	}

	var patchData domain.PatchClub
	if err := c.ShouldBindJSON(&patchData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.clubCase.Update(usecase.NewContext(c, nil), id, &patchData)
	if err != nil {
		if err.Error() == fmt.Sprintf("club with id %s not found", id) {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "Failed to update court")
		return
	}

	// Возвращаем обновленный корт
	court, err := h.clubCase.GetByID(usecase.NewContext(c, nil), id)
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

	err := h.clubCase.Delete(usecase.NewContext(c, nil), id)
	if err != nil {
		if err.Error() == fmt.Sprintf("club with id %s not found", id) {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "Failed to delete court")
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Court deleted successfully"})
} 