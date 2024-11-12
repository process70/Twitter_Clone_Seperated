import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import XSvg from "../components/X";

import { MdOutlineMail } from "react-icons/md";
import { MdPassword } from "react-icons/md";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import toast from "react-hot-toast";
import usePersist, { updatePersist } from "../hooks/usePersist";

const LoginPage = () => {
  	const [formData, setFormData] = useState({
		username: "",
		password: "",
	});

	const navigate = useNavigate()

	const { mutate: login, isError: isLoginError, isPending, error} = useMutation({
		mutationFn: async (formData) => {
		  try {
			const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/login`, {
			  method: "POST",
			  headers: { "Content-Type": "application/json" },
			  credentials: "include", // This is essential for cross-origin cookies
			  body: JSON.stringify({
				username: formData.username,
				password: formData.password
			}),
			});

			const data = await res.json();
			console.log("Cookies:", document.cookie);
			if (!res.ok) {
				throw new Error(data.message || "Something went wrong");
			}
			
			return data.user
			  
		  } catch (err) {
			throw new Error(err.message);			
		  }
		},
		onError: (error) => {
			console.log(error.message)
			toast.error(error.message || "An error occurred during login. Please try again.");
			updatePersist(false);
		},
		onSuccess: () => {
			toast.success('Successful Login')
			updatePersist(true);
			
			navigate('/');
		}
	});

	const handleSubmit = (e) => {
		e.preventDefault();
		login(formData)
	};

	const handleInputChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const isError = false;

	return (
		<div className='max-w-screen-xl mx-auto flex h-screen'>
			<div className='flex-1 hidden lg:flex items-center  justify-center'>
				<XSvg className='lg:w-2/3 fill-white' />
			</div>
			<div className='flex-1 flex flex-col justify-center items-center'>
				{isLoginError && <p className='text-red-500'>{error}</p>}
				<form className='flex gap-4 flex-col' onSubmit={handleSubmit}>
					<XSvg className='w-24 lg:hidden fill-white' />
					<h1 className='text-4xl font-extrabold text-white'>Let's go.</h1>
					<label className='input input-bordered rounded flex items-center gap-2 mx-0'>
						<MdOutlineMail />
						<input type='text' className='grow' placeholder='username' autoComplete="off"
							name='username'	onChange={handleInputChange} value={formData.username}/>
					</label>

					<label className='input input-bordered rounded flex items-center gap-2'>
						<MdPassword />
						<input	type='password'	className='grow'	placeholder='Password'
							name='password'	onChange={handleInputChange}	value={formData.password}/>
					</label>
					<button className='btn rounded-full btn-primary text-white w-full'>Login</button>
          
				</form>
        
				<div className='flex flex-col gap-2 mt-4'>
					<p className='text-white text-lg'>Don't have an account?</p>
					<Link to='/signup'>
						<button className='btn rounded-full btn-primary text-white btn-outline w-full'>Sign up</button>
					</Link>
				</div>
			</div>
		</div>
	);
}

export default LoginPage
