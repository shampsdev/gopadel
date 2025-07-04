package domain

type Court struct {
	ID      string `json:"id"`
	Name    string `json:"name"`
	Address string `json:"address"`
}

type CreateCourt struct {
	Name    string `json:"name" binding:"required"`
	Address string `json:"address" binding:"required"`
}

type PatchCourt struct {
	Name    *string `json:"name,omitempty"`
	Address *string `json:"address,omitempty"`
}

type FilterCourt struct {
	ID   *string `json:"id,omitempty"`
	Name *string `json:"name,omitempty"`
} 