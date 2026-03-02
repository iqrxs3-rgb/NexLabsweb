'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, LogOut, Trash2 } from 'lucide-react'

interface Project {
  id: string
  name: string
  description: string | null
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDesc, setNewProjectDesc] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('chat')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects')
      if (res.ok) {
        const data = await res.json()
        setProjects(data)
        if (data.length > 0 && !selectedProject) {
          setSelectedProject(data[0])
        }
      }
    } catch (error) {
      console.error('Fetch projects error:', error)
    }
  }

  const createProject = async () => {
    if (!newProjectName.trim()) return
    setLoading(true)

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProjectName,
          description: newProjectDesc,
        }),
      })

      if (res.ok) {
        const newProject = await res.json()
        setProjects([newProject, ...projects])
        setSelectedProject(newProject)
        setNewProjectName('')
        setNewProjectDesc('')
        setDialogOpen(false)
      }
    } catch (error) {
      console.error('Create project error:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteProject = async (id: string) => {
    if (!confirm('Delete this project?')) return

    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' })
      if (res.ok) {
        const newProjects = projects.filter((p) => p.id !== id)
        setProjects(newProjects)
        if (selectedProject?.id === id) {
          setSelectedProject(newProjects[0] || null)
        }
      }
    } catch (error) {
      console.error('Delete project error:', error)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-[#0F0F0F] flex">
      {/* Sidebar */}
      <div className="w-64 border-r border-white/10 flex flex-col">
        <div className="p-4 border-b border-white/10">
          <h1 className="text-xl font-bold text-white">NexLabs</h1>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-400">Projects</h2>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="ghost">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New Project</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Project name"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                  />
                  <Input
                    placeholder="Description (optional)"
                    value={newProjectDesc}
                    onChange={(e) => setNewProjectDesc(e.target.value)}
                  />
                  <Button onClick={createProject} disabled={loading} className="w-full">
                    {loading ? 'Creating...' : 'Create'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-2">
            {projects.map((project) => (
              <div
                key={project.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors group ${
                  selectedProject?.id === project.id
                    ? 'bg-primary/10 border border-primary/20'
                    : 'hover:bg-white/5'
                }`}
                onClick={() => setSelectedProject(project)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {project.name}
                    </p>
                    {project.description && (
                      <p className="text-xs text-gray-400 truncate">
                        {project.description}
                      </p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="opacity-0 group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteProject(project.id)
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-white/10">
          <div className="mb-3">
            <p className="text-sm font-medium text-white">{session.user?.name}</p>
            <Badge variant="secondary" className="mt-1">Free</Badge>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => signOut({ callbackUrl: '/login' })}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {selectedProject ? (
          <>
            <div className="border-b border-white/10 p-4">
              <h2 className="text-lg font-semibold text-white mb-4">
                {selectedProject.name}
              </h2>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="chat">Chat</TabsTrigger>
                  <TabsTrigger value="code">Code</TabsTrigger>
                  <TabsTrigger value="images">Images</TabsTrigger>
                  <TabsTrigger value="voice">Voice</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="flex-1 overflow-hidden">
              {children}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-400">Create or select a project to get started</p>
          </div>
        )}
      </div>
    </div>
  )
}