import { useMutation, useQueryClient } from '@tanstack/react-query'
import React from 'react'
import toast from 'react-hot-toast'

const useFollow = () => {
    const queryClient = useQueryClient()

    const {mutate: followUnFollow, data: userToFollow} = useMutation({
        mutationFn: async(id) => {
            try {
                const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/followUnFollow/${id}`, {
                    method: 'POST',
                    credentials: "include", // This is essential for cross-origin cookies
                })
                const data = await res.json()

                if(!res.ok) throw new Error(err.message)

                return data    

            } catch (err) {
                throw new Error(err.message)
            }
        },
        onError: (error) => {
            toast.error(error.message)
        },
        onSuccess: (data) => {
            console.log(`You ${data.message} ${data.userToFollow.username} Successfully`)
            toast.success(`You ${data.message} ${data.userToFollow.username} Successfully`)
            queryClient.invalidateQueries('suggestedUsers')
            
        }

    })

  return { followUnFollow } 
}

export default useFollow