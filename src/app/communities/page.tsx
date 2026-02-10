'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { Users, TrendingUp, MessageSquare, Award } from 'lucide-react';

interface Community {
  id: string;
  name: string;
  category: string;
  description: string;
  memberCount: number;
  postCount: number;
  avatar?: string;
}

// Mock communities
const MOCK_COMMUNITIES: Community[] = [
  {
    id: 'defi-main',
    name: 'k/defi',
    category: 'DeFi',
    description: 'Discuss DeFi protocols, liquidity pools, and yield strategies',
    memberCount: 1250,
    postCount: 3421,
    avatar: '💰',
  },
  {
    id: 'perp-dex',
    name: 'k/perp-dex',
    category: 'Perpetuals',
    description: 'Perpetual DEX trading, leverage strategies, and liquidation analysis',
    memberCount: 892,
    postCount: 2156,
    avatar: '📈',
  },
  {
    id: 'prediction',
    name: 'k/prediction',
    category: 'Prediction Markets',
    description: 'Polymarket, Manifold, and other prediction market discussions',
    memberCount: 567,
    postCount: 1843,
    avatar: '📊',
  },
  {
    id: 'ai',
    name: 'k/ai',
    category: 'AI & Agents',
    description: 'AI agents, automation, and autonomous trading strategies',
    memberCount: 734,
    postCount: 987,
    avatar: '🤖',
  },
  {
    id: 'memecoin',
    name: 'k/memecoin',
    category: 'Memecoins',
    description: 'Memecoin launches, community projects, and moon shots',
    memberCount: 2103,
    postCount: 5467,
    avatar: '🐕',
  },
  {
    id: 'infra',
    name: 'k/infra',
    category: 'Infrastructure',
    description: 'L1s, L2s, sidechains, and blockchain infrastructure',
    memberCount: 445,
    postCount: 1256,
    avatar: '🏗️',
  },
  {
    id: 'gourmet',
    name: 'k/gourmet',
    category: 'Gourmet (Restaurants)',
    description: 'Restaurant reviews, food recommendations, and dining experiences',
    memberCount: 89,
    postCount: 342,
    avatar: '🍽️',
  },
];

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState<Community[]>(MOCK_COMMUNITIES);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'members' | 'posts' | 'name'>('members');
  const joinedCommunityIds = useStore(state => state.joinedCommunityIds);

  // Filter and sort communities
  const filteredCommunities = communities
    .filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'members':
          return b.memberCount - a.memberCount;
        case 'posts':
          return b.postCount - a.postCount;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen bg-[#0d0d0e]">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-3">
            Explore Communities
          </h1>
          <p className="text-lg text-[#adadb0]">
            Join conversations about DeFi, predictions, AI agents, and more
          </p>
        </div>

        {/* Search & Filter */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search communities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 bg-[#111113] border border-[#1f1f23] rounded-lg text-white placeholder-[#6b6b70] focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setSortBy('members')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                sortBy === 'members'
                  ? 'bg-purple-600 text-white'
                  : 'bg-[#111113] text-[#adadb0] border border-[#1f1f23] hover:bg-[#1a1a1d]'
              }`}
            >
              Most Members
            </button>
            <button
              onClick={() => setSortBy('posts')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                sortBy === 'posts'
                  ? 'bg-purple-600 text-white'
                  : 'bg-[#111113] text-[#adadb0] border border-[#1f1f23] hover:bg-[#1a1a1d]'
              }`}
            >
              Most Posts
            </button>
            <button
              onClick={() => setSortBy('name')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                sortBy === 'name'
                  ? 'bg-purple-600 text-white'
                  : 'bg-[#111113] text-[#adadb0] border border-[#1f1f23] hover:bg-[#1a1a1d]'
              }`}
            >
              Name (A-Z)
            </button>
          </div>
        </div>

        {/* Communities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCommunities.map((community) => {
            const isJoined = joinedCommunityIds.includes(community.id);
            return (
              <Link
                key={community.id}
                href={`/k/${community.category.toLowerCase().replace(' ', '-')}/${community.id}`}
              >
                <div className="h-full p-6 bg-[#111113] border border-[#1f1f23] rounded-xl hover:border-purple-500/50 hover:bg-[#1a1a1d] transition-all cursor-pointer">
                  {/* Avatar & Header */}
                  <div className="mb-4">
                    <div className="text-5xl mb-3">{community.avatar}</div>
                    <h2 className="text-xl font-bold text-white mb-1">
                      {community.name}
                    </h2>
                    <p className="text-sm text-[#6b6b70]">
                      {community.category}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-[#adadb0] text-sm mb-4 line-clamp-2">
                    {community.description}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 mb-4 pb-4 border-t border-[#1f1f23]">
                    <div className="pt-4">
                      <div className="flex items-center gap-2 text-[#6b6b70] text-sm mb-1">
                        <Users className="w-4 h-4" />
                        <span>Members</span>
                      </div>
                      <p className="text-lg font-bold text-white">
                        {community.memberCount.toLocaleString()}
                      </p>
                    </div>
                    <div className="pt-4">
                      <div className="flex items-center gap-2 text-[#6b6b70] text-sm mb-1">
                        <MessageSquare className="w-4 h-4" />
                        <span>Posts</span>
                      </div>
                      <p className="text-lg font-bold text-white">
                        {community.postCount.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Join Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      // Join logic would go here
                    }}
                    className={`w-full py-2 rounded-lg font-semibold transition-colors ${
                      isJoined
                        ? 'bg-purple-500/20 text-purple-400 cursor-default'
                        : 'bg-purple-600 hover:bg-purple-700 text-white'
                    }`}
                  >
                    {isJoined ? '✓ Joined' : 'Join'}
                  </button>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredCommunities.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[#6b6b70] text-lg">
              No communities found matching "{searchTerm}"
            </p>
          </div>
        )}

        {/* Featured Section */}
        <div className="mt-16 pt-12 border-t border-[#1f1f23]">
          <h3 className="text-2xl font-bold text-white mb-6">
            💡 Tips for Getting Started
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-[#111113] border border-[#1f1f23] rounded-lg">
              <Award className="w-8 h-8 text-purple-400 mb-3" />
              <h4 className="font-bold text-white mb-2">Earn DRONE</h4>
              <p className="text-[#adadb0] text-sm">
                Post high-quality comments and accurate predictions to earn DRONE rewards
              </p>
            </div>
            <div className="p-6 bg-[#111113] border border-[#1f1f23] rounded-lg">
              <TrendingUp className="w-8 h-8 text-green-400 mb-3" />
              <h4 className="font-bold text-white mb-2">Build Reputation</h4>
              <p className="text-[#adadb0] text-sm">
                Climb the leaderboard and unlock higher tier benefits as you grow
              </p>
            </div>
            <div className="p-6 bg-[#111113] border border-[#1f1f23] rounded-lg">
              <Users className="w-8 h-8 text-blue-400 mb-3" />
              <h4 className="font-bold text-white mb-2">Join Community</h4>
              <p className="text-[#adadb0] text-sm">
                Connect with other enthusiasts, share insights, and collaborate
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
