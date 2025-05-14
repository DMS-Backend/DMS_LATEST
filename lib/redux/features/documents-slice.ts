import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import { documentApi } from "@/lib/api/document-api"

interface Document {
  id: string
  title: string
  description: string
  content: string
  type: string
  s3Key?: string
  fileUrl?: string
  fileName?: string
  fileType?: string
  fileSize?: number
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
  createdByName?: string
  updatedByName?: string
}

interface DocumentsState {
  documents: Document[]
  loading: boolean
  error: string | null
}

const initialState: DocumentsState = {
  documents: [],
  loading: false,
  error: null,
}

export const fetchDocuments = createAsyncThunk("documents/fetchDocuments", async (_, { rejectWithValue }) => {
  try {
    return await documentApi.getAllDocuments()
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch documents")
  }
})

export const fetchDocumentsByUser = createAsyncThunk(
  "documents/fetchDocumentsByUser",
  async (userId: string, { rejectWithValue }) => {
    try {
      return await documentApi.getDocumentsByUser(userId)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch documents by user")
    }
  },
)

export const fetchDocumentsByType = createAsyncThunk(
  "documents/fetchDocumentsByType",
  async (type: string, { rejectWithValue }) => {
    try {
      return await documentApi.getDocumentsByType(type)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch documents by type")
    }
  },
)

export const createDocument = createAsyncThunk(
  "documents/createDocument",
  async (documentData: any, { rejectWithValue }) => {
    try {
      return await documentApi.createDocument(documentData)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to create document")
    }
  },
)

export const updateDocument = createAsyncThunk(
  "documents/updateDocument",
  async ({ id, documentData }: { id: string; documentData: any }, { rejectWithValue }) => {
    try {
      return await documentApi.updateDocument(id, documentData)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update document")
    }
  },
)

export const uploadDocumentFile = createAsyncThunk(
  "documents/uploadFile",
  async ({ id, file }: { id: string; file: File }, { rejectWithValue }) => {
    try {
      return await documentApi.uploadFile(id, file)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to upload file")
    }
  },
)

export const deleteDocument = createAsyncThunk("documents/deleteDocument", async (id: string, { rejectWithValue }) => {
  try {
    await documentApi.deleteDocument(id)
    return id
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to delete document")
  }
})

const documentsSlice = createSlice({
  name: "documents",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    addDocument: (state, action: PayloadAction<any>) => {
      state.documents.push(action.payload)
    },
    updateDocument: (state, action: PayloadAction<any>) => {
      const index = state.documents.findIndex((doc) => doc.id === action.payload.id)
      if (index !== -1) {
        state.documents[index] = action.payload
      }
    },
    deleteDocument: (state, action: PayloadAction<string>) => {
      state.documents = state.documents.filter((doc) => doc.id !== action.payload)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDocuments.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.loading = false
        state.documents = action.payload
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(fetchDocumentsByUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDocumentsByUser.fulfilled, (state, action) => {
        state.loading = false
        state.documents = action.payload
      })
      .addCase(fetchDocumentsByUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(fetchDocumentsByType.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDocumentsByType.fulfilled, (state, action) => {
        state.loading = false
        state.documents = action.payload
      })
      .addCase(fetchDocumentsByType.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(createDocument.fulfilled, (state, action) => {
        state.documents.push(action.payload)
      })
      .addCase(updateDocument.fulfilled, (state, action) => {
        const index = state.documents.findIndex((doc) => doc.id === action.payload.id)
        if (index !== -1) {
          state.documents[index] = action.payload
        }
      })
      .addCase(uploadDocumentFile.fulfilled, (state, action) => {
        const index = state.documents.findIndex((doc) => doc.id === action.payload.id)
        if (index !== -1) {
          state.documents[index] = action.payload
        }
      })
      .addCase(deleteDocument.fulfilled, (state, action) => {
        state.documents = state.documents.filter((doc) => doc.id !== action.payload)
      })
  },
})

export const { clearError, addDocument } = documentsSlice.actions
export default documentsSlice.reducer
