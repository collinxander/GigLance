"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Briefcase, Search, MapPin, Clock, Star, Filter, X } from "lucide-react"

export default function DiscoverPage() {
  const [priceRange, setPriceRange] = useState([20, 50])
  const [selectedSkills, setSelectedSkills] = useState<string[]>(["Video Editing", "Graphic Design"])

  const handleRemoveSkill = (skill: string) => {
    setSelectedSkills(selectedSkills.filter((s) => s !== skill))
  }

  const handleClearFilters = () => {
    setSelectedSkills([])
    setPriceRange([0, 100])
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header with search */}
      <header className="bg-white border-b sticky top-0 z-10 py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Briefcase className="h-6 w-6 text-purple-600" />
              <span className="font-bold text-xl">GigLance</span>
            </Link>

            <div className="hidden md:flex items-center flex-1 max-w-xl mx-4">
              <div className="relative w-full">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input placeholder="Search for gigs, skills, or keywords" className="pl-9 py-6" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Filters Sidebar */}
          <div className="md:w-1/4 space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">Filters</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-purple-600 h-auto p-0 text-sm"
                  onClick={handleClearFilters}
                >
                  Clear all
                </Button>
              </div>

              {selectedSkills.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-2">Applied filters:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedSkills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                        {skill}
                        <button onClick={() => handleRemoveSkill(skill)}>
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="type">
                  <AccordionTrigger className="text-sm font-medium">Type of Work</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Switch id="freelance" />
                        <Label htmlFor="freelance">Freelance</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="part-time" />
                        <Label htmlFor="part-time">Part-time</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="one-time" />
                        <Label htmlFor="one-time">One-time gig</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="internship" />
                        <Label htmlFor="internship">Internship</Label>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="location">
                  <AccordionTrigger className="text-sm font-medium">Location</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Switch id="remote" defaultChecked />
                        <Label htmlFor="remote">Remote</Label>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input id="city" placeholder="e.g. Austin, TX" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="radius">Distance</Label>
                        <Select defaultValue="10">
                          <SelectTrigger id="radius">
                            <SelectValue placeholder="Select distance" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5">Within 5 miles</SelectItem>
                            <SelectItem value="10">Within 10 miles</SelectItem>
                            <SelectItem value="25">Within 25 miles</SelectItem>
                            <SelectItem value="50">Within 50 miles</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="pay">
                  <AccordionTrigger className="text-sm font-medium">Pay Range</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <div>
                        <Slider
                          defaultValue={[20, 50]}
                          max={100}
                          step={1}
                          value={priceRange}
                          onValueChange={setPriceRange}
                          className="my-6"
                        />
                        <div className="flex items-center justify-between">
                          <span className="text-sm">${priceRange[0]}/hr</span>
                          <span className="text-sm">${priceRange[1]}/hr</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="fixed-price" />
                        <Label htmlFor="fixed-price">Include fixed-price gigs</Label>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="skills">
                  <AccordionTrigger className="text-sm font-medium">Skills</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Switch id="video-editing" checked={selectedSkills.includes("Video Editing")} />
                        <Label htmlFor="video-editing">Video Editing</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="graphic-design" checked={selectedSkills.includes("Graphic Design")} />
                        <Label htmlFor="graphic-design">Graphic Design</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="web-development" />
                        <Label htmlFor="web-development">Web Development</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="content-writing" />
                        <Label htmlFor="content-writing">Content Writing</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="social-media" />
                        <Label htmlFor="social-media">Social Media</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="photography" />
                        <Label htmlFor="photography">Photography</Label>
                      </div>
                      <Button variant="link" size="sm" className="text-purple-600 p-0 h-auto">
                        Show more skills
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="experience">
                  <AccordionTrigger className="text-sm font-medium">Experience Level</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Switch id="entry-level" />
                        <Label htmlFor="entry-level">Entry Level</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="intermediate" defaultChecked />
                        <Label htmlFor="intermediate">Intermediate</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="expert" />
                        <Label htmlFor="expert">Expert</Label>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <Button className="w-full mt-4 bg-purple-600 hover:bg-purple-700">Apply Filters</Button>
            </div>
          </div>

          {/* Gigs List */}
          <div className="md:w-3/4">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-xl font-bold">Discover Opportunities</h1>
              <Select defaultValue="newest">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest first</SelectItem>
                  <SelectItem value="highest-pay">Highest paying</SelectItem>
                  <SelectItem value="best-match">Best match</SelectItem>
                  <SelectItem value="deadline">Deadline (soonest)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              {/* Gig Cards */}
              {[1, 2, 3, 4, 5, 6, 7, 8].map((gig) => (
                <Card key={gig} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">
                          {gig % 2 === 0 ? "Graphic Designer for Social Media" : "Video Editor for YouTube Channel"}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <span>{gig % 2 === 0 ? "CreativeAgency" : "TechTube Media"}</span>
                          <span className="text-gray-300">•</span>
                          <MapPin className="h-3 w-3" />
                          <span>{gig % 3 === 0 ? "Austin, TX" : "Remote"}</span>
                        </CardDescription>
                      </div>
                      <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
                        {gig % 2 === 0 ? "$20-30/hr" : "$25-35/hr"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm text-gray-600">
                      {gig % 2 === 0
                        ? "We're looking for a creative graphic designer to create engaging social media content for our brand. Experience with Instagram and TikTok formats preferred."
                        : "Looking for a skilled video editor to help with our tech review channel. Must be proficient in Adobe Premiere Pro and After Effects. This is an ongoing part-time position with flexible hours."}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {gig % 2 === 0 ? (
                        <>
                          <Badge variant="outline" className="text-xs">
                            Graphic Design
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Social Media
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Photoshop
                          </Badge>
                        </>
                      ) : (
                        <>
                          <Badge variant="outline" className="text-xs">
                            Video Editing
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Adobe Premiere
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            After Effects
                          </Badge>
                        </>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-2">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>
                          Posted {gig} day{gig !== 1 ? "s" : ""} ago
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 mr-1 text-yellow-400" />
                        <span>
                          4.{gig} ({gig * 3} reviews)
                        </span>
                      </div>
                    </div>
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                      Apply Now
                    </Button>
                  </CardFooter>
                </Card>
              ))}

              <div className="flex justify-center pt-4">
                <Button variant="outline">Load More</Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
