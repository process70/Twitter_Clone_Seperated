import React from 'react'
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import {useMutation} from '@tanstack/react-query'
import XSvg from '../components/X';

import { MdOutlineMail } from "react-icons/md";
import { FaUser } from "react-icons/fa";
import { MdPassword } from "react-icons/md";
import { MdDriveFileRenameOutline } from "react-icons/md";

import toast from "react-hot-toast";

const SignUpPage = () => {
	const navigate = useNavigate()
  const [formData, setFormData] = useState({
		email: "",
		username: "",
		fullName: "",
		password: "",
	});

	const { mutate: signup, isError: isSignUpError, isPending, error, } = useMutation({
		mutationFn: async (formData) => {
		  try {
			const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/signup`, {
			  method: "POST",
			  headers: { "Content-Type": "application/json" },
			  credentials: "include", // This is essential for cross-origin cookies
			  body: JSON.stringify({
				email: formData.email, 
				fullName: formData.fullName, 
				username: formData.username,
				password: formData.password
			  }),
			});
			const data = await res.json();
			if (res.ok) {  //success 
			  toast.success("Account created successfully");
			}
 			else {
				throw new Error(data.message)
			}
			
			return data
  
		  } catch (err) {
			  console.log('SignUp Error')
			  throw new Error(err.message)
		  }
		},
		onError: (error) => { 
			console.log(error.message)
		},
		/* when no error is thrown in the mutationFn, 
		The onSuccess callback will only be called when the mutation is successful */
		onSuccess: () => {
			navigate('/login')
		}
		/* throw new Error(): we're now properly throwing an error when the response is not ok. 
		This ensures that the onError callback will be triggered.
		React Query will automatically catch any errors thrown in this function and pass them to the onError callback.
		so try-catch block could be removed; */
		
	});

	const handleSubmit = (e) => {
		e.preventDefault();
		signup(formData)
  };

	const handleInputChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const isError = false;
  
	return (
		<div className='max-w-screen-xl mx-auto flex h-screen'>
			<div className='flex-1 hidden lg:flex items-center  justify-center'>
				<XSvg className=' lg:w-2/3 fill-white' />
			</div>
			<div className='flex-1 flex flex-col justify-center items-center'>
				{isSignUpError && <p className='text-red-500'>{error}</p>}
				<form className='lg:w-2/3  mx-auto md:mx-20 flex gap-4 flex-col' onSubmit={handleSubmit}>
					<XSvg className='w-24 lg:hidden fill-white' />
					<h1 className='text-4xl font-extrabold text-white'>Join today.</h1>
					<label className='input input-bordered rounded flex items-center gap-2'>
						<MdOutlineMail />
						<input type='email' className='grow' placeholder='Email' name='email'
							onChange={handleInputChange} value={formData.email}/>
					</label>

					<div className='flex gap-4 flex-wrap'>
						<label className='input input-bordered rounded flex items-center gap-2 flex-1'>
							<FaUser />
							<input	type='text'	className='grow '	placeholder='Username'
								name='username'	onChange={handleInputChange} value={formData.username}/>
						</label>
						
           				<label className='input input-bordered rounded flex items-center gap-2 flex-1'>
							<MdDriveFileRenameOutline />
							<input	type='text'	className='grow' placeholder='Full Name'
								name='fullName'	onChange={handleInputChange}	value={formData.fullName}/>
						</label>
					</div>

					<label className='input input-bordered rounded flex items-center gap-2'>
						<MdPassword />
						<input	type='password'	className='grow'	placeholder='Password'	name='password'
							onChange={handleInputChange}	value={formData.password}/>
					</label>
					<button className='btn rounded-full btn-primary text-white'>Sign up</button>
					
				</form>

				<div className='flex flex-col lg:w-2/3 gap-2 mt-4'>
					<p className='text-white text-lg'>Already have an account?</p>
					<Link to='/login'>
						<button className='btn rounded-full btn-primary text-white btn-outline w-full'>Sign in</button>
					</Link>
				</div>
			</div>
			
		</div>
	);
}

export default SignUpPage
