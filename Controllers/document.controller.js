import 'dotenv/config';
import { User } from '../models/user.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { apiResponseErr, apiResponseSuccess } from '../utils/serverError.js';
import { Document } from '../models/document.model.js';

export const uploadDocuments = async (req, res) => {
  try {
    const { userId } = req.params;
    let { type, file } = req.body;
    type = type.trim();

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send(apiResponseErr(null, false, 404, 'User not found'));
    }

    const cloudinaryResponse = await uploadOnCloudinary(file);
    if (!cloudinaryResponse || !cloudinaryResponse.url) {
      return res.status(500).send(apiResponseErr(null, false, 500, 'Failed to upload file to Cloudinary'));
    }

    if (!Array.isArray(user.documents)) {
      user.documents = [];
    }

    const newDocument = new Document({
      userId: userId,
      userName: user.userName,
      type,
      fileUrl: cloudinaryResponse.url, 
      uploadDate: new Date(),
    });

    await newDocument.save();

    user.documents.push(newDocument);
    await user.save();

    const responseData = {
      _id: newDocument._id,
      userId: newDocument.userId,
      userName: newDocument.userName,
      type: newDocument.type,
      fileUrl: newDocument.fileUrl,
      uploadDate: newDocument.uploadDate,
    };

    return res.status(200).send(apiResponseSuccess(responseData, true, 200, 'Document uploaded successfully'));
  } catch (error) {
    return res.status(500).send(apiResponseErr(null, false, 500, 'Internal Server Error'));
  }
};

export const getDocuments = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('userId userName');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const documents = await Document.find({ userId });

    return res.status(200).json({
      userId: user.userId,
      userName: user.userName,
      documents: documents,
    });
  } catch (error) {
    console.error('Error retrieving user details:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


export const updateDocument = async (req, res) => {
  const { documentId, userId } = req.params;
  const { type, file } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    console.error('User not found');
    return res.status(404).send(apiResponseErr(null, false, 404, 'User not found'));
  }

  if (!file) {
    return res.status(400).send(apiResponseErr(null, false, 400, 'No file data uploaded'));
  }

  try {
    const uploadResponse = await uploadOnCloudinary(file);

    if (!uploadResponse) {
      return res.status(500).send(apiResponseErr(null, false, 500, 'Failed to upload file to Cloudinary'));
    }

    const updatedDocument = await Document.findByIdAndUpdate(
      documentId,
      {
        userId,
        type,
        fileUrl: uploadResponse.url,
        uploadDate: new Date(),
      },
      { new: true, runValidators: true },
    );

    if (!updatedDocument) {
      return res.status(404).send(apiResponseErr(null, false, 404, 'Document not found'));
    }

    return res.status(200).send(apiResponseSuccess(updatedDocument, true, 200, 'Document updated successfully'));
  } catch (error) {
    return res.status(500).send(apiResponseErr(null, false, 500, `Internal Server Error: ${error.message}`));
  }
};



export const deleteDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    await Document.findByIdAndDelete(documentId);

    return res.status(200).json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
