import connectDB from '../../../lib/mongodb';
import User from '../../../models/User';
import { getUserFromRequest } from '../../../lib/auth';
import { uploadImage, deleteImage } from '../../../lib/cloudinary';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();

    const userId = await getUserFromRequest(req);

    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Parse form data
    const form = formidable({});
    const [fields, files] = await form.parse(req);

    // Update username if provided
    if (fields.username && fields.username[0]) {
      const username = fields.username[0];
      
      // Check if username is already taken
      const existingUser = await User.findOne({ username, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ message: 'Username already taken' });
      }
      
      user.username = username;
    }

    // Update profile picture if provided
    if (files.profilePicture && files.profilePicture[0]) {
      const file = files.profilePicture[0];
      
      // Delete old image from Cloudinary if exists
      if (user.cloudinaryId) {
        await deleteImage(user.cloudinaryId);
      }

      // Upload new image to Cloudinary
      const result = await uploadImage(file.filepath);
      user.profilePicture = result.url;
      user.cloudinaryId = result.publicId;

      // Clean up temporary file
      fs.unlinkSync(file.filepath);
    }

    await user.save();

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
        stats: user.stats,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ message: 'Server error. Please try again.' });
  }
}

