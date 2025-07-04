package admin_admins

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/shampsdev/go-telegram-template/pkg/domain"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/ginerr"
	"github.com/shampsdev/go-telegram-template/pkg/repo"
	"github.com/shampsdev/go-telegram-template/pkg/usecase"
)

type Handler struct {
	adminUserCase *usecase.AdminUser
}

func NewHandler(adminUserCase *usecase.AdminUser) *Handler {
	return &Handler{
		adminUserCase: adminUserCase,
	}
}

// FilterAdmins получает список админов с фильтрацией
// @Summary Filter admin users
// @Description Get filtered list of admin users. Available only for superuser.
// @Tags admin
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param filter body domain.FilterAdminUser true "Admin filter"
// @Success 200 {array} domain.AdminUser
// @Failure 400 {object} domain.ErrorResponse
// @Failure 401 {object} domain.ErrorResponse
// @Failure 403 {object} domain.ErrorResponse
// @Failure 500 {object} domain.ErrorResponse
// @Router /admin/filter [post]
func (h *Handler) FilterAdmins(c *gin.Context) {
	var filter domain.FilterAdminUser
	if err := c.ShouldBindJSON(&filter); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	admins, err := h.adminUserCase.Filter(c.Request.Context(), &filter)
	if ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "Failed to filter admins") {
		return
	}

	c.JSON(http.StatusOK, admins)
}

// CreateAdmin создает нового админа
// @Summary Create admin user
// @Description Create a new admin user. Available only for superuser.
// @Tags admin
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param admin body domain.CreateAdminUser true "Admin data"
// @Success 201 {object} domain.AdminUser
// @Failure 400 {object} domain.ErrorResponse
// @Failure 401 {object} domain.ErrorResponse
// @Failure 403 {object} domain.ErrorResponse
// @Failure 500 {object} domain.ErrorResponse
// @Router /admin [post]
func (h *Handler) CreateAdmin(c *gin.Context) {
	var createData domain.CreateAdminUser
	if err := c.ShouldBindJSON(&createData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	id, err := h.adminUserCase.Create(c.Request.Context(), &createData)
	if ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "Failed to create admin") {
		return
	}

	filter := &domain.FilterAdminUser{
		ID: &id,
	}
	
	admins, err := h.adminUserCase.Filter(c.Request.Context(), filter)
	if ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "Failed to get created admin") {
		return
	}

	if len(admins) == 0 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Created admin not found"})
		return
	}

	c.JSON(http.StatusCreated, admins[0])
}

// PatchAdmin обновляет админа
// @Summary Update admin user
// @Description Update admin user data. Available only for superuser.
// @Tags admin
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Admin ID"
// @Param admin body domain.PatchAdminUser true "Admin update data"
// @Success 200 {object} domain.AdminUser
// @Failure 400 {object} domain.ErrorResponse
// @Failure 401 {object} domain.ErrorResponse
// @Failure 403 {object} domain.ErrorResponse
// @Failure 404 {object} domain.ErrorResponse
// @Failure 500 {object} domain.ErrorResponse
// @Router /admin/{id} [patch]
func (h *Handler) PatchAdmin(c *gin.Context) {
	adminID := c.Param("id")
	if adminID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Admin ID is required"})
		return
	}

	var patch domain.PatchAdminUser
	if err := c.ShouldBindJSON(&patch); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	admin, err := h.adminUserCase.Patch(c.Request.Context(), adminID, &patch)
	if err != nil {
		if err == repo.ErrNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Admin not found"})
			return
		}
		if ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "Failed to update admin") {
			return
		}
	}

	c.JSON(http.StatusOK, admin)
}

// DeleteAdmin удаляет админа
// @Summary Delete admin user
// @Description Delete admin user. Available only for superuser.
// @Tags admin
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Admin ID"
// @Success 200 {object} domain.MessageResponse
// @Failure 400 {object} domain.ErrorResponse
// @Failure 401 {object} domain.ErrorResponse
// @Failure 403 {object} domain.ErrorResponse
// @Failure 404 {object} domain.ErrorResponse
// @Failure 500 {object} domain.ErrorResponse
// @Router /admin/{id} [delete]
func (h *Handler) DeleteAdmin(c *gin.Context) {
	adminID := c.Param("id")
	if adminID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Admin ID is required"})
		return
	}

	// Проверяем существование админа используя Filter
	filter := &domain.FilterAdminUser{
		ID: &adminID,
	}
	
	admins, err := h.adminUserCase.Filter(c.Request.Context(), filter)
	if err != nil {
		if ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "Failed to check admin existence") {
			return
		}
	}

	if len(admins) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Admin not found"})
		return
	}

	err = h.adminUserCase.Delete(c.Request.Context(), adminID)
	if ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "Failed to delete admin") {
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Admin deleted successfully"})
} 