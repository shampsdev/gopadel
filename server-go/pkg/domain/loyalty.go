package domain

type Loyalty struct {
	ID           int    `json:"id"`
	Name         string `json:"name"`
	Discount     int    `json:"discount"`
	Description  string `json:"description"`
	Requirements string `json:"requirements"`
}

type CreateLoyalty struct {
	Name         string `json:"name"`
	Discount     int    `json:"discount"`
	Description  string `json:"description"`
	Requirements string `json:"requirements"`
}

type PatchLoyalty struct {
	Name         *string `json:"name"`
	Discount     *int    `json:"discount"`
	Description  *string `json:"description"`
	Requirements *string `json:"requirements"`
}

type FilterLoyalty struct {
	ID *int `json:"id"`
}
