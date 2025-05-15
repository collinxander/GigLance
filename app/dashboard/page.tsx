"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Briefcase,
  Search,
  Bell,
  MessageSquare,
  User,
  Settings,
  LogOut,
  Star,
  Clock,
  DollarSign,
  MapPin,
  Filter,
  ChevronDown,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("discover")

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="h-6 w-6 text-purple-600" />
              <span className="font-bold text-xl">GigLance</span>
            </div>

            <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
              <div className="relative w-full">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input placeholder="Search for gigs, skills, or people" className="pl-8" />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </Button>

              <Button variant="ghost" size="icon">
                <MessageSquare className="h-5 w-5" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder.svg?height=32&width=32" alt="@username" />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">John Doe</p>
                      <p className="text-xs leading-none text-gray-500">john.doe@example.com</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="container mx-auto px-4 py-6">
          <Tabs defaultValue="discover" className="space-y-6" onValueChange={setActiveTab}>
            <div className="flex justify-between items-center">
              <TabsList>
                <TabsTrigger value="discover">Discover</TabsTrigger>
                <TabsTrigger value="applied">Applied</TabsTrigger>
                <TabsTrigger value="saved">Saved</TabsTrigger>
              </TabsList>

              {activeTab === "discover" && (
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        Sort by <ChevronDown className="h-4 w-4 ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Newest first</DropdownMenuItem>
                      <DropdownMenuItem>Highest paying</DropdownMenuItem>
                      <DropdownMenuItem>Best match</DropdownMenuItem>
                      <DropdownMenuItem>Deadline (soonest)</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>

            <TabsContent value="discover" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-4">
                  <h2 className="text-xl font-bold">Recommended for you</h2>

                  {/* Gig Cards */}
                  {[1, 2, 3, 4, 5].map((gig) => (
                    <Card key={gig} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">Video Editor for YouTube Channel</CardTitle>
                            <CardDescription className="flex items-center gap-1 mt-1">
                              <span>TechTube Media</span>
                              <span className="text-gray-300">•</span>
                              <MapPin className="h-3 w-3" />
                              <span>Remote</span>
                            </CardDescription>
                          </div>
                          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">$25-35/hr</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <p className="text-sm text-gray-600">
                          Looking for a skilled video editor to help with our tech review channel. Must be proficient in
                          Adobe Premiere Pro and After Effects. This is an ongoing part-time position with flexible
                          hours.
                        </p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          <Badge variant="outline" className="text-xs">
                            Video Editing
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Adobe Premiere
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            After Effects
                          </Badge>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between pt-2">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>Posted 2 days ago</span>
                          </div>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 mr-1 text-yellow-400" />
                            <span>4.8 (24 reviews)</span>
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

                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Profile Completion</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progress</span>
                            <span className="font-medium">75%</span>
                          </div>
                          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="bg-purple-600 h-full rounded-full" style={{ width: "75%" }}></div>
                          </div>
                        </div>

                        <ul className="space-y-2 text-sm">
                          <li className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                              <svg
                                className="w-3 h-3 text-green-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <span>Basic information</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                              <svg
                                className="w-3 h-3 text-green-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <span>Skills & expertise</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                              <svg
                                className="w-3 h-3 text-green-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <span>Portfolio links</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
                              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                            </div>
                            <span className="text-gray-500">Add payment info</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
                              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                            </div>
                            <span className="text-gray-500">Verify identity</span>
                          </li>
                        </ul>

                        <Button variant="outline" size="sm" className="w-full">
                          Complete Profile
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Your Stats</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <div className="text-purple-600 mb-1">
                            <DollarSign className="h-5 w-5" />
                          </div>
                          <div className="text-2xl font-bold">$0</div>
                          <div className="text-xs text-gray-500">Total Earned</div>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <div className="text-purple-600 mb-1">
                            <Briefcase className="h-5 w-5" />
                          </div>
                          <div className="text-2xl font-bold">0</div>
                          <div className="text-xs text-gray-500">Completed Gigs</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Trending Skills</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Video Editing</span>
                            <span className="text-green-600">+15%</span>
                          </div>
                          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="bg-green-500 h-full rounded-full" style={{ width: "85%" }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Social Media Management</span>
                            <span className="text-green-600">+12%</span>
                          </div>
                          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="bg-green-500 h-full rounded-full" style={{ width: "78%" }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>UI/UX Design</span>
                            <span className="text-green-600">+10%</span>
                          </div>
                          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="bg-green-500 h-full rounded-full" style={{ width: "72%" }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Content Writing</span>
                            <span className="text-green-600">+8%</span>
                          </div>
                          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="bg-green-500 h-full rounded-full" style={{ width: "65%" }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Web Development</span>
                            <span className="text-green-600">+7%</span>
                          </div>
                          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="bg-green-500 h-full rounded-full" style={{ width: "60%" }}></div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="applied">
              <div className="text-center py-12">
                <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Briefcase className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-medium mb-2">No applications yet</h3>
                <p className="text-gray-500 max-w-md mx-auto mb-6">
                  When you apply to gigs, they'll appear here so you can track your applications
                </p>
                <Button asChild className="bg-purple-600 hover:bg-purple-700">
                  <Link href="#discover">Browse Opportunities</Link>
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="saved">
              <div className="text-center py-12">
                <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Star className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-medium mb-2">No saved gigs</h3>
                <p className="text-gray-500 max-w-md mx-auto mb-6">
                  Save gigs you're interested in to come back to them later
                </p>
                <Button asChild className="bg-purple-600 hover:bg-purple-700">
                  <Link href="#discover">Browse Opportunities</Link>
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t py-2">
        <div className="flex justify-around">
          <Button variant="ghost" className="flex flex-col items-center gap-1 h-auto py-1">
            <Briefcase className="h-5 w-5" />
            <span className="text-xs">Discover</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center gap-1 h-auto py-1">
            <MessageSquare className="h-5 w-5" />
            <span className="text-xs">Messages</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center gap-1 h-auto py-1">
            <Bell className="h-5 w-5" />
            <span className="text-xs">Alerts</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center gap-1 h-auto py-1">
            <User className="h-5 w-5" />
            <span className="text-xs">Profile</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
