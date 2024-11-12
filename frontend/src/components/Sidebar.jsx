
import { MdHomeFilled } from "react-icons/md";
import { IoNotifications } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import { Link } from "react-router-dom";
import { BiLogOut } from "react-icons/bi";

import XSvg from "./X";
import useGetAuthenticatedUser from "../hooks/useGetAuthenticatedUser";

const Sidebar = () => {


	const { user, isSuccess , logout} = useGetAuthenticatedUser()
	
	const handleLogout = (e) => {
		e.preventDefault()
		logout()
	}

	return (
		<div className='md:flex-[2_2_0] md:max-w-64'>
			<div className='sticky top-0 left-0  h-screen flex flex-col border-r border-gray-700 w-20 md:w-full'>
				<Link to='/' className='flex justify-center md:justify-start'>
					<XSvg className='px-2 w-12 h-12 rounded-full fill-white hover:bg-stone-900' />
				</Link>
				<ul className='flex flex-col gap-3 mt-4'>
					<li className='flex justify-center md:justify-start'>
						<Link to='/' className='flex gap-3 items-center hover:bg-stone-900 transition-all 
							rounded-full duration-300 py-2 pl-2 pr-4 w-full cursor-pointer'>
							<MdHomeFilled className='w-8 h-8' />
							<span className='text-lg hidden md:block'>Home</span>
						</Link>
					</li>
					<li className='flex justify-center md:justify-start'>
						<Link to='/notifications' className='flex gap-3 items-center hover:bg-stone-900
							transition-all rounded-full duration-300 py-2 pl-2 pr-4 w-full cursor-pointer'>
							<IoNotifications className='w-6 h-6' />
							<span className='text-lg hidden md:block'>Notifications</span>
						</Link>
					</li>

					<li className='flex justify-center md:justify-start'>
						<Link to={`/profile/${user?.username}`} className='flex gap-3 items-center hover:bg-stone-900 
							transition-all rounded-full duration-300 py-2 pl-2 pr-4 w-full cursor-pointer'>
							<FaUser className='w-6 h-6' />
							<span className='text-lg hidden md:block'>Profile</span>
						</Link>
					</li>
				</ul>
				{isSuccess && user && (
					<div className="flex items-center justify-between mt-auto mb-14">
						<Link to={`/profile/${user?.username}`} className=' flex gap-2 justify-between items-center transition-all duration-300 hover:bg-[#181818] py-2 px-2 rounded-full'>
							<div className='avatar hidden md:flex '>
								<div className='w-8 rounded-full'>
									<img src={user?.profileImage || "/avatar-placeholder.png"} />
								</div>
							</div>
							<div className='flex justify-between items-center flex-1'>
								<div className='hidden md:block'>
									<p className='text-white font-bold text-sm w-20 truncate'>{ user?.fullName &&
										user?.fullName.length > 8 ? `${user?.fullName.slice(0, 8)}...` : user?.fullName}
									</p>
									<p className='text-slate-500 text-sm'>@{ user?.username && 
										user?.username.length > 8 ? `${user?.username.slice(0, 8)}...` : user?.username}
									</p>
								</div>
								
							</div>
						</Link>
						<div className="py-2 px-2 rounded-full hover:bg-[#181818]">
							<BiLogOut className='w-5 h-5 cursor-pointer' onClick={handleLogout}/>
						</div>
						
					</div>
				)}
			</div>
		</div>
	);
};
export default Sidebar;