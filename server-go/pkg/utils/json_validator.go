package utils

import (
	"encoding/json"
	"fmt"
	"strings"
)

// ValidateEventDataJSON проверяет валидность JSON данных события и наличие поля result
func ValidateEventDataJSON(data []byte, userID string) (bool, error) {
	if len(data) == 0 {
		return false, nil
	}

	// Базовая валидация JSON
	var jsonData map[string]interface{}
	if err := json.Unmarshal(data, &jsonData); err != nil {
		return false, fmt.Errorf("invalid JSON format from user %s: %w", userID, err)
	}

	// Проверяем безопасность - ищем подозрительные строки
	dataStr := string(data)
	dangerousPatterns := []string{
		"--", "/*", "*/", ";", 
		"DROP", "DELETE", "INSERT", "UPDATE", "SELECT",
		"drop", "delete", "insert", "update", "select",
		"<script", "</script>", "javascript:",
		"eval(", "Function(", "setTimeout(", "setInterval(",
	}

	dataLower := strings.ToLower(dataStr)
	for _, pattern := range dangerousPatterns {
		if strings.Contains(dataLower, strings.ToLower(pattern)) {
			return false, fmt.Errorf("potentially dangerous content detected from user %s: %s", userID, pattern)
		}
	}

	// Проверяем наличие поля result
	if result, exists := jsonData["result"]; exists && result != nil {
		// Убеждаемся что result это объект
		if _, isObject := result.(map[string]interface{}); isObject {
			return true, nil
		}
	}

	return false, nil
} 