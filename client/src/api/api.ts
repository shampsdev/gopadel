import axios from "axios"
import { API_URL } from "../shared/constants"
import { User, PlayingPosition } from "@/types/user"
import { Tournament } from "@/types/tournament"
import { Registration, RegistrationWithTournament } from "@/types/registration"
import { initDataRaw } from "@telegram-apps/sdk-react"
import { LoyaltyDetails, LoyaltyResponse } from "@/types/loyalty"
import { Waitlist } from "@/types/waitlist"

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
    const userData = response.data
    
    // Normalize playing_position to ensure it's always lowercase
    if (userData.playing_position) {
      userData.playing_position = userData.playing_position.toLowerCase() as PlayingPosition
    }
    
    return userData
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

export const getTournamentWaitlist = async (
  tournamentId: string
): Promise<Waitlist[]> => {
  try {
    const response = await api.get<Waitlist[]>(
      `/tournaments/${tournamentId}/waitlist`
    )
    return response.data
  } catch (error) {
    console.error(
      `Error fetching waitlist for tournament ${tournamentId}:`,
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

export const getUserTournamentHistory = async (): Promise<RegistrationWithTournament[]> => {
  try {
    const response = await api.get<RegistrationWithTournament[]>(
      `/tournaments/my`
    )
    return response.data
  } catch (error) {
    console.error(
      `Error fetching user tournament history:`,
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

export const cancelRegistrationBeforePayment = async (
  tournamentId: string
): Promise<Registration | null> => {
  try {
    const response = await api.delete<Registration>(
      `/registration/${tournamentId}/cancel-before-payment`
    )
    return response.data
  } catch (error) {
    console.error(
      `Error canceling registration before payment for tournament ${tournamentId}:`,
      error
    )
    return null
  }
}

export const createPaymentForTournament = async (
  tournamentId: string
): Promise<Registration | null> => {
  try {
    const response = await api.post<Registration>(
      `/registration/${tournamentId}/create-payment`
    )
    return response.data
  } catch (error) {
    console.error(
      `Error creating payment for tournament ${tournamentId}:`,
      error
    )
    return null
  }
}

export const getUsers = async () => {
  try {
    const response = await api.get("/users")
    const users = response.data
    
    // Normalize playing_position for all users
    if (Array.isArray(users)) {
      users.forEach((user: User) => {
        if (user.playing_position) {
          user.playing_position = user.playing_position.toLowerCase() as PlayingPosition
        }
      })
    }
    
    return users
  } catch (error) {
    console.error("Error fetching users:", error)
    return []
  }
}

export const getLoyaltyLevels = async (): Promise<LoyaltyDetails[]> => {
  try {
    const response = await api.get<LoyaltyResponse[]>("/users/loyalty-levels")

    // Transform API response to match our LoyaltyDetails interface
    return response.data.map((loyalty: LoyaltyResponse) => ({
      id: loyalty.id,
      name: loyalty.name,
      discount: loyalty.discount,
      description: loyalty.description || "",
      // Extract text from requirements or provide default
      requirements: loyalty.requirements?.text || "Регистрация в приложении",
      // Extract benefits list or provide default empty list
      benefits: loyalty.requirements?.benefits || [],
    }))
  } catch (error) {
    console.error("Error fetching loyalty levels:", error)
    return []
  }
}

// Waitlist API methods
export const addToWaitlist = async (
  tournamentId: string
): Promise<Waitlist | null> => {
  try {
    const response = await api.post<Waitlist>(`/waitlist/${tournamentId}`)
    return response.data
  } catch (error) {
    console.error(`Error adding to waitlist for tournament ${tournamentId}:`, error)
    return null
  }
}

export const removeFromWaitlist = async (
  tournamentId: string
): Promise<boolean> => {
  try {
    await api.delete(`/waitlist/${tournamentId}`)
    return true
  } catch (error) {
    console.error(`Error removing from waitlist for tournament ${tournamentId}:`, error)
    return false
  }
}

export const getUserWaitlists = async (): Promise<Waitlist[]> => {
  try {
    const response = await api.get<Waitlist[]>("/waitlist/my")
    return response.data
  } catch (error) {
    console.error("Error fetching user waitlists:", error)
    return []
  }
}

export const getTournamentWaitlistStatus = async (
  tournamentId: string
): Promise<Waitlist | null> => {
  try {
    const waitlists = await getUserWaitlists()
    return waitlists.find(w => w.tournament_id === tournamentId) || null
  } catch (error) {
    console.error(`Error checking waitlist status for tournament ${tournamentId}:`, error)
    return null
  }
}
