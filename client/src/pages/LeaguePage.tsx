import videoFile from "@/assets/IMG_8675.MP4?url"

export default function LeaguePage() {
  return (
    <div className="p-4 bg-white min-h-screen flex flex-col pb-20">
      {/* League content placeholder */}
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        {/* Responsive video container */}
        <div className="relative w-full max-w-2xl mx-auto mb-4">
          <video
            className="w-full h-auto rounded-lg shadow-md"
            controls
            preload="metadata"
            poster=""
            autoPlay
            muted
            playsInline
          >
            <source src={videoFile} type="video/mp4" />
            Ваш браузер не поддерживает воспроизведение видео.
          </video>
        </div>

        <a 
          href="http://russianpadel.ru/" 
          target="_blank"
          rel="noopener noreferrer" 
          className="inline-flex items-center gap-2 px-4 py-2 mt-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-sm"
        >
          <span>Перейти на сайт лиги</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
        </a>
      </div>
    </div>
  )
}