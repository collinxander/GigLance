import { NextResponse } from 'next/server'
import { supabase, handleSupabaseError } from '@/lib/supabase'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabase
      .from('gigs')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    const { error: errorMessage, status } = handleSupabaseError(error)
    return NextResponse.json({ error: errorMessage }, { status })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { title, description, budget, category, location, status } = body

    const { data, error } = await supabase
      .from('gigs')
      .update({
        title,
        description,
        budget,
        category,
        location,
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    const { error: errorMessage, status } = handleSupabaseError(error)
    return NextResponse.json({ error: errorMessage }, { status })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabase
      .from('gigs')
      .delete()
      .eq('id', params.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    const { error: errorMessage, status } = handleSupabaseError(error)
    return NextResponse.json({ error: errorMessage }, { status })
  }
} 