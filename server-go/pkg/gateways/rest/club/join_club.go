package club

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/ginerr"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/middlewares"
	"github.com/shampsdev/go-telegram-template/pkg/usecase"
)

// JoinClub godoc
// @Summary Join club
// @Tags clubs
// @Accept json
// @Produce json
// @Schemes http https
// @Param club_id path string true "Club ID"
// @Success 200 {object} domain.Club "Club data"
// @Failure 400 "Bad Request"
// @Failure 401 "Unauthorized"
// @Failure 500 "Internal Server Error"
// @Security ApiKeyAuth
// @Router /clubs/{club_id}/join [post]
func JoinClub(clubCase *usecase.Club) gin.HandlerFunc {
	return func(c *gin.Context) {
		user := middlewares.MustGetUser(c)
		clubID := c.Param("club_id")

		if clubID == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "club_id is required"})
			return
		}

		ctx := usecase.NewContext(c, user)
		club, err := clubCase.JoinClubAndGet(&ctx, clubID)
		if ginerr.AbortIfErr(c, err, http.StatusBadRequest, "failed to join club") {
			return
		}

		c.JSON(http.StatusOK, club)
	}
} 