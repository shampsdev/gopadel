export default function NotSupported() {
  return (
    <div className="p-4 flex flex-col gap-4 items-center text-center justify-center h-full">
      <h1 className="text-xl font-bold">
        Ваша версия Telegram не может запустить это приложение
      </h1>
      <p className="text-center">
        Обновите Telegram для использования этого MiniApp
      </p>
    </div>
  )
}
