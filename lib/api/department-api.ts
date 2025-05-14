import apiClient from "./api-client"

export const departmentApi = {
  getAllDepartments: async () => {
    const response = await apiClient.get("/departments")
    return response.data
  },

  getDepartmentById: async (id: string) => {
    const response = await apiClient.get(`/departments/${id}`)
    return response.data
  },

  createDepartment: async (departmentData: any) => {
    const response = await apiClient.post("/departments", departmentData)
    return response.data
  },

  updateDepartment: async (id: string, departmentData: any) => {
    const response = await apiClient.put(`/departments/${id}`, departmentData)
    return response.data
  },

  deleteDepartment: async (id: string) => {
    await apiClient.delete(`/departments/${id}`)
  },
}
