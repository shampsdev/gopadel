package shared

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/shampsdev/go-telegram-template/pkg/domain"
)

const BaseURL = "http://localhost:8888/api/v1"

type Client struct {
	http *http.Client
}

func NewClient() *Client {
	return &Client{
		http: &http.Client{Timeout: 10 * time.Second},
	}
}

func (c *Client) CreateEvent(token string, event domain.CreateEvent) (*domain.Event, error) {
	body, err := json.Marshal(event)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequest("POST", BaseURL+"/events", bytes.NewBuffer(body))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-API-Token", token)

	resp, err := c.http.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated {
		// Читаем тело ответа для диагностики
		var errorResponse map[string]interface{}
		if err := json.NewDecoder(resp.Body).Decode(&errorResponse); err == nil {
			return nil, fmt.Errorf("failed to create event: status %d, error: %v", resp.StatusCode, errorResponse)
		}
		return nil, fmt.Errorf("failed to create event: status %d", resp.StatusCode)
	}

	var createdEvent domain.Event
	if err := json.NewDecoder(resp.Body).Decode(&createdEvent); err != nil {
		return nil, err
	}

	return &createdEvent, nil
}

func (c *Client) DeleteEvent(token, eventID string) error {
	url := fmt.Sprintf("%s/events/%s", BaseURL, eventID)
	req, err := http.NewRequest("DELETE", url, nil)
	if err != nil {
		return err
	}

	req.Header.Set("X-API-Token", token)

	resp, err := c.http.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusNoContent {
		return fmt.Errorf("failed to delete event: status %d", resp.StatusCode)
	}

	return nil
}

func (c *Client) CreateRegistration(token, eventID string) (*domain.Registration, error) {
	// Для этого endpoint не нужно тело запроса, eventID передается в URL
	url := fmt.Sprintf("%s/registrations/%s", BaseURL, eventID)
	req, err := http.NewRequest("POST", url, nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("X-API-Token", token)

	resp, err := c.http.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated {
		return nil, fmt.Errorf("failed to create registration: status %d", resp.StatusCode)
	}

	var registration domain.Registration
	if err := json.NewDecoder(resp.Body).Decode(&registration); err != nil {
		return nil, err
	}

	return &registration, nil
}

func (c *Client) ApproveRegistration(token, eventID, userID string) error {
	url := fmt.Sprintf("%s/registrations/%s/%s/approve", BaseURL, eventID, userID)
	req, err := http.NewRequest("PUT", url, nil)
	if err != nil {
		return err
	}

	req.Header.Set("X-API-Token", token)

	resp, err := c.http.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("failed to approve registration: status %d", resp.StatusCode)
	}

	return nil
}

func (c *Client) CancelRegistration(token, eventID string) error {
	url := fmt.Sprintf("%s/registrations/%s/cancel", BaseURL, eventID)
	req, err := http.NewRequest("POST", url, nil)
	if err != nil {
		return err
	}

	req.Header.Set("X-API-Token", token)

	resp, err := c.http.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("failed to cancel registration: status %d", resp.StatusCode)
	}

	return nil
}

func (c *Client) GetUserMe(token string) (*domain.User, error) {
	req, err := http.NewRequest("GET", BaseURL+"/users/me", nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("X-API-Token", token)

	resp, err := c.http.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to get user: status %d", resp.StatusCode)
	}

	var user domain.User
	if err := json.NewDecoder(resp.Body).Decode(&user); err != nil {
		return nil, err
	}

	return &user, nil
}

func (c *Client) PatchEvent(token, eventID string, patch domain.PatchEvent) (*domain.Event, error) {
	body, err := json.Marshal(patch)
	if err != nil {
		return nil, err
	}

	url := fmt.Sprintf("%s/events/%s", BaseURL, eventID)
	req, err := http.NewRequest("PATCH", url, bytes.NewBuffer(body))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-API-Token", token)

	resp, err := c.http.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to patch event: status %d", resp.StatusCode)
	}

	var updatedEvent domain.Event
	if err := json.NewDecoder(resp.Body).Decode(&updatedEvent); err != nil {
		return nil, err
	}

	return &updatedEvent, nil
}
