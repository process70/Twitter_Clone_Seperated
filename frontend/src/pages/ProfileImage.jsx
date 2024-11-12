import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

import Posts from "../components/common/Posts";
import ProfileHeaderSkeleton from "../components/skeletons/ProfileHeaderSkeleton";
import EditProfileModal from "./EditProfileModal";

import { FaArrowLeft } from "react-icons/fa6";
import { IoCalendarOutline } from "react-icons/io5";
import { FaLink } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { useQuery } from "@tanstack/react-query";

import toast from "react-hot-toast";
import useGetAuthenticatedUser from "../hooks/useGetAuthenticatedUser";
import useFollow from "../hooks/useFollow";

const ProfilePage = () => {
	const [coverImg, setCoverImg] = useState("");
	const [profileImg, setProfileImg] = useState("");

	const [coverImgFile, setCoverImgFile] = useState(null);
	const [profileImgFile, setProfileImgFile] = useState(null);

	const [feedType, setFeedType] = useState("posts");

	const { username } = useParams()

	const { user: currentUser, isLoading: isLodaingUser, isSuccess, editUser, editSuccess } = useGetAuthenticatedUser()

	// get user profile
	const {data: user, isError, isLoading, error, isRefetching, refetch} = useQuery({
		queryKey: ['userProfile'],
		queryFn: async() => {
			try {
				const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/profile/${username}`, {
					method: 'GET',
					credentials: "include", // This is essential for cross-origin cookies
				})

				const userProfile = await res.json()
				if(res.ok){
					console.log(userProfile.user.link.length)
				}
				else{
					toast.error(`Unable to get user ${username}`)
				}
				return userProfile.user
			} catch (err) {
				console.error(err)
			}
		}
	})

	const date = new Date(user?.createdAt);
	const formattedDate = date.toLocaleDateString('en-US', {
		year: 'numeric', 	month: 'long',    day: 'numeric',
	  });

	// get user posts
	const {data: userPosts, isError: isUserPostsError, 
			isLoading: isUserPostsLoading, error: userPostsError} = useQuery({
		queryKey: ['userPosts'],
		queryFn: async() => {
			try {
				const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/posts/getUserPosts/${username}`, {
					method: 'GET',
					credentials: "include", // This is essential for cross-origin cookies
				})

				const posts = await res.json()

				if(!res.ok) 
					toast.error(`Unable to get user ${username}`)				

				return posts.posts

			} catch (err) {
				console.error(err)
			}
		}
	})

	const coverImgRef = useRef(null);
	const profileImgRef = useRef(null);

	const isMyProfile = username === currentUser?.username ;

/* 	const user = {
		_id: "1",
		fullName: "John Doe",
		username: "johndoe",
		profileImg: "/avatars/user6.jpg",
		coverImg: "/posts/city4.jpg",
		bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
		link: "https://youtube.com/@asaprogrammer_",
		following: ["1", "2", "3"],
		followers: ["1", "2", "3"],
	}; */

	const handleImgChange = (e, state) => {
		const file = e.target.files[0];
		if (file) {
			console.log({state})
			console.log({file})
			if(state === "cover"){
				setCoverImg(URL.createObjectURL(file))
				setCoverImgFile(file)
			}
			else{
				setProfileImg(URL.createObjectURL(file));
				setProfileImgFile(file)
			}
			/* const reader = new FileReader();
			reader.onload = () => {
				state === "cover" && setCoverImg(reader.result);
				state === "profileImage" && setProfileImg(reader.result);
			};
			reader.readAsDataURL(file); */
		}
		// state === "cover" ? console.log({coverImg}) : console.log({coverImg});
	};

	const updateHandler = (e) => {
		e.preventDefault();
		user.coverImg = coverImgFile
		user.profileImg = profileImgFile
		console.log(currentUser)
		user.newPassword = ''
		editUser(user)
		if(editSuccess) {
			setCoverImg('')
			setProfileImg('')
		}
	}

	const { followUnFollow } = useFollow()

	const handleFollow = (e, id) => {
		e.preventDefault()
		console.log({id})
		followUnFollow(id)
	}

	useEffect(() => {
		refetch();
	}, [username, refetch]);

	return (
		<>
			<div className='flex-[1_1_0] border-r border-gray-700 min-h-screen'>
				{/* HEADER */}
				{isLoading && <ProfileHeaderSkeleton />}
				{!isLoading && !user && <p className='text-center text-lg mt-4'>User not found</p>}
				<div className='flex flex-col'>
					{!isLoading && user && (
						<>
							<div className='flex gap-10 px-4 py-2 items-center'>
								<Link to='/'> <FaArrowLeft className='w-4 h-4' /> </Link>
								<div className='flex flex-col'>
									<p className='font-bold text-lg'>{user?.fullName}</p>
									<span className='text-sm text-slate-500'>{userPosts?.length} posts</span>
								</div>
							</div>
							{/* COVER IMG */}
							<div className='relative group/cover'>
								<img src={ coverImg ? coverImg : user?.cover || '/cover.png'}
									className='h-52 w-full object-cover' alt='cover image'
								/>
								{isMyProfile && (
									<div className='absolute top-2 right-2 rounded-full p-2 bg-gray-800 bg-opacity-75
										 cursor-pointer opacity-0 group-hover/cover:opacity-100 transition duration-200'
										onClick={() => coverImgRef.current.click()}>
										<MdEdit className='w-5 h-5 text-white' />
									</div>
								)}

								<input type='file' hidden ref={coverImgRef}
									onChange={(e) => handleImgChange(e, "cover")} />

								<input type='file' hidden ref={profileImgRef}
									onChange={(e) => handleImgChange(e, "profileImage")} />
								{/* USER AVATAR */}
								<div className='avatar absolute -bottom-16 left-4'>
									<div className='w-32 rounded-full relative group/avatar'>
										<img src={ profileImg ? profileImg : user?.profileImage || '/avatar-placeholder.png'}/>
										<div className='absolute top-5 right-3 p-1 bg-primary rounded-full 
                                                group-hover/avatar:opacity-100 opacity-0 cursor-pointer'>
											{isMyProfile && (
												<MdEdit className='w-4 h-4 text-white'
													onClick={() => profileImgRef.current.click()} />
											)}
										</div>
									</div>
								</div>
							</div>
							<div className='flex justify-end px-4 mt-5'>
								{isMyProfile && isSuccess && !isLodaingUser && <EditProfileModal currentUser = {currentUser}/>}
								{!isMyProfile && (
									<>
										{user?.followers?.includes(currentUser?._id) ? (
											<button className='btn btn-outline rounded-full btn-sm'
												onClick={(e) => handleFollow(e, user?._id)} >UnFollow
											</button>
										) : (
											<button className='btn btn-outline rounded-full btn-sm'
												onClick={(e) => handleFollow(e, user?._id)} >Follow
											</button>
										)}
									</>
								)}
								{(coverImg || profileImg) && (
									<button className='btn btn-primary rounded-full btn-sm text-white px-4 ml-2'
										onClick={(e) => updateHandler(e)} >Update
									</button>
								)}
							</div>

							<div className='flex flex-col gap-4 mt-14 px-4'>
								<div className='flex flex-col'>
									<span className='font-bold text-lg'>{user?.fullName}</span>
									<span className='text-sm text-slate-500'>@{user?.username}</span>
									<span className='text-sm my-1'>{user?.bio}</span>
								</div>

								<div className='flex gap-2 flex-wrap'>
									{user?.link && (
										<div className='flex gap-1 items-center '>
											<>
												<FaLink className='w-3 h-3 text-slate-500' />
												<a href='https://youtube.com/@asaprogrammer_' target='_blank'
													 rel='noreferrer' className='text-sm text-blue-500 hover:underline'>
													    {user && user?.link.length > 0 ? 
														user?.link : 'youtube.com/@asaprogrammer_'}
												</a>
											</>
										</div>
									)}
									<div className='flex gap-2 items-center'>
										<IoCalendarOutline className='w-4 h-4 text-slate-500' />
										<span className='text-sm text-slate-500'>{formattedDate}</span>
									</div>
								</div>
								<div className='flex gap-2'>
									<div className='flex gap-1 items-center'>
										<span className='font-bold text-xs'>{user?.following.length}</span>
										<span className='text-slate-500 text-xs'>Following</span>
									</div>
									<div className='flex gap-1 items-center'>
										<span className='font-bold text-xs'>{user?.followers.length}</span>
										<span className='text-slate-500 text-xs'>Followers</span>
									</div>
								</div>
							</div>
							<div className='flex w-full border-b border-gray-700 mt-4'>
								<div
									className='flex justify-center flex-1 p-3 hover:bg-secondary transition duration-300 relative       cursor-pointer' onClick={() => setFeedType("posts")} >
									    Posts
									{feedType === "posts" && (
										<div className='absolute bottom-0 w-10 h-1 rounded-full bg-primary' />
									)}
								</div>
								<div
									className='flex justify-center flex-1 p-3 text-slate-500 hover:bg-secondary transition duration-300 relative cursor-pointer' onClick={() => setFeedType("likes")} >
									    Likes
									{feedType === "likes" && (
										<div className='absolute bottom-0 w-10  h-1 rounded-full bg-primary' />
									)}
								</div>
							</div>
						</>
					)}

					<Posts feedType={feedType} username={username} userId={user?._id}/>
				</div>
			</div>
		</>
	);
};
export default ProfilePage;