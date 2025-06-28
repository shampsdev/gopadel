package domain

type Club struct {
	ID      string `json:"id"`
	Name    string `json:"name"`
	Address string `json:"address"`
}

type CreateClub struct {
	Name    string `json:"name" binding:"required"`
	Address string `json:"address" binding:"required"`
}

type PatchClub struct {
	Name    *string `json:"name,omitempty"`
	Address *string `json:"address,omitempty"`
}

type FilterClub struct {
	ID   *string `json:"id,omitempty"`
	Name *string `json:"name,omitempty"`
}
