package pg

import "gopadel/scheduler/pkg/repo"

var (
	_ repo.Task = &TaskRepo{}
	_ repo.Registration = &RegistrationRepo{}
)
