package events_test

import (
	"testing"

	"github.com/shampsdev/go-telegram-template/tests/shared"
)

func TestEventDeletion(t *testing.T) {
	client := shared.NewClient()
	userToken, adminToken := shared.SkipIfNoTokens(t)

	t.Run("User cannot delete admin tournament", func(t *testing.T) {
		tournament := shared.CreateTestTournament(t, client, adminToken)
		defer shared.CleanupEvent(client, adminToken, tournament.ID)

		err := client.DeleteEvent(userToken, tournament.ID)
		if err == nil {
			t.Error("Expected error when user tries to delete admin tournament")
		}
	})

	t.Run("Admin can delete own tournament", func(t *testing.T) {
		tournament := shared.CreateTestTournament(t, client, adminToken)

		err := client.DeleteEvent(adminToken, tournament.ID)
		if err != nil {
			t.Errorf("Admin should be able to delete own tournament: %v", err)
		}
	})

	t.Run("User cannot delete admin game", func(t *testing.T) {
		game := shared.CreateTestGame(t, client, adminToken)
		defer shared.CleanupEvent(client, adminToken, game.ID)

		err := client.DeleteEvent(userToken, game.ID)
		if err == nil {
			t.Error("Expected error when user tries to delete admin game")
		}
	})

	t.Run("User can delete own game", func(t *testing.T) {
		game := shared.CreateTestGame(t, client, userToken)

		err := client.DeleteEvent(userToken, game.ID)
		if err != nil {
			t.Errorf("User should be able to delete own game: %v", err)
		}
	})

	t.Run("Admin can delete own game", func(t *testing.T) {
		game := shared.CreateTestGame(t, client, adminToken)

		err := client.DeleteEvent(adminToken, game.ID)
		if err != nil {
			t.Errorf("Admin should be able to delete own game: %v", err)
		}
	})

	t.Run("Admin can delete any game", func(t *testing.T) {
		game := shared.CreateTestGame(t, client, userToken)

		err := client.DeleteEvent(adminToken, game.ID)
		if err != nil {
			t.Errorf("Admin should be able to delete any game: %v", err)
		}
	})
} 