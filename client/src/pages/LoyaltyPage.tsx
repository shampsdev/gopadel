import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Award, Check } from "lucide-react"
import Divider from "@/components/ui/Divider"
import useUserStore from "@/stores/userStore"
import { LoyaltyDetails, mockLoyaltyLevels } from "@/types/loyalty"
import blackLogo from "@/assets/logo-black.png"

export default function LoyaltyPage() {
  const { userData } = useUserStore()
  const navigate = useNavigate()
  const [loyaltyLevels, setLoyaltyLevels] = useState<LoyaltyDetails[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading from API
    setLoading(true)
    setTimeout(() => {
      setLoyaltyLevels(mockLoyaltyLevels)
      setLoading(false)
    }, 500)
  }, [])

  const handleBack = () => {
    navigate(-1)
  }

  if (loading) {
    return (
      <div className="p-4 min-h-screen flex flex-col pb-20">
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

  return (
    <div className="p-4 min-h-screen flex flex-col pb-20">
      <div>
        <div className="flex items-center">
          <img src={blackLogo} className="h-5" alt="" />
        </div>
        <div className="my-4">
          <Divider />
        </div>
      </div>

      <div className="flex items-center mb-4">
        <button 
          onClick={handleBack}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-semibold ml-2">Уровни лояльности</h1>
      </div>

      <p className="text-gray-600 mb-6">
        Программа лояльности GoPadel предлагает специальные привилегии постоянным участникам наших турниров.
      </p>

      {loyaltyLevels.map((level) => (
        <div 
          key={level.id} 
          className={`mb-6 rounded-lg overflow-hidden border ${userData?.loyalty_id === level.id ? 'border-green-500' : 'border-gray-200'}`}
        >
          <div className={`p-4 ${userData?.loyalty_id === level.id ? 'bg-green-50' : 'bg-white'}`}>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Award size={24} className={`mr-2 ${userData?.loyalty_id === level.id ? 'text-green-600' : 'text-gray-400'}`} />
                <h2 className="text-lg font-bold">{level.name}</h2>
              </div>
              {userData?.loyalty_id === level.id && (
                <span className="text-sm text-green-600 font-medium">Ваш текущий уровень</span>
              )}
            </div>
            
            <p className="text-gray-600 mt-2">{level.description}</p>
            
            {level.discount > 0 && (
              <div className="mt-2 flex items-center">
                <span className="text-sm font-medium mr-2">Скидка:</span>
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded-full">
                  {level.discount}%
                </span>
              </div>
            )}
            
            <div className="mt-3">
              <span className="text-sm font-medium">Требования:</span>
              <p className="text-sm text-gray-600 mt-1">{level.requirements}</p>
            </div>
          </div>
          
          <div className="p-4 bg-gray-50">
            <span className="text-sm font-medium">Преимущества:</span>
            <ul className="mt-2">
              {level.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start mb-2">
                  <Check size={16} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  )
} 