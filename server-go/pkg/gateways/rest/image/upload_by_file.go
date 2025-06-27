package image

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/middlewares"
	"github.com/shampsdev/go-telegram-template/pkg/usecase"
)

// UploadResponse represents the response structure for image upload
type UploadResponse struct {
	URL string `json:"url" example:"https://example.com/image.jpg"`
}

// UploadByFile godoc
// @Summary Upload file to s3
// @Tags images
// @Accept multipart/form-data
// @Produce json
// @Schemes http https
// @Param file formData file true "Image data"
// @Success 200 {object} UploadResponse "A url to the stored image"
// @Failure 400 "Parsing error"
// @Failure 401 "Unauthorized"
// @Failure 500 "Internal Server Error"
// @Security ApiKeyAuth
// @Router /images/upload/avatar [post]
func UploadByFile(imageCase *usecase.Image) gin.HandlerFunc {
	return func(c *gin.Context) {
		user := middlewares.MustGetUser(c)
		destDir := fmt.Sprintf("user/%d", user.TelegramID)

		file, err := c.FormFile("file")
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		fOpen, err := file.Open()
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		defer fOpen.Close()

		storage := imageCase.GetStorage()
		url, err := storage.SaveImageByReaderWithPath(c, fOpen, destDir)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, UploadResponse{URL: url})
	}
}
