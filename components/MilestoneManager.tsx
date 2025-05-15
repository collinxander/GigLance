"use client"

import { useState } from 'react'
import { usePayment } from '@/components/providers/PaymentProvider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format } from 'date-fns'
import { Calendar as CalendarIcon, Plus, CheckCircle2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MilestoneManagerProps {
  gigId: string
  isClient: boolean
}

export default function MilestoneManager({ gigId, isClient }: MilestoneManagerProps) {
  const { milestones, loading, error, createMilestone } = usePayment()
  const [newMilestone, setNewMilestone] = useState({
    title: '',
    description: '',
    amount: '',
    due_date: null as Date | null,
  })
  const [isAdding, setIsAdding] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMilestone.title || !newMilestone.amount) return

    try {
      await createMilestone({
        gig_id: gigId,
        title: newMilestone.title,
        description: newMilestone.description,
        amount: parseFloat(newMilestone.amount),
        due_date: newMilestone.due_date?.toISOString(),
      })

      setNewMilestone({
        title: '',
        description: '',
        amount: '',
        due_date: null,
      })
      setIsAdding(false)
    } catch (err) {
      console.error('Failed to create milestone:', err)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500">Completed</Badge>
      case 'processing':
        return <Badge className="bg-blue-500">Processing</Badge>
      case 'failed':
        return <Badge className="bg-red-500">Failed</Badge>
      default:
        return <Badge className="bg-gray-500">Pending</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Project Milestones</h2>
        {isClient && (
          <Button onClick={() => setIsAdding(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Milestone
          </Button>
        )}
      </div>

      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Milestone</CardTitle>
            <CardDescription>Create a new milestone for this project</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="title">Title</label>
                <Input
                  id="title"
                  value={newMilestone.title}
                  onChange={(e) => setNewMilestone(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter milestone title"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="description">Description</label>
                <Textarea
                  id="description"
                  value={newMilestone.description}
                  onChange={(e) => setNewMilestone(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter milestone description"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="amount">Amount ($)</label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={newMilestone.amount}
                  onChange={(e) => setNewMilestone(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="Enter milestone amount"
                  required
                />
              </div>
              <div className="space-y-2">
                <label>Due Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !newMilestone.due_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newMilestone.due_date ? (
                        format(newMilestone.due_date, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newMilestone.due_date || undefined}
                      onSelect={(date: Date | null) => {
                        if (date) {
                          setNewMilestone(prev => ({ ...prev, due_date: date }))
                        }
                      }}
                      initialFocus
                      disabled={false}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Milestone'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {error && (
        <div className="flex items-center gap-2 text-red-500">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid gap-4">
        {milestones.map((milestone) => (
          <Card key={milestone.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{milestone.title}</CardTitle>
                  <CardDescription className="mt-1">
                    {milestone.description}
                  </CardDescription>
                </div>
                {getStatusBadge(milestone.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Amount:</span>
                  <span className="ml-2">${milestone.amount}</span>
                </div>
                {milestone.due_date && (
                  <div>
                    <span className="font-medium">Due Date:</span>
                    <span className="ml-2">
                      {format(new Date(milestone.due_date), "PPP")}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
            {milestone.status === 'pending' && isClient && (
              <CardFooter>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    // Handle milestone payment
                  }}
                >
                  Pay Milestone
                </Button>
              </CardFooter>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
} 