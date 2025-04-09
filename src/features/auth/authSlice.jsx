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
  //name is default property of rtk ,auth is shown in my rtk devtools
  //we can add initial state directly here as well
  //reducers are pair of properties and funcion
  //each reducer method has two params state,action
  //state access the initial state
  //actions give us dispatches values from code that use the reducer method action.payload
  //make the structure in which you want to store value optional
  //you can also directly reffer like this  state.user=action.payload
  //state.user(any initialState property name) and store structure data in initialState
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
