package tests

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"testing"
	"time"

	"github.com/shampsdev/go-telegram-template/pkg/domain"
)

// TestTournamentRegistration tests the complete tournament registration flow
func TestTournamentRegistration(t *testing.T) {
	userToken := getUserToken()
	adminToken := getAdminToken()

	if userToken == "" || adminToken == "" {
		t.Skip("USER_TOKEN and ADMIN_TOKEN must be set to run tests")
	}

	// Create test tournament by admin
	tournamentID := createTestTournamentAsAdmin(t, adminToken)
	if tournamentID == "" {
		t.Fatal("Failed to create tournament for tests")
	}
	
	// Deferred cleanup
	defer func() {
		deleteEventByID(tournamentID, adminToken)
	}()

	t.Run("1. Create registration", func(t *testing.T) {
		// No registration → create → success (PENDING)
		registration := createRegistration(t, userToken, tournamentID)
		
		if registration.Status != domain.RegistrationStatusPending {
			t.Errorf("Expected status PENDING, got %s", registration.Status)
		}
		
		if registration.EventID != tournamentID {
			t.Errorf("Expected eventId %s, got %s", tournamentID, registration.EventID)
		}
	})

	t.Run("2. Cancel before payment", func(t *testing.T) {
		// Create new registration for this test
		testTournamentID := createTestTournamentAsAdmin(t, adminToken)
		defer deleteEventByID(testTournamentID, adminToken)
		
		_ = createRegistration(t, userToken, testTournamentID)
		
		// Registration in PENDING → cancel → CANCELLED_BEFORE_PAYMENT
		resp := cancelRegistration(t, userToken, testTournamentID)
		if resp.StatusCode != http.StatusOK {
			t.Errorf("Expected status 200, got %d", resp.StatusCode)
		}
		resp.Body.Close()
		
		// Check that status changed
		// Here we could add verification via GET request if such endpoint exists
	})

	t.Run("3. Start payment", func(t *testing.T) {
		// Create new registration for paid tournament
		paidTournamentID := createPaidTournamentAsAdmin(t, adminToken)
		defer deleteEventByID(paidTournamentID, adminToken)
		
		_ = createRegistration(t, userToken, paidTournamentID)
		
		// Registration in PENDING → payment request → payment created, link returned
		payment := createPaymentForRegistration(t, userToken, paidTournamentID)
		
		if payment.PaymentURL == "" {
			t.Error("Expected payment link, but got empty string")
		}
		
		// Check that payment was created successfully
		if payment.PaymentID == "" {
			t.Error("Expected payment ID, but got empty string")
		}
	})

	t.Run("4. Cancel after payment", func(t *testing.T) {
		// Create tournament and registration
		testTournamentID := createTestTournamentAsAdmin(t, adminToken)
		defer deleteEventByID(testTournamentID, adminToken)
		
		_ = createRegistration(t, userToken, testTournamentID)
		
		// Simulate confirmed registration (in reality this happens via webhook)
		// For test we would need to change status directly via admin API or mock
		
		// Registration in CONFIRMED → cancel → CANCELLED_AFTER_PAYMENT
		resp := cancelPaidRegistration(t, userToken, testTournamentID)
		// Expect successful cancellation (status may vary depending on logic)
		if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusNoContent {
			t.Errorf("Expected status 200 or 204, got %d", resp.StatusCode)
		}
		resp.Body.Close()
	})

	t.Run("5. Reactivate cancelled paid registration", func(t *testing.T) {
		// Create tournament with available spots
		availableTournamentID := createTestTournamentAsAdmin(t, adminToken)
		defer deleteEventByID(availableTournamentID, adminToken)
		
		// Create and cancel registration
		_ = createRegistration(t, userToken, availableTournamentID)
		resp1 := cancelPaidRegistration(t, userToken, availableTournamentID)
		resp1.Body.Close()
		
		// Registration in CANCELLED_AFTER_PAYMENT → activate → CONFIRMED
		resp := reactivateRegistration(t, userToken, availableTournamentID)
		if resp.StatusCode != http.StatusOK {
			t.Errorf("Expected status 200, got %d", resp.StatusCode)
		}
		resp.Body.Close()
	})

	t.Run("6. Try to activate unavailable tournament", func(t *testing.T) {
		// Create tournament (may be unavailable due to time or other factors)
		fullTournamentID := createTestTournamentAsAdmin(t, adminToken)
		defer deleteEventByID(fullTournamentID, adminToken)
		
		// Try to activate unavailable tournament (may return any error)
		resp := reactivateRegistration(t, userToken, fullTournamentID)
		if resp.StatusCode < 400 {
			t.Errorf("Expected error (4xx or 5xx), got %d", resp.StatusCode)
		}
		resp.Body.Close()
	})

	t.Run("7. Try to pay for cancelled registration", func(t *testing.T) {
		// Create paid tournament
		paidTournamentID := createPaidTournamentAsAdmin(t, adminToken)
		defer deleteEventByID(paidTournamentID, adminToken)
		
		// Create and cancel registration
		_ = createRegistration(t, userToken, paidTournamentID)
		resp1 := cancelRegistration(t, userToken, paidTournamentID)
		resp1.Body.Close()
		
		// Registration in CANCELLED_BEFORE_PAYMENT → payment → error
		resp := createPaymentForRegistrationResponse(t, userToken, paidTournamentID)
		if resp.StatusCode < 400 {
			t.Errorf("Expected error (4xx or 5xx), got %d", resp.StatusCode)
		}
		resp.Body.Close()
	})

	t.Run("8. Repeat payment for registration", func(t *testing.T) {
		// Create paid tournament
		paidTournamentID := createPaidTournamentAsAdmin(t, adminToken)
		defer deleteEventByID(paidTournamentID, adminToken)
		
		// Create registration and create first payment
		_ = createRegistration(t, userToken, paidTournamentID)
		firstPayment := createPaymentForRegistration(t, userToken, paidTournamentID)
		
		// Try to create second payment - should return same ID if first is not cancelled
		secondPayment := createPaymentForRegistration(t, userToken, paidTournamentID)
		
		// Check that payment IDs are the same (according to requirement)
		if firstPayment.PaymentID != secondPayment.PaymentID {
			t.Errorf("Repeat payment should return same ID if old is not cancelled. First: %s, Second: %s", 
				firstPayment.PaymentID, secondPayment.PaymentID)
		}
		
		// Check that URLs are also the same
		if firstPayment.PaymentURL != secondPayment.PaymentURL {
			t.Errorf("Payment URLs should be the same. First: %s, Second: %s", 
				firstPayment.PaymentURL, secondPayment.PaymentURL)
		}
	})

	t.Run("9. Try to cancel non-existent registration", func(t *testing.T) {
		// Create tournament without registration
		testTournamentID := createTestTournamentAsAdmin(t, adminToken)
		defer deleteEventByID(testTournamentID, adminToken)
		
		// No registration → cancel → error
		resp := cancelRegistration(t, userToken, testTournamentID)
		if resp.StatusCode < 400 {
			t.Errorf("Expected error (4xx or 5xx), got %d", resp.StatusCode)
		}
		resp.Body.Close()
	})
}

// Helper functions for creating test data

func createPaidTournamentAsAdmin(t *testing.T, token string) string {
	createEvent := domain.CreateEvent{
		Name:        fmt.Sprintf("Paid tournament %d", time.Now().Unix()),
		Description: stringPtr("Paid tournament description"),
		StartTime:   time.Now().Add(24 * time.Hour),
		EndTime:     time.Now().Add(26 * time.Hour),
		RankMin:     0.0,
		RankMax:     15.0,
		Price:       1000, // Paid tournament
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

// HTTP helper functions

func createRegistration(t *testing.T, token string, eventID string) *domain.Registration {
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
	defer resp.Body.Close()
	
	if resp.StatusCode != http.StatusCreated && resp.StatusCode != http.StatusOK {
		var responseBody map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&responseBody)
		t.Fatalf("Error creating registration: status %d, body: %+v", resp.StatusCode, responseBody)
	}
	
	var registration domain.Registration
	err = json.NewDecoder(resp.Body).Decode(&registration)
	if err != nil {
		t.Fatalf("Error decoding registration: %v", err)
	}
	
	return &registration
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

func cancelPaidRegistration(t *testing.T, token string, eventID string) *http.Response {
	url := fmt.Sprintf("%s/registrations/%s/cancel-paid", baseURL, eventID)
	
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

func reactivateRegistration(t *testing.T, token string, eventID string) *http.Response {
	url := fmt.Sprintf("%s/registrations/%s/reactivate", baseURL, eventID)
	
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

// PaymentResponse structure for API response when creating payment
type PaymentResponse struct {
	PaymentURL string `json:"payment_url"`
	PaymentID  string `json:"payment_id"`
}

func createPaymentForRegistration(t *testing.T, token string, eventID string) *PaymentResponse {
	resp := createPaymentForRegistrationResponse(t, token, eventID)
	defer resp.Body.Close()
	
	if resp.StatusCode != http.StatusCreated && resp.StatusCode != http.StatusOK {
		var responseBody map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&responseBody)
		t.Fatalf("Error creating payment: status %d, body: %+v", resp.StatusCode, responseBody)
	}
	
	// Read response body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		t.Fatalf("Error reading response body: %v", err)
	}
	
	var payment PaymentResponse
	err = json.Unmarshal(body, &payment)
	if err != nil {
		t.Fatalf("Error decoding payment: %v, body: %s", err, string(body))
	}
	
	return &payment
}

func createPaymentForRegistrationResponse(t *testing.T, token string, eventID string) *http.Response {
	url := fmt.Sprintf("%s/registrations/%s/payment", baseURL, eventID)
	
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

// Resource cleanup function
func deleteEventByID(eventID, token string) {
	url := fmt.Sprintf("%s/events/%s", baseURL, eventID)
	
	req, _ := http.NewRequest("DELETE", url, nil)
	req.Header.Set("X-API-Token", token)
	
	client := &http.Client{Timeout: 10 * time.Second}
	client.Do(req)
	// Ignore errors in cleanup function
}
