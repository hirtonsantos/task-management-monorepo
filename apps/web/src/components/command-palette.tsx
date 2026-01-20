"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { useTasks } from "@/lib/hooks/use-tasks"
import { LayoutDashboard, CheckSquare, BarChart3, FolderOpen, Settings, Plus, Search } from "lucide-react"

const navigationItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tasks", label: "Tarefas", icon: CheckSquare },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/categories", label: "Categorias", icon: FolderOpen },
  { href: "/settings", label: "Configurações", icon: Settings },
]

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { data: tasksData } = useTasks({})

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const runCommand = useCallback((command: () => void) => {
    setOpen(false)
    command()
  }, [])

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Digite um comando ou busque..." />
      <CommandList>
        <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>

        <CommandGroup heading="Ações">
          <CommandItem onSelect={() => runCommand(() => router.push("/tasks?new=true"))}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Tarefa
            <CommandShortcut>N</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/tasks"))}>
            <Search className="mr-2 h-4 w-4" />
            Buscar Tarefas
            <CommandShortcut>/</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Navegação">
          {navigationItems.map((item) => (
            <CommandItem key={item.href} onSelect={() => runCommand(() => router.push(item.href))}>
              <item.icon className="mr-2 h-4 w-4" />
              {item.label}
            </CommandItem>
          ))}
        </CommandGroup>

        {tasksData?.data && tasksData.data.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Tarefas Recentes">
              {tasksData.data.slice(0, 5).map((task) => (
                <CommandItem key={task.id} onSelect={() => runCommand(() => router.push(`/tasks?id=${task.id}`))}>
                  <CheckSquare className="mr-2 h-4 w-4" />
                  <span className="truncate">{task.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  )
}
