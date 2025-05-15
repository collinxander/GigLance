import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// Mark this route as dynamically rendered
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get subscription status
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan_id')
      .eq('user_id', user.id)
      .single()

    // Get usage metrics
    const [
      { count: gigPosts },
      { count: gigApplications },
      { count: teamMembers }
    ] = await Promise.all([
      supabase
        .from('gigs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id),
      supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id),
      supabase
        .from('team_members')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
    ])

    // Get API request count (if you're tracking this)
    const { count: apiRequests } = await supabase
      .from('api_requests')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours

    return NextResponse.json({
      gigPosts: gigPosts || 0,
      gigApplications: gigApplications || 0,
      teamMembers: teamMembers || 0,
      apiRequests: apiRequests || 0,
      planId: subscription?.plan_id || 'basic'
    })
  } catch (error) {
    console.error('Error fetching usage data:', error)
    return NextResponse.json(
      { error: 'Error fetching usage data' },
      { status: 500 }
    )
  }
} 