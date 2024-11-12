import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import HomePage from "./pages/HomePage";
import Sidebar from "./components/Sidebar";
import RightPanel from "./components/common/RightPanel";
import Notification from "./pages/Notification";
import ProfilePage from "./pages/ProfileImage";
import { Toaster } from 'react-hot-toast';
import { QueryClient, queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";
import LoadingSpinner from "./components/common/LoadingSpinner";
import { useEffect, useState } from "react";

import toast from "react-hot-toast";
import usePersist from "./hooks/usePersist";
import useGetAuthenticatedUser from "./hooks/useGetAuthenticatedUser";


function App() {

	const { authUser, setauthUser } = usePersist()

	const queryClient = new QueryClient()

	/* let authUser = queryClient.invalidateQueries({queryKey: ['authUser']}) */


    useEffect(() => {
        const handleStorageChange = () => {
            const persistValue = Boolean(JSON.parse(localStorage.getItem('persist')))
            setauthUser(persistValue)
        }

		// capture the event emitted from usePersist hook and handle it
        window.addEventListener('storage', handleStorageChange)
        

        return () => {
			// remove the listner on cleanup function when the component remounts 
            window.removeEventListener('storage', handleStorageChange)
        }
    }, [authUser])

	return (
		<div className='flex justify-center mx-auto'>
			{authUser && <Sidebar /> }
				<Routes>
					{/* PUBLIC ROUTES */}
					<Route path='/signup' element={<SignUpPage />} />
					<Route path='/login' element={<LoginPage />} />

					{/* THE PROBELM IS THAT authUser VALUE DOES NOT CHANGE */}

					{/* PROTECTED ROUTES */}
					<Route path='/' element={authUser ? <HomePage /> : <Navigate to='/login' />} />
					<Route path='/notifications' element={authUser ? <Notification /> : <Navigate to='/login' />} />
					<Route path='/profile/:username' 
							element={authUser ? <ProfilePage /> : <Navigate to='/login' />} />
					{/* {authUser && <Route path='/profile/:username' element={ <ProfilePage /> } />}
					{authUser && <Route path='/notification' element={ <Notification /> } />}
					{authUser && <Route path='/' element={ <HomePage /> } />} */}
					{/* <Route path='/profile/:username' element={<ProfilePage /> } /> */}

				</Routes>
			{authUser && <RightPanel /> }
			{/* Toaster */}
			<Toaster position="top-center" reverseOrder={false} />
		</div>
	);
}

export default App
