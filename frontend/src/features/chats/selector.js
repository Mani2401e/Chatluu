// selectors.js


export const CurrentUserId = (state) => state.auth.user._id;
export const selectCurrentUserName = (state) => state.auth.user.name;
