import { createContext, useContext, useEffect ,useState, useCallback} from "react";
import { AuthContext } from "./AppContext.jsx";
import toast from "react-hot-toast";


export const ChatContext=createContext();

export const ChatProvider= ({children}) => {
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [unseenMessages, setunseenMessages] = useState({});
    const {axios,socket,authUser}=useContext(AuthContext)


    const getUsers=useCallback(async () => {
        if (!authUser) return;
        try {
            const {data}=await axios.get("/api/messages/users",{withCredentials: true});
            if (data.success) {
                setUsers(data.users);
                setunseenMessages(data.unseenMessages)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }, [authUser, axios])

    useEffect(()=>{
        if (authUser) {
            getUsers();
        }
    },[authUser, getUsers])

    const getMessages=async (userId) => {
        try {
            const {data}=await axios.get(`/api/messages/${userId}`);
            if (data.success) {
                setMessages(data.messages)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }
    const sendMessages=async (messageData) => {
       try {
         const {data}=await axios.post(`/api/messages/send/${selectedUser._id}`,messageData)
        if (data.success) {
            setMessages((prev)=>[...prev,data.newMessage])
        }
        else{
            toast.error(error.message)
        }
       } catch (error) {
        toast.error(error.message)
       }
    }
    const subscribeToMessages=async () => {
        if (!socket) return;
        socket.on("newMessage",(newMessage)=>{
            if (selectedUser && newMessage.senderId === selectedUser._id) {
                newMessage.seen =true;
                setMessages((prevMessages)=>[...prevMessages,newMessage]);
                axios.patch(`/api/messages/mark/${newMessage._id}`)
            }
            else{
                setunseenMessages((prevUnseenMessages)=>({
                    ...prevUnseenMessages,[newMessage.senderId]:
                    prevUnseenMessages[newMessage.senderId] ? prevUnseenMessages[newMessage.senderId] + 1:1
                }))
            }
        })
    }
    const unsubscribeFromMessages=()=>{
        if (socket) {
            socket.off("newMessage")
        }
    }
    useEffect(()=>{
        subscribeToMessages();
        return ()=>unsubscribeFromMessages();
    },[socket,selectedUser])

    const value={messages,users,selectedUser,getUsers,getMessages,sendMessages,setSelectedUser,unseenMessages,setunseenMessages}
    
    return (<ChatContext.Provider value={value}>
        {children}
    </ChatContext.Provider>)
}