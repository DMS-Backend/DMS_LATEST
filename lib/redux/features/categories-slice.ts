import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { categoryApi } from "@/lib/api/category-api"

interface Category {
  id: string
  name: string
  description: string
}

interface CategoriesState {
  categories: Category[]
  loading: boolean
  error: string | null
}

const initialState: CategoriesState = {
  categories: [],
  loading: false,
  error: null,
}

export const fetchCategories = createAsyncThunk("categories/fetchCategories", async (_, { rejectWithValue }) => {
  try {
    return await categoryApi.getAllCategories()
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch categories")
  }
})

export const createCategory = createAsyncThunk(
  "categories/createCategory",
  async (categoryData: any, { rejectWithValue }) => {
    try {
      return await categoryApi.createCategory(categoryData)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to create category")
    }
  },
)

export const updateCategory = createAsyncThunk(
  "categories/updateCategory",
  async ({ id, categoryData }: { id: string; categoryData: any }, { rejectWithValue }) => {
    try {
      return await categoryApi.updateCategory(id, categoryData)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update category")
    }
  },
)

export const deleteCategory = createAsyncThunk("categories/deleteCategory", async (id: string, { rejectWithValue }) => {
  try {
    await categoryApi.deleteCategory(id)
    return id
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to delete category")
  }
})

const categoriesSlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false
        state.categories = action.payload
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.categories.push(action.payload)
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        const index = state.categories.findIndex((cat) => cat.id === action.payload.id)
        if (index !== -1) {
          state.categories[index] = action.payload
        }
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.categories = state.categories.filter((cat) => cat.id !== action.payload)
      })
  },
})

export const { clearError } = categoriesSlice.actions
export default categoriesSlice.reducer
