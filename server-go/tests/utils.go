package e2e

import (
	"log"
	"os"
	"path/filepath"
	"sync"

	"github.com/joho/godotenv"
)

var (
	envOnce sync.Once
)

// loadEnvFile загружает переменные окружения из .env файла (выполняется только один раз)
func loadEnvFile() {
	envOnce.Do(func() {
		// Пытаемся найти .env файл в корне проекта
		envPath := filepath.Join(".env")
		
		// Если файл существует, загружаем его
		if _, err := os.Stat(envPath); err == nil {
			if err := godotenv.Load(envPath); err != nil {
				log.Printf("Предупреждение: не удалось загрузить .env файл из корня проекта: %v", err)
			}
		}
		
		// Также пытаемся загрузить .env из текущей директории тестов
		if err := godotenv.Load(".env"); err == nil {
			// Файл успешно загружен из текущей директории
		}
	})
}

// getEnvOrDefault получает переменную окружения или возвращает значение по умолчанию
func getEnvOrDefault(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// getUserToken получает токен обычного пользователя из переменной окружения
func getUserToken() string {
	loadEnvFile() // Загружаем .env перед получением токена
	return getEnvOrDefault("USER_TOKEN", "")
}

// getAdminToken получает токен админа из переменной окружения
func getAdminToken() string {
	loadEnvFile() // Загружаем .env перед получением токена
	return getEnvOrDefault("ADMIN_TOKEN", "")
}

// stringPtr возвращает указатель на строку
func stringPtr(s string) *string {
	return &s
}

// intPtr возвращает указатель на int
func intPtr(i int) *int {
	return &i
} 