"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/utils/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import Header from "@/components/header"
import WaterBackground from "@/components/water-background"

export default function AnalyticsDashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [pageViews, setPageViews] = useState<any[]>([])
  const [ageVerifications, setAgeVerifications] = useState<any[]>([])
  const [userData, setUserData] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          setUser(user)
          fetchAnalyticsData()
        } else {
          router.push("/signin")
        }
      } catch (error) {
        router.push("/signin")
      } finally {
        setLoading(false)
      }
    }

    checkUser()
  }, [router])

  const fetchAnalyticsData = async () => {
    try {
      // Fetch page views
      const { data: pageViewsData } = await supabase
        .from("page_views")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(1000)

      if (pageViewsData) {
        setPageViews(pageViewsData)
      }

      // Fetch age verifications
      const { data: ageVerificationsData } = await supabase
        .from("age_verifications")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(1000)

      if (ageVerificationsData) {
        setAgeVerifications(ageVerificationsData)
      }

      // Fetch user data
      const { data: userDataResult } = await supabase
        .from("user_data")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(1000)

      if (userDataResult) {
        setUserData(userDataResult)
      }
    } catch (error) {
      console.error("Error fetching analytics data:", error)
    }
  }

  // Process data for charts
  const getPageViewsByPath = () => {
    const pathCounts: Record<string, number> = {}

    pageViews.forEach((view) => {
      pathCounts[view.path] = (pathCounts[view.path] || 0) + 1
    })

    return Object.entries(pathCounts)
      .map(([path, count]) => ({
        path: path || "/",
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  }

  const getAgeVerificationStats = () => {
    const verified = ageVerifications.filter((v) => v.verified).length
    const rejected = ageVerifications.filter((v) => !v.verified).length

    return [
      { name: "Verified (21+)", value: verified },
      { name: "Rejected (Under 21)", value: rejected },
    ]
  }

  const getReferrerStats = () => {
    const referrerCounts: Record<string, number> = {}

    pageViews.forEach((view) => {
      const referrer = view.referrer || "direct"
      referrerCounts[referrer] = (referrerCounts[referrer] || 0) + 1
    })

    return Object.entries(referrerCounts)
      .map(([referrer, count]) => ({
        referrer: referrer === "direct" ? "Direct" : new URL(referrer).hostname,
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  }

  const COLORS = ["#ffd6c0", "#a8d1e7", "#ffcbb0", "#97c0d6", "#ffc0a0"]

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-pulse text-3xl text-[#ffd6c0]">Loading...</div>
      </div>
    )
  }

  return (
    <>
      <WaterBackground />
      <Header />
      <div className="page-container">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-[#ffd6c0]">Analytics Dashboard</h1>
            </div>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="pageViews">Page Views</TabsTrigger>
                <TabsTrigger value="ageVerification">Age Verification</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Total Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">{userData.length}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Total Page Views</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">{pageViews.length}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Age Verifications</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">{ageVerifications.length}</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Top Pages</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={getPageViewsByPath()}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis type="category" dataKey="path" width={100} tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Bar dataKey="count" fill="#ffd6c0" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Age Verification Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={getAgeVerificationStats()}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {getAgeVerificationStats().map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="pageViews">
                <Card>
                  <CardHeader>
                    <CardTitle>Page Views Over Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-96">
                      {/* Page views chart would go here */}
                      <p className="text-center text-gray-500">Detailed page view analytics will be displayed here</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Top Referrers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={getReferrerStats()}
                          layout="vertical"
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis type="category" dataKey="referrer" width={100} tick={{ fontSize: 12 }} />
                          <Tooltip />
                          <Bar dataKey="count" fill="#a8d1e7" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="ageVerification">
                <Card>
                  <CardHeader>
                    <CardTitle>Age Verification Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={getAgeVerificationStats()}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {getAgeVerificationStats().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Recent Age Verifications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">Timestamp</th>
                            <th className="text-left p-2">Result</th>
                            <th className="text-left p-2">User Agent</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ageVerifications.slice(0, 10).map((verification, index) => (
                            <tr key={index} className="border-b">
                              <td className="p-2">{new Date(verification.timestamp).toLocaleString()}</td>
                              <td className="p-2">
                                <span
                                  className={`inline-block px-2 py-1 rounded-full text-xs ${verification.verified ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                                >
                                  {verification.verified ? "21+ Verified" : "Under 21"}
                                </span>
                              </td>
                              <td className="p-2 truncate max-w-xs">{verification.user_agent}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  )
}
