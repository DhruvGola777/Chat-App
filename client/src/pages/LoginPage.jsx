import {useContext, useState} from 'react'
import assets from '../assets/assets'
import { AuthContext } from '../hooks/AppContext';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [currState, setCurrState] = useState("Sign up");
  const [fullName,setFullName]=useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");
  const [isDateSubmitted, setIsDateSubmitted] = useState(false);

  const {login}=useContext(AuthContext);

  const onSubmitHandler=(e)=>{
    e.preventDefault();
    if (currState ==="Sign up" && !isDateSubmitted) {
      if(fullName.trim()===""){
        toast.error("Please enter your fullname")
        return;
      }
      setIsDateSubmitted(true);
      return;
    }
    console.log({
  fullName,
  email,
  password,
  bio
});
    login(currState ==="Sign up" ? 'signup':'login',{fullName,email,password,bio})
  }
  return (
    <div className='min-h-screen bg-cover bg-center flex items-center justify-center gap-8 sm:justify-evenly max-sm:flex-col backdrop-blur-2xl'>
      {/* left */}
      <img src={assets.logo_big} alt="" className='w-[min(30vw,250px)]'/>
      {/* right */}
      <form onSubmit={onSubmitHandler} className='border-2 bg-white/8 text-white border-gray-500 p-6 flex flex-col gap-6 rounded-lg shadow-lg'>
      <h2 className='font-medium text-2xl flex justify-between items-center'>
        {currState}
        {isDateSubmitted && <img onClick={()=>setIsDateSubmitted(false)} src={assets.arrow_icon} alt="" className='w-5 cursor-pointer'/>}
        
      </h2>
        {currState ==="Sign up" && !isDateSubmitted && (
          <input onChange={(e)=>setFullName(e.target.value)} value={fullName} type="text" className='p-2 border border-gray-500 rounded-md focus:outline-none' placeholder='full Name' required/>
        )}

        {(currState==="Login" || !isDateSubmitted) && (
          <>
          <input onChange={(e)=>setEmail(e.target.value)} value={email} type="email" placeholder='Email address' required className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'/>

          <input onChange={(e)=>setPassword(e.target.value)} value={password} type="password" placeholder='Password' required className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'/>
          </>
        )}
        {
          currState ==="Sign up" && isDateSubmitted && (
            <textarea onChange={(e)=>setBio(e.target.value)} value={bio} rows={4} className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500' placeholder='Enter your bio..' required></textarea>
          )
        }
        <button type="submit" className='py-3 bg-linear-to-r from-purple-400 to-violet-600 text-white rounded-md cursor-pointer'>
          { currState ==="Login" ? "Login Now":!isDateSubmitted?"Next":"Create Account"}
        </button>
        <div className='flex items-center gap-2 text-sm text-gray-500'>
          <input type="checkbox"/>
          <p className='text-white'>Agree to the terms of use & privacy policy</p>
        </div>
        <div className='flex flex-col gap-2'>
          {currState ==="Sign up" ? (
            <p className='text-sm text-gray-300'>Already have an Acoount?<span onClick={()=>{setCurrState("Login"); setIsDateSubmitted(false)}} className='font-medium text-violet-500 cursor-pointer'>Login Here</span></p>
          )
          :
          (
            <p className='text-sm text-gray-300'>Create an account <span onClick={()=>setCurrState("Sign up")} className='font-medium text-violet-500 cursor-pointer'>Click Here</span></p>
          )}
        </div>
      </form>
    </div>
  )
}

export default LoginPage
