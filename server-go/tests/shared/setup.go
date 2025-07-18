package shared

import (
	"fmt"
	"log"
	"os"
	"path/filepath"
	"sync"
	"testing"
	"time"

	"github.com/joho/godotenv"
	"github.com/shampsdev/go-telegram-template/pkg/domain"
)

var envOnce sync.Once

func LoadEnv() {
	envOnce.Do(func() {
		envPath := filepath.Join(".env")
		if _, err := os.Stat(envPath); err == nil {
			if err := godotenv.Load(envPath); err != nil {
				log.Printf("Warning: failed to load .env file: %v", err)
			}
		}
		godotenv.Load(".env")
	})
}

func GetUserToken() string {
	LoadEnv()
	return os.Getenv("USER_WEBAPP_TOKEN")
}

func GetAdminToken() string {
	LoadEnv()
	return os.Getenv("ADMIN_WEBAPP_TOKEN")
}

func SkipIfNoTokens(t *testing.T) (userToken, adminToken string) {
	userToken = GetUserToken()
	adminToken = GetAdminToken()
	
	if userToken == "" || adminToken == "" {
		t.Skip("USER_WEBAPP_TOKEN and ADMIN_WEBAPP_TOKEN must be set in .env file. Use real signed Telegram Web App tokens.")
	}
	
	return userToken, adminToken
}

func StringPtr(s string) *string {
	return &s
}

func IntPtr(i int) *int {
	return &i
}

func CreateTestTournament(t *testing.T, client *Client, token string) *domain.Event {
	event := domain.CreateEvent{
		Name:        fmt.Sprintf("Test Tournament %d", time.Now().Unix()),
		Description: StringPtr("Test tournament description"),
		StartTime:   time.Now().Add(24 * time.Hour),
		EndTime:     time.Now().Add(26 * time.Hour),
		RankMin:     0.0,
		RankMax:     15.0,
		Price:       1000,
		MaxUsers:    16,
		Type:        domain.EventTypeTournament,
		CourtID:     "9603f0b7-7729-410f-92bf-04de55527a8f",
		ClubID:      StringPtr("global"),
	}

	createdEvent, err := client.CreateEvent(token, event)
	if err != nil {
		t.Fatalf("Failed to create test tournament: %v", err)
	}

	return createdEvent
}

func CreateTestGame(t *testing.T, client *Client, token string) *domain.Event {
	event := domain.CreateEvent{
		Name:        fmt.Sprintf("Test Game %d", time.Now().Unix()),
		Description: StringPtr("Test game description"),
		StartTime:   time.Now().Add(24 * time.Hour),
		EndTime:     time.Now().Add(26 * time.Hour),
		RankMin:     1.0,
		RankMax:     10.0,
		Price:       0,
		MaxUsers:    4,
		Type:        domain.EventTypeGame,
		CourtID:     "9603f0b7-7729-410f-92bf-04de55527a8f",
		ClubID:      StringPtr("global"),
	}

	createdEvent, err := client.CreateEvent(token, event)
	if err != nil {
		t.Fatalf("Failed to create test game: %v", err)
	}

	return createdEvent
}

func CleanupEvent(client *Client, token, eventID string) {
	client.DeleteEvent(token, eventID)
} 