package admin_loyalties

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/shampsdev/go-telegram-template/pkg/domain"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/ginerr"
	"github.com/shampsdev/go-telegram-template/pkg/usecase"
)

type Handler struct {
	loyaltyCase *usecase.Loyalty
}

func NewHandler(loyaltyCase *usecase.Loyalty) *Handler {
	return &Handler{
		loyaltyCase: loyaltyCase,
	}
}

// GetAllLoyalties получает все уровни лояльности для админов
// @Summary Get all loyalty levels (Admin)
// @Description Get all loyalty levels. Available for any admin.
// @Tags admin-loyalties
// @Produce json
// @Security BearerAuth
// @Success 200 {array} domain.Loyalty
// @Failure 401 {object} domain.ErrorResponse
// @Failure 500 {object} domain.ErrorResponse
// @Router /admin/loyalties [get]
func (h *Handler) GetAllLoyalties(c *gin.Context) {
	filter := &domain.FilterLoyalty{}
	loyalties, err := h.loyaltyCase.Filter(usecase.NewContext(c, nil), filter)
	if ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "Failed to get loyalties") {
		return
	}

	if loyalties == nil {
		loyalties = []*domain.Loyalty{}
	}

	c.JSON(http.StatusOK, loyalties)
}

// CreateLoyalty создает новый уровень лояльности
// @Summary Create loyalty level (Admin)
// @Description Create a new loyalty level. Available for any admin.
// @Tags admin-loyalties
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param loyalty body domain.CreateLoyalty true "Loyalty data"
// @Success 201 {object} domain.Loyalty
// @Failure 400 {object} domain.ErrorResponse
// @Failure 401 {object} domain.ErrorResponse
// @Failure 500 {object} domain.ErrorResponse
// @Router /admin/loyalties [post]
func (h *Handler) CreateLoyalty(c *gin.Context) {
	var createData domain.CreateLoyalty
	if err := c.ShouldBindJSON(&createData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	id, err := h.loyaltyCase.Create(usecase.NewContext(c, nil), &createData)
	if ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "Failed to create loyalty") {
		return
	}

	// Возвращаем созданный уровень лояльности
	idInt := 0
	if _, err := fmt.Sscanf(id, "%d", &idInt); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid loyalty ID"})
		return
	}

	filter := &domain.FilterLoyalty{ID: &idInt}
	loyalties, err := h.loyaltyCase.Filter(usecase.NewContext(c, nil), filter)
	if ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "Failed to get created loyalty") {
		return
	}

	if len(loyalties) == 0 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Created loyalty not found"})
		return
	}

	c.JSON(http.StatusCreated, loyalties[0])
}

// PatchLoyalty обновляет уровень лояльности
// @Summary Update loyalty level (Admin)
// @Description Update loyalty level data. Available for any admin.
// @Tags admin-loyalties
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Loyalty ID"
// @Param loyalty body domain.PatchLoyalty true "Loyalty update data"
// @Success 200 {object} domain.Loyalty
// @Failure 400 {object} domain.ErrorResponse
// @Failure 401 {object} domain.ErrorResponse
// @Failure 404 {object} domain.ErrorResponse
// @Failure 500 {object} domain.ErrorResponse
// @Router /admin/loyalties/{id} [patch]
func (h *Handler) PatchLoyalty(c *gin.Context) {
	idStr := c.Param("id")
	id := 0
	if _, err := fmt.Sscanf(idStr, "%d", &id); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid loyalty ID"})
		return
	}

	var patchData domain.PatchLoyalty
	if err := c.ShouldBindJSON(&patchData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.loyaltyCase.Patch(usecase.NewContext(c, nil), id, &patchData)
	if err != nil {
		if err.Error() == fmt.Sprintf("loyalty with id %d not found", id) {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "Failed to update loyalty")
		return
	}

	// Возвращаем обновленный уровень лояльности
	filter := &domain.FilterLoyalty{ID: &id}
	loyalties, err := h.loyaltyCase.Filter(usecase.NewContext(c, nil), filter)
	if ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "Failed to get updated loyalty") {
		return
	}

	if len(loyalties) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Updated loyalty not found"})
		return
	}

	c.JSON(http.StatusOK, loyalties[0])
}

// DeleteLoyalty удаляет уровень лояльности
// @Summary Delete loyalty level (Admin)
// @Description Delete loyalty level. Available for any admin.
// @Tags admin-loyalties
// @Produce json
// @Security BearerAuth
// @Param id path int true "Loyalty ID"
// @Success 200 {object} domain.MessageResponse
// @Failure 400 {object} domain.ErrorResponse
// @Failure 401 {object} domain.ErrorResponse
// @Failure 404 {object} domain.ErrorResponse
// @Failure 500 {object} domain.ErrorResponse
// @Router /admin/loyalties/{id} [delete]
func (h *Handler) DeleteLoyalty(c *gin.Context) {
	idStr := c.Param("id")
	id := 0
	if _, err := fmt.Sscanf(idStr, "%d", &id); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid loyalty ID"})
		return
	}

	err := h.loyaltyCase.Delete(usecase.NewContext(c, nil), id)
	if err != nil {
		if err.Error() == fmt.Sprintf("loyalty with id %d not found", id) {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "Failed to delete loyalty")
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Loyalty level deleted successfully"})
} 