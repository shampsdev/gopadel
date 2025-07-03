export interface FilterTournament {
  id?: string;
  name?: string;
  notEnded?: boolean;
  notFull?: boolean;
  organizatorId?: string;
}

export interface FilterUser {
  firstName?: string;
  id?: string;
  lastName?: string;
  telegramId?: string;
}
