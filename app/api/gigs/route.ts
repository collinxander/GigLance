import { NextResponse } from 'next/server'
import { supabase, handleSupabaseError } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const location = searchParams.get('location')
    const status = searchParams.get('status')

    let query = supabase
      .from('gigs')
      .select('*')
      .eq('status', 'open')

    if (category) {
      query = query.eq('category', category)
    }
    if (location) {
      query = query.eq('location', location)
    }
    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    const { error: errorMessage, status } = handleSupabaseError(error)
    return NextResponse.json({ error: errorMessage }, { status })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, description, budget, category, location, client_id } = body

    const { data, error } = await supabase
      .from('gigs')
      .insert([
        {
          title,
          description,
          budget,
          category,
          location,
          client_id,
          status: 'open',
        },
      ])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    const { error: errorMessage, status } = handleSupabaseError(error)
    return NextResponse.json({ error: errorMessage }, { status })
  }
} 