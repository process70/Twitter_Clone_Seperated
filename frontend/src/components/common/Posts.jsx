import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";
import { POSTS } from "../../assets/dummy";
import toast from "react-hot-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useParams } from "react-router-dom";

const Posts = ({feedType, username, userId}) => {

	const getPostEndpoint = () => {
		switch (feedType) {
			case "forYou":
				return "/posts/getAllPosts";
			case "following":
				return "/posts/getFollowingPosts";
			case "posts":
				return `/posts/getUserPosts/${username}`;
			case "likes":
				return `/users/likes/${userId}`;
			default:
				return "/posts/getAllPosts";
		}
	};

	// get posts per type
	const {data: posts, isLoading, isSuccess, isError, isRefetching, refetch} = useQuery({
		queryKey: ['posts'],
		queryFn: async() => {
			try {
				const type = feedType === "following" ? "getFollowingPosts" : "getAllPosts";
				console.log(`${getPostEndpoint()}`)
				const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}${getPostEndpoint()}`, {
					method: 'GET',
					credentials: "include", // This is essential for cross-origin cookies
				})
				const data = await res.json();
	
				if(!res.ok) throw new Error(data.message)
		
				return data.posts

			} catch (err) {
				console.log(err.message)
			}
		}
	})

	useEffect(() => {
		refetch()
	}, [feedType, refetch])

	return (
		<>
			{isError && <p>Unable to fetch posts</p>}
			{(isLoading || isRefetching) && (
				<div className='flex flex-col justify-center'>
					<PostSkeleton />
					<PostSkeleton />
					<PostSkeleton />
				</div>
			)}
			{!isLoading && posts?.length === 0 && <p className='text-center my-4'>No posts in this tab. Switch 👻</p>}
			{!isLoading && isSuccess && posts &&(
				<div>
					{posts.map((post) => (
						<Post key={post._id} post={post} />
					))}
				</div>
			)}
		</>
	);
};
export default Posts;