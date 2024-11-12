import { Link } from "react-router-dom";
import { USERS_FOR_RIGHT_PANEL } from "../../assets/dummy";
import RightPanelSkeleton from "../skeletons/RightPanelSkeleton";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import useFollow from "../../hooks/useFollow";
import { useEffect } from "react";
/* import RightPanelSkeleton from "../skeletons/RightPanelSkeleton";
 */

const RightPanel = () => {
	
	const queryClient = useQueryClient()
	
	const {data: suggestedUsers, isLoading, isSuccess, isError, error} = useQuery({
		queryKey: ['suggestedUsers'],
		queryFn: async() => {
			try {
				const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/getSuggestedUsers`, {
					method: 'GET',
					credentials: "include", // This is essential for cross-origin cookies
				});
				const data = await res.json();
				if(!res.ok) throw new Error(data.messsage)

					return data.filteredUsers
			} catch (err) {
				throw new Error(err.message)
			}
		}
	})

	const { followUnFollow } = useFollow()

	const handleFollow = (e, id) => {
		e.preventDefault()
		console.log({id})
		followUnFollow(id)
	}

	if(suggestedUsers?.length === 0) return <div className="md:w-64 w-0"></div>

	return (
		<div className='hidden lg:block my-4 mx-2'>
			<div className='bg-[#16181C] p-4 rounded-md sticky top-2'>
				<p className='font-bold'>Who to follow</p>
				<div className='flex flex-col gap-4'>
					{/* item */}
					{isLoading && (
						<>
							<RightPanelSkeleton />
							<RightPanelSkeleton />
							<RightPanelSkeleton />
							<RightPanelSkeleton />
						</>
					)}
					{(isSuccess && !isLoading) &&
						suggestedUsers?.map((user) => (
							<Link key={user?._id} to={`/profile/${user?.username}`}
								className='flex items-center justify-between gap-4'>
								<div className='flex gap-2 items-center'>
									<div className='avatar'>
										<div className='w-8 rounded-full'>
											<img src={user?.profileImage || "/avatar-placeholder.png"} />
										</div>
									</div>
									<div className='flex flex-col'>
										<span className='font-semibold tracking-tight truncate w-28'>
											{user?.fullName}
										</span>
										<span className='text-sm text-slate-500'>@{user?.username}</span>
									</div>
								</div>
								<div>
									<button onClick={(e) => handleFollow(e, user?._id)}
										className='btn bg-white text-black hover:bg-white hover:opacity-90 rounded-full btn-sm'>
										Follow
									</button>
								</div>
							</Link>
						))}
				</div>
			</div>
		</div>
	);
};
export default RightPanel;