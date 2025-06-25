package domain

type Loyalty struct {
	ID          int    `json:"id"`
	Name        string `json:"name"`
	Discount    int    `json:"discount"`
	Description string `json:"description"`
	Data        string `json:"data"`
}
