package registrations_test

import (
	"testing"

	"github.com/shampsdev/go-telegram-template/pkg/domain"
	"github.com/shampsdev/go-telegram-template/tests/shared"
)

func TestTournamentRegistrationFlow(t *testing.T) {
	client := shared.NewClient()
	userToken, adminToken := shared.SkipIfNoTokens(t)

	t.Run("User can register for tournament", func(t *testing.T) {
		tournament := shared.CreateTestTournament(t, client, adminToken)
		defer shared.CleanupEvent(client, adminToken, tournament.ID)

		registration, err := client.CreateRegistration(userToken, tournament.ID)
		if err != nil {
			t.Fatalf("Failed to create registration: %v", err)
		}

		if registration.Status != domain.RegistrationStatusPending {
			t.Errorf("Expected status PENDING, got %s", registration.Status)
		}

		if registration.EventID != tournament.ID {
			t.Errorf("Expected eventId %s, got %s", tournament.ID, registration.EventID)
		}
	})

	t.Run("User can cancel registration before payment", func(t *testing.T) {
		tournament := shared.CreateTestTournament(t, client, adminToken)
		defer shared.CleanupEvent(client, adminToken, tournament.ID)

		_, err := client.CreateRegistration(userToken, tournament.ID)
		if err != nil {
			t.Fatalf("Failed to create registration: %v", err)
		}

		err = client.CancelRegistration(userToken, tournament.ID)
		if err != nil {
			t.Errorf("Failed to cancel registration: %v", err)
		}
	})

	t.Run("User cannot register twice for same tournament", func(t *testing.T) {
		tournament := shared.CreateTestTournament(t, client, adminToken)
		defer shared.CleanupEvent(client, adminToken, tournament.ID)

		_, err := client.CreateRegistration(userToken, tournament.ID)
		if err != nil {
			t.Fatalf("Failed to create first registration: %v", err)
		}

		_, err = client.CreateRegistration(userToken, tournament.ID)
		if err == nil {
			t.Error("Expected error when registering twice for same tournament")
		}
	})
} 