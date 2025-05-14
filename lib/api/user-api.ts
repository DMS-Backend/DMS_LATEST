import apiClient from "./api-client"

export const userApi = {
  getAllUsers: async () => {
    const response = await apiClient.get("/users")
    return response.data
  },

  getUserById: async (id: string) => {
    const response = await apiClient.get(`/users/${id}`)
    return response.data
  },

  getUsersByDepartment: async (departmentId: string) => {
    const response = await apiClient.get(`/users/department/${departmentId}`)
    return response.data
  },

  createUser: async (userData: any) => {
    const response = await apiClient.post("/users", userData)
    return response.data
  },

  updateUser: async (id: string, userData: any) => {
    const response = await apiClient.put(`/users/${id}`, userData)
    return response.data
  },

  deleteUser: async (id: string) => {
    await apiClient.delete(`/users/${id}`)
  },
}
