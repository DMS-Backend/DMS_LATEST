"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import type { RootState } from "@/lib/redux/store"
import {
  fetchUsers,
  fetchUsersByDepartment,
  createUser,
  updateUser,
  deleteUser,
} from "@/lib/redux/features/users-slice"
import { fetchDepartments } from "@/lib/redux/features/departments-slice"
import { useAuth } from "@/lib/auth-context"
import { useRouter, useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

import { Plus, User, UserCheck, UserX, Pencil, Trash2, Shield, Building } from "lucide-react"

export default function UsersPage() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const departmentFilter = searchParams.get("department")

  const dispatch = useDispatch()
  const { users, loading: usersLoading } = useSelector((state: RootState) => state.users)
  const { departments, loading: departmentsLoading } = useSelector((state: RootState) => state.departments)

  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "user",
    isActive: true,
    departmentId: "",
  })

  useEffect(() => {
    // Redirect if not admin
    if (user && user.role !== "admin") {
      router.push("/dashboard")
    } else {
      // @ts-ignore
      dispatch(fetchDepartments())

      if (departmentFilter) {
        // @ts-ignore
        dispatch(fetchUsersByDepartment(departmentFilter))
      } else {
        // @ts-ignore
        dispatch(fetchUsers())
      }
    }
  }, [user, router, dispatch, departmentFilter])

  if (user?.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Shield className="h-12 w-12 text-gray-400 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-gray-500">You don't have permission to access this page.</p>
      </div>
    )
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData({
      ...formData,
      isActive: checked,
    })
  }

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      role: "user",
      isActive: true,
      departmentId: "",
    })
    setEditId(null)
  }

  const openCreateDialog = () => {
    resetForm()
    setOpen(true)
  }

  const openEditDialog = (user: any) => {
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.active !== false,
      departmentId: user.departmentId || "",
    })
    setEditId(user.id)
    setOpen(true)
  }

  const handleSubmit = () => {
    const userData = {
      ...formData,
      departmentId: formData.departmentId || null,
    }

    if (editId) {
      // Update existing user
      // @ts-ignore
      dispatch(
        updateUser({
          id: editId,
          userData,
        }),
      )
    } else {
      // Create new user
      // @ts-ignore
      dispatch(createUser(userData))
    }

    setOpen(false)
    resetForm()
  }

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      // @ts-ignore
      dispatch(deleteUser(id))
    }
  }

  const getDepartmentName = (departmentId: string) => {
    const department = departments.find((dept: any) => dept.id === departmentId)
    return department ? department.name : "None"
  }

  const isLoading = usersLoading || departmentsLoading

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          {departmentFilter ? `Users in ${getDepartmentName(departmentFilter)}` : "All Users"}
        </h1>
        <div className="flex gap-2">
          {departmentFilter && (
            <Button variant="outline" onClick={() => router.push("/dashboard/users")}>
              View All Users
            </Button>
          )}
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length > 0 ? (
                  users.map((user: any) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium flex items-center">
                        <User className="h-4 w-4 mr-2 text-gray-500" />
                        {user.name}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            user.role === "admin"
                              ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          }`}
                        >
                          {user.role}
                        </span>
                      </TableCell>
                      <TableCell>
                        {user.departmentId ? (
                          <span className="flex items-center">
                            <Building className="h-4 w-4 mr-1" />
                            {user.departmentName || getDepartmentName(user.departmentId)}
                          </span>
                        ) : (
                          "None"
                        )}
                      </TableCell>
                      <TableCell>
                        {user.active !== false ? (
                          <span className="flex items-center text-green-600">
                            <UserCheck className="h-4 w-4 mr-1" />
                            Active
                          </span>
                        ) : (
                          <span className="flex items-center text-red-600">
                            <UserX className="h-4 w-4 mr-1" />
                            Inactive
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(user)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(user.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editId ? "Edit User" : "Add New User"}</DialogTitle>
            <DialogDescription>
              {editId ? "Update the user details below." : "Fill in the user details below to create a new user."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input id="name" name="name" className="col-span-3" value={formData.name} onChange={handleInputChange} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                className="col-span-3"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role
              </Label>
              <Select value={formData.role} onValueChange={(value) => handleSelectChange("role", value)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="department" className="text-right">
                Department
              </Label>
              <Select
                value={formData.departmentId}
                onValueChange={(value) => handleSelectChange("departmentId", value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {departments.map((dept: any) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Active
              </Label>
              <div className="flex items-center space-x-2 col-span-3">
                <Switch id="status" checked={formData.isActive} onCheckedChange={handleSwitchChange} />
                <Label htmlFor="status">{formData.isActive ? "Active" : "Inactive"}</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSubmit}>
              {editId ? "Save Changes" : "Add User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
