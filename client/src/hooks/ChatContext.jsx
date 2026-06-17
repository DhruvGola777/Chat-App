import { createContext, useContext, useEffect ,useState, useCallback} from "react";
import { AuthContext } from "./AppContext.jsx";
import toast from "react-hot-toast";


export const ChatContext=createContext();

export const ChatProvider= ({children}) => {
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [unseenMessages, setunseenMessages] = useState({});
    const [typingUsers, setTypingUsers] = useState({}); // { userId: boolean }
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
            socket.off("messageDeleted")
            socket.off("typing")
            socket.off("stopTyping")
        }
    }
    const deleteMessage = async (messageId) => {
        if (!messageId) {
            toast.error("Message ID is missing");
            return;
        }
        try {
            console.log("Deleting message:", messageId);
            const { data } = await axios.delete(`/api/messages/delete/${messageId}`);
            if (data.success) {
                setMessages((prev) =>
                    prev.map((msg) =>
                        msg._id === messageId ? { ...msg, isDeleted: true } : msg
                    )
                );
                toast.success("Message deleted");
            }
        } catch (error) {
            console.error("Delete error:", error);
            const errorMessage = error.response?.data?.message || error.message;
            toast.error(`Delete failed: ${errorMessage}`);
        }
    };
    useEffect(()=>{
        if (!socket) return;
        socket.on("messageDeleted", ({ messageId }) => {
            setMessages((prev) =>
                prev.map((msg) =>
                    msg._id === messageId ? { ...msg, isDeleted: true } : msg
                )
            );
        });

        socket.on("typing", ({ senderId }) => {
            setTypingUsers(prev => ({ ...prev, [senderId]: true }));
        });

        socket.on("stopTyping", ({ senderId }) => {
            setTypingUsers(prev => ({ ...prev, [senderId]: false }));
        });

        subscribeToMessages();
        return ()=>unsubscribeFromMessages();
    },[socket,selectedUser])

    const value={messages,users,selectedUser,getUsers,getMessages,sendMessages,setSelectedUser,unseenMessages,setunseenMessages, deleteMessage, typingUsers}
    
    return (<ChatContext.Provider value={value}>
        {children}
    </ChatContext.Provider>)
}