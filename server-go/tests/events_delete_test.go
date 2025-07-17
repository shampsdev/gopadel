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


func TestEventDeletion(t *testing.T) {
	// Загружаем токены из переменных окружения
	userToken := getUserToken()
	adminToken := getAdminToken()

	t.Logf("User token: %s", userToken)
	t.Logf("Admin token: %s", adminToken)

	if userToken == "" || adminToken == "" {
		t.Skip("USER_TOKEN and ADMIN_TOKEN must be set to run tests")
	}

	t.Run("1. User deletes admin tournament -> error", func(t *testing.T) {
		// Admin creates tournament
		tournamentEvent := createTestEvent(domain.EventTypeTournament)
		createdEvent := createEventWithToken(t, adminToken, tournamentEvent)
		defer deleteEvent(createdEvent.ID, adminToken) // Cleanup if test fails

		// User tries to delete admin tournament
		resp := deleteEventWithToken(t, userToken, createdEvent.ID)
		if resp.StatusCode != http.StatusForbidden {
			t.Errorf("Expected status 403, got %d. User should not have permission to delete admin tournaments", resp.StatusCode)
		}

		// Cleanup - admin deletes tournament
		deleteResp := deleteEventWithToken(t, adminToken, createdEvent.ID)
		if deleteResp.StatusCode != http.StatusNoContent {
			t.Errorf("Cleanup error: expected status 204, got %d", deleteResp.StatusCode)
		}
	})

	t.Run("2. Admin deletes own tournament -> success", func(t *testing.T) {
		// Admin creates tournament
		tournamentEvent := createTestEvent(domain.EventTypeTournament)
		createdEvent := createEventWithToken(t, adminToken, tournamentEvent)

		// Admin deletes own tournament
		resp := deleteEventWithToken(t, adminToken, createdEvent.ID)
		if resp.StatusCode != http.StatusNoContent {
			t.Errorf("Expected status 204, got %d. Admin should have permission to delete own tournaments", resp.StatusCode)
		}
	})

	t.Run("3. User deletes foreign game -> error", func(t *testing.T) {
		// Admin creates game
		gameEvent := createTestEvent(domain.EventTypeGame)
		createdEvent := createEventWithToken(t, adminToken, gameEvent)
		defer deleteEvent(createdEvent.ID, adminToken) // Cleanup if test fails

		// User tries to delete foreign game
		resp := deleteEventWithToken(t, userToken, createdEvent.ID)
		if resp.StatusCode != http.StatusForbidden {
			t.Errorf("Expected status 403, got %d. User should not have permission to delete foreign games", resp.StatusCode)
		}

		// Cleanup - admin deletes game
		deleteResp := deleteEventWithToken(t, adminToken, createdEvent.ID)
		if deleteResp.StatusCode != http.StatusNoContent {
			t.Errorf("Cleanup error: expected status 204, got %d", deleteResp.StatusCode)
		}
	})

	t.Run("4. User deletes own game -> success", func(t *testing.T) {
		// User creates game
		gameEvent := createTestEvent(domain.EventTypeGame)
		createdEvent := createEventWithToken(t, userToken, gameEvent)

		// User deletes own game
		resp := deleteEventWithToken(t, userToken, createdEvent.ID)
		if resp.StatusCode != http.StatusNoContent {
			t.Errorf("Expected status 204, got %d. User should have permission to delete own games", resp.StatusCode)
		}
	})

	t.Run("5. Admin deletes own game -> success", func(t *testing.T) {
		// Admin creates game
		gameEvent := createTestEvent(domain.EventTypeGame)
		createdEvent := createEventWithToken(t, adminToken, gameEvent)

		// Admin deletes own game
		resp := deleteEventWithToken(t, adminToken, createdEvent.ID)
		if resp.StatusCode != http.StatusNoContent {
			t.Errorf("Expected status 204, got %d. Admin should have permission to delete own games", resp.StatusCode)
		}
	})

	t.Run("6. Admin deletes foreign game -> success", func(t *testing.T) {
		// User creates game
		gameEvent := createTestEvent(domain.EventTypeGame)
		createdEvent := createEventWithToken(t, userToken, gameEvent)

		// Admin deletes foreign game
		resp := deleteEventWithToken(t, adminToken, createdEvent.ID)
		if resp.StatusCode != http.StatusNoContent {
			t.Errorf("Expected status 204, got %d. Admin should have permission to delete any games", resp.StatusCode)
		}
	})
}

// createTestEvent creates base event for testing
func createTestEvent(eventType domain.EventType) domain.CreateEvent {
	return domain.CreateEvent{
		Name:        fmt.Sprintf("Test event - %s", eventType),
		Description: stringPtr("Test event description"),
		StartTime:   time.Now().Add(24 * time.Hour),
		EndTime:     time.Now().Add(26 * time.Hour),
		RankMin:     0.0,  // Изменяем на 0 чтобы подходить всем пользователям
		RankMax:     15.0, // Увеличиваем максимум
		Price:       0,
		MaxUsers:    4,
		Type:        eventType,
		CourtID:     "9603f0b7-7729-410f-92bf-04de55527a8f",
		ClubID:      stringPtr("global"),
	}
}

// createEventWithToken creates event with specified token
func createEventWithToken(t *testing.T, token string, event domain.CreateEvent) *domain.Event {
	jsonData, err := json.Marshal(event)
	if err != nil {
		t.Fatalf("Error serializing event: %v", err)
	}

	url := fmt.Sprintf("%s/events", baseURL)
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		t.Fatalf("Error creating POST request: %v", err)
	}

	req.Header.Set("X-API-Token", token)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		t.Fatalf("Error executing POST request: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated {
		// Читаем тело ответа для отладки
		var responseBody map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&responseBody)
		t.Fatalf("Error creating event: status %d, body: %+v", resp.StatusCode, responseBody)
	}

	var createdEvent domain.Event
	err = json.NewDecoder(resp.Body).Decode(&createdEvent)
	if err != nil {
		t.Fatalf("Error decoding created event: %v", err)
	}

	return &createdEvent
}

// deleteEventWithToken sends DELETE request to delete event
func deleteEventWithToken(t *testing.T, token string, eventID string) *http.Response {
	url := fmt.Sprintf("%s/events/%s", baseURL, eventID)
	
	req, err := http.NewRequest("DELETE", url, nil)
	if err != nil {
		t.Fatalf("Error creating DELETE request: %v", err)
	}

	req.Header.Set("X-API-Token", token)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		t.Fatalf("Error executing DELETE request: %v", err)
	}

	return resp
}

// deleteEvent - helper function for resource cleanup
func deleteEvent(eventID string, token string) {
	url := fmt.Sprintf("%s/events/%s", baseURL, eventID)
	req, _ := http.NewRequest("DELETE", url, nil)
	req.Header.Set("X-API-Token", token)
	
	client := &http.Client{Timeout: 10 * time.Second}
	client.Do(req) // Ignore errors in cleanup
} 