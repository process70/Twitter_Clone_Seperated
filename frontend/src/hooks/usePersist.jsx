import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export const updatePersist = (value) => {
    

	localStorage.setItem('persist', JSON.stringify(value))
    
    /* The main issue in the current implementation is that changing localStorage doesn't automatically 
    trigger a re-render or update of the isAuthenticated state in other components. 
    we would need to implement a mechanism to propagate the localStorage 
    change to the React state across all components */
	window.dispatchEvent(new Event('storage'))
}

export const logoutPersist = () => {

    console.log("inside logout persist")
	localStorage.removeItem('persist')
    console.log("checking persist: "+localStorage.getItem('persist'))
    window.dispatchEvent(new Event('storage'))
}

const usePersist = () => {

    const [isAuthenticated, setIsAuthenticated] = useState(JSON.parse(localStorage.getItem('persist') || false));
      
    /* useEffect(() => {
        // initializing the localStorage persist value
        localStorage.setItem("persist", JSON.stringify(isAuthenticated))
    }, []) */

  return { authUser: isAuthenticated, setauthUser: setIsAuthenticated }
}

export default usePersist