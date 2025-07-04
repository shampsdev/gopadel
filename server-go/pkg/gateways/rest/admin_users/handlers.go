package admin_users

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/shampsdev/go-telegram-template/pkg/domain"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/ginerr"
	"github.com/shampsdev/go-telegram-template/pkg/usecase"
)

type Handler struct {
	userCase *usecase.User
}

func NewHandler(userCase *usecase.User) *Handler {
	return &Handler{
		userCase: userCase,
	}
}

// FilterUsers получает список пользователей с фильтрацией
// @Summary Filter users (Admin)
// @Description Get filtered list of users. Available for any admin.
// @Tags admin-users
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param filter body domain.FilterUser true "User filter"
// @Success 200 {array} domain.User
// @Failure 400 {object} domain.ErrorResponse
// @Failure 401 {object} domain.ErrorResponse
// @Failure 500 {object} domain.ErrorResponse
// @Router /admin/users/filter [post]
func (h *Handler) FilterUsers(c *gin.Context) {
	var filter domain.FilterUser
	if err := c.ShouldBindJSON(&filter); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	users, err := h.userCase.AdminFilter(c.Request.Context(), &filter)
	if ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "Failed to filter users") {
		return
	}

	c.JSON(http.StatusOK, users)
}

// PatchUser обновляет пользователя
// @Summary Update user (Admin)
// @Description Update user data. Available only for superuser. Cannot change telegramUsername.
// @Tags admin-users
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "User ID"
// @Param user body domain.AdminPatchUser true "User update data"
// @Success 200 {object} domain.User
// @Failure 400 {object} domain.ErrorResponse
// @Failure 401 {object} domain.ErrorResponse
// @Failure 403 {object} domain.ErrorResponse
// @Failure 404 {object} domain.ErrorResponse
// @Failure 500 {object} domain.ErrorResponse
// @Router /admin/users/{id} [patch]
func (h *Handler) PatchUser(c *gin.Context) {
	userID := c.Param("id")
	if userID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User ID is required"})
		return
	}

	var patch domain.AdminPatchUser
	if err := c.ShouldBindJSON(&patch); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := h.userCase.AdminPatchUser(c.Request.Context(), userID, &patch)
	if ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "Failed to update user") {
		return
	}

	c.JSON(http.StatusOK, user)
} 