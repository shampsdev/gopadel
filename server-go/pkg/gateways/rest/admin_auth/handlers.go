package admin_auth

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/shampsdev/go-telegram-template/pkg/domain"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/ginerr"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/middlewares"
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

// Login выполняет аутентификацию админа
// @Summary Admin login
// @Description Authenticate admin user and return JWT token
// @Tags admin-auth
// @Accept json
// @Produce json
// @Param login body domain.AdminLogin true "Login credentials"
// @Success 200 {object} domain.AdminToken
// @Failure 400 {object} domain.ErrorResponse
// @Failure 401 {object} domain.ErrorResponse
// @Router /admin/auth/login [post]
func (h *Handler) Login(c *gin.Context) {
	var loginData domain.AdminLogin
	if err := c.ShouldBindJSON(&loginData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	token, err := h.adminUserCase.Login(c.Request.Context(), &loginData)
	if ginerr.AbortIfErr(c, err, http.StatusUnauthorized, "Invalid username or password") {
		return
	}

	c.JSON(http.StatusOK, token)
}

// Me возвращает информацию о текущем админе
// @Summary Get current admin info
// @Description Get information about currently authenticated admin
// @Tags admin-auth
// @Produce json
// @Security BearerAuth
// @Success 200 {object} domain.AdminMe
// @Failure 401 {object} domain.ErrorResponse
// @Router /admin/auth/me [get]
func (h *Handler) Me(c *gin.Context) {
	admin := middlewares.MustGetAdmin(c)
	
	response := &domain.AdminMe{
		Username:    admin.Username,
		IsSuperUser: admin.IsSuperUser,
	}
	
	c.JSON(http.StatusOK, response)
}

// ChangePassword изменяет пароль админа
// @Summary Change admin password
// @Description Change password for currently authenticated admin
// @Tags admin-auth
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param password body domain.AdminPasswordChange true "Password change data"
// @Success 200 {object} domain.MessageResponse
// @Failure 400 {object} domain.ErrorResponse
// @Failure 401 {object} domain.ErrorResponse
// @Router /admin/auth/change-password [post]
func (h *Handler) ChangePassword(c *gin.Context) {
	admin := middlewares.MustGetAdmin(c)
	
	var passwordData domain.AdminPasswordChange
	if err := c.ShouldBindJSON(&passwordData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.adminUserCase.ChangePassword(
		c.Request.Context(), 
		admin, 
		passwordData.OldPassword, 
		passwordData.NewPassword,
	)
	if ginerr.AbortIfErr(c, err, http.StatusBadRequest, "Failed to change password") {
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Password updated successfully"})
} 