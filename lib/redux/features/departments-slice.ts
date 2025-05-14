import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { departmentApi } from "@/lib/api/department-api"

interface Department {
  id: string
  name: string
  description: string
}

interface DepartmentsState {
  departments: Department[]
  loading: boolean
  error: string | null
}

const initialState: DepartmentsState = {
  departments: [],
  loading: false,
  error: null,
}

export const fetchDepartments = createAsyncThunk("departments/fetchDepartments", async (_, { rejectWithValue }) => {
  try {
    return await departmentApi.getAllDepartments()
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch departments")
  }
})

export const createDepartment = createAsyncThunk(
  "departments/createDepartment",
  async (departmentData: any, { rejectWithValue }) => {
    try {
      return await departmentApi.createDepartment(departmentData)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to create department")
    }
  },
)

export const updateDepartment = createAsyncThunk(
  "departments/updateDepartment",
  async ({ id, departmentData }: { id: string; departmentData: any }, { rejectWithValue }) => {
    try {
      return await departmentApi.updateDepartment(id, departmentData)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update department")
    }
  },
)

export const deleteDepartment = createAsyncThunk(
  "departments/deleteDepartment",
  async (id: string, { rejectWithValue }) => {
    try {
      await departmentApi.deleteDepartment(id)
      return id
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete department")
    }
  },
)

const departmentsSlice = createSlice({
  name: "departments",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDepartments.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.loading = false
        state.departments = action.payload
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(createDepartment.fulfilled, (state, action) => {
        state.departments.push(action.payload)
      })
      .addCase(updateDepartment.fulfilled, (state, action) => {
        const index = state.departments.findIndex((dept) => dept.id === action.payload.id)
        if (index !== -1) {
          state.departments[index] = action.payload
        }
      })
      .addCase(deleteDepartment.fulfilled, (state, action) => {
        state.departments = state.departments.filter((dept) => dept.id !== action.payload)
      })
  },
})

export const { clearError } = departmentsSlice.actions
export default departmentsSlice.reducer
