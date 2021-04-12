let userState;

if(window.localStorage.getItem("auth")) {
  userState=JSON.parse(window.localStorage.getItem("auth"));
}else{
  userState=null;
}


//2.create user reducer functions
export const authReducer = (state = userState,action) => {
    switch (action.type){
      case "LOGGED_IN_USER":
        return { ...state,...action.payload };
      case "LOGOUT":
        return action.payload;
      default:
        return state;
    }
  };