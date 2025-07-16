package e2e

import (
	"bytes"
	"encoding/json"
	"net/http"
	"testing"
	"time"

	"github.com/shampsdev/go-telegram-template/pkg/domain"
)

const (
	baseURL = "http://localhost:8000/api/v1"
)

// TestCreateGame тестирует создание игры обычным пользователем
func TestCreateGame(t *testing.T) {
	userToken := getUserToken() // Получаем токен обычного пользователя
	if userToken == "" {
		t.Skip("USER_TOKEN not provided")
	}

	createEvent := domain.CreateEvent{
		Name:        "Тестовая игра",
		Description: stringPtr("Описание тестовой игры"),
		StartTime:   time.Now().Add(24 * time.Hour),
		EndTime:     time.Now().Add(26 * time.Hour),
		RankMin:     1.0,
		RankMax:     10.0,
		Price:       0,
		MaxUsers:    4,
		Type:        domain.EventTypeGame,
		CourtID:     "9603f0b7-7729-410f-92bf-04de55527a8f",
		ClubID:      stringPtr("global"),
	}

	body, _ := json.Marshal(createEvent)
	
	req, err := http.NewRequest("POST", baseURL+"/events", bytes.NewBuffer(body))
	if err != nil {
		t.Fatal(err)
	}
	
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-API-Token", userToken)
	
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()
	
	if resp.StatusCode != http.StatusCreated {
		t.Errorf("Expected status %d, got %d", http.StatusCreated, resp.StatusCode)
	}
	
	var createdEvent domain.Event
	if err := json.NewDecoder(resp.Body).Decode(&createdEvent); err != nil {
		t.Fatal(err)
	}
	
	if createdEvent.Type != domain.EventTypeGame {
		t.Errorf("Expected event type %s, got %s", domain.EventTypeGame, createdEvent.Type)
	}
	
	if createdEvent.Name != createEvent.Name {
		t.Errorf("Expected name %s, got %s", createEvent.Name, createdEvent.Name)
	}
}

// TestCreateTournamentAsUser тестирует попытку создания турнира обычным пользователем (должна быть ошибка)
func TestCreateTournamentAsUser(t *testing.T) {
	userToken := getUserToken()
	if userToken == "" {
		t.Skip("USER_TOKEN not provided")
	}

	createEvent := domain.CreateEvent{
		Name:        "Тестовый турнир",
		Description: stringPtr("Описание тестового турнира"),
		StartTime:   time.Now().Add(24 * time.Hour),
		EndTime:     time.Now().Add(26 * time.Hour),
		RankMin:     1.0,
		RankMax:     10.0,
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
	req.Header.Set("X-API-Token", userToken)
	
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()
	
	// Ожидаем ошибку 403 Forbidden
	if resp.StatusCode != http.StatusForbidden {
		t.Errorf("Expected status %d (Forbidden), got %d", http.StatusForbidden, resp.StatusCode)
	}
}

// TestCreateTournamentAsAdmin тестирует создание турнира админом
func TestCreateTournamentAsAdmin(t *testing.T) {
	adminToken := getAdminToken()
	if adminToken == "" {
		t.Skip("ADMIN_TOKEN not provided")
	}

	createEvent := domain.CreateEvent{
		Name:        "Тестовый турнир (админ)",
		Description: stringPtr("Описание тестового турнира от админа"),
		StartTime:   time.Now().Add(24 * time.Hour),
		EndTime:     time.Now().Add(26 * time.Hour),
		RankMin:     1.0,
		RankMax:     10.0,
		Price:       1500,
		MaxUsers:    32,
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
	req.Header.Set("X-API-Token", adminToken)
	
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()
	
	if resp.StatusCode != http.StatusCreated {
		t.Errorf("Expected status %d, got %d", http.StatusCreated, resp.StatusCode)
	}
	
	var createdEvent domain.Event
	if err := json.NewDecoder(resp.Body).Decode(&createdEvent); err != nil {
		t.Fatal(err)
	}
	
	if createdEvent.Type != domain.EventTypeTournament {
		t.Errorf("Expected event type %s, got %s", domain.EventTypeTournament, createdEvent.Type)
	}
	
	if createdEvent.Price != createEvent.Price {
		t.Errorf("Expected price %d, got %d", createEvent.Price, createdEvent.Price)
	}
}

// TestCreateTraining тестирует попытку создания тренировки (должна быть ошибка)
func TestCreateTraining(t *testing.T) {
	userToken := getUserToken()
	if userToken == "" {
		t.Skip("USER_TOKEN not provided")
	}

	createEvent := domain.CreateEvent{
		Name:        "Тестовая тренировка",
		Description: stringPtr("Описание тестовой тренировки"),
		StartTime:   time.Now().Add(24 * time.Hour),
		EndTime:     time.Now().Add(26 * time.Hour),
		RankMin:     1.0,
		RankMax:     10.0,
		Price:       500,
		MaxUsers:    8,
		Type:        domain.EventTypeTraining,
		CourtID:     "9603f0b7-7729-410f-92bf-04de55527a8f",
		ClubID:      stringPtr("global"),
	}

	body, _ := json.Marshal(createEvent)
	
	req, err := http.NewRequest("POST", baseURL+"/events", bytes.NewBuffer(body))
	if err != nil {
		t.Fatal(err)
	}
	
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-API-Token", userToken)
	
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()
	
	// Ожидаем ошибку (функционал тренировок недоступен)
	if resp.StatusCode == http.StatusCreated {
		t.Error("Training creation should fail, but got success")
	}
}

// TestCreateInvalidEventType тестирует создание события с неверным типом
func TestCreateInvalidEventType(t *testing.T) {
	userToken := getUserToken()
	if userToken == "" {
		t.Skip("USER_TOKEN not provided")
	}

	// Создаем JSON с неверным типом события
	invalidEvent := map[string]interface{}{
		"name":        "Тестовое событие",
		"startTime":   time.Now().Add(24 * time.Hour),
		"endTime":     time.Now().Add(26 * time.Hour),
		"rankMin":     1.0,
		"rankMax":     10.0,
		"price":       0,
		"maxUsers":    4,
		"type":        "invalid_type",
		"courtId":     "9603f0b7-7729-410f-92bf-04de55527a8f",
	}

	body, _ := json.Marshal(invalidEvent)
	
	req, err := http.NewRequest("POST", baseURL+"/events", bytes.NewBuffer(body))
	if err != nil {
		t.Fatal(err)
	}
	
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-API-Token", userToken)
	
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()
	
	// Ожидаем ошибку
	if resp.StatusCode == http.StatusCreated {
		t.Error("Invalid event type creation should fail, but got success")
	}
} 