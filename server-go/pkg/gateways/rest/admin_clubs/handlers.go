package admin_clubs

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

// GetAllClubs получает все клубы для админов
// @Summary Get all clubs (Admin)
// @Description Get all clubs. Available for any admin.
// @Tags admin-clubs
// @Produce json
// @Security BearerAuth
// @Success 200 {array} domain.Club
// @Failure 401 {object} domain.ErrorResponse
// @Failure 500 {object} domain.ErrorResponse
// @Router /admin/clubs [get]
func (h *Handler) GetAllClubs(c *gin.Context) {
	filter := &domain.FilterClub{}
	ctx := &usecase.Context{Context: c, User: nil}
	clubs, err := h.clubCase.AdminFilter(ctx, filter)
	if ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "Failed to get clubs") {
		return
	}

	if clubs == nil {
		clubs = []*domain.Club{}
	}

	c.JSON(http.StatusOK, clubs)
}

// CreateClub создает новый клуб
// @Summary Create club (Admin)
// @Description Create a new club. Available for superusers only.
// @Tags admin-clubs
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param club body domain.CreateClub true "Club data"
// @Success 201 {object} domain.Club
// @Failure 400 {object} domain.ErrorResponse
// @Failure 401 {object} domain.ErrorResponse
// @Failure 500 {object} domain.ErrorResponse
// @Router /admin/clubs [post]
func (h *Handler) CreateClub(c *gin.Context) {
	var createData domain.CreateClub
	if err := c.ShouldBindJSON(&createData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx := &usecase.Context{Context: c, User: nil}
	err := h.clubCase.AdminCreate(ctx, &createData)
	if ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "Failed to create club") {
		return
	}

	// Возвращаем созданный клуб
	filter := &domain.FilterClub{ID: &createData.ID}
	clubs, err := h.clubCase.AdminFilter(ctx, filter)
	if ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "Failed to get created club") {
		return
	}

	if len(clubs) == 0 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Created club not found"})
		return
	}

	c.JSON(http.StatusCreated, clubs[0])
}

// PatchClub обновляет клуб
// @Summary Update club (Admin)
// @Description Update club data. Available for superusers only.
// @Tags admin-clubs
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Club ID"
// @Param club body domain.PatchClub true "Club update data"
// @Success 200 {object} domain.Club
// @Failure 400 {object} domain.ErrorResponse
// @Failure 401 {object} domain.ErrorResponse
// @Failure 404 {object} domain.ErrorResponse
// @Failure 500 {object} domain.ErrorResponse
// @Router /admin/clubs/{id} [patch]
func (h *Handler) PatchClub(c *gin.Context) {
	clubID := c.Param("id")
	if clubID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Club ID is required"})
		return
	}

	var patchData domain.PatchClub
	if err := c.ShouldBindJSON(&patchData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx := &usecase.Context{Context: c, User: nil}
	err := h.clubCase.Patch(ctx, clubID, &patchData)
	if err != nil {
		if err.Error() == fmt.Sprintf("club with id %s not found", clubID) {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "Failed to update club")
		return
	}

	// Возвращаем обновленный клуб
	filter := &domain.FilterClub{ID: &clubID}
	clubs, err := h.clubCase.AdminFilter(ctx, filter)
	if ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "Failed to get updated club") {
		return
	}

	if len(clubs) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Updated club not found"})
		return
	}

	c.JSON(http.StatusOK, clubs[0])
}

// DeleteClub удаляет клуб
// @Summary Delete club (Admin)
// @Description Delete club. Available for superusers only.
// @Tags admin-clubs
// @Produce json
// @Security BearerAuth
// @Param id path string true "Club ID"
// @Success 200 {object} domain.MessageResponse
// @Failure 400 {object} domain.ErrorResponse
// @Failure 401 {object} domain.ErrorResponse
// @Failure 404 {object} domain.ErrorResponse
// @Failure 500 {object} domain.ErrorResponse
// @Router /admin/clubs/{id} [delete]
func (h *Handler) DeleteClub(c *gin.Context) {
	clubID := c.Param("id")
	if clubID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Club ID is required"})
		return
	}

	ctx := &usecase.Context{Context: c, User: nil}
	err := h.clubCase.Delete(ctx, clubID)
	if err != nil {
		if err.Error() == fmt.Sprintf("club with id %s not found", clubID) {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "Failed to delete club")
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Club deleted successfully"})
}
