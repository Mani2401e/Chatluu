import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import chatReducer from '../features/chats/chatSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    chats: chatReducer
  },
})
