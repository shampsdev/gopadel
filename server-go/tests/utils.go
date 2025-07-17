package tests

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"sync"
	"testing"
	"time"

	"github.com/joho/godotenv"
	"github.com/shampsdev/go-telegram-template/pkg/domain"
)

const (
	baseURL = "http://localhost:8000/api/v1"
)

var (
	envOnce sync.Once
)

// loadEnvFile загружает переменные окружения из .env файла (выполняется только один раз)
func loadEnvFile() {
	envOnce.Do(func() {
		// Пытаемся найти .env файл в корне проекта
		envPath := filepath.Join(".env")
		
		// Если файл существует, загружаем его
		if _, err := os.Stat(envPath); err == nil {
			if err := godotenv.Load(envPath); err != nil {
				log.Printf("Предупреждение: не удалось загрузить .env файл из корня проекта: %v", err)
			}
		}
		
		// Также пытаемся загрузить .env из текущей директории тестов
		if err := godotenv.Load(".env"); err == nil {
			// Файл успешно загружен из текущей директории
		}
	})
}

// getEnvOrDefault получает переменную окружения или возвращает значение по умолчанию
func getEnvOrDefault(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// getUserToken получает токен обычного пользователя из переменной окружения
func getUserToken() string {
	loadEnvFile() // Загружаем .env перед получением токена
	return getEnvOrDefault("USER_TOKEN", "")
}

// getAdminToken получает токен админа из переменной окружения
func getAdminToken() string {
	loadEnvFile() // Загружаем .env перед получением токена
	return getEnvOrDefault("ADMIN_TOKEN", "")
}

// stringPtr возвращает указатель на строку
func stringPtr(s string) *string {
	return &s
}

// createTestTournamentAsAdmin creates test tournament as admin
func createTestTournamentAsAdmin(t *testing.T, token string) string {
	createEvent := domain.CreateEvent{
		Name:        fmt.Sprintf("Test tournament %d", time.Now().Unix()),
		Description: stringPtr("Tournament description"),
		StartTime:   time.Now().Add(24 * time.Hour),
		EndTime:     time.Now().Add(26 * time.Hour),
		RankMin:     0.0,
		RankMax:     15.0,
		Price:       1000,
		MaxUsers:    16,
		Type:        domain.EventTypeTournament,
		CourtID:     "9603f0b7-7729-410f-92bf-04de55527a8f",
		ClubID:      stringPtr("global"),
	}

	body, _ := json.Marshal(createEvent)
	
	req, err := http.NewRequest("POST", baseURL+"/events", bytes.NewBuffer(body))
	if err != nil {
		t.Fatal(err)
	}
	
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-API-Token", token)
	
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()
	
	if resp.StatusCode != http.StatusCreated {
		return ""
	}
	
	var createdEvent domain.Event
	if err := json.NewDecoder(resp.Body).Decode(&createdEvent); err != nil {
		return ""
	}
	
	return createdEvent.ID
}

// intPtr возвращает указатель на int
func intPtr(i int) *int {
	return &i
} 

// deleteEvent - helper function for resource cleanup
func deleteEvent(eventID string, token string) {
	url := fmt.Sprintf("%s/events/%s", baseURL, eventID)
	req, _ := http.NewRequest("DELETE", url, nil)
	req.Header.Set("X-API-Token", token)
	
	client := &http.Client{Timeout: 10 * time.Second}
	client.Do(req) // Ignore errors in cleanup
} 