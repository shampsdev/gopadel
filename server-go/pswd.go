package main

import (
	"fmt"
	"os"

	"github.com/shampsdev/go-telegram-template/pkg/utils"
)

func main() {
	if len(os.Args) < 2 {
		fmt.Println("Использование: go run generate_password_hash.go <пароль>")
		fmt.Println("Пример: go run generate_password_hash.go mypassword123")
		os.Exit(1)
	}

	password := os.Args[1]
	
	if len(password) < 4 {
		fmt.Println("Ошибка: пароль должен содержать минимум 6 символов")
		os.Exit(1)
	}

	hash, err := utils.HashPassword(password)
	if err != nil {
		fmt.Printf("Ошибка при создании хеша: %v\n", err)
		os.Exit(1)
	}

	fmt.Println("Хеш пароля успешно сгенерирован:")
	fmt.Println(hash)
	fmt.Println()
	fmt.Println("Используйте этот хеш в базе данных для поля password_hash админ-пользователя")
} 