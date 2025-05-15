"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, ArrowLeft, Plus, X } from "lucide-react"

export default function PostGigPage() {
  const router = useRouter()
  const [skills, setSkills] = useState<string[]>([])
  const [newSkill, setNewSkill] = useState("")
  const [loading, setLoading] = useState(false)

  const handleAddSkill = () => {
    if (newSkill && !skills.includes(newSkill)) {
      setSkills([...skills, newSkill])
      setNewSkill("")
    }
  }

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      router.push("/dashboard")
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center">
          <Link href="/dashboard" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back to dashboard</span>
          </Link>
          <div className="mx-auto flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-purple-600" />
            <span className="font-bold">Hustl Hub</span>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2">Post a New Gig</h1>
            <p className="text-gray-600">
              Fill out the details below to post your gig and find talented students and creatives
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Gig Details</CardTitle>
                <CardDescription>Provide the basic information about your gig</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Gig Title</Label>
                  <Input id="title" placeholder="e.g. Video Editor for YouTube Channel" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the gig, requirements, and expectations"
                    rows={5}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select required>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="design">Design & Creative</SelectItem>
                        <SelectItem value="development">Development & IT</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="writing">Writing & Translation</SelectItem>
                        <SelectItem value="video">Video & Animation</SelectItem>
                        <SelectItem value="music">Music & Audio</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Type of Work</Label>
                    <Select required>
                      <SelectTrigger id="type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="one-time">One-time project</SelectItem>
                        <SelectItem value="ongoing">Ongoing work</SelectItem>
                        <SelectItem value="part-time">Part-time job</SelectItem>
                        <SelectItem value="internship">Internship</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="skills">Required Skills</Label>
                  <div className="flex gap-2">
                    <Input
                      id="skills"
                      placeholder="e.g. Video Editing, Photoshop, Web Development"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          handleAddSkill()
                        }
                      }}
                    />
                    <Button type="button" onClick={handleAddSkill} variant="outline">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {skills.map((skill) => (
                      <div
                        key={skill}
                        className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="text-purple-800 hover:text-purple-900"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="experience">Experience Level</Label>
                    <Select>
                      <SelectTrigger id="experience">
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entry">Entry Level</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="expert">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deadline">Application Deadline</Label>
                    <Input id="deadline" type="date" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Location & Budget</CardTitle>
                <CardDescription>Specify where the work will be done and your budget</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Location Type</Label>
                  <RadioGroup defaultValue="remote">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="remote" id="remote" />
                      <Label htmlFor="remote">Remote</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="on-site" id="on-site" />
                      <Label htmlFor="on-site">On-site</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="hybrid" id="hybrid" />
                      <Label htmlFor="hybrid">Hybrid</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location (if on-site or hybrid)</Label>
                  <Input id="location" placeholder="e.g. Austin, TX" />
                </div>

                <div className="space-y-2">
                  <Label>Payment Type</Label>
                  <RadioGroup defaultValue="hourly">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="hourly" id="hourly" />
                      <Label htmlFor="hourly">Hourly Rate</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="fixed" id="fixed" />
                      <Label htmlFor="fixed">Fixed Price</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="min-rate">Minimum Rate ($)</Label>
                    <Input id="min-rate" type="number" placeholder="e.g. 20" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max-rate">Maximum Rate ($)</Label>
                    <Input id="max-rate" type="number" placeholder="e.g. 35" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="negotiable" />
                    <label
                      htmlFor="negotiable"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Rate is negotiable
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
                <CardDescription>Provide any other details that might be helpful</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="attachments">Attachments (optional)</Label>
                  <div className="p-6 border-2 border-dashed rounded-lg text-center">
                    <p className="text-sm text-gray-500 mb-2">Drag and drop files or click to browse</p>
                    <Button variant="outline" size="sm">
                      Browse Files
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additional">Additional Notes (optional)</Label>
                  <Textarea
                    id="additional"
                    placeholder="Any other information you'd like to share with applicants"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="terms" required />
                    <label
                      htmlFor="terms"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I agree to Hustl Hub&apos;s terms and conditions
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Button variant="outline" type="button" onClick={() => router.push("/dashboard")}>
                Cancel
              </Button>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700" disabled={loading}>
                {loading ? "Posting..." : "Post Gig"}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
