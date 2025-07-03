import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, User, Lock, AlertCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useToastContext } from '../contexts/ToastContext'

export function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  
  const { login, isLoading } = useAuth()
  const toast = useToastContext()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    try {
      await login({ username, password })
      toast.success('Добро пожаловать!')
    } catch (err: any) {
      console.error('Ошибка входа:', err)
      let errorMessage = 'Произошла ошибка при входе в систему'
      
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error
      } else if (err.response?.status === 401) {
        errorMessage = 'Неверное имя пользователя или пароль'
      }
      
      setError(errorMessage)
      toast.error(errorMessage)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
      <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 shadow-2xl">
        <CardHeader className="space-y-1 text-center pb-8">
          <CardTitle className="text-3xl font-bold text-white">
            GoPadel
          </CardTitle>
          <CardDescription className="text-zinc-400 text-base">
            Панель администрирования
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-900/20 border border-red-800 rounded-md">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <span className="text-red-400 text-sm">{error}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium text-zinc-200">
                Имя пользователя
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                <Input
                  id="username"
                  type="text"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-zinc-600"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-zinc-200">
                Пароль
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-zinc-600"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-zinc-400 hover:text-zinc-200 transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-zinc-700 hover:bg-zinc-600 text-white font-medium py-3 transition-colors"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Вход...
                </div>
              ) : (
                'Войти в систему'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 