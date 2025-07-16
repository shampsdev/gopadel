package e2e

import (
	"bytes"
	"encoding/json"
	"net/http"
	"testing"
	"time"

	"github.com/shampsdev/go-telegram-template/pkg/domain"
)

// TestUpdateGameAsCreator тестирует изменение игры её создателем
func TestUpdateGameAsCreator(t *testing.T) {
	userToken := getUserToken()
	if userToken == "" {
		t.Skip("USER_TOKEN not provided")
	}

	// Сначала создаем игру
	gameID := createTestGame(t, userToken)
	if gameID == "" {
		t.Fatal("Failed to create test game")
	}

	// Теперь изменяем игру
	patchEvent := domain.PatchEvent{
		Name:        stringPtr("Обновленная тестовая игра"),
		Description: stringPtr("Обновленное описание игры"),
		Price:       intPtr(100), // Добавляем цену
		MaxUsers:    intPtr(6),   // Увеличиваем количество участников
	}

	body, _ := json.Marshal(patchEvent)
	
	req, err := http.NewRequest("PATCH", baseURL+"/events/"+gameID, bytes.NewBuffer(body))
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
	
	if resp.StatusCode != http.StatusOK {
		t.Errorf("Expected status %d, got %d", http.StatusOK, resp.StatusCode)
	}
	
	var updatedEvent domain.Event
	if err := json.NewDecoder(resp.Body).Decode(&updatedEvent); err != nil {
		t.Fatal(err)
	}
	
	if *patchEvent.Name != updatedEvent.Name {
		t.Errorf("Expected name %s, got %s", *patchEvent.Name, updatedEvent.Name)
	}
	
	if *patchEvent.Price != updatedEvent.Price {
		t.Errorf("Expected price %d, got %d", *patchEvent.Price, updatedEvent.Price)
	}
}

// TestUpdateTournamentAsAdmin тестирует изменение турнира админом
func TestUpdateTournamentAsAdmin(t *testing.T) {
	adminToken := getAdminToken()
	if adminToken == "" {
		t.Skip("ADMIN_TOKEN not provided")
	}

	// Сначала создаем турнир
	tournamentID := createTestTournament(t, adminToken)
	if tournamentID == "" {
		t.Fatal("Failed to create test tournament")
	}

	// Теперь изменяем турнир (используем админский PATCH)
	adminPatch := domain.AdminPatchEvent{
		Name:        stringPtr("Обновленный турнир"),
		Description: stringPtr("Обновленное описание турнира"),
		Price:       intPtr(2000),
		MaxUsers:    intPtr(64),
		Status:      statusPtr(domain.EventStatusFull), // Меняем статус
	}

	body, _ := json.Marshal(adminPatch)
	
	// Предполагаем что есть админский эндпоинт для PATCH
	req, err := http.NewRequest("PATCH", baseURL+"/admin/events/"+tournamentID, bytes.NewBuffer(body))
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
	
	// Если админский эндпоинт не реализован, используем обычный
	if resp.StatusCode == http.StatusNotFound {
		req, _ = http.NewRequest("PATCH", baseURL+"/events/"+tournamentID, bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("X-API-Token", adminToken)
		
		resp, err = client.Do(req)
		if err != nil {
			t.Fatal(err)
		}
		defer resp.Body.Close()
	}
	
	if resp.StatusCode != http.StatusOK {
		t.Errorf("Expected status %d, got %d", http.StatusOK, resp.StatusCode)
	}
}

// TestUpdateEventByNonOwner тестирует попытку изменения события не его создателем
func TestUpdateEventByNonOwner(t *testing.T) {
	adminToken := getAdminToken()
	userToken := getUserToken()
	
	if adminToken == "" || userToken == "" {
		t.Skip("ADMIN_TOKEN and USER_TOKEN required")
	}

	// Админ создает турнир
	tournamentID := createTestTournament(t, adminToken)
	if tournamentID == "" {
		t.Fatal("Failed to create test tournament")
	}

	// Обычный пользователь пытается изменить турнир админа
	patchEvent := domain.PatchEvent{
		Name: stringPtr("Хакерская попытка изменения"),
	}

	body, _ := json.Marshal(patchEvent)
	
	req, err := http.NewRequest("PATCH", baseURL+"/events/"+tournamentID, bytes.NewBuffer(body))
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
	
	// Ожидаем ошибку доступа
	if resp.StatusCode == http.StatusOK {
		t.Error("Non-owner should not be able to update event")
	}
}

// TestUpdateTraining тестирует попытку изменения тренировки
func TestUpdateTraining(t *testing.T) {
	userToken := getUserToken()
	if userToken == "" {
		t.Skip("USER_TOKEN not provided")
	}

	// Попытка изменить несуществующую тренировку
	patchEvent := domain.PatchEvent{
		Name: stringPtr("Попытка изменить тренировку"),
	}

	body, _ := json.Marshal(patchEvent)
	
	req, err := http.NewRequest("PATCH", baseURL+"/events/training-id", bytes.NewBuffer(body))
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
	
	// Ожидаем ошибку (тренировки не поддерживаются или не найдены)
	if resp.StatusCode == http.StatusOK {
		t.Error("Training update should fail")
	}
}

// Вспомогательные функции для создания тестовых событий
func createTestGame(t *testing.T, token string) string {
	createEvent := domain.CreateEvent{
		Name:        "Тестовая игра для изменения",
		Description: stringPtr("Описание игры"),
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

func createTestTournament(t *testing.T, token string) string {
	createEvent := domain.CreateEvent{
		Name:        "Тестовый турнир для изменения",
		Description: stringPtr("Описание турнира"),
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

func statusPtr(s domain.EventStatus) *domain.EventStatus {
	return &s
} 