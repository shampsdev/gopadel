package registration

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/ginerr"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/middlewares"
	"github.com/shampsdev/go-telegram-template/pkg/usecase"
)

type CreatePaymentRequest struct {
	ReturnURL string `json:"returnUrl" binding:"required"`
}

// CreatePayment godoc
// @Summary Create payment for tournament registration
// @Description Creates payment in YooKassa for existing PENDING registration. Returns existing payment if it's already in success/pending status. For free tournaments (price = 0), payment is not required.
// @Tags registration
// @Accept json
// @Produce json
// @Param tournament_id path string true "Tournament ID"
// @Param request body CreatePaymentRequest true "Payment creation request"
// @Success 200 {object} domain.Payment "Payment created or existing payment returned"
// @Failure 400 {object} map[string]string "Invalid request data or tournament is free"
// @Failure 401 {object} map[string]string "User not authorized"
// @Failure 404 {object} map[string]string "No pending registration found"
// @Failure 500 {object} map[string]string "Internal server error"
// @Security ApiKeyAuth
// @Router /registrations/{tournament_id}/payment [post]
func CreatePayment(paymentCase *usecase.Payment, userCase *usecase.User) gin.HandlerFunc {
	return func(c *gin.Context) {
		user := middlewares.MustGetUser(c)
		tournamentID := c.Param("tournament_id")
		if tournamentID == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "tournament_id is required"})
			return
		}

		var request CreatePaymentRequest
		if err := c.ShouldBindJSON(&request); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body: " + err.Error()})
			return
		}

		payment, err := paymentCase.CreateYooKassaPayment(c.Request.Context(), user, tournamentID, request.ReturnURL)
		if err != nil {
			switch {
			case err.Error() == "no pending registration found for this tournament":
				c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			case err.Error() == "tournament not found":
				c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			case err.Error() == "tournament is free, no payment required":
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			default:
				ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "failed to create payment")
			}
			return
		}

		c.JSON(http.StatusOK, payment)
	}
} 