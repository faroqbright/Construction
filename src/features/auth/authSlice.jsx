import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  loading: false,
  userInfo: {}, //  user object
  userToken: null,
  role: null, //
  error: null,
  isAuthenticated: false,
};
export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUserInfo: (state, action) => {
      if (action.payload?.user) {
        state.userInfo = { ...action.payload.user }; // Overwrite with new data
        state.userToken = action.payload.accessToken || state.userToken;
        state.isAuthenticated = true;
      }
      state.loading = false;
    },    
    removeUserInfo: (state) => {
      state.userInfo = {};
      state.userToken = null;
      state.loading = null;
      state.role = null;
      state.isAuthenticated = null;
    },
  },
});
export const { setUserInfo, removeUserInfo } = authSlice.actions;
export default authSlice.reducer;
