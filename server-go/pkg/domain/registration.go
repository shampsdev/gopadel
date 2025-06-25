package domain

type RegistrationStatus string

const (
	RegistrationStatusPending        RegistrationStatus = "PENDING"
	RegistrationStatusActive         RegistrationStatus = "ACTIVE"
	RegistrationStatusCanceled       RegistrationStatus = "CANCELED"
	RegistrationStatusCanceledByUser RegistrationStatus = "CANCELED_BY_USER"
)
