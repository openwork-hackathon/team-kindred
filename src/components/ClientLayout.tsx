'use client'

import { useState } from 'react'
import { Header } from './layout/Header'
import { Sidebar } from './layout/Sidebar'
import { PanelLeftOpen } from 'lucide-react'

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [agentMode, setAgentMode] = useState(false) // This could be global state later

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex flex-col">
      {/* Agent Mode Banner */}
      {agentMode && (
        <div className="bg-green-500/10 border-b border-green-500/30 py-2 px-4 flex items-center justify-center gap-2 text-green-500 text-xs font-medium">
          <span>Bot</span>
          <span>Agent Mode Active — AI agents can now operate on your behalf</span>
        </div>
      )}

      {/* Header */}
      <Header />

      {/* Main Layout */}
      <div className="flex flex-1 pt-0">
        {/* Sidebar */}
        <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
        
        {/* Expand Button (when sidebar collapsed) */}
        {sidebarCollapsed && (
          <button 
            onClick={() => setSidebarCollapsed(false)}
            className="fixed left-4 top-[80px] z-40 p-2 bg-[#111113] border border-[#1f1f23] rounded-lg text-white hover:border-purple-500 transition-colors shadow-lg"
          >
            <PanelLeftOpen className="w-5 h-5" />
          </button>
        )}

        {/* Main Content */}
        <main 
          className={`flex-1 transition-all duration-300 ease-in-out ${
            sidebarCollapsed ? 'ml-0' : 'md:ml-[260px]'
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
