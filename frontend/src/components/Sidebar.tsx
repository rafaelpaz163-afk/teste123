import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  PawPrint,
  Calendar,
  BookOpen,
  Stethoscope,
  BarChart3,
  Target,
  AlertTriangle,
  Settings,
  UserCog,
  X,
  LogOut,
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { cn } from '../utils/cn'

interface SidebarProps {
  open: boolean
  setOpen: (open: boolean) => void
  userRole?: string
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Conversas', href: '/conversations', icon: MessageSquare },
  { name: 'Tutores', href: '/tutors', icon: Users },
  { name: 'Pets', href: '/pets', icon: PawPrint },
  { name: 'Agendamentos', href: '/appointments', icon: Calendar },
  { name: 'Base de Conhecimento', href: '/knowledge', icon: BookOpen },
  { name: 'Serviços', href: '/services', icon: Stethoscope },
  { name: 'Relatórios', href: '/reports', icon: BarChart3 },
  { name: 'Leads', href: '/leads', icon: Target },
  { name: 'Emergências', href: '/emergencies', icon: AlertTriangle },
]

const adminNavigation = [
  { name: 'Configurações', href: '/settings', icon: Settings },
  { name: 'Usuários', href: '/users', icon: UserCog },
]

export default function Sidebar({ open, setOpen, userRole }: SidebarProps) {
  const location = useLocation()
  const { logout } = useAuthStore()

  const allNav = userRole === 'ADMIN' 
    ? [...navigation, ...adminNavigation] 
    : navigation

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div 
          className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-200 ease-in-out",
        open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <PawPrint className="h-8 w-8 text-blue-600" />
            <span className="text-lg font-bold text-gray-900">VetClinic AI</span>
          </div>
          <button 
            className="lg:hidden p-2 rounded-md hover:bg-gray-100"
            onClick={() => setOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {allNav.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-blue-50 text-blue-700" 
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive ? "text-blue-600" : "text-gray-400")} />
                {item.name}
              </NavLink>
            )
          })}
        </nav>

        <div className="p-3 border-t border-gray-200">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2 w-full rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Sair
          </button>
        </div>
      </div>
    </>
  )
}