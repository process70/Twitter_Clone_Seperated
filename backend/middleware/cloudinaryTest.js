import cloudinary from 'cloudinary'
export const testCloudinaryConfig = async() => {
    try {
        // Test configuration
        const testResult = await cloudinary.v2.api.ping();
        console.log('Cloudinary configuration test:', testResult);
        
        // Test API access
        const usage = await cloudinary.v2.api.usage();
        console.log('API access test successful:', usage);
        
        return true;
    } catch (error) {
        console.error('Cloudinary configuration test failed:', {
            message: error.message,
            code: error.code,
            name: error.name
        });
        return false;
    }
}