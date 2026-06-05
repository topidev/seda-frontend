'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  GraduationCap,
  Home,
  BookOpen,
  Users,
  UserSquare,
  User,
  Monitor,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { useTeacher } from '@/hooks/useTeacher'
import Image from 'next/image'

const navItems = [
  { href: '/dashboard', label: 'Inicio', icon: Home },
  { href: '/dashboard/classroom', label: 'Mis Clases', icon: Monitor },
  { href: '/dashboard/schools', label: 'Escuelas', icon: GraduationCap },
  { href: '/dashboard/subjects', label: 'Materias', icon: BookOpen },
  { href: '/dashboard/groups', label: 'Grupos', icon: Users },
  { href: '/dashboard/students', label: 'Alumnos', icon: UserSquare },
]

export default function AppSidebar() {
  const pathname = usePathname()
  const { data: teacher } = useTeacher()
  const { setOpenMobile } = useSidebar()

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  const handleNavClick = () => {
    setOpenMobile(false)
  }

  return (
    <Sidebar>
      {/* Logo */}
      <SidebarHeader>
        <div className="flex items-center gap-3 px-2 py-4">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            <GraduationCap size={16} color="white" />
          </div>
          <span
            className="text-lg font-semibold"
            style={{
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-geist)',
            }}
          >
            SEDA
          </span>
        </div>
      </SidebarHeader>

      {/* Navegación */}
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} className="w-full" onClick={handleNavClick}>
                <SidebarMenuButton className='cursor-pointer' isActive={isActive(item.href)}>
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      {/* Perfil abajo */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/dashboard/profile" className="w-full" onClick={handleNavClick}>
              <SidebarMenuButton isActive={pathname === '/dashboard/profile'}>
                {teacher?.photo ? (
                  <Image
                    src={teacher.photo}
                    alt={teacher.name}
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                ) : (
                  <User size={18} />
                )}
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {teacher?.name} {teacher?.lastName}
                  </span>
                  <span
                    className="text-xs"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {teacher?.email}
                  </span>
                </div>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}