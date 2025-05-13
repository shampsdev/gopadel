import axios from "axios"
import { API_URL } from "../shared/constants"
import { User } from "@/types/user"
import { Tournament } from "@/types/tournament"
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

export const getTournamentParticipants = async (tournamentId: string) => {
  try {
    const response = await api.get(`/tournaments/${tournamentId}/participants`)
    return response.data
  } catch (error) {
    console.error(
      `Error fetching participants for tournament ${tournamentId}:`,
      error
    )
    return []
  }
}
