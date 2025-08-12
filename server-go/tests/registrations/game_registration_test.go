package registrations_test

import (
	"testing"

	"github.com/shampsdev/go-telegram-template/pkg/domain"
	"github.com/shampsdev/go-telegram-template/tests/shared"
)

func TestGameRegistrationFlow(t *testing.T) {
	client := shared.NewClient()
	userToken, adminToken := shared.SkipIfNoTokens(t)

	t.Run("User can apply for game", func(t *testing.T) {
		game := shared.CreateTestGame(t, client, adminToken)
		defer shared.CleanupEvent(client, adminToken, game.ID)

		registration, err := client.CreateRegistration(userToken, game.ID)
		if err != nil {
			t.Fatalf("Failed to create registration: %v", err)
		}

		if registration.Status != domain.RegistrationStatusPending {
			t.Errorf("Expected status PENDING, got %s", registration.Status)
		}

		if registration.EventID != game.ID {
			t.Errorf("Expected eventId %s, got %s", game.ID, registration.EventID)
		}
	})

	t.Run("Admin can approve game registration", func(t *testing.T) {
		game := shared.CreateTestGame(t, client, adminToken)
		defer shared.CleanupEvent(client, adminToken, game.ID)

		_, err := client.CreateRegistration(userToken, game.ID)
		if err != nil {
			t.Fatalf("Failed to create registration: %v", err)
		}

		user, err := client.GetUserMe(userToken)
		if err != nil {
			t.Fatalf("Failed to get user: %v", err)
		}

		err = client.ApproveRegistration(adminToken, game.ID, user.ID)
		if err != nil {
			t.Errorf("Failed to approve registration: %v", err)
		}
	})

	t.Run("User can cancel pending registration", func(t *testing.T) {
		game := shared.CreateTestGame(t, client, adminToken)
		defer shared.CleanupEvent(client, adminToken, game.ID)

		_, err := client.CreateRegistration(userToken, game.ID)
		if err != nil {
			t.Fatalf("Failed to create registration: %v", err)
		}

		err = client.CancelRegistration(userToken, game.ID)
		if err != nil {
			t.Errorf("Failed to cancel registration: %v", err)
		}
	})
} 