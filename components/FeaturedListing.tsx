"use client"

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Star } from 'lucide-react'

interface FeaturedListingProps {
  gigId: string
  currentPrice?: number
}

export default function FeaturedListing({ gigId, currentPrice = 0 }: FeaturedListingProps) {
  const [loading, setLoading] = useState(false)
  const [selectedDuration, setSelectedDuration] = useState(1)
  const router = useRouter()

  const pricing: Record<number, number> = {
    1: 5, // $5 per day
    3: 12, // $12 for 3 days
    7: 25, // $25 for 7 days
  }

  const handleFeature = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login?redirect=/gigs/' + gigId)
        return
      }

      // Here you would typically integrate with a payment processor
      // For now, we'll just create the featured listing
      const { error } = await supabase
        .from('featured_listings')
        .insert({
          gig_id: gigId,
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + selectedDuration * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active',
        })

      if (error) throw error

      router.refresh()
    } catch (error) {
      console.error('Error featuring listing:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white/5 rounded-lg p-6 border border-white/10">
      <div className="flex items-center gap-2 mb-4">
        <Star className="h-5 w-5 text-yellow-400" />
        <h3 className="text-lg font-semibold text-white">Feature Your Listing</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Duration
          </label>
          <select
            value={selectedDuration}
            onChange={(e) => setSelectedDuration(Number(e.target.value))}
            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value={1}>1 Day - ${pricing[1]}</option>
            <option value={3}>3 Days - ${pricing[3]}</option>
            <option value={7}>7 Days - ${pricing[7]}</option>
          </select>
        </div>

        <div className="bg-black/50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-400 mb-2">Benefits</h4>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>• Priority placement in search results</li>
            <li>• Featured section on homepage</li>
            <li>• Highlighted in email newsletters</li>
            <li>• Increased visibility and engagement</li>
          </ul>
        </div>

        <button
          onClick={handleFeature}
          disabled={loading}
          className="w-full bg-purple-600 text-white rounded-lg px-4 py-2 font-semibold hover:bg-purple-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : `Feature for $${pricing[selectedDuration]}`}
        </button>
      </div>
    </div>
  )
} 