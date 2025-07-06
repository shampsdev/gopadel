package admin_tournaments

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/shampsdev/go-telegram-template/pkg/domain"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/ginerr"
	"github.com/shampsdev/go-telegram-template/pkg/usecase"
)

type Handler struct {
	tournamentCase *usecase.Tournament
}

func NewHandler(tournamentCase *usecase.Tournament) *Handler {
	return &Handler{
		tournamentCase: tournamentCase,
	}
}

// GetAllTournaments получает все турниры для админов
// @Summary Get all tournaments (Admin)
// @Description Get all tournaments with advanced filtering. Available for any admin.
// @Tags admin-tournaments
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param filter body domain.AdminFilterTournament false "Filter criteria"
// @Success 200 {array} domain.Tournament
// @Failure 401 {object} domain.ErrorResponse
// @Failure 500 {object} domain.ErrorResponse
// @Router /admin/tournaments/filter [post]
func (h *Handler) GetAllTournaments(c *gin.Context) {
	var filter domain.AdminFilterTournament
	if err := c.ShouldBindJSON(&filter); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx := &usecase.Context{Context: c, User: nil}
	tournaments, err := h.tournamentCase.AdminFilter(ctx, &filter)
	if ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "Failed to get tournaments") {
		return
	}

	if tournaments == nil {
		tournaments = []*domain.Tournament{}
	}

	c.JSON(http.StatusOK, tournaments)
}

// CreateTournament создает новый турнир
// @Summary Create tournament (Admin)
// @Description Create a new tournament. Available for any admin.
// @Tags admin-tournaments
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param tournament body domain.CreateTournament true "Tournament data"
// @Success 201 {object} domain.Tournament
// @Failure 400 {object} domain.ErrorResponse
// @Failure 401 {object} domain.ErrorResponse
// @Failure 500 {object} domain.ErrorResponse
// @Router /admin/tournaments [post]
func (h *Handler) CreateTournament(c *gin.Context) {
	var createData domain.CreateTournament
	if err := c.ShouldBindJSON(&createData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx := &usecase.Context{Context: c, User: nil}
	tournament, err := h.tournamentCase.AdminCreate(ctx, &createData)
	if ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "Failed to create tournament") {
		return
	}

	c.JSON(http.StatusCreated, tournament)
}

// PatchTournament обновляет турнир
// @Summary Update tournament (Admin)
// @Description Update tournament data. Available for any admin.
// @Tags admin-tournaments
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Tournament ID"
// @Param tournament body domain.AdminPatchTournament true "Tournament update data"
// @Success 200 {object} domain.Tournament
// @Failure 400 {object} domain.ErrorResponse
// @Failure 401 {object} domain.ErrorResponse
// @Failure 404 {object} domain.ErrorResponse
// @Failure 500 {object} domain.ErrorResponse
// @Router /admin/tournaments/{id} [patch]
func (h *Handler) PatchTournament(c *gin.Context) {
	tournamentID := c.Param("id")
	if tournamentID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Tournament ID is required"})
		return
	}

	var patchData domain.AdminPatchTournament
	if err := c.ShouldBindJSON(&patchData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx := &usecase.Context{Context: c, User: nil}
	tournament, err := h.tournamentCase.AdminPatch(ctx, tournamentID, &patchData)
	if err != nil {
		if err.Error() == fmt.Sprintf("tournament with id %s not found", tournamentID) {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "Failed to update tournament")
		return
	}

	c.JSON(http.StatusOK, tournament)
}

// DeleteTournament удаляет турнир
// @Summary Delete tournament (Admin)
// @Description Delete tournament. Available for any admin.
// @Tags admin-tournaments
// @Produce json
// @Security BearerAuth
// @Param id path string true "Tournament ID"
// @Success 200 {object} domain.MessageResponse
// @Failure 400 {object} domain.ErrorResponse
// @Failure 401 {object} domain.ErrorResponse
// @Failure 404 {object} domain.ErrorResponse
// @Failure 500 {object} domain.ErrorResponse
// @Router /admin/tournaments/{id} [delete]
func (h *Handler) DeleteTournament(c *gin.Context) {
	tournamentID := c.Param("id")
	if tournamentID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Tournament ID is required"})
		return
	}

	ctx := &usecase.Context{Context: c, User: nil}
	err := h.tournamentCase.AdminDelete(ctx, tournamentID)
	if err != nil {
		if err.Error() == fmt.Sprintf("tournament with id %s not found", tournamentID) {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "Failed to delete tournament")
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Tournament deleted successfully"})
} 