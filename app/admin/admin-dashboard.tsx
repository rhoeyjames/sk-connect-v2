"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Users, Search, Download, Shield, UserCheck, UserX } from "lucide-react"

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: "youth" | "sk_official" | "admin"
  age: number
  barangay: string
  municipality?: string
  province?: string
  isActive: boolean
  createdAt: string
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const { toast } = useToast()

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await fetch("/api/admin/users", {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setUsers(data.users || [])
        } else {
          console.error("Failed to fetch users:", response.statusText)
          toast({
            title: "Error",
            description: "Failed to load users",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error fetching users:", error)
        toast({
          title: "Error",
          description: "Failed to connect to server",
          variant: "destructive",
        })
      }
    }

    fetchUsers()
  }, [])

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.barangay.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole = roleFilter === "all" || user.role === roleFilter
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && user.isActive) ||
      (statusFilter === "inactive" && !user.isActive)

    return matchesSearch && matchesRole && matchesStatus
  })

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      })

      if (response.ok) {
        setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, role: newRole as User["role"] } : user)))
        toast({
          title: "Role Updated",
          description: "User role has been successfully updated.",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to update user role",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating role:", error)
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      })
    }
  }

  const handleStatusToggle = async (userId: string) => {
    try {
      const token = localStorage.getItem("token")
      const user = users.find(u => u.id === userId)
      const newStatus = !user?.isActive

      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: newStatus }),
      })

      if (response.ok) {
        setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, isActive: newStatus } : user)))
        toast({
          title: "Status Updated",
          description: "User status has been successfully updated.",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to update user status",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating status:", error)
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      })
    }
  }

  const exportUsers = () => {
    const csv = [
      ["Name", "Email", "Role", "Age", "Barangay", "Status", "Created"],
      ...filteredUsers.map((user) => [
        `${user.firstName} ${user.lastName}`,
        user.email,
        user.role,
        user.age.toString(),
        user.barangay,
        user.isActive ? "Active" : "Inactive",
        user.createdAt,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "skconnect-users.csv"
    a.click()
    window.URL.revokeObjectURL(url)

    toast({
      title: "Export Complete",
      description: "User data has been exported to CSV.",
    })
  }

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter((u) => u.isActive).length,
    youthUsers: users.filter((u) => u.role === "youth").length,
    skOfficials: users.filter((u) => u.role === "sk_official").length,
    admins: users.filter((u) => u.role === "admin").length,
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="h-8 w-8 text-red-600" />
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-2">Manage users, events, and system settings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.activeUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Youth</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.youthUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">SK Officials</CardTitle>
              <Shield className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.skOfficials}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admins</CardTitle>
              <Shield className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.admins}</div>
            </CardContent>
          </Card>
        </div>

        {/* User Management */}
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>Manage user accounts, roles, and permissions</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="youth">Youth</SelectItem>
                  <SelectItem value="sk_official">SK Official</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={exportUsers} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>

            {/* Users Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.firstName} {user.lastName}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Select value={user.role} onValueChange={(value) => handleRoleChange(user.id, value)}>
                          <SelectTrigger className="w-[130px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="youth">Youth</SelectItem>
                            <SelectItem value="sk_official">SK Official</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>{user.age}</TableCell>
                      <TableCell>{user.barangay}</TableCell>
                      <TableCell>
                        <Badge variant={user.isActive ? "default" : "secondary"}>
                          {user.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => handleStatusToggle(user.id)}>
                          {user.isActive ? (
                            <>
                              <UserX className="h-4 w-4 mr-1" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <UserCheck className="h-4 w-4 mr-1" />
                              Activate
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-8 text-gray-500">No users found matching your criteria.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
