import { configureStore } from "@reduxjs/toolkit"
import authReducer from "./features/auth-slice"
import usersReducer from "./features/users-slice"
import documentsReducer from "./features/documents-slice"
import departmentsReducer from "./features/departments-slice"
import categoriesReducer from "./features/categories-slice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,
    documents: documentsReducer,
    departments: departmentsReducer,
    categories: categoriesReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
