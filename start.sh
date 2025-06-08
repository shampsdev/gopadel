#!/bin/bash

show_help() {
    echo "Использование: ./start.sh [опция]"
    echo ""
    echo "Опции:"
    echo "  --help, -h       Показать эту справку"
    echo ""
    echo "Команды tmux:"
    echo "  tmux ls                      Показать все сессии"
    echo "  tmux a -t gopadel       Подключиться к сессии gopadel"
    echo "  tmux a -t gopadel:admin Подключиться к окну admin в сессии gopadel"
    echo "  tmux kill-session -t gopadel Завершить сессию gopadel"
    echo "  Ctrl+b d                     Отключиться от сессии (detach)"
    echo "  Ctrl+b c                     Создать новое окно"
    echo "  Ctrl+b n                     Перейти к следующему окну"
    echo "  Ctrl+b p                     Перейти к предыдущему окну"
    echo "  Ctrl+b w                     Показать список окон"
    exit 0
}

if [[ "$1" == "--help" || "$1" == "-h" ]]; then
    show_help
fi

tmux kill-session -t gopadel 2>/dev/null

pkill -f "npm run dev"
pkill -f "bore local"

echo "Starting services in tmux windows..."

tmux new -d -s gopadel -n admin
tmux send-keys -t gopadel:admin "cd admin && npm run dev" C-m

tmux neww -t gopadel -n client
tmux send-keys -t gopadel:client "cd client && npm run dev" C-m

tmux neww -t gopadel -n miniapp-tunnel
tmux send-keys -t gopadel:miniapp-tunnel "bore local 2999 --to dimaxren.tunnel.shamps.dev -s g6KwBQGdT2VkDeJcLhSXjH -p 8004" C-m

sleep 1
echo "miniapp tunnel started at https://dimaxren.tunnel.shamps.dev"

read -p "Enter y if you want to expose the backend" -n 1 -r
echo \n
if [[ $REPLY =~ ^[Yy]$ ]]
then
    tmux neww -t gopadel -n backend-tunnel
    tmux send-keys -t gopadel:backend-tunnel "bore local 8001 --to mrussy.tunnel.shamps.dev -s g6KwBQGdT2VkDeJcLhSXjH -p 8005" C-m
    echo "backend tunnel started at https://mrussy.tunnel.shamps.dev"
fi

echo "Running tmux windows in gopadel session:"
tmux list-windows -t gopadel
echo ""
echo "Используйте 'tmux attach -t gopadel' для подключения к сессии"