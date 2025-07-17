package tests

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"testing"
	"time"

	"github.com/shampsdev/go-telegram-template/pkg/domain"
)

// TestCreateGameAsUser тестирует создание игры обычным пользователем (должна создаться)
func TestCreateGameAsUser(t *testing.T) {
	userToken := getUserToken()
	if userToken == "" {
		t.Skip("USER_TOKEN not provided")
	}

	createEvent := domain.CreateEvent{
		Name:        "Тестовая игра пользователя",
		Description: stringPtr("Описание игры от пользователя"),
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
		// Выводим тело ответа для отладки
		var responseBody map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&responseBody)
		t.Logf("Response body: %+v", responseBody)
		return
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

// TestCreateGameAsAdmin тестирует создание игры администратором (должна создаться)
func TestCreateGameAsAdmin(t *testing.T) {
	adminToken := getAdminToken()
	if adminToken == "" {
		t.Skip("ADMIN_TOKEN not provided")
	}

	createEvent := domain.CreateEvent{
		Name:        "Тестовая игра админа",
		Description: stringPtr("Описание игры от админа"),
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
	req.Header.Set("X-API-Token", adminToken)
	
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()
	
	if resp.StatusCode != http.StatusCreated {
		t.Errorf("Expected status %d, got %d", http.StatusCreated, resp.StatusCode)
		// Выводим тело ответа для отладки
		var responseBody map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&responseBody)
		t.Logf("Response body: %+v", responseBody)
		return
	}
	
	var createdEvent domain.Event
	if err := json.NewDecoder(resp.Body).Decode(&createdEvent); err != nil {
		t.Fatal(err)
	}
	
	if createdEvent.Type != domain.EventTypeGame {
		t.Errorf("Expected event type %s, got %s", domain.EventTypeGame, createdEvent.Type)
	}
}

// TestUpdateOwnGameAsUser тестирует изменение СВОЕЙ игры пользователем (должна измениться)
func TestUpdateOwnGameAsUser(t *testing.T) {
	userToken := getUserToken()
	if userToken == "" {
		t.Skip("USER_TOKEN not provided")
	}

	// Сначала создаем игру
	gameID := createTestGameAsUser(t, userToken)
	if gameID == "" {
		t.Fatal("Failed to create test game")
	}

	// Теперь изменяем свою игру
	patchEvent := domain.PatchEvent{
		Name:        stringPtr("Обновленная игра пользователя"),
		Description: stringPtr("Обновленное описание"),
		Price:       intPtr(100),
		MaxUsers:    intPtr(6),
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
		// Выводим тело ответа для отладки
		var responseBody map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&responseBody)
		t.Logf("Response body: %+v", responseBody)
		return
	}
	
	var updatedEvent domain.Event
	if err := json.NewDecoder(resp.Body).Decode(&updatedEvent); err != nil {
		t.Fatal(err)
	}
	
	if *patchEvent.Name != updatedEvent.Name {
		t.Errorf("Expected name %s, got %s", *patchEvent.Name, updatedEvent.Name)
	}
}

// TestUpdateAdminGameAsUser тестирует изменение ЧУЖОЙ игры (админа) пользователем (должна быть ошибка)
func TestUpdateAdminGameAsUser(t *testing.T) {
	adminToken := getAdminToken()
	userToken := getUserToken()
	
	if adminToken == "" || userToken == "" {
		t.Skip("ADMIN_TOKEN and USER_TOKEN required")
	}

	// Админ создает игру
	gameID := createTestGameAsAdmin(t, adminToken)
	if gameID == "" {
		t.Fatal("Failed to create admin game")
	}

	// Пользователь пытается изменить игру админа
	patchEvent := domain.PatchEvent{
		Name: stringPtr("Попытка хакнуть игру админа"),
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
	
	// Ожидаем ошибку доступа (403 Forbidden)
	if resp.StatusCode != http.StatusForbidden {
		t.Errorf("Expected status %d (Forbidden), got %d", http.StatusForbidden, resp.StatusCode)
		// Выводим тело ответа для отладки
		var responseBody map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&responseBody)
		t.Logf("Response body: %+v", responseBody)
	}
}

// TestUpdateUserGameAsAdmin тестирует изменение ЧУЖОЙ игры (пользователя) админом (должна измениться)
func TestUpdateUserGameAsAdmin(t *testing.T) {
	adminToken := getAdminToken()
	userToken := getUserToken()
	
	if adminToken == "" || userToken == "" {
		t.Skip("ADMIN_TOKEN and USER_TOKEN required")
	}

	// Пользователь создает игру
	gameID := createTestGameAsUser(t, userToken)
	if gameID == "" {
		t.Fatal("Failed to create user game")
	}

	// Админ изменяет игру пользователя
	patchEvent := domain.PatchEvent{
		Name:        stringPtr("Игра изменена админом"),
		Description: stringPtr("Админ может изменять любые события"),
		Price:       intPtr(200),
	}

	body, _ := json.Marshal(patchEvent)
	
	req, err := http.NewRequest("PATCH", baseURL+"/events/"+gameID, bytes.NewBuffer(body))
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
	
	if resp.StatusCode != http.StatusOK {
		t.Errorf("Expected status %d, got %d", http.StatusOK, resp.StatusCode)
		// Выводим тело ответа для отладки
		var responseBody map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&responseBody)
		t.Logf("Response body: %+v", responseBody)
		return
	}
	
	var updatedEvent domain.Event
	if err := json.NewDecoder(resp.Body).Decode(&updatedEvent); err != nil {
		t.Fatal(err)
	}
	
	if *patchEvent.Name != updatedEvent.Name {
		t.Errorf("Expected name %s, got %s", *patchEvent.Name, updatedEvent.Name)
	}
}

// TestCreateTournamentAsUserPermissions тестирует создание турнира пользователем (должна быть ошибка)
func TestCreateTournamentAsUserPermissions(t *testing.T) {
	userToken := getUserToken()
	if userToken == "" {
		t.Skip("USER_TOKEN not provided")
	}

	createEvent := domain.CreateEvent{
		Name:        "Попытка создать турнир пользователем",
		Description: stringPtr("Это должно завершиться ошибкой"),
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
		// Выводим тело ответа для отладки
		var responseBody map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&responseBody)
		t.Logf("Response body: %+v", responseBody)
	}
}

// TestCreateTournamentAsAdminPermissions тестирует создание турнира админом (должен создаться)
func TestCreateTournamentAsAdminPermissions(t *testing.T) {
	adminToken := getAdminToken()
	if adminToken == "" {
		t.Skip("ADMIN_TOKEN not provided")
	}

	createEvent := domain.CreateEvent{
		Name:        "Турнир от админа",
		Description: stringPtr("Админ может создавать турниры"),
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
		// Выводим тело ответа для отладки
		var responseBody map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&responseBody)
		t.Logf("Response body: %+v", responseBody)
		return
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

// TestUpdateTournamentAsAdminPermissions тестирует изменение турнира админом (должен измениться)
func TestUpdateTournamentAsAdminPermissions(t *testing.T) {
	adminToken := getAdminToken()
	if adminToken == "" {
		t.Skip("ADMIN_TOKEN not provided")
	}

	// Сначала создаем турнир
	tournamentID := createTestTournamentAsAdmin(t, adminToken)
	if tournamentID == "" {
		t.Fatal("Failed to create test tournament")
	}

	// Теперь изменяем турнир
	patchEvent := domain.PatchEvent{
		Name:        stringPtr("Обновленный турнир"),
		Description: stringPtr("Обновленное описание турнира"),
		Price:       intPtr(2000),
		MaxUsers:    intPtr(64),
	}

	body, _ := json.Marshal(patchEvent)
	
	req, err := http.NewRequest("PATCH", baseURL+"/events/"+tournamentID, bytes.NewBuffer(body))
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
	
	if resp.StatusCode != http.StatusOK {
		t.Errorf("Expected status %d, got %d", http.StatusOK, resp.StatusCode)
		// Выводим тело ответа для отладки
		var responseBody map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&responseBody)
		t.Logf("Response body: %+v", responseBody)
		return
	}
	
	var updatedEvent domain.Event
	if err := json.NewDecoder(resp.Body).Decode(&updatedEvent); err != nil {
		t.Fatal(err)
	}
	
	if *patchEvent.Name != updatedEvent.Name {
		t.Errorf("Expected name %s, got %s", *patchEvent.Name, updatedEvent.Name)
	}
}

// TestUpdateTournamentAsUser тестирует изменение турнира пользователем (должна быть ошибка)
func TestUpdateTournamentAsUser(t *testing.T) {
	adminToken := getAdminToken()
	userToken := getUserToken()
	
	if adminToken == "" || userToken == "" {
		t.Skip("ADMIN_TOKEN and USER_TOKEN required")
	}

	// Админ создает турнир
	tournamentID := createTestTournamentAsAdmin(t, adminToken)
	if tournamentID == "" {
		t.Fatal("Failed to create test tournament")
	}

	// Пользователь пытается изменить турнир админа
	patchEvent := domain.PatchEvent{
		Name: stringPtr("Попытка хакнуть турнир"),
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
	
	// Ожидаем ошибку доступа (403 Forbidden)
	if resp.StatusCode != http.StatusForbidden {
		t.Errorf("Expected status %d (Forbidden), got %d", http.StatusForbidden, resp.StatusCode)
		// Выводим тело ответа для отладки
		var responseBody map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&responseBody)
		t.Logf("Response body: %+v", responseBody)
	}
}

// TestCreateTrainingPermissions тестирует создание тренировки (должна быть ошибка)
func TestCreateTrainingPermissions(t *testing.T) {
	userToken := getUserToken()
	if userToken == "" {
		t.Skip("USER_TOKEN not provided")
	}

	createEvent := domain.CreateEvent{
		Name:        "Попытка создать тренировку",
		Description: stringPtr("Тренировки запрещены"),
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
	
	// Ожидаем ошибку (тренировки запрещены)
	if resp.StatusCode == http.StatusCreated {
		t.Error("Training creation should fail, but got success")
	}
	
	// Проверяем, что это именно ошибка из-за типа тренировки
	if resp.StatusCode != http.StatusInternalServerError && resp.StatusCode != http.StatusBadRequest {
		t.Errorf("Expected status %d or %d, got %d", http.StatusInternalServerError, http.StatusBadRequest, resp.StatusCode)
	}
}

// Вспомогательные функции для создания тестовых событий

func createTestGameAsUser(t *testing.T, token string) string {
	createEvent := domain.CreateEvent{
		Name:        fmt.Sprintf("Тестовая игра пользователя %d", time.Now().Unix()),
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

func createTestGameAsAdmin(t *testing.T, token string) string {
	createEvent := domain.CreateEvent{
		Name:        fmt.Sprintf("Тестовая игра админа %d", time.Now().Unix()),
		Description: stringPtr("Описание игры от админа"),
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

func createTestTournamentAsAdmin(t *testing.T, token string) string {
	createEvent := domain.CreateEvent{
		Name:        fmt.Sprintf("Тестовый турнир %d", time.Now().Unix()),
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