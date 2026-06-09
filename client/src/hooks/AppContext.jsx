import  { createContext ,useEffect,useState} from 'react';
import axios from 'axios';
import toast  from 'react-hot-toast';
import {io} from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
export const AuthContext=createContext();

export const AuthProvider=({children})=>{
    const [authUser, setAuthUser] = useState(null);
    const [onlineUser, setOnlineUser] = useState([]);
    const [socket, setSocket] = useState(null);
    const backendUrl=import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
    axios.defaults.baseURL=backendUrl;
    axios.defaults.withCredentials=true;
    const navigate=useNavigate();

    const checkAuth=async () => {
        try {
            const {data}=await axios.get("/api/auth/check")
            if (data.success) {
                setAuthUser(data.user);
                connectSocket(data.user);
            }
        } catch (error) {
            console.log("Not authenticated");
        }
    }
    const login=async (state,credentials) => {
        try {
            const {data}=await axios.post(`${backendUrl}/api/auth/${state}`,credentials,{withCredentials:true});
            if (data.success) {
                setAuthUser(data.user);
                connectSocket(data.user);
                // setToken(data.token)
                toast.success(data.message)
                navigate('/')
            }
            else{
                toast.error(error.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }
    const logout=async () => {
        await axios.post(`${backendUrl}/api/auth/logout`,{},{withCredentials:true})
        setAuthUser(null);
        setOnlineUser([]);
        socket?.disconnect()
        toast.success("Logged out successfully");
    }
    const updateProfile=async (body) => {
        try {
            const {data}=await axios.patch("/api/auth/update-profile",body)
            if (data.success) {
                setAuthUser(data.user);
                toast.success("Profile update successfully")
            }
        } catch (error) {
            toast.error(error.message)
        }
    }
    useEffect(()=>{
        checkAuth();
    },[])
    const connectSocket=(user)=>{
        if (!user || (socket?.connected)) return;
        const newSocket=io(backendUrl,{
            query:{
                userId:user._id
            },
            transports: ["websocket"]
        });
        // newSocket.connect();
        setSocket(newSocket)
        newSocket.on("getOnlineUsers",(userIds)=>{
            setOnlineUser(userIds);
        })
    }
    const value ={
        axios,authUser,onlineUser,socket,login,logout,updateProfile
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )

}

