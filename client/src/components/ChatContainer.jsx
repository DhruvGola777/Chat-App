import React, { useContext, useEffect, useRef, useState } from 'react'
import assets from '../assets/assets'
import { formatMessageTime } from '../lib/utils';
import toast from "react-hot-toast";
import { ChatContext } from '../hooks/ChatContext'
import { AuthContext } from '../hooks/AppContext';
const ChatContainer = () => {

  const { messages, selectedUser, setSelectedUser, sendMessages, getMessages, deleteMessage, typingUsers} = useContext(ChatContext)

  const { authUser, onlineUser, socket } = useContext(AuthContext)

  const scrollEnd = useRef();

  const [input,setInput]=useState('');
  const [activeMessageId, setActiveMessageId] = useState(null);

  const handleSendMessage=async(e)=>{
    e.preventDefault();
    if (input.trim() ==="") {
      return null;
    }
    await sendMessages({text:input.trim()})
    setInput("");
    socket.emit("stopTyping", { senderId: authUser._id, receiverId: selectedUser._id });
  }
  const handleSendImage=async(e)=>{
    const file=e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Select an image file");
      return;
    }
    const reader=new FileReader();
    reader.onloadend=async()=>{
      await sendMessages({image:reader.result})
      e.target.value="";
    }
    reader.readAsDataURL(file)
  }

  // Typing indicator logic
  useEffect(() => {
    if (!socket || !selectedUser || !input) return;

    socket.emit("typing", { senderId: authUser._id, receiverId: selectedUser._id });

    const timeout = setTimeout(() => {
      socket.emit("stopTyping", { senderId: authUser._id, receiverId: selectedUser._id });
    }, 2000);

    return () => clearTimeout(timeout);
  }, [input, socket, selectedUser, authUser._id]);

  useEffect(()=>{
    if (selectedUser) {
      getMessages(selectedUser._id)
      setActiveMessageId(null)
    }
  },[selectedUser])

  useEffect(() => {
    if (scrollEnd.current && messages) {
      scrollEnd.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, typingUsers[selectedUser?._id]])

  return selectedUser ? (
    <div className='h-full overflow-scroll relative backdrop-blur-lg'>
      <div className='flex items-center gap-3 py-3 mx-4 border-b border-stone-500'>
        <img src={selectedUser.profilePic || assets.avatar_icon} alt="" className='w-8 rounded-full' />
        <div className='flex-1 flex flex-col'>
          <p className='text-lg text-white flex items-center gap-2'>
            {selectedUser.fullName}
            {onlineUser?.includes(selectedUser._id) &&<span className='w-2 h-2 rounded-full bg-green-500'></span>}
          </p>
          {typingUsers[selectedUser._id] && <p className='text-xs text-green-400 animate-pulse'>typing...</p>}
        </div>
        <img onClick={() => setSelectedUser(null)} src={assets.arrow_icon} alt="" className='md:hidden max-w-7' />
        <img src={assets.help_icon} alt="" className='max-md:hidden max-w-5' />
      </div>
      {/*------- chat area -----------*/}
      <div onClick={() => setActiveMessageId(null)} className='flex flex-col h-[calc(100%-120px)] overflow-y-scroll p-3 pb-6'>
        {messages.map((msg, index) => (
          <div onClick={(e) => {
            if (msg.senderId === authUser._id && !msg.isDeleted) {
              e.stopPropagation();
              setActiveMessageId(activeMessageId === msg._id ? null : msg._id);
            }
          }} key={index} className={`group flex items-end gap-2 justify-end ${String(msg.senderId) !== String(authUser._id) && 'flex-row-reverse'}`}>
            {msg.isDeleted ? (
              <p className={`p-2 max-w-50 md:text-sm italic font-light rounded-lg mb-8 bg-gray-500/20 text-gray-400 ${msg.senderId !== authUser._id ? 'rounded-br-none' : 'rounded-bl-none'}`}>
                This message was deleted
              </p>
            ) : msg.image ? (
              <div className='relative'>
                <img src={msg.image} alt="" className='max-w-57.5 border border-gray-700 rounded-lg overflow-hidden mb-8' />
                {msg.senderId === authUser._id && (
                  <button onClick={() => deleteMessage(msg._id)} className={`absolute top-2 right-2 p-1 bg-red-500/80 rounded-full cursor-pointer ${activeMessageId === msg._id ? 'block' : 'hidden group-hover:block'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-white">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                  </button>
                )}
              </div>
            ) : (
              <div className='relative'>
                <p className={`p-2 max-w-50 md:text-sm font-light rounded-lg mb-8 break-all bg-violet-500/30 text-white ${msg.senderId !== authUser._id ? 'rounded-br-none' : 'rounded-bl-none'}`}>{msg.text}</p>
                {msg.senderId === authUser._id && (
                  <button onClick={() => deleteMessage(msg._id)} className={`absolute -top-2 -right-2 p-1 bg-red-500/80 rounded-full cursor-pointer ${activeMessageId === msg._id ? 'block' : 'hidden group-hover:block'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3 text-white">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                  </button>
                )}
              </div>
            )}
            <div className='text-center text-xs'>
              <img src={msg.senderId === authUser._id ? authUser ?.profilePic || assets.avatar_icon : selectedUser ?.profilePic || assets.avatar_icon} alt="" className='w-7 rounded-full' />
              <p className='text-gray-500'>{msg.createdAt ? formatMessageTime(msg.createdAt) : ""}</p>
            </div>
          </div>
        ))}
        {typingUsers[selectedUser._id] && (
          <div className="flex items-center gap-2 mb-4">
             <div className="p-3 bg-gray-700/30 rounded-lg rounded-bl-none flex gap-1">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
             </div>
          </div>
        )}
        <div ref={scrollEnd}></div>
      </div>
      {/* --------------bottom area-------------*/}
      <div className='absolute bottom-0 left-0 right-0 flex items-center gap-3 p-3'>
        <div className='flex-1 flex items-center bg-gray-100/12 px-3 rounded-full'>
          <input onChange={(e)=>setInput(e.target.value)} value={input}
          onKeyDown={(e)=>e.key==="Enter" ? handleSendMessage(e):null} type="text" placeholder='Send a message' className='flex-1 text-sm p-3 border-none rounded-lg outline-none text-white placeholder-gray-400' />
          <input onChange={handleSendImage} type="file" id='image' accept='image/png, image/jpeg' hidden />
          <label htmlFor="image">
            <img src={assets.gallery_icon} alt="" className='w-5 mr-2 cursor-pointer' />
          </label>
        </div>
        <img onClick={handleSendMessage} src={assets.send_button} alt="" className='w-7 cursor-pointer' />
      </div>
    </div>
  ) : (
    <div className='flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden'>
      <img src={assets.logo_icon} alt="" className='max-w-16' />
      <p className='text-lg font-medium text-white'>Chat anytime,Anywhere</p>
    </div>
  )
}

export default ChatContainer
