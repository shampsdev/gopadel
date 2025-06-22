package domain

type MessageType string

const (
	MessageTypeText       MessageType = "text"
	MessageTypeForward    MessageType = "forward"
	MessageTypePhoto      MessageType = "photo"
	MessageTypeMediaGroup MessageType = "media_group"
)

type Message struct {
	Type       MessageType     `json:"type"`
	Text       *MessageText    `json:"text,omitempty"`
	Forward    *MessageForward `json:"forward,omitempty"`
	Photo      *MessagePhoto   `json:"photo,omitempty"`
	MediaGroup *MessageMedia   `json:"media_group,omitempty"`
}

type MessageText struct {
	Text string `json:"text"`
}

type MessagePhoto struct {
	Caption string `json:"caption,omitempty"`
	URL     string `json:"url"`
}

type MessageForward struct {
	FromChatID int `json:"fromChatID"`
	MessageID  int `json:"messageID"`
}

type MessageMedia struct {
	Caption string   `json:"caption,omitempty"`
	URLS    []string `json:"urls"`
}