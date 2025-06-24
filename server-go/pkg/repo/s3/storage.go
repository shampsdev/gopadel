package s3

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"log/slog"
	"mime"
	"net/http"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/google/uuid"
	"github.com/shampsdev/go-telegram-template/pkg/config"
	"github.com/shampsdev/go-telegram-template/pkg/utils/slogx"
)

type Storage struct {
	cfg      config.S3Config
	session  *session.Session
	s3Client *s3.S3
	rootDir  string
}

func NewStorage(cfg config.S3Config) (*Storage, error) {
	sess, err := session.NewSession(&aws.Config{
		Region:      &cfg.Region,
		Endpoint:    &cfg.EndpointUrl,
		Credentials: credentials.NewStaticCredentials(cfg.AccessKeyID, cfg.SecretKey, ""),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create AWS session: %w", err)
	}

	s3Client := s3.New(sess)

	return &Storage{
		cfg:      cfg,
		session:  sess,
		s3Client: s3Client,
		rootDir:  cfg.RootDirectory,
	}, nil
}

func (s *Storage) SaveImageByURL(ctx context.Context, imageURL, key string) (string, error) {
	imageData, err := downloadFromURL(imageURL)
	if err != nil {
		return "", fmt.Errorf("failed to download image: %w", err)
	}

	fileURL, err := s.SaveImageByBytes(ctx, imageData, key)
	if err != nil {
		return "", fmt.Errorf("failed to save image: %w", err)
	}

	return fileURL, nil
}

func (s *Storage) SaveImageByBytes(ctx context.Context, imageData []byte, uid string) (string, error) {
	if uid == "" {
		uid = uuid.New().String()
	}
	mimeType := http.DetectContentType(imageData)
	fileExtension, _ := mime.ExtensionsByType(mimeType)
	if len(fileExtension) == 0 {
		fileExtension = []string{".jpeg"}
	}

	key := fmt.Sprintf("%s/%s%s", s.rootDir, uid, fileExtension[0])

	_, err := s.s3Client.PutObject(&s3.PutObjectInput{
		Bucket:      &s.cfg.Bucket,
		Key:         aws.String(key),
		Body:        bytes.NewReader(imageData),
		ContentType: aws.String(mimeType),
	})
	if err != nil {
		return "", fmt.Errorf("failed to upload image to S3: %w", err)
	}

	fileURL := fmt.Sprintf("%s/%s/%s", s.cfg.EndpointUrl, s.cfg.Bucket, key)
	slogx.Info(ctx, "Succesfully upload image", slog.String("file_url", fileURL))

	return fileURL, nil
}

func downloadFromURL(imageURL string) ([]byte, error) {
	resp, err := http.Get(imageURL)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch image from URL: %w", err)
	}
	defer resp.Body.Close()

	buf := new(bytes.Buffer)
	_, err = io.Copy(buf, resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read image data: %w", err)
	}

	return buf.Bytes(), nil
}
