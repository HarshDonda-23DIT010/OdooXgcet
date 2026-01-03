import multer from 'multer';

// Configure multer to store files in memory
const storage = multer.memoryStorage();

// File filter for images only (profile pictures)
const imageFileFilter = (req, file, cb) => {
  // Accept images only
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed for profile pictures!'), false);
  }
};

// File filter for documents (accept images and PDFs)
const documentFileFilter = (req, file, cb) => {
  // Accept images and PDFs
  const allowedTypes = ['image/', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument'];
  
  if (allowedTypes.some(type => file.mimetype.includes(type))) {
    cb(null, true);
  } else {
    cb(new Error('Only images, PDFs, and document files are allowed!'), false);
  }
};

// Multer upload configuration for profile pictures
export const uploadImage = multer({
  storage: storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Multer upload configuration for documents (higher limit)
export const uploadDocument = multer({
  storage: storage,
  fileFilter: documentFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for documents
  },
});

// Default export for backward compatibility
export const upload = uploadImage;
