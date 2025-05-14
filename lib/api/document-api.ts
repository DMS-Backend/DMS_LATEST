import apiClient from "./api-client"

export const documentApi = {
  getAllDocuments: async () => {
    const response = await apiClient.get("/documents")
    return response.data
  },

  getDocumentById: async (id: string) => {
    const response = await apiClient.get(`/documents/${id}`)
    return response.data
  },

  getDocumentsByUser: async (userId: string) => {
    const response = await apiClient.get(`/documents/user/${userId}`)
    return response.data
  },

  getDocumentsByType: async (type: string) => {
    const response = await apiClient.get(`/documents/type/${type}`)
    return response.data
  },

  createDocument: async (documentData: any) => {
    const response = await apiClient.post("/documents", documentData)
    return response.data
  },

  updateDocument: async (id: string, documentData: any) => {
    const response = await apiClient.put(`/documents/${id}`, documentData)
    return response.data
  },

  uploadFile: async (id: string, file: File) => {
    const formData = new FormData()
    formData.append("file", file)

    const response = await apiClient.post(`/documents/${id}/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  },

  deleteDocument: async (id: string) => {
    await apiClient.delete(`/documents/${id}`)
  },
}
