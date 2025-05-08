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
export const getTournaments = async (): Promise<Tournament[]> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  return [
    {
      id: "1",
      name: "Название",
      organizer: "Иван Иванов",
      start_time: new Date().toISOString(),
      price: 5000,
      location: "локация",
      rank_min: 1.0,
      rank_max: 2.0,
      max_users: 36,
      current_users: 30,
    },
    {
      id: "2",
      name: "Название",
      organizer: "Иван Иванов",
      start_time: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      price: 5000,
      location: "локация",
      rank_min: 1.0,
      rank_max: 2.0,
      max_users: 36,
      current_users: 30,
    },
  ]
}
