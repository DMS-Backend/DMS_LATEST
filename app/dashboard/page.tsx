"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSelector } from "react-redux"
import type { RootState } from "@/lib/redux/store"

import { FileText, UserCheck, Clock, ArrowUpRight } from "lucide-react"

export default function DashboardPage() {
  const { user } = useAuth()
  const documents = useSelector((state: RootState) => state.documents.documents)
  const users = useSelector((state: RootState) => state.users.users)
  const [recentDocs, setRecentDocs] = useState<any[]>([])

  useEffect(() => {
    // Get the 5 most recent documents
    const sorted = [...documents]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5)

    setRecentDocs(sorted)
  }, [documents])

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Welcome, {user?.name}</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Total Documents"
          value={documents.length.toString()}
          description="Documents in the system"
          icon={<FileText className="h-5 w-5" />}
        />

        {user?.role === "admin" && (
          <DashboardCard
            title="Total Users"
            value={users.length.toString()}
            description="Registered users"
            icon={<UserCheck className="h-5 w-5" />}
          />
        )}

        <DashboardCard
          title="Recent Activity"
          value={recentDocs.length > 0 ? recentDocs[0].title : "None"}
          description="Last updated document"
          icon={<Clock className="h-5 w-5" />}
        />

        <DashboardCard
          title="Your Role"
          value={user?.role || "User"}
          description="System permissions"
          icon={<ArrowUpRight className="h-5 w-5" />}
        />
      </div>

      <h2 className="text-xl font-semibold mt-4">Recent Documents</h2>

      <div className="grid gap-4">
        {recentDocs.length > 0 ? (
          recentDocs.map((doc) => (
            <Card key={doc.id}>
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{doc.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Last updated: {new Date(doc.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {doc.type}
                </span>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-4 text-center">
              <p>No recent documents</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function DashboardCard({
  title,
  value,
  description,
  icon,
}: {
  title: string
  value: string
  description: string
  icon: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
      </CardContent>
    </Card>
  )
}
