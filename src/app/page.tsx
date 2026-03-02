import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Code, MessageSquare, Image, Mic, Brain, Lock } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0F0F0F]">
      {/* Navbar */}
      <nav className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="text-2xl font-bold text-white">NexLabs</div>
            <div className="flex gap-4">
              <Link href="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h1 className="text-6xl font-bold text-white mb-6">
          Your Private AI Workspace
        </h1>
        <p className="text-xl text-gray-400 mb-12 max-w-3xl mx-auto">
          Code, chat, generate images, train models — all in one isolated environment. 
          Built for Arabic developers.
        </p>
        <Link href="/register">
          <Button size="lg" className="text-lg px-8 py-6">
            Get Started Free
          </Button>
        </Link>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <MessageSquare className="h-12 w-12 text-primary mb-4" />
              <CardTitle>AI Chat</CardTitle>
              <CardDescription>
                Powered by Groq's fastest LLM models for instant responses
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Code className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Code Runner</CardTitle>
              <CardDescription>
                Execute Python & JavaScript in isolated Docker containers
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Image className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Image Generation</CardTitle>
              <CardDescription>
                Create stunning images with AI-powered generation
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Mic className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Voice AI</CardTitle>
              <CardDescription>
                Transcribe audio and generate natural speech
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Brain className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Model Training</CardTitle>
              <CardDescription>
                Train and deploy custom AI models
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Lock className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Full Privacy</CardTitle>
              <CardDescription>
                Your data stays private in isolated environments
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Pricing */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h2 className="text-4xl font-bold text-center text-white mb-12">Pricing</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Free</CardTitle>
              <div className="text-4xl font-bold text-white mt-4">$0</div>
              <CardDescription>Perfect to get started</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• 1 project</li>
                <li>• 100 AI messages/month</li>
                <li>• Basic code execution</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pro</CardTitle>
              <div className="text-4xl font-bold text-white mt-4">$12</div>
              <CardDescription>For serious developers</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• 10 projects</li>
                <li>• Unlimited AI messages</li>
                <li>• Advanced features</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Builder</CardTitle>
              <div className="text-4xl font-bold text-white mt-4">$29</div>
              <CardDescription>For teams</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• Unlimited projects</li>
                <li>• Priority support</li>
                <li>• Team collaboration</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Enterprise</CardTitle>
              <div className="text-4xl font-bold text-white mt-4">$199</div>
              <CardDescription>Custom solutions</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• Custom infrastructure</li>
                <li>• Dedicated support</li>
                <li>• SLA guarantee</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center text-gray-400">
          <p>© 2025 Even Projects. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}