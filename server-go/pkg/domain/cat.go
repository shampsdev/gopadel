package domain

type Cat struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Owner *User  `json:"owner,omitempty"`
}

type CreateCat struct {
	Name    string `json:"name"`
	OwnerID string `json:"ownerId"`
}

type PatchCat struct {
	Name    *string `json:"name"`
	OwnerID *string `json:"ownerId"`
}

type FilterCat struct {
	ID      *string `json:"id"`
	OwnerID *string `json:"ownerId"`

	IncludeOwner bool `json:"includeOwner"`
}
