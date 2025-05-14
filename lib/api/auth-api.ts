import apiClient from "./api-client"

export const authApi = {
  login: async (email: string, password: string) => {
    const response = await apiClient.post("/auth/login", { email, password })
    return response.data
  },

  register: async (name: string, email: string, password: string, departmentId?: string) => {
    const response = await apiClient.post("/auth/register", {
      name,
      email,
      password,
      departmentId: departmentId ? departmentId : undefined,
    })
    return response.data
  },
}
