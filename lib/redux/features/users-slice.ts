import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { userApi } from "@/lib/api/user-api"

interface User {
  id: string
  name: string
  email: string
  role: string
  active: boolean
  departmentId?: string
  departmentName?: string
}

interface UsersState {
  users: User[]
  loading: boolean
  error: string | null
}

const initialState: UsersState = {
  users: [],
  loading: false,
  error: null,
}

export const fetchUsers = createAsyncThunk("users/fetchUsers", async (_, { rejectWithValue }) => {
  try {
    return await userApi.getAllUsers()
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch users")
  }
})

export const fetchUsersByDepartment = createAsyncThunk(
  "users/fetchUsersByDepartment",
  async (departmentId: string, { rejectWithValue }) => {
    try {
      return await userApi.getUsersByDepartment(departmentId)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch users by department")
    }
  },
)

export const createUser = createAsyncThunk("users/createUser", async (userData: any, { rejectWithValue }) => {
  try {
    return await userApi.createUser(userData)
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to create user")
  }
})

export const updateUser = createAsyncThunk(
  "users/updateUser",
  async ({ id, userData }: { id: string; userData: any }, { rejectWithValue }) => {
    try {
      return await userApi.updateUser(id, userData)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update user")
    }
  },
)

export const deleteUser = createAsyncThunk("users/deleteUser", async (id: string, { rejectWithValue }) => {
  try {
    await userApi.deleteUser(id)
    return id
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to delete user")
  }
})

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false
        state.users = action.payload
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(fetchUsersByDepartment.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUsersByDepartment.fulfilled, (state, action) => {
        state.loading = false
        state.users = action.payload
      })
      .addCase(fetchUsersByDepartment.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.users.push(action.payload)
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        const index = state.users.findIndex((user) => user.id === action.payload.id)
        if (index !== -1) {
          state.users[index] = action.payload
        }
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter((user) => user.id !== action.payload)
      })
  },
})

export const { clearError } = usersSlice.actions
export default usersSlice.reducer
