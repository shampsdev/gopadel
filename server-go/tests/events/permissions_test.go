package events_test

import (
	"testing"
	"time"

	"github.com/shampsdev/go-telegram-template/pkg/domain"
	"github.com/shampsdev/go-telegram-template/tests/shared"
)

func TestCreateGamePermissions(t *testing.T) {
	client := shared.NewClient()
	userToken, adminToken := shared.SkipIfNoTokens(t)

	tests := []struct {
		name     string
		token    string
		wantCode int
	}{
		{"User can create game", userToken, 201},
		{"Admin can create game", adminToken, 201},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			event := domain.CreateEvent{
				Name:        "Test Game",
				Description: shared.StringPtr("Test game description"),
				StartTime:   time.Now().Add(24 * time.Hour),
				EndTime:     time.Now().Add(26 * time.Hour),
				RankMin:     1.0,
				RankMax:     10.0,
				Price:       0,
				MaxUsers:    4,
				Type:        domain.EventTypeGame,
				CourtID:     "9603f0b7-7729-410f-92bf-04de55527a8f",
				ClubID:      shared.StringPtr("global"),
			}

			createdEvent, err := client.CreateEvent(tt.token, event)
			if tt.wantCode == 201 {
				if err != nil {
					t.Errorf("Failed to create event: %v", err)
					return
				}
				if createdEvent.Type != domain.EventTypeGame {
					t.Errorf("Expected event type %s, got %s", domain.EventTypeGame, createdEvent.Type)
				}
				shared.CleanupEvent(client, tt.token, createdEvent.ID)
			} else {
				if err == nil {
					t.Error("Expected error but got success")
					shared.CleanupEvent(client, tt.token, createdEvent.ID)
				}
			}
		})
	}
}

func TestCreateTournamentPermissions(t *testing.T) {
	client := shared.NewClient()
	userToken, adminToken := shared.SkipIfNoTokens(t)

	tests := []struct {
		name      string
		token     string
		expectErr bool
	}{
		{"User cannot create tournament", userToken, true},
		{"Admin can create tournament", adminToken, false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			event := domain.CreateEvent{
				Name:        "Test Tournament",
				Description: shared.StringPtr("Test tournament description"),
				StartTime:   time.Now().Add(24 * time.Hour),
				EndTime:     time.Now().Add(26 * time.Hour),
				RankMin:     1.0,
				RankMax:     10.0,
				Price:       1000,
				MaxUsers:    16,
				Type:        domain.EventTypeTournament,
				CourtID:     "9603f0b7-7729-410f-92bf-04de55527a8f",
				ClubID:      shared.StringPtr("global"),
			}

			createdEvent, err := client.CreateEvent(tt.token, event)
			if tt.expectErr {
				if err == nil {
					t.Error("Expected error but got success")
					shared.CleanupEvent(client, tt.token, createdEvent.ID)
				}
			} else {
				if err != nil {
					t.Errorf("Failed to create tournament: %v", err)
					return
				}
				if createdEvent.Type != domain.EventTypeTournament {
					t.Errorf("Expected event type %s, got %s", domain.EventTypeTournament, createdEvent.Type)
				}
				shared.CleanupEvent(client, adminToken, createdEvent.ID)
			}
		})
	}
}

func TestUpdateGamePermissions(t *testing.T) {
	client := shared.NewClient()
	userToken, adminToken := shared.SkipIfNoTokens(t)

	t.Run("User can update own game", func(t *testing.T) {
		game := shared.CreateTestGame(t, client, userToken)
		defer shared.CleanupEvent(client, userToken, game.ID)

		patch := domain.PatchEvent{
			Name:     shared.StringPtr("Updated Game Name"),
			MaxUsers: shared.IntPtr(6),
		}

		_, err := client.PatchEvent(userToken, game.ID, patch)
		if err != nil {
			t.Errorf("User should be able to update own game: %v", err)
		}
	})

	t.Run("User cannot update admin game", func(t *testing.T) {
		game := shared.CreateTestGame(t, client, adminToken)
		defer shared.CleanupEvent(client, adminToken, game.ID)

		patch := domain.PatchEvent{
			Name: shared.StringPtr("Hacked Game"),
		}

		_, err := client.PatchEvent(userToken, game.ID, patch)
		if err == nil {
			t.Error("User should not be able to update admin's game")
		}
	})

	t.Run("Admin can update any game", func(t *testing.T) {
		game := shared.CreateTestGame(t, client, userToken)
		defer shared.CleanupEvent(client, adminToken, game.ID)

		patch := domain.PatchEvent{
			Name: shared.StringPtr("Admin Updated Game"),
		}

		_, err := client.PatchEvent(adminToken, game.ID, patch)
		if err != nil {
			t.Errorf("Admin should be able to update any game: %v", err)
		}
	})
}

func TestCreateTrainingPermissions(t *testing.T) {
	client := shared.NewClient()
	userToken, _ := shared.SkipIfNoTokens(t)

	event := domain.CreateEvent{
		Name:        "Test Training",
		Description: shared.StringPtr("Training should be forbidden"),
		StartTime:   time.Now().Add(24 * time.Hour),
		EndTime:     time.Now().Add(26 * time.Hour),
		RankMin:     1.0,
		RankMax:     10.0,
		Price:       500,
		MaxUsers:    8,
		Type:        domain.EventTypeTraining,
		CourtID:     "9603f0b7-7729-410f-92bf-04de55527a8f",
		ClubID:      shared.StringPtr("global"),
	}

	_, err := client.CreateEvent(userToken, event)
	if err == nil {
		t.Error("Training creation should fail")
	}
} 