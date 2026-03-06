'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Play, Trash2 } from 'lucide-react'
import Editor from '@monaco-editor/react'

interface CodeFile {
  id: string
  name: string
  language: string
  content: string
}

export default function CodeTab() {
  const [files, setFiles] = useState<CodeFile[]>([])
  const [selectedFile, setSelectedFile] = useState<CodeFile | null>(null)
  const [code, setCode] = useState('')
  const [output, setOutput] = useState('')
  const [running, setRunning] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newFileName, setNewFileName] = useState('')
  const [newFileLanguage, setNewFileLanguage] = useState('python')

  useEffect(() => {
    fetchFiles()
  }, [])

  useEffect(() => {
    if (selectedFile) {
      setCode(selectedFile.content)
    }
  }, [selectedFile])

  const fetchFiles = async () => {
    const projectId = getSelectedProjectId()
    if (!projectId) return

    try {
      const res = await fetch(`/api/code/files?projectId=${projectId}`)
      if (res.ok) {
        const data = await res.json()
        setFiles(data)
        if (data.length > 0 && !selectedFile) {
          setSelectedFile(data[0])
        }
      }
    } catch (error) {
      console.error('Fetch files error:', error)
    }
  }

  const createFile = async () => {
    if (!newFileName.trim()) return
    const projectId = getSelectedProjectId()
    if (!projectId) return

    try {
      const res = await fetch('/api/code/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          name: newFileName,
          language: newFileLanguage,
          content: '',
        }),
      })

      if (res.ok) {
        const newFile = await res.json()
        setFiles([newFile, ...files])
        setSelectedFile(newFile)
        setNewFileName('')
        setDialogOpen(false)
      }
    } catch (error) {
      console.error('Create file error:', error)
    }
  }

  const deleteFile = async (id: string) => {
    if (!confirm('Delete this file?')) return

    try {
      const res = await fetch(`/api/code/files/${id}`, { method: 'DELETE' })
      if (res.ok) {
        const newFiles = files.filter((f) => f.id !== id)
        setFiles(newFiles)
        if (selectedFile?.id === id) {
          setSelectedFile(newFiles[0] || null)
        }
      }
    } catch (error) {
      console.error('Delete file error:', error)
    }
  }

  const saveFile = async () => {
    if (!selectedFile) return

    try {
      await fetch(`/api/code/files/${selectedFile.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: code }),
      })
    } catch (error) {
      console.error('Save file error:', error)
    }
  }

  const runCode = async () => {
    if (!selectedFile || running) return
    setRunning(true)
    setOutput('Running...')

    try {
      await saveFile()

      const res = await fetch('/api/code/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language: selectedFile.language,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setOutput(data.output || 'No output')
      } else {
        setOutput(`Error: ${data.error}`)
      }
    } catch (error) {
      setOutput(`Error: ${error}`)
    } finally {
      setRunning(false)
    }
  }

  const getSelectedProjectId = () => {
    return localStorage.getItem('selectedProjectId') || ''
  }

  // RTL support: adjust editor container direction based on document direction
  const [isRTL, setIsRTL] = useState(false)
  useEffect(() => {
    setIsRTL(typeof document !== 'undefined' && document.documentElement.dir === 'rtl')
  }, [])
  return (
    <div className="h-full flex">
      <div className="w-64 border-r border-white/10 flex flex-col p-4">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="mb-4">
              <Plus className="h-4 w-4 mr-2" />
              New File
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Code File</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="File name (e.g., main.py)"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
              />
              <Select value={newFileLanguage} onValueChange={setNewFileLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={createFile} className="w-full">
                Create
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <div className="flex-1 overflow-y-auto space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              className={`p-3 rounded-lg cursor-pointer group ${
                selectedFile?.id === file.id
                  ? 'bg-primary/10 border border-primary/20'
                  : 'hover:bg-white/5'
              }`}
              onClick={() => setSelectedFile(file)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{file.name}</p>
                  <p className="text-xs text-gray-400">{file.language}</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="opacity-0 group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteFile(file.id)
                  }}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {selectedFile ? (
          <>
            <div className="border-b border-white/10 p-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">{selectedFile.name}</h3>
              <div className="flex gap-2">
                <Button onClick={saveFile} variant="outline">
                  Save
                </Button>
                <Button onClick={runCode} disabled={running}>
                  <Play className="h-4 w-4 mr-2" />
                  {running ? 'Running...' : 'Run'}
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
              <Editor
                height="100%"
                language={selectedFile.language}
                theme="vs-dark"
                value={code}
                onChange={(value) => setCode(value || '')}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                }}
              />
            </div>

            <div className="h-48 border-t border-white/10 bg-black p-4 overflow-y-auto">
              <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap">
                {output || 'Output will appear here...'}
              </pre>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-400">Create or select a file to get started</p>
          </div>
        )}
      </div>
    </div>
  )
}
