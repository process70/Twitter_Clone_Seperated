import { FaHeart, FaRegComment } from "react-icons/fa";
import { BiRepost } from "react-icons/bi";
import { FaRegHeart } from "react-icons/fa";
import { FaRegBookmark } from "react-icons/fa6";
import { FaTrash } from "react-icons/fa";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { QueryClient, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import useGetAuthenticatedUser from "../../hooks/useGetAuthenticatedUser";

import ReactTimeAgo from 'react-time-ago'
import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en'

TimeAgo.addDefaultLocale(en)

const Post = ({ post }) => {
	const [comment, setComment] = useState("");
	const [isOpenModal, setIsOpenModal] = useState(false);

	const postOwner = post.user;

	// invalidate edited post
	const {data: invalidatedPost} = useQuery({
		queryKey: ['post', post._id],
		queryFn: async() => {
			try {
				const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/posts/getPost/${post._id}`, {
					method: 'GET',
					credentials: "include", // This is essential for cross-origin cookies
				})
				const data = await res.json();
	
				if(!res.ok) throw new Error(data.message)
		
				return data.post	

			} catch (err) {
				console.log(err.message)
			}
		}
	})
	
	const isCommenting = false;
	
	const queryClient = useQueryClient()
	
	const { user } = useGetAuthenticatedUser()
	
	const isMyPost = post.user._id === user?._id;
	const [isLiked, setIsLiked] = useState(post.likes.includes(user?._id));

	const {mutate: deletePost} = useMutation({
		mutationFn: async() => {
			try {
				const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/posts/delete/${post._id}`, {
					method: "DELETE",
					credentials: "include", // This is essential for cross-origin cookies
				})
				const data = await res.json()

				if(!res.ok) throw new Error(data.message)
				console.log(data)

				return data

			} catch (error) {
				throw new Error(error.message)
			}
		},
		onError: (error) => toast.error(error.message),
		onSuccess: (deletedPost) => {
			console.log({deletedPost})
			toast.success(deletedPost);
			queryClient.invalidateQueries('posts')
		}
	})
	const handleDeletePost = (e) => {
		e.preventDefault();
		deletePost()
	};

	const {mutate: commentPost, isError: isCommentPostError, error: commentPostError} = useMutation({
		mutationFn: async() => {
			try {
				const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/posts/comment/${post._id}`, {
					method: 'POST',
					headers: { 'Content-Type' : 'application/json' },
					credentials: "include", // This is essential for cross-origin cookies
					body: JSON.stringify({ text: comment })
				});
				const data = await res.json()
				
				if(!res.ok) throw new Error(data.message)
				
				return data

			} catch (err) {
				throw new Error(err)
			}
		},
		onError: (error) => {
			console.log(error.message)
			toast.error(error.message)
		},
		onSuccess: (data) => {
			toast.success(data)
			queryClient.invalidateQueries(['post', post._id])
			setComment('')
			document.getElementById("comments_modal" + post._id).close()
		}
	})

	const handlePostComment = (e) => {
		e.preventDefault();
		commentPost()
	};

	const {mutate: likeUnLike} = useMutation({
		mutationFn: async() => {
			try {
				const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/posts/like/${post._id}`, {
					method: 'POST',
					credentials: "include", // This is essential for cross-origin cookies
				});
				const data = await res.json()
				
				if(!res.ok) throw new Error(data.message)
				
				console.log(data)
				return data

			} catch (err) {
				throw new Error(err.message)
			}
		},
		onError: (error) => {
			toast.error(error)
		},
		onSuccess: (data) => {
			toast.success(data)
			// queryClient.invalidateQueries(['post', post._id]) that's reload the page
		}
	})

	const handleLikePost = (e) => {
		e.preventDefault()
		likeUnLike()
		setIsLiked(prev => !prev)
	};

	return (
		<>
			<div className='flex gap-2 items-start p-4 border-b border-gray-700'>
				<div className='avatar'>
					<div className="w-8 rounded-full">
						<Link to={`/profile/${post?.user?.username}`}>
							<img src={post?.user?.profileImage || "/avatar-placeholder.png"} />
						</Link>
					</div>
				</div>
				<div className='flex flex-col flex-1 gap-3'>
					<div className='flex gap-2 items-center'>
						<Link to={`/profile/${post?.user?.username}`} className='font-bold'>
							{post?.user?.fullName}
						</Link>
						<span className='text-gray-700 flex gap-1 text-sm'>
							<Link to={`/profile/${post?.user?.username}`}>@{post?.user?.username}</Link>
							<span>·</span> 
							<span><ReactTimeAgo date = {new Date(post?.createdAt)} locale='en-US' /></span>
						</span>
						{isMyPost && (
							<span className='flex justify-end flex-1'>
								<FaTrash className='cursor-pointer hover:text-red-500' onClick={handleDeletePost} />
							</span>
						)}
					</div>
					<div className='flex flex-col gap-3 overflow-hidden'>
						<span>{post.text}</span>
						{post?.img && (
							<img src={post.img} className='h-80 object-cover rounded-lg border border-gray-700' alt=''/>
						)}
					</div>
					{/* <div className='flex justify-between mt-3'> */}
						<div className='flex gap-4 items-center justify-between'>
							<div className='flex gap-1 items-center cursor-pointer group' 
								onClick={() => document.getElementById("comments_modal" + post._id).showModal()}>
								<FaRegComment className='w-4 h-4  text-slate-500 group-hover:text-sky-400' />
								<span className='text-sm text-slate-500 group-hover:text-sky-400'>
									{post.comments.length}
								</span>
							</div>
							<dialog id={`comments_modal${post._id}`} className='modal border-none outline-none'>
								<div className='modal-box rounded border border-gray-600'>
									<h3 className='font-bold text-lg mb-4'>COMMENTS</h3>
									<div className='flex flex-col gap-3 max-h-60 overflow-auto'>
										{post.comments.length === 0 && (
											<p className='text-sm text-slate-500'>
												No comments yet 🤔 Be the first one 😉
											</p>
										)}
										{post.comments?.map((comment) => (
											<div key={comment._id} className='flex gap-2 items-start'>
												<div className='avatar'>
													<div className='w-8 rounded-full'>
														<img src={comment?.user?.profileImage || "/avatar-placeholder.png"}/>
													</div>
												</div>
												<div className='flex flex-col'>
													<div className='flex items-center gap-1'>
														<span className='font-bold'>{comment.user.fullName}</span>
														<span className='text-gray-700 text-sm'>@{comment.user.username}</span>
													</div>
													<div className='text-sm'>{comment.text}</div>
												</div>
											</div>
										))}
									</div>
									<form className='flex gap-2 items-center mt-4 border-t border-gray-600 pt-2'
										onSubmit={handlePostComment}>
										<textarea
											className='textarea w-full p-1 rounded text-md resize-none border focus:outline-none  border-gray-800' placeholder='Add a comment...' required
											value={comment} onChange={(e) => setComment(e.target.value)}/>
										<button className='btn btn-primary rounded-full btn-sm text-white px-4'
											disabled={!comment}>
											{isCommenting ? (
												<span className='loading loading-spinner loading-md'></span>
											) : (
												"Post"
											)}
										</button>
										{isCommentPostError && <p className='text-red-500'>{commentPostError}</p>}	
									</form>
								</div>
								<form method='dialog' className='modal-backdrop'>
									<button className='outline-none'>close</button>
								</form>
							</dialog>
							<div className='flex gap-1 items-center group cursor-pointer'>
								<BiRepost className='w-6 h-6  text-slate-500 group-hover:text-green-500' />
								<span className='text-sm text-slate-500 group-hover:text-green-500'>0</span>
							</div>
							<div className='flex gap-1 items-center group cursor-pointer' onClick={handleLikePost}>
								{!isLiked && (
									<FaRegHeart className='w-4 h-4 cursor-pointer text-slate-500 group-hover:text-pink-500' />
								)}
								{isLiked && <FaHeart className='w-4 h-4 cursor-pointer fill-pink-500' />}

								<span className={`text-sm text-slate-500 
                    					group-hover:text-pink-500 ${isLiked ? "text-pink-500" : ""}`}>
									{post.likes.length}
								</span>
							</div>
						<div>
							<FaRegBookmark className='w-4 h-4 text-slate-500 cursor-pointer' />
						</div>
						</div>
					{/* </div> */}
				</div>
			</div>
		</>
	);
};
export default Post;