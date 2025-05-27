import Header from "@/components/Header"

export default function PeoplePage() {
  return (
    <div className="p-4 bg-white min-h-screen pb-20">
      <Header />

      <h1 className="text-center font-semibold text-2xl mb-6 mt-2 text-gray-800">
        Люди
      </h1>

      <div className="flex flex-col items-center justify-center mt-10">
        <p className="text-gray-500">Список пользователей будет доступен скоро</p>
      </div>
    </div>
  )
} 