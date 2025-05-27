import axios from "axios"
import { API_URL } from "../shared/constants"
import { User } from "@/types/user"
import { Tournament } from "@/types/tournament"
import { Registration, RegistrationWithTournament } from "@/types/registration"
import { initDataRaw } from "@telegram-apps/sdk-react"

export const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: {
    "Content-Type": "application/json",
    Authorization: `tma ${initDataRaw()}`,
  },
  maxRedirects: 0,
})

export const getMe = async (): Promise<User | null> => {
  try {
    const response = await api.get<User>(`/auth/me`)
    return response.data
  } catch (error) {
    console.error("Ошибка при получении профиля текущего пользователя:", error)
    return null
  }
}

// Commented out real implementation - to be used later
/*
export const getTournaments = async (): Promise<Tournament[]> => {
  try {
    const response = await api.get<Tournament[]>(`/tournaments`)
    return response.data
  } catch (error) {
    console.error("Ошибка при получении списка турниров:", error)
    return []
  }
}
*/

// Mock function for development
export const getTournaments = async (
  availableOnly: boolean
): Promise<Tournament[]> => {
  const response = await api.get<Tournament[]>(
    `/tournaments?available=${availableOnly}`
  )
  return response.data
}

export const getTournament = async (id: string): Promise<Tournament | null> => {
  try {
    const response = await api.get<Tournament>(`/tournaments/${id}`)
    return response.data
  } catch (error) {
    console.error(`Error fetching tournament with id ${id}:`, error)
    return null
  }
}

export const getTournamentParticipants = async (
  tournamentId: string
): Promise<Registration[]> => {
  try {
    const response = await api.get<Registration[]>(
      `/tournaments/${tournamentId}/participants`
    )
    return response.data
  } catch (error) {
    console.error(
      `Error fetching participants for tournament ${tournamentId}:`,
      error
    )
    return []
  }
}

export const registerForTournament = async (
  tournamentId: string
): Promise<Registration | null> => {
  try {
    const response = await api.post<Registration>(
      `/registration/${tournamentId}`
    )
    return response.data
  } catch (error) {
    console.error(`Error registering for tournament ${tournamentId}:`, error)
    return null
  }
}

export const getTournamentRegistration = async (
  tournamentId: string
): Promise<Registration | null> => {
  try {
    const response = await api.get<Registration>(
      `/tournaments/${tournamentId}/registration`
    )
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      // Not found is expected when user isn't registered
      return null
    }
    console.error(
      `Error fetching registration for tournament ${tournamentId}:`,
      error
    )
    return null
  }
}

export const getUserTournaments = async (
  tournamentId: string
): Promise<RegistrationWithTournament[]> => {
  try {
    const response = await api.get<RegistrationWithTournament[]>(
      `/tournaments/${tournamentId}/my`
    )
    return response.data
  } catch (error) {
    console.error(
      `Error fetching user tournaments for tournament ${tournamentId}:`,
      error
    )
    return []
  }
}

export const deleteRegistration = async (
  tournamentId: string
): Promise<Registration | null> => {
  try {
    const response = await api.delete<Registration>(
      `/registration/${tournamentId}`
    )
    return response.data
  } catch (error) {
    console.error(
      `Error deleting registration for tournament ${tournamentId}:`,
      error
    )
    return null
  }
}

export const getUsers = async () => {
  try {
    const response = await api.get("/users/");
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};
