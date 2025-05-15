import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import PDFDocument from 'pdfkit'

export async function GET(
  req: Request,
  { params }: { params: { paymentId: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get payment details with user information
    const { data: payment } = await supabase
      .from('payments')
      .select(`
        *,
        client:user_id (
          full_name,
          email
        ),
        creative:creative_id (
          full_name,
          email
        )
      `)
      .eq('id', params.paymentId)
      .single()

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }

    // Check if user is authorized to view this receipt
    if (payment.user_id !== user.id && payment.creative_id !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized to view this receipt' },
        { status: 403 }
      )
    }

    // Format the receipt data
    const receipt = {
      id: payment.id,
      created_at: payment.created_at,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      description: payment.description,
      client_name: payment.client.full_name,
      client_email: payment.client.email,
      creative_name: payment.creative.full_name,
      creative_email: payment.creative.email,
    }

    return NextResponse.json(receipt)
  } catch (err: any) {
    console.error('Receipt generation error:', err)
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    )
  }
}

export async function POST(
  req: Request,
  { params }: { params: { paymentId: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get payment details
    const { data: payment } = await supabase
      .from('payments')
      .select(`
        *,
        client:user_id (
          full_name,
          email
        ),
        creative:creative_id (
          full_name,
          email
        )
      `)
      .eq('id', params.paymentId)
      .single()

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }

    // Create PDF receipt
    const doc = new PDFDocument()
    const chunks: Buffer[] = []

    doc.on('data', (chunk) => chunks.push(chunk))
    
    // Add receipt content
    doc.fontSize(20).text('Payment Receipt', { align: 'center' })
    doc.moveDown()
    doc.fontSize(12).text(`Receipt Number: ${payment.id}`)
    doc.text(`Date: ${new Date(payment.created_at).toLocaleDateString()}`)
    doc.moveDown()
    doc.text(`Amount: ${payment.currency} ${payment.amount}`)
    doc.text(`Status: ${payment.status}`)
    doc.moveDown()
    doc.text('From:')
    doc.text(payment.client.full_name)
    doc.text(payment.client.email)
    doc.moveDown()
    doc.text('To:')
    doc.text(payment.creative.full_name)
    doc.text(payment.creative.email)
    doc.moveDown()
    doc.text(`Description: ${payment.description}`)

    doc.end()

    // Convert chunks to buffer
    const pdfBuffer = Buffer.concat(chunks)

    // Store receipt in database
    await supabase
      .from('payment_receipts')
      .insert({
        payment_id: payment.id,
        pdf_data: pdfBuffer.toString('base64'),
        created_at: new Date().toISOString()
      })

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="receipt-${payment.id}.pdf"`
      }
    })
  } catch (err: any) {
    console.error('Receipt generation error:', err)
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    )
  }
} 