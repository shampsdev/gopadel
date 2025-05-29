import { useEffect, useState } from "react"
import { Check } from "lucide-react"
import Divider from "@/components/ui/Divider"
import useUserStore from "@/stores/userStore"
import { LoyaltyDetails } from "@/types/loyalty"
import blackLogo from "@/assets/logo-black.png"
import { getLoyaltyLevels } from "@/api/api"
import LoyaltyBadge from "@/components/LoyaltyBadge"

export default function LoyaltyPage() {
  const { userData } = useUserStore()
  const [loyaltyLevels, setLoyaltyLevels] = useState<LoyaltyDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [activeLevel, setActiveLevel] = useState<number | null>(null)

  useEffect(() => {
    // Load loyalty levels from API
    setLoading(true)
    getLoyaltyLevels()
      .then(levels => {
        setLoyaltyLevels(levels)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    // Set user's current loyalty level as active by default
    if (userData && userData.loyalty_id) {
      setActiveLevel(userData.loyalty_id)
    }
  }, [userData])

  if (loading) {
    return (
      <div className="p-4 bg-white min-h-screen flex flex-col pb-20">
        <div>
          <div className="flex items-center">
            <img src={blackLogo} className="h-5" alt="" />
          </div>
          <div className="my-4">
            <Divider />
          </div>
        </div>
        <div className="flex justify-center mt-10">
          <div className="text-gray-500">Загрузка информации...</div>
        </div>
      </div>
    )
  }

  const activeDetails = loyaltyLevels.find(level => level.id === activeLevel) || loyaltyLevels[0]

  return (
    <div className="p-4 bg-white min-h-screen flex flex-col pb-20">
      <div>
        <div className="flex items-center">
          <img src={blackLogo} className="h-5" alt="" />
        </div>
        <div className="my-4">
          <Divider />
        </div>
      </div>

      <p className="text-gray-600 mb-6">
        Программа лояльности GoPadel предлагает специальные привилегии постоянным участникам наших турниров.
      </p>

      {/* Responsive loyalty badges */}
      <div className="mb-8">
        <div className="grid grid-cols-5 gap-2">
          {loyaltyLevels.map((level) => (
            <div 
              key={level.id} 
              className={`flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${activeLevel === level.id ? 'opacity-100' : 'opacity-60'}`}
              onClick={() => setActiveLevel(level.id)}
            >
              <div className="flex justify-center items-center">
                <LoyaltyBadge 
                  loyaltyId={level.id} 
                  size="md"
                />
              </div>
              <span className={`mt-2 text-xs text-center ${activeLevel === level.id ? 'font-semibold' : ''}`}>
                {level.name.split(' ').pop()}
              </span>
              {userData?.loyalty_id === level.id && (
                <div className="mt-1 text-xs text-center text-green-600 font-medium">
                  Ваш
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Active level description */}
      {activeDetails && (
        <div className="mb-6">
          <div className="p-4 bg-white rounded-lg">
            <div className="text-center">
              <h2 className="text-xl font-bold">{activeDetails.name}</h2>
              <p className="text-gray-600 mt-3">{activeDetails.description}</p>
            </div>
            
            {activeDetails.discount > 0 && (
              <div className="flex justify-center mt-4">
                <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                  Скидка {activeDetails.discount}%
                </span>
              </div>
            )}
          </div>
          
          <div className="mt-5">
            <ul className="space-y-3">
              {activeDetails.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start">
                  <Check size={18} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
} 