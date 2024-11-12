import { CiImageOn } from "react-icons/ci";
import { BsEmojiSmileFill } from "react-icons/bs";
import { useRef, useState } from "react";
import { IoCloseSharp } from "react-icons/io5";
import { QueryClient, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const CreatePost = () => {
	const [text, setText] = useState("");
	const [img, setImg] = useState(null);
	const [imgFile, setImgFile] = useState(null);

	const imgRef = useRef(null);

	const data = {
		profileImg: "/avatars/user5.jpg",
	};

	const queryClient = useQueryClient()

	const {mutate: createPost, isPending, isError, error} = useMutation({
		mutationFn: async({text, imgFile}) => {
			try {
				const formData = new FormData()
				console.log({text: typeof text, imgFile: typeof imgFile})
				formData.append('text', text)
				formData.append('img', imgFile)
				const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/posts/create`, {
					method: 'POST',
					credentials: "include", // This is essential for cross-origin cookies
					body: formData
				})

				const data = await res.json()

				if(!res.ok) {					
					throw new Error(data.message)
				}

				return data.post

			} catch (error) {
				throw new Error('Unable to create the post: '+error.message)
			}
		}, 
		onError: (error) => toast.error(error.message),
		onSuccess: () => {
			toast.success("Post Created Successfuly")
			setImg(null)
			setText('')
			queryClient.invalidateQueries('posts')
		}
	})

	const handleSubmit = (e) => {
		e.preventDefault();
		createPost({text, imgFile})
	};

/*     This pattern is commonly used for custom file upload interfaces, especially for profile picture or avatar uploads.
 */
	const handleImgChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			setImgFile(file)
			/* const reader = new FileReader();
			reader.onload = () => {
				setImg(reader.result);
			};
			reader.readAsDataURL(file); */
			setImg(URL.createObjectURL(file))
		}
	};

	return (
		<div className='flex p-4 items-start gap-4 border-b border-gray-700'>
			<div className='avatar'>
				<div className='w-8 rounded-full'>
					<img src={data.profileImg || "/avatar-placeholder.png"} />
				</div>
			</div>
			<form className='flex flex-col gap-2 w-full' onSubmit={handleSubmit}>
				<textarea placeholder='What is happening?!' value={text} onChange={(e) => setText(e.target.value)}
					className='textarea w-full p-0 text-lg resize-y border-none focus:outline-none  border-gray-800'/>
				{img && (
					<div className='relative w-full mx-auto'>
						<IoCloseSharp
							className='absolute top-0 right-0 text-white bg-gray-800 rounded-full w-5 h-5 cursor-pointer'
							onClick={() => {	
								setImg(null);	
								imgRef.current.value = null;
								}
							}/>
						<img src={img} className='mx-auto h-72 object-contain rounded' />
					</div>
				)}

				<div className='flex justify-between border-t py-2 border-t-gray-700'>
					<div className='flex gap-1 items-center'>
                        {/* when clicked, triggers a click on the hidden file input. */}
						<CiImageOn	className='fill-primary w-6 h-6 cursor-pointer'
							onClick={() => imgRef.current.click()}/>
						<BsEmojiSmileFill className='fill-primary w-5 h-5 cursor-pointer' />
					</div>
					<input type='file' hidden ref={imgRef} onChange={handleImgChange} />
					<button className='btn btn-primary rounded-full btn-sm text-white px-4'>
						{isPending ? "Posting..." : "Post"}
					</button>
				</div>
				{isError && <div className='text-red-500'>Something went wrong</div>}
			</form>
		</div>
	);
};
export default CreatePost;