import { useState } from "react";
import {toast} from "react-toastify";
import {login} from "../actions/auth";
import LoginForm from '../components/LoginForm';
import {useDispatch} from 'react-redux'

const Login = ({history}) => {
    const [email, setEmail] =useState("mk@gamil.com");
    const [password, setPassword] =useState("aaaaaas");
    

    const dispatch = useDispatch()

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("send login data",{email,password});
        try{
            let res=await login({email,password});

            if(res.data){
                console.log("save user res in redux and local storage then redirect");
               // console.log(res.data);
                //save user and token to local storage
                window.localStorage.setItem("auth",JSON.stringify(res.data));
                //save user and token to redux

                dispatch({
                    type: "LOGGED_IN_USER",
                    payload: res.data,
                });
                history.push("/");
            }
           
        }catch(err)
        {
            console.log(err);
            if (err.response.status===400) toast.error(err.response.data);
        }
    };
    return (
    <>
    <div className="container-fluid bg-secondary p-5 text-center">
        <h1>Login</h1>
    </div>;
    <div className="container">
        <div className="row">
            <div className="col-md-6 offset-md-3">
                <LoginForm handleSubmit={handleSubmit}
                    email={email}
                    setEmail={setEmail}
                    password={password}
                    setPassword={setPassword}
                    />
            </div>
        </div>
    </div>
    </>
    );
};

export default Login;