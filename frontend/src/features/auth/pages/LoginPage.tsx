import { useState } from "react"
import { Monitor, Shield, Zap, LayoutDashboard, BrainCircuit, Activity, Lock, Moon, Sun } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { Input } from "@/shared/components/ui/input"
import { Button } from "@/shared/components/ui/button"
import { Label } from "@/shared/components/ui/label"
import { Checkbox } from "@/shared/components/ui/checkbox"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { authApi } from "@/shared/api/authApi"
import { useAuthStore } from "@/shared/providers/useAuthStore"

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isDark, setIsDark] = useState(true)
  const setAuth = useAuthStore((state) => state.setAuth)

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setAuth(data.access_token, data.session?.tenant_id || null, data.user)
      navigate("/dashboard")
    },
    onError: () => {
      toast.error("Invalid email or password")
    }
  })

  const toggleTheme = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle("dark")
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    loginMutation.mutate({ email, password })
  }

  return (
    <div className={`min-h-screen w-full flex ${isDark ? 'dark' : ''} bg-background text-foreground`}>
      {/* Left Panel - Branding & Visuals */}
      <div className="hidden lg:flex w-1/2 bg-slate-950 relative flex-col justify-center items-center overflow-hidden border-r border-slate-800">
        {/* Background glow effects */}
        <div className="absolute top-0 -left-1/4 w-full h-full bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 -right-1/4 w-full h-full bg-indigo-500/10 rounded-full blur-[120px]" />
        
        <div className="absolute top-8 left-12 flex items-center gap-2">
          <div className="flex items-center gap-3">
            <img src="/logo.jpg" alt="Central Eye" className="h-8 w-8 object-cover rounded-md" />
            <div className="flex flex-col">
              <span className="text-2xl font-bold tracking-tight text-white">Central <span className="text-blue-500">Eye</span></span>
            </div>
          </div>
        </div>

        <div className="z-10 w-full max-w-lg px-12 mt-12 flex flex-col gap-6">
          <h1 className="text-4xl md:text-5xl font-semibold leading-tight text-white">
            One Platform.<br />
            One Conversation.<br />
            <span className="text-blue-400">One Resolution.</span>
          </h1>
          <p className="text-slate-400 text-lg">
            AI-Powered IT Operations, Monitoring, Support & Security Platform
          </p>

          <div className="mt-12 relative w-full aspect-square max-w-[400px] mx-auto flex items-center justify-center">
            {/* Center Brain Icon */}
            <div className="absolute z-20 p-6 bg-slate-900/80 backdrop-blur-md rounded-full border border-blue-500/30 shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)]">
              <BrainCircuit className="w-16 h-16 text-blue-400" />
            </div>

            {/* Orbiting Icons */}
            <div className="absolute w-full h-full border border-slate-800/50 rounded-full" />
            <div className="absolute w-3/4 h-3/4 border border-slate-800/80 rounded-full" />
            
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
              <div className="p-3 bg-slate-900 rounded-full border border-slate-800 text-blue-400"><Monitor size={20} /></div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400">Monitor</span>
            </div>
            
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 flex flex-col items-center gap-2">
              <div className="p-3 bg-slate-900 rounded-full border border-slate-800 text-indigo-400"><Activity size={20} /></div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400">Analyze</span>
            </div>
            
            <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
              <div className="p-3 bg-slate-900 rounded-full border border-slate-800 text-cyan-400"><Shield size={20} /></div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400">Secure</span>
            </div>
            
            <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
              <div className="p-3 bg-slate-900 rounded-full border border-slate-800 text-teal-400"><Zap size={20} /></div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400">Automate</span>
            </div>
            
            <div className="absolute top-[14.6%] left-[14.6%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
              <div className="p-3 bg-slate-900 rounded-full border border-slate-800 text-purple-400"><LayoutDashboard size={20} /></div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400">Manage</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col relative bg-background">
        <div className="absolute top-6 right-6 flex items-center gap-4">
          <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        <div className="flex-1 flex flex-col justify-center items-center px-8 sm:px-16 md:px-24">
          <div className="w-full max-w-[400px] flex flex-col gap-8">
            
            {/* Mobile Branding (hidden on desktop) */}
            <div className="flex lg:hidden items-center gap-3 mb-4">
              <img src="/logo.jpg" alt="Central Eye" className="h-8 w-8 object-cover rounded-md" />
              <div className="flex flex-col">
                <span className="text-2xl font-bold tracking-tight text-foreground">Central <span className="text-blue-500">Eye</span></span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-semibold tracking-tight">Welcome back</h2>
              <p className="text-sm text-muted-foreground">Sign in to access Central Eye</p>
            </div>

            <form onSubmit={handleLogin} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email address</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                    <Monitor size={16} /> {/* Placeholder for user icon */}
                  </div>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="Enter your email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 h-11 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                    <Lock size={16} />
                  </div>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="Enter your password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 h-11 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 pr-10"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground cursor-pointer hover:text-foreground">
                    {/* Placeholder for eye icon */}
                    <span className="text-xs font-medium">Show</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-1">
                <div className="flex items-center space-x-2">
                  <Checkbox id="remember" />
                  <label
                    htmlFor="remember"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Remember me
                  </label>
                </div>
                <a href="#" className="text-sm font-medium text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300">
                  Forgot password?
                </a>
              </div>

              {loginMutation.isError && (
                <div className="text-sm text-red-500 bg-red-500/10 p-3 rounded-md border border-red-500/20">
                  {loginMutation.error instanceof Error 
                    ? loginMutation.error.message 
                    : "Login failed. Please check your credentials."}
                </div>
              )}

              <Button 
                type="submit" 
                disabled={loginMutation.isPending}
                className="w-full h-11 mt-2 text-base font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
              >
                {loginMutation.isPending ? "Signing In..." : "Sign In"}
              </Button>
            </form>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
              <span className="flex-shrink-0 mx-4 text-xs text-muted-foreground uppercase tracking-wider">or continue with</span>
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Button variant="outline" className="h-11 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800">
                <Shield className="w-4 h-4 mr-2 text-slate-700 dark:text-slate-300" />
                SSO
              </Button>
              <Button variant="outline" className="h-11 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800">
                <span className="font-bold text-red-500 mr-2">G</span>
                Google
              </Button>
              <Button variant="outline" className="h-11 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800">
                <LayoutDashboard className="w-4 h-4 mr-2 text-blue-500" />
                Microsoft
              </Button>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-4">
              Don't have an account? <a href="#" className="font-medium text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300">Contact your administrator</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
