import React from 'react'
import { Link } from "react-router-dom";

import LoadingSpinner from '../components/common/LoadingSpinner';

import { IoSettingsOutline } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import { FaHeart } from "react-icons/fa6";
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast, { ErrorIcon } from 'react-hot-toast';

const Notification = () => {

	const queryClient = useQueryClient()

	const { data: notifications, isLoading } = useQuery({
		queryKey: ['notifications'],
		queryFn: async() => {
			try {
				const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/notifications/`, {
					method: 'GET',
					credentials: "include", // This is essential for cross-origin cookies
				})
				const data = await res.json()

				if(!res.ok) toast.error(data.message)

				console.log(data.notifications)
				return data.notifications
					
			} catch (err) {
				toast.error(err.message)
			}
		}
	})

	const { mutate: notificationDelete, isPending } = useMutation({
		mutationFn: async() => {
			try {
				const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/notifications/`, {
					method: 'DELETE',
					credentials: "include", // This is essential for cross-origin cookies
				})
				const data = await res.json()

				if(!res.ok) {
					console.log(data.message)
					throw new Error(data.message)
				}
				
				console.log(data.message)
				return data
					
			} catch (err) {
				throw new Error(err.message)
			}
		},
		onError: (error) => {
			toast.error(error.message)
		},
		onSuccess: (data) => {
			toast.success(data.message)
			queryClient.invalidateQueries(['notifications'])
		}
	})

    const deleteNotifications = (event) => {
		event.preventDefault();
		notificationDelete()
	};
	return (
		<>
			<div className='flex-[4_4_0] border-l border-r border-gray-700 min-h-screen'>
				<div className='flex justify-between items-center p-4 border-b border-gray-700'>
					<p className='font-bold'>Notifications</p>
					<div className='dropdown '>
						<div tabIndex={0} role='button' className='m-1'>
							<IoSettingsOutline className='w-4' />
						</div>
						<ul	className='dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52'>
							<li> <button onClick={deleteNotifications}>
								{isPending ? <span className="loading loading-spinner loading-md"></span> :
								<span>Delete all notifications</span>}
							</button> </li>
						</ul>
					</div>
				</div>
				{isLoading && (
					<div className='flex justify-center h-full items-center'>
						<LoadingSpinner size='lg' />
					</div>
				)}
				{notifications?.length === 0 && <div className='text-center p-4 font-bold'>No notifications 🤔</div>}
				{notifications?.map((notification) => (
					<div className='border-b border-gray-700' key={notification?._id}>
						<div className='flex gap-2 p-4'>
							{notification?.type === `${notificationTypes.FOLLOW}` ? <FaUser className='w-7 h-7 text-primary' />
							    : <FaHeart className='w-7 h-7 text-red-500' />}
							<Link to={`/profile/${notification?.from?.username}`}>
								<div className='avatar'>
									<div className='w-8 rounded-full'>
										<img src={notification?.from?.profileImage || "/avatar-placeholder.png"} />
									</div>
								</div>
								<div className='flex gap-1'>
									<span className='font-bold'>@{notification?.from?.username}</span>{" "}
									{notification?.type === `${notificationTypes.FOLLOW}`? "followed you" : "liked your post"}
								</div>
							</Link>
						</div>
					</div>
				))}
			</div>
		</>
	);
}

export default Notification
