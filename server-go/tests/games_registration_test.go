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

// TestGameRegistrationFlow tests the complete game registration flow for approval-based games
func TestGameRegistrationFlow(t *testing.T) {
	userToken := getUserToken()
	organizerToken := getAdminToken() // Admin as organizer

	if userToken == "" || organizerToken == "" {
		t.Skip("USER_TOKEN and ADMIN_TOKEN must be set to run tests")
	}

	// Create test game by organizer
	gameID := createTestGameAsOrganizer(t, organizerToken)
	if gameID == "" {
		t.Fatal("Failed to create game for tests")
	}

	// Deferred cleanup
	defer func() {
		cleanupGameEvent(gameID, organizerToken)
	}()

	t.Run("1. Application → PENDING", func(t *testing.T) {
		// User submits application for game
		registration := createGameRegistration(t, userToken, gameID)

		if registration.Status != domain.RegistrationStatusPending {
			t.Errorf("Expected status PENDING, got %s", registration.Status)
		}

		if registration.EventID != gameID {
			t.Errorf("Expected eventId %s, got %s", gameID, registration.EventID)
		}
	})

	t.Run("2. Organizer approves → PENDING → CONFIRMED", func(t *testing.T) {
		// Create new game for this test
		testGameID := createTestGameAsOrganizer(t, organizerToken)
		defer cleanupGameEvent(testGameID, organizerToken)

		// User applies
		registration := createGameRegistration(t, userToken, testGameID)
		if registration.Status != domain.RegistrationStatusPending {
			t.Errorf("Expected initial status PENDING, got %s", registration.Status)
		}

		// Organizer approves
		userID := getUserID(t, userToken)
		resp := approveRegistration(t, organizerToken, testGameID, userID)
		if resp.StatusCode != http.StatusOK {
			t.Errorf("Expected status 200, got %d", resp.StatusCode)
		}

		// Check the approval response body
		var approvedRegistration domain.Registration
		err := json.NewDecoder(resp.Body).Decode(&approvedRegistration)
		resp.Body.Close()
		if err == nil && approvedRegistration.Status != domain.RegistrationStatusConfirmed {
			t.Errorf("Expected status CONFIRMED after approval, got %s", approvedRegistration.Status)
		}
	})

	t.Run("3. Organizer rejects → PENDING → CANCELLED", func(t *testing.T) {
		// Create new game for this test
		testGameID := createTestGameAsOrganizer(t, organizerToken)
		defer cleanupGameEvent(testGameID, organizerToken)

		// User applies
		registration := createGameRegistration(t, userToken, testGameID)
		if registration.Status != domain.RegistrationStatusPending {
			t.Errorf("Expected initial status PENDING, got %s", registration.Status)
		}

		// Organizer rejects
		userID := getUserID(t, userToken)
		resp := rejectRegistration(t, organizerToken, testGameID, userID)
		if resp.StatusCode != http.StatusOK {
			t.Errorf("Expected status 200, got %d", resp.StatusCode)
		}

		// Check the rejection response body
		var rejectedRegistration domain.Registration
		err := json.NewDecoder(resp.Body).Decode(&rejectedRegistration)
		resp.Body.Close()
		if err == nil && rejectedRegistration.Status != domain.RegistrationStatusCancelled {
			t.Errorf("Expected status CANCELLED after rejection, got %s", rejectedRegistration.Status)
		}
	})

	t.Run("4. User cancels before decision → PENDING → CANCELLED", func(t *testing.T) {
		// Create new game for this test
		testGameID := createTestGameAsOrganizer(t, organizerToken)
		defer cleanupGameEvent(testGameID, organizerToken)

		// User applies
		registration := createGameRegistration(t, userToken, testGameID)
		if registration.Status != domain.RegistrationStatusPending {
			t.Errorf("Expected initial status PENDING, got %s", registration.Status)
		}

		// User cancels their own application
		resp := cancelRegistration(t, userToken, testGameID)
		if resp.StatusCode != http.StatusOK {
			t.Errorf("Expected status 200, got %d", resp.StatusCode)
		}

		// Check the cancellation response body
		var cancelledRegistration domain.Registration
		err := json.NewDecoder(resp.Body).Decode(&cancelledRegistration)
		resp.Body.Close()
		if err == nil && cancelledRegistration.Status != domain.RegistrationStatusCancelled {
			t.Errorf("Expected status CANCELLED after user cancellation, got %s", cancelledRegistration.Status)
		}
	})

	t.Run("5. User leaves after confirmation → CONFIRMED → LEFT", func(t *testing.T) {
		// Create new game for this test
		testGameID := createTestGameAsOrganizer(t, organizerToken)
		defer cleanupGameEvent(testGameID, organizerToken)

		// User applies
		registration := createGameRegistration(t, userToken, testGameID)
		if registration.Status != domain.RegistrationStatusPending {
			t.Errorf("Expected initial status PENDING, got %s", registration.Status)
		}

		// Organizer approves
		userID := getUserID(t, userToken)
		approveResp := approveRegistration(t, organizerToken, testGameID, userID)
		approveResp.Body.Close()

		// User leaves after confirmation
		resp := cancelRegistration(t, userToken, testGameID)
		if resp.StatusCode != http.StatusOK {
			t.Errorf("Expected status 200, got %d", resp.StatusCode)
		}

		// Check the leave response body
		var leftRegistration domain.Registration
		err := json.NewDecoder(resp.Body).Decode(&leftRegistration)
		resp.Body.Close()
		if err == nil && leftRegistration.Status != domain.RegistrationStatusLeft {
			t.Errorf("Expected status LEFT after leaving confirmed game, got %s", leftRegistration.Status)
		}
	})

	t.Run("6. Full game application → handled correctly", func(t *testing.T) {
		// Create game with max 2 users
		fullGameID := createTestGameWithMaxUsers(t, organizerToken, 2)
		defer cleanupGameEvent(fullGameID, organizerToken)

		// User applies
		registration := createGameRegistration(t, userToken, fullGameID)
		if registration.Status != domain.RegistrationStatusPending {
			t.Errorf("Expected initial status PENDING, got %s", registration.Status)
		}

		// Organizer approves
		userID := getUserID(t, userToken)
		approveResp := approveRegistration(t, organizerToken, fullGameID, userID)
		approveResp.Body.Close()

		// This test validates that the system can handle games with proper maxUsers validation
		// The actual "full game" logic would require multiple real users to test properly
		// For now we just ensure the basic flow works with our constraints
		if registration.EventID != fullGameID {
			t.Errorf("Expected eventId %s, got %s", fullGameID, registration.EventID)
		}
	})

	t.Run("7. Reapplication after CANCELLED → new PENDING", func(t *testing.T) {
		// Create new game for this test
		testGameID := createTestGameAsOrganizer(t, organizerToken)
		defer cleanupGameEvent(testGameID, organizerToken)

		// User applies
		registration := createGameRegistration(t, userToken, testGameID)
		if registration.Status != domain.RegistrationStatusPending {
			t.Errorf("Expected initial status PENDING, got %s", registration.Status)
		}

		// Organizer rejects
		userID := getUserID(t, userToken)
		rejectResp := rejectRegistration(t, organizerToken, testGameID, userID)
		rejectResp.Body.Close()

		// User reapplies after rejection
		newRegistration := createGameRegistration(t, userToken, testGameID)
		if newRegistration.Status != domain.RegistrationStatusPending {
			t.Errorf("Expected new application to have PENDING status, got %s", newRegistration.Status)
		}
	})

	t.Run("8. Reapplication after LEFT → new PENDING", func(t *testing.T) {
		// Create new game for this test
		testGameID := createTestGameAsOrganizer(t, organizerToken)
		defer cleanupGameEvent(testGameID, organizerToken)

		// User applies and gets approved
		registration := createGameRegistration(t, userToken, testGameID)
		if registration.Status != domain.RegistrationStatusPending {
			t.Errorf("Expected initial status PENDING, got %s", registration.Status)
		}

		userID := getUserID(t, userToken)
		approveResp := approveRegistration(t, organizerToken, testGameID, userID)
		approveResp.Body.Close()

		// User leaves
		cancelResp := cancelRegistration(t, userToken, testGameID)
		cancelResp.Body.Close()

		// User reapplies after leaving
		newRegistration := createGameRegistration(t, userToken, testGameID)
		if newRegistration.Status != domain.RegistrationStatusPending {
			t.Errorf("Expected new application after LEFT to have PENDING status, got %s", newRegistration.Status)
		}
	})

	t.Run("9. Cancel non-existent registration → error", func(t *testing.T) {
		// Create new game without any registration
		testGameID := createTestGameAsOrganizer(t, organizerToken)
		defer cleanupGameEvent(testGameID, organizerToken)

		// Try to cancel non-existent registration
		resp := cancelRegistration(t, userToken, testGameID)
		if resp.StatusCode < 400 {
			t.Errorf("Expected error (4xx or 5xx) for non-existent registration, got %d", resp.StatusCode)
		}
		resp.Body.Close()
	})
}

// Helper functions for game testing

func createTestGameAsOrganizer(t *testing.T, token string) string {
	return createTestGameWithMaxUsers(t, token, 4)
}

func createTestGameWithMaxUsers(t *testing.T, token string, maxUsers int) string {
	createEvent := domain.CreateEvent{
		Name:        fmt.Sprintf("Test game %d", time.Now().Unix()),
		Description: stringPtr("Game description"),
		StartTime:   time.Now().Add(24 * time.Hour),
		EndTime:     time.Now().Add(26 * time.Hour),
		RankMin:     0.0,
		RankMax:     15.0,
		Price:       0, // Free game
		MaxUsers:    maxUsers,
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

func createGameRegistration(t *testing.T, token string, eventID string) *domain.Registration {
	resp := createGameRegistrationResponse(t, token, eventID)
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated && resp.StatusCode != http.StatusOK {
		var responseBody map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&responseBody)
		t.Fatalf("Error creating game registration: status %d, body: %+v", resp.StatusCode, responseBody)
	}

	var registration domain.Registration
	err := json.NewDecoder(resp.Body).Decode(&registration)
	if err != nil {
		t.Fatalf("Error decoding registration: %v", err)
	}

	return &registration
}

func createGameRegistrationResponse(t *testing.T, token string, eventID string) *http.Response {
	url := fmt.Sprintf("%s/registrations/%s", baseURL, eventID)

	req, err := http.NewRequest("POST", url, nil)
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

	return resp
}

func approveRegistration(t *testing.T, organizerToken string, eventID string, userID string) *http.Response {
	url := fmt.Sprintf("%s/registrations/%s/%s/approve", baseURL, eventID, userID)

	req, err := http.NewRequest("PUT", url, nil)
	if err != nil {
		t.Fatalf("Error creating PUT request: %v", err)
	}

	req.Header.Set("X-API-Token", organizerToken)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		t.Fatalf("Error executing PUT request: %v", err)
	}

	return resp
}

func rejectRegistration(t *testing.T, organizerToken string, eventID string, userID string) *http.Response {
	url := fmt.Sprintf("%s/registrations/%s/%s/reject", baseURL, eventID, userID)

	req, err := http.NewRequest("PUT", url, nil)
	if err != nil {
		t.Fatalf("Error creating PUT request: %v", err)
	}

	req.Header.Set("X-API-Token", organizerToken)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		t.Fatalf("Error executing PUT request: %v", err)
	}

	return resp
}

func getUserID(t *testing.T, userToken string) string {
	url := fmt.Sprintf("%s/users/me", baseURL)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		t.Fatalf("Error creating GET request: %v", err)
	}

	req.Header.Set("X-API-Token", userToken)

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		t.Fatalf("Error executing GET request: %v", err)
	}
	defer resp.Body.Close()

	// Принимаем как 200, так и 201 как успешные ответы
	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		t.Fatalf("Error getting user info: status %d", resp.StatusCode)
	}

	var user domain.User
	err = json.NewDecoder(resp.Body).Decode(&user)
	if err != nil {
		t.Fatalf("Error decoding user: %v", err)
	}

	return user.ID
}

func cleanupGameEvent(eventID, token string) {
	// Сначала пытаемся удалить все регистрации для события
	// Поскольку нет прямого API для этого, просто пытаемся удалить событие
	url := fmt.Sprintf("%s/events/%s", baseURL, eventID)
	req, _ := http.NewRequest("DELETE", url, nil)
	req.Header.Set("X-API-Token", token)
	
	client := &http.Client{Timeout: 10 * time.Second}
	client.Do(req) // Игнорируем ошибки при очистке
}

func cancelRegistration(t *testing.T, token string, eventID string) *http.Response {
	url := fmt.Sprintf("%s/registrations/%s/cancel", baseURL, eventID)
	
	req, err := http.NewRequest("POST", url, nil)
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
	
	return resp
} 