import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore, UserRole } from '../store/authStore'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group'
import { AlertCircle, Truck, Eye, EyeOff } from 'lucide-react'

const ROLES: { value: UserRole; label: string; description: string }[] = [
  { value: 'manager', label: 'Manager', description: 'Fleet and analytics management' },
  { value: 'dispatcher', label: 'Dispatcher', description: 'Manage trips and assignments' },
]

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
  role: z.enum(['manager', 'dispatcher'] as [string, ...string[]]),
})

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email address'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
  confirmPassword: z.string(),
  role: z.enum(['manager', 'dispatcher'] as [string, ...string[]]),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type LoginFormData = z.infer<typeof loginSchema>
type RegisterFormData = z.infer<typeof registerSchema>

export default function LoginPage() {
  const navigate = useNavigate()
  const { setAuth, isAuthenticated } = useAuthStore()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      role: 'dispatcher' as UserRole,
    },
  })

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'dispatcher' as UserRole,
    },
  })

  // Auto-redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/')
    }
  }, [isAuthenticated, navigate])

  const handleModeChange = (newMode: 'login' | 'register') => {
    setMode(newMode)
    setError('')
    loginForm.reset()
    registerForm.reset()
  }

  const onLoginSubmit = async (data: LoginFormData) => {
    try {
      setError('')
      setIsLoading(true)

      // Backend expects role as 'Manager' or 'Dispatcher'
      const roleMap: Record<string, string> = { admin: 'Admin', manager: 'Manager', dispatcher: 'Dispatcher', driver: 'Driver' }
      const roleForBackend = roleMap[data.role] || data.role.charAt(0).toUpperCase() + data.role.slice(1)
      const payload = { email: data.email, password: data.password, role: roleForBackend }

      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Login failed')
      }

      if (!result.token || !result.user) {
        throw new Error('Invalid login response')
      }
      setAuth(result.token, result.user)
      navigate('/')
      
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  const onRegisterSubmit = async (data: RegisterFormData) => {
    try {
      setError('')
      setIsLoading(true)

      // Backend expects {email, password, role} - name is optional
      const { confirmPassword, name, ...registerData } = data
      
      const roleMap: Record<string, string> = { admin: 'Admin', manager: 'Manager', dispatcher: 'Dispatcher', driver: 'Driver' }
      const roleForBackend = roleMap[registerData.role] || registerData.role.charAt(0).toUpperCase() + registerData.role.slice(1)
      const payload = {
        email: registerData.email,
        password: registerData.password,
        role: roleForBackend,
        ...(name && name.trim() && { name }),
      }

      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Registration failed')
      }

      if (result.token && result.user) {
        setAuth(result.token, result.user)
      } else {
        setAuth('', { id: Date.now(), email: data.email, role: roleForBackend })
      }
      navigate('/')
      
    } catch (err: any) {
      setError(err.message || 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Truck className="text-primary" size={32} />
            <h1 className="text-3xl font-bold text-primary">FleetFlow</h1>
          </div>
          <p className="text-muted-foreground">Professional Fleet Management System</p>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-2 mb-6 justify-center">
          <Button
            variant={mode === 'login' ? 'default' : 'outline'}
            onClick={() => handleModeChange('login')}
            disabled={isLoading}
          >
            Sign In
          </Button>
          <Button
            variant={mode === 'register' ? 'default' : 'outline'}
            onClick={() => handleModeChange('register')}
            disabled={isLoading}
          >
            Register
          </Button>
        </div>

        {/* Login Form */}
        {mode === 'login' && (
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Sign In to Your Account</CardTitle>
              <CardDescription>
                Enter your credentials and select your role to continue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email Address</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="your@email.com"
                    {...loginForm.register('email')}
                    disabled={isLoading}
                  />
                  {loginForm.formState.errors.email && (
                    <p className="text-sm text-destructive">{loginForm.formState.errors.email.message}</p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      {...loginForm.register('password')}
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full w-10 p-0 opacity-75 hover:opacity-100"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {loginForm.formState.errors.password && (
                    <p className="text-sm text-destructive">{loginForm.formState.errors.password.message}</p>
                  )}
                </div>

                {/* Role Selection */}
                <div className="space-y-3">
                  <Label>Select Your Role</Label>
                  <RadioGroup 
                    value={loginForm.watch('role')} 
                    onValueChange={(value) => loginForm.setValue('role', value as UserRole)}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {ROLES.map((role) => (
                        <div key={role.value} className="flex items-start space-x-2 p-3 border border-border rounded-lg hover:bg-muted cursor-pointer transition-colors disabled:opacity-50">
                          <RadioGroupItem 
                            value={role.value} 
                            id={`login-role-${role.value}`} 
                            className="mt-1" 
                          />
                          <label htmlFor={`login-role-${role.value}`} className="flex-1 cursor-pointer">
                            <p className="font-medium text-sm">{role.label}</p>
                            <p className="text-xs text-muted-foreground">{role.description}</p>
                          </label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                  {loginForm.formState.errors.role && (
                    <p className="text-sm text-destructive">{loginForm.formState.errors.role.message}</p>
                  )}
                </div>

                {/* Error Message */}
                {error && (
                  <div className="flex gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
                    <AlertCircle size={20} className="text-destructive flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>

                {/* Demo Credentials */}
                <div className="p-3 bg-muted rounded-lg text-xs text-muted-foreground">
                  <p className="font-semibold mb-1">Demo Credentials:</p>
                  <p>Email: demo@fleetflow.com</p>
                  <p>Password: demo123</p>
                  <p>Role: dispatcher</p>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Register Form */}
        {mode === 'register' && (
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Create New Account</CardTitle>
              <CardDescription>
                Fill in the details below to register for FleetFlow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-6">
                {/* Name - Optional */}
                <div className="space-y-2">
                  <Label htmlFor="register-name">Full Name (Optional)</Label>
                  <Input
                    id="register-name"
                    type="text"
                    placeholder="John Doe"
                    {...registerForm.register('name')}
                    disabled={isLoading}
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email Address *</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="your@email.com"
                    {...registerForm.register('email')}
                    disabled={isLoading}
                  />
                  {registerForm.formState.errors.email && (
                    <p className="text-sm text-destructive">{registerForm.formState.errors.email.message}</p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="register-password">Password *</Label>
                  <div className="relative">
                    <Input
                      id="register-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      {...registerForm.register('password')}
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full w-10 p-0 opacity-75 hover:opacity-100"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {registerForm.formState.errors.password && (
                    <p className="text-sm text-destructive">{registerForm.formState.errors.password.message}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="register-confirm">Confirm Password *</Label>
                  <Input
                    id="register-confirm"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...registerForm.register('confirmPassword')}
                    disabled={isLoading}
                  />
                  {registerForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-destructive">{registerForm.formState.errors.confirmPassword.message}</p>
                  )}
                </div>

                {/* Role Selection */}
                <div className="space-y-3">
                  <Label>Select Your Role *</Label>
                  <RadioGroup 
                    value={registerForm.watch('role')} 
                    onValueChange={(value) => registerForm.setValue('role', value as UserRole)}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {ROLES.map((role) => (
                        <div key={role.value} className="flex items-start space-x-2 p-3 border border-border rounded-lg hover:bg-muted cursor-pointer transition-colors">
                          <RadioGroupItem 
                            value={role.value} 
                            id={`register-role-${role.value}`} 
                            className="mt-1" 
                          />
                          <label htmlFor={`register-role-${role.value}`} className="flex-1 cursor-pointer">
                            <p className="font-medium text-sm">{role.label}</p>
                            <p className="text-xs text-muted-foreground">{role.description}</p>
                          </label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                  {registerForm.formState.errors.role && (
                    <p className="text-sm text-destructive">{registerForm.formState.errors.role.message}</p>
                  )}
                </div>

                {/* Error Message */}
                {error && (
                  <div className="flex gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
                    <AlertCircle size={20} className="text-destructive flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}