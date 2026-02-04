'use client'

import { useState } from 'react'
import { useStore, Project } from '@/lib/store'
import { X, Loader2, Coins } from 'lucide-react'

interface CreateReviewModalProps {
  isOpen: boolean
  onClose: () => void
  projectId?: string // Optional pre-selected project
}

export function CreateReviewModal({ isOpen, onClose, projectId }: CreateReviewModalProps) {
  const [selectedProject, setSelectedProject] = useState(projectId || '')
  const [content, setContent] = useState('')
  const [rating, setRating] = useState(5)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const projects = useStore(state => state.projects)
  const addReview = useStore(state => state.addReview)
  const userBalance = useStore(state => state.userStakedBalance)
  
  const STAKE_REQUIRED = 50

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    // Simulate network delay
    await new Promise(r => setTimeout(r, 1000))

    const project = projects.find(p => p.id === selectedProject)
    if (!project) {
      setError('Please select a valid project')
      setIsSubmitting(false)
      return
    }

    const success = addReview({
      projectId: project.id,
      projectName: project.name,
      author: 'You', // Mock user
      content,
      rating,
      stakedAmount: STAKE_REQUIRED
    })

    if (success) {
      setContent('')
      onClose()
      alert(`Review published! ${STAKE_REQUIRED} $OPENWORK staked.`)
    } else {
      setError(`Insufficient $OPENWORK balance. You have ${userBalance}, need ${STAKE_REQUIRED}.`)
    }
    setIsSubmitting(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-[#111113] border border-[#1f1f23] rounded-2xl p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-[#6b6b70] hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold mb-1">Write a Review</h2>
        <p className="text-sm text-[#6b6b70] mb-6">Stake tokens to publish your prediction.</p>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-[#6b6b70] mb-2">Project</label>
            <select 
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full bg-[#1a1a1d] border border-[#2a2a2e] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
            >
              <option value="">Select a project...</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.ticker})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-[#6b6b70] mb-2">Analysis</label>
            <textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-32 bg-[#1a1a1d] border border-[#2a2a2e] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500 resize-none"
              placeholder="Share your analysis and prediction..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-[#6b6b70] mb-2">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRating(r)}
                  className={`w-10 h-10 rounded-lg font-bold transition-colors ${
                    rating === r 
                      ? 'bg-purple-500 text-white' 
                      : 'bg-[#1a1a1d] text-[#6b6b70] hover:bg-[#2a2a2e]'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-[#1f1f23] flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-[#adadb0]">
              <Coins className="w-4 h-4 text-yellow-500" />
              <span>Stake Required: <span className="font-bold text-white">{STAKE_REQUIRED} $KIND</span></span>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Publish Review
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
