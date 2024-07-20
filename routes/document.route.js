import express from 'express';
import { upload } from '../middleware/multer.js';
import { Authorize } from '../middleware/auth.js';
import { deleteDocument, getDocuments, updateDocument, uploadDocuments } from '../controllers/document.controller.js';
import customErrorHandler from '../middleware/customErrorHandler.js';
import { validateDeleteDocument, validateGetDocuments, validateUpdateDocument, validateUploadDocuments } from '../schema/commonSchema.js';


export const DocumentRoute = express();

DocumentRoute.post('/uploadDocument/:userId', upload.single('file'), Authorize(['Admin']),validateUploadDocuments,customErrorHandler,uploadDocuments);
DocumentRoute.get('/documents/:userId', validateGetDocuments,customErrorHandler,getDocuments);
DocumentRoute.put('/updateDocument/:userId/:documentId', upload.single('file'), Authorize(['Admin']),validateUpdateDocument,customErrorHandler,updateDocument);
DocumentRoute.delete('/document/:documentId', Authorize(['Admin']),validateDeleteDocument,customErrorHandler,deleteDocument);

