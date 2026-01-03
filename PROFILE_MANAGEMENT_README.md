# Employee Profile Management System

## Overview
Complete employee profile management system with Cloudinary integration for profile pictures and documents. Includes role-based edit permissions and comprehensive profile views.

## Features Implemented

### 1. **Employee Model Enhancement**
- **Personal Details**: First name, last name, date of birth, gender, phone
- **Address**: Street address, city, state, ZIP code, country
- **Emergency Contact**: Name and phone number
- **Job Details**: Employee code, department, designation, joining date, employment type, work location, reporting to, status
- **Salary Structure**: Basic salary, allowances (HRA, transport, medical, other), deductions (tax, provident fund, insurance, other)
- **Documents**: Array with document type, name, URL, Cloudinary public ID, upload date
- **Profile Picture**: URL and Cloudinary public ID for easy deletion

### 2. **Backend Implementation**

#### Cloudinary Configuration (`server/config/cloudinary.js`)
```javascript
- uploadToCloudinary(fileBuffer, folder)
  - Uploads image to Cloudinary
  - Applies transformations: 500x500 crop with face detection, auto quality/format
  - Returns: { url, publicId }

- deleteFromCloudinary(publicId)
  - Deletes image/document from Cloudinary
  - Returns: Cloudinary deletion result
```

#### Multer Middleware (`server/middleware/upload.js`)
- Memory storage configuration
- Image-only filter for profile pictures
- 5MB file size limit
- Error handling for invalid files

#### Profile Controller (`server/controllers/profile.controller.js`)
Seven endpoints with comprehensive functionality:

1. **GET /api/profile/me** - Get current user's profile
   - Returns: Full employee profile with populated user data

2. **GET /api/profile/:employeeId** - Get specific employee profile
   - Permission check: Admin or own profile only
   - Returns: Employee profile with user data

3. **PUT /api/profile/:employeeId** - Update employee profile
   - **Employee permissions**: phone, address, city, state, zipCode, country, emergency contacts
   - **Admin permissions**: All fields including salary, department, designation
   - Returns: Updated employee profile

4. **POST /api/profile/:employeeId/upload-picture** - Upload profile picture
   - Deletes old profile picture from Cloudinary if exists
   - Uploads new image with transformations (500x500, face crop)
   - Updates profileImage and profileImagePublicId
   - Returns: Updated employee profile

5. **POST /api/profile/:employeeId/upload-document** - Upload document
   - Accepts document file and type (Resume, ID Proof, Address Proof, etc.)
   - Uploads to Cloudinary
   - Adds to employee.documents array
   - Returns: Updated employee profile

6. **DELETE /api/profile/:employeeId/document/:documentId** - Delete document
   - Deletes document from Cloudinary
   - Removes from employee.documents array
   - Returns: Updated employee profile

7. **GET /api/profile/all** - Get all employees (Admin only)
   - Returns: List of all employees with user data

#### Routes (`server/routes/profile.routes.js`)
- All routes protected with JWT authentication
- File upload routes use Multer middleware
- Proper route ordering for RESTful API design

### 3. **Frontend Implementation**

#### Profile Component (`client/src/components/pages/ProfileNew.jsx`)

**Key Features:**
- Complete profile view with all fields
- Role-based edit permissions
- Image upload with preview
- Document management UI
- Salary structure display (admin only)
- Real-time validation and error handling
- Loading states and toast notifications

**Sections:**
1. **Profile Picture**
   - Display current profile picture
   - Camera icon for editing (visible when in edit mode)
   - Image preview before upload
   - Upload/Cancel buttons

2. **Personal Information**
   - First/Last name (admin edit only)
   - Email (read-only)
   - Phone (editable by all)
   - Date of birth (admin edit only)
   - Gender dropdown (admin edit only)

3. **Address**
   - Street address, city, state, ZIP code, country
   - All fields editable by employees

4. **Emergency Contact**
   - Contact name and phone
   - Editable by all employees

5. **Job Details**
   - Employee code (read-only)
   - Department, designation (admin edit only)
   - Joining date (admin edit only)
   - Employment type, work location (admin edit only)
   - Status badge (ACTIVE/INACTIVE)

6. **Salary Structure (Admin Only)**
   - Basic salary
   - Allowances breakdown (HRA, transport, medical, other)
   - Deductions breakdown (tax, provident fund, insurance, other)
   - Salary summary with totals
   - Net salary calculation

7. **Documents**
   - Upload new document with type selection
   - Document list with view/delete options
   - File type, name, and upload date display

## API Endpoints Summary

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/profile/me` | All authenticated users | Get own profile |
| GET | `/api/profile/:employeeId` | Admin or owner | Get specific employee profile |
| PUT | `/api/profile/:employeeId` | Admin or owner | Update profile (role-based fields) |
| POST | `/api/profile/:employeeId/upload-picture` | Admin or owner | Upload profile picture |
| POST | `/api/profile/:employeeId/upload-document` | Admin or owner | Upload document |
| DELETE | `/api/profile/:employeeId/document/:documentId` | Admin or owner | Delete document |
| GET | `/api/profile/all` | Admin only | Get all employees |

## Environment Variables Required

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=dknsejweq
CLOUDINARY_API_KEY=642886885475136
CLOUDINARY_API_SECRET=7imeQj_qMSgTFXJpsnW686wSHus

# MongoDB
MONGO_URI=mongodb://127.0.0.1:27017/GCET

# JWT
JWT_SECRET=your_jwt_secret_here

# Email (Gmail SMTP)
EMAIL_USER=dondaharsh04@gmail.com
EMAIL_PASSWORD=spubcpporrfvkemg
```

## Testing Guide

### 1. Start Backend Server
```bash
cd server
npm install  # if not already installed
node index.js
```
Server should start on `http://localhost:5000`

### 2. Start Frontend Development Server
```bash
cd client
npm install  # if not already installed
npm run dev
```
Frontend should start on `http://localhost:5173`

### 3. Test Profile Features

#### As Employee:
1. Sign in with employee credentials
2. Navigate to Profile page
3. Click "Edit Profile"
4. Test editing:
   - Phone number ✓
   - Full address ✓
   - Emergency contact ✓
5. Upload profile picture:
   - Click camera icon
   - Select image (< 5MB)
   - Click "Upload Image"
6. Upload document:
   - Select document type
   - Choose file
   - Click "Upload"
7. View documents and delete if needed

#### As Admin/HR:
1. Sign in with admin credentials
2. Navigate to Profile page
3. Click "Edit Profile"
4. Test editing all fields including:
   - Personal info (name, DOB, gender) ✓
   - Job details (department, designation) ✓
   - Salary structure (basic, allowances, deductions) ✓
5. View salary summary with calculations
6. All employee features available

### 4. Verify Cloudinary Integration
1. Upload profile picture
2. Check Cloudinary dashboard:
   - Image should be in correct folder
   - Transformations applied (500x500, face crop)
3. Upload document
4. Delete document
5. Verify deletion from Cloudinary

### 5. Test API Endpoints (Postman/Thunder Client)

```bash
# Get my profile
GET http://localhost:5000/api/profile/me
Cookie: jwt=<your_jwt_token>

# Update profile
PUT http://localhost:5000/api/profile/:employeeId
Cookie: jwt=<your_jwt_token>
Body: { "phone": "+91 12345 67890", "city": "Mumbai" }

# Upload profile picture
POST http://localhost:5000/api/profile/:employeeId/upload-picture
Cookie: jwt=<your_jwt_token>
Body (form-data): image=<select_file>

# Upload document
POST http://localhost:5000/api/profile/:employeeId/upload-document
Cookie: jwt=<your_jwt_token>
Body (form-data): 
  - document=<select_file>
  - type="Resume"

# Delete document
DELETE http://localhost:5000/api/profile/:employeeId/document/:documentId
Cookie: jwt=<your_jwt_token>

# Get all employees (Admin only)
GET http://localhost:5000/api/profile/all
Cookie: jwt=<your_jwt_token>
```

## Role-Based Permissions

### Employee Can Edit:
- Phone
- Address (street, city, state, ZIP, country)
- Emergency contact (name, phone)
- Profile picture
- Upload/delete documents

### Employee Can Only View:
- First/Last name
- Email
- Date of birth, gender
- Employee code
- Department, designation
- Joining date
- Employment type, work location
- Status

### Admin/HR Can Edit:
- **All employee fields PLUS:**
- First/Last name
- Date of birth, gender
- Department, designation
- Joining date
- Employment type, work location
- Reporting to
- Basic salary
- Allowances (HRA, transport, medical, other)
- Deductions (tax, provident fund, insurance, other)
- Status

### Admin/HR Exclusive Views:
- Salary structure section
- All employees list (`/api/profile/all`)

## Image Transformations

Profile pictures are automatically optimized:
- **Size**: 500x500 pixels
- **Crop**: Face detection with gravity
- **Quality**: Auto (Cloudinary optimizes)
- **Format**: Auto (Cloudinary chooses best format)

## Security Features

1. **Authentication**: All routes require valid JWT token
2. **Authorization**: Role-based access control (Employee vs Admin)
3. **File Validation**: 
   - Image type check for profile pictures
   - 5MB file size limit
   - Server-side validation
4. **Permission Checks**: 
   - Users can only edit their own profiles
   - Admins can edit any profile
   - Field-level permissions based on role

## Error Handling

- **401 Unauthorized**: Missing or invalid JWT token
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Employee profile not found
- **400 Bad Request**: Invalid file type or size
- **500 Internal Server Error**: Server or Cloudinary errors

All errors return JSON with:
```json
{
  "success": false,
  "message": "Error description"
}
```

## Future Enhancements

1. **Profile Completion Indicator**: Show percentage of completed fields
2. **Profile Picture Crop**: Frontend cropping tool before upload
3. **Document Preview**: Display PDFs/images in modal
4. **Profile History**: Track changes with audit log
5. **Bulk Document Upload**: Upload multiple documents at once
6. **Employee Search**: Search employees by name, department, designation
7. **Export Profile**: Download profile as PDF
8. **Profile Analytics**: View profile views, document downloads

## Troubleshooting

### Profile not loading
- Check if backend server is running
- Verify JWT token in cookies
- Check browser console for errors
- Verify employee record exists in database

### Image upload failing
- Check file size (< 5MB)
- Verify file is an image type
- Check Cloudinary credentials in .env
- Check server logs for Cloudinary errors

### Salary not visible
- Verify user role is ADMIN or HR
- Check if employee has salary data in database
- Clear browser cache and reload

### Permission denied errors
- Verify user is trying to edit their own profile
- Check user role for admin-only fields
- Verify JWT token is valid

## Dependencies

### Backend
- `cloudinary@2.8.0` - Image/document storage and transformations
- `multer@2.0.2` - File upload handling
- `mongoose` - MongoDB ODM
- `express` - Web framework
- `jsonwebtoken` - JWT authentication
- `dotenv` - Environment variables

### Frontend
- `react@19` - UI framework
- `axios@1.13.2` - HTTP client
- `react-hot-toast@2.6.0` - Toast notifications
- `lucide-react` - Icons
- `react-router-dom@7.11.0` - Routing
- `react-redux@9.2.0` - State management

## File Structure

```
server/
├── config/
│   └── cloudinary.js          # Cloudinary configuration
├── controllers/
│   └── profile.controller.js  # Profile API logic
├── middleware/
│   ├── auth.middleware.js     # JWT verification
│   └── upload.js              # Multer configuration
├── model/
│   └── employee.model.js      # Employee schema
├── routes/
│   └── profile.routes.js      # Profile routes
└── index.js                   # Server entry point

client/
├── src/
│   ├── components/
│   │   └── pages/
│   │       └── ProfileNew.jsx # Profile component
│   └── App.jsx                # Routes configuration
```

## Notes

- Profile pictures are stored in Cloudinary under `employee_profiles` folder
- Documents are stored in Cloudinary under `employee_documents` folder
- All images are optimized automatically by Cloudinary
- Employee model includes virtual fields for salary calculations
- Make sure to configure CORS to allow credentials

## Support

For issues or questions:
1. Check browser console for frontend errors
2. Check server logs for backend errors
3. Verify all environment variables are set
4. Ensure MongoDB is running
5. Verify Cloudinary credentials are correct
