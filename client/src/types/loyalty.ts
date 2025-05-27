export interface Loyalty {
  id: number
  name: string
  discount: number
}

export interface LoyaltyDetails extends Loyalty {
  description: string
  requirements: string
  benefits: string[]
}

export const mockLoyaltyLevels: LoyaltyDetails[] = [
  {
    id: 1,
    name: "GoPadel Rookie",
    discount: 0,
    description: "Начальный уровень для новых игроков",
    requirements: "Регистрация в приложении",
    benefits: [
      "Участие во всех турнирах",
      "Доступ к расписанию мероприятий",
    ]
  },
  {
    id: 2,
    name: "GoPadel Player",
    discount: 5,
    description: "Уровень для активных игроков",
    requirements: "Участие минимум в 3 турнирах",
    benefits: [
      "Скидка 5% на участие в турнирах",
      "Ранний доступ к регистрации на популярные турниры",
      "Участие во всех турнирах",
      "Доступ к расписанию мероприятий",
    ]
  },
  {
    id: 3,
    name: "GoPadel Pro",
    discount: 10,
    description: "Уровень для постоянных игроков",
    requirements: "Участие минимум в 10 турнирах",
    benefits: [
      "Скидка 10% на участие в турнирах",
      "Приоритетная регистрация на все турниры",
      "Специальные предложения от партнеров",
      "Участие во всех турнирах",
      "Доступ к расписанию мероприятий",
    ]
  },
  {
    id: 4,
    name: "GoPadel Aksakal",
    discount: 15,
    description: "Элитный уровень для лояльных игроков",
    requirements: "Участие минимум в 20 турнирах",
    benefits: [
      "Скидка 15% на участие в турнирах",
      "VIP-доступ ко всем мероприятиям",
      "Эксклюзивные предложения и события",
      "Персональная поддержка",
      "Приоритетная регистрация на все турниры",
      "Специальные предложения от партнеров",
      "Участие во всех турнирах",
      "Доступ к расписанию мероприятий",
    ]
  }
]
