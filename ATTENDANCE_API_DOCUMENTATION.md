# Attendance Management System - Backend API Documentation

## Overview
This document provides comprehensive documentation for the Attendance Management System backend. The system supports both employee and admin functionalities for tracking and managing attendance records.

## API Base URL
```
http://localhost:5000/api/attendance
```

## Authentication
All endpoints require authentication via JWT token stored in cookies. The token is set during login.

---

## Employee Endpoints

### 1. Check In
**Endpoint:** `POST /api/attendance/check-in`  
**Authentication:** Required  
**Description:** Records employee check-in time for the current day

**Request Body:**
```json
{
  "notes": "Starting work on project X" // Optional
}
```

**Success Response (200):**
```json
{
  "statusCode": 200,
  "data": {
    "_id": "attendance_id",
    "employeeId": {
      "firstName": "John",
      "lastName": "Doe",
      "employeeCode": "EMP001",
      "department": "Engineering"
    },
    "userId": {
      "email": "john@example.com"
    },
    "companyId": "company_id",
    "date": "2026-01-03T00:00:00.000Z",
    "checkIn": "2026-01-03T09:00:00.000Z",
    "checkOut": null,
    "workingHours": 0,
    "status": "Present",
    "notes": "Starting work on project X"
  },
  "message": "Checked in successfully",
  "success": true
}
```

**Error Responses:**
- `400` - Already checked in today
- `404` - Employee profile not found
- `401` - Unauthorized (no token)

---

### 2. Check Out
**Endpoint:** `POST /api/attendance/check-out`  
**Authentication:** Required  
**Description:** Records employee check-out time for the current day

**Request Body:**
```json
{
  "notes": "Completed tasks for the day" // Optional
}
```

**Success Response (200):**
```json
{
  "statusCode": 200,
  "data": {
    "_id": "attendance_id",
    "checkIn": "2026-01-03T09:00:00.000Z",
    "checkOut": "2026-01-03T18:00:00.000Z",
    "workingHours": 9.0,
    "status": "Present"
  },
  "message": "Checked out successfully",
  "success": true
}
```

**Error Responses:**
- `400` - No check-in record found for today
- `400` - Already checked out today
- `404` - Employee profile not found

---

### 3. Get Today's Attendance
**Endpoint:** `GET /api/attendance/today`  
**Authentication:** Required  
**Description:** Retrieves the current day's attendance record for the logged-in employee

**Success Response (200):**
```json
{
  "statusCode": 200,
  "data": {
    "_id": "attendance_id",
    "checkIn": "2026-01-03T09:00:00.000Z",
    "checkOut": null,
    "workingHours": 0,
    "status": "Present",
    "notes": ""
  },
  "message": "Today's attendance retrieved successfully",
  "success": true
}
```

**Note:** Returns `null` in data if no attendance record exists for today.

---

### 4. Get My Attendance History
**Endpoint:** `GET /api/attendance/my-attendance`  
**Authentication:** Required  
**Description:** Retrieves attendance history for the logged-in employee with pagination

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Records per page (default: 10)

**Example:** `GET /api/attendance/my-attendance?page=1&limit=10`

**Success Response (200):**
```json
{
  "statusCode": 200,
  "data": {
    "attendance": [
      {
        "_id": "attendance_id",
        "date": "2026-01-03T00:00:00.000Z",
        "checkIn": "2026-01-03T09:00:00.000Z",
        "checkOut": "2026-01-03T18:00:00.000Z",
        "workingHours": 9.0,
        "status": "Present",
        "notes": ""
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalRecords": 50,
      "hasMore": true
    }
  },
  "message": "Attendance history retrieved successfully",
  "success": true
}
```

---

## Admin Endpoints

### 5. Get All Attendance Records
**Endpoint:** `GET /api/attendance/all`  
**Authentication:** Required (Admin)  
**Description:** Retrieves all attendance records with filtering and pagination

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Records per page (default: 20)
- `startDate` (optional): Filter by start date (YYYY-MM-DD)
- `endDate` (optional): Filter by end date (YYYY-MM-DD)
- `status` (optional): Filter by status (Present, Absent, Half-day, Leave)
- `employeeId` (optional): Filter by specific employee

**Example:** `GET /api/attendance/all?startDate=2026-01-01&endDate=2026-01-31&status=Present&page=1&limit=20`

**Success Response (200):**
```json
{
  "statusCode": 200,
  "data": {
    "attendance": [
      {
        "_id": "attendance_id",
        "employeeId": {
          "firstName": "John",
          "lastName": "Doe",
          "employeeCode": "EMP001",
          "department": "Engineering"
        },
        "date": "2026-01-03T00:00:00.000Z",
        "checkIn": "2026-01-03T09:00:00.000Z",
        "checkOut": "2026-01-03T18:00:00.000Z",
        "workingHours": 9.0,
        "status": "Present",
        "notes": ""
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalRecords": 200,
      "hasMore": true
    }
  },
  "message": "All attendance records retrieved successfully",
  "success": true
}
```

---

### 6. Get Attendance Summary
**Endpoint:** `GET /api/attendance/summary`  
**Authentication:** Required (Admin)  
**Description:** Retrieves aggregated attendance statistics

**Query Parameters:**
- `startDate` (optional): Start date for summary (YYYY-MM-DD)
- `endDate` (optional): End date for summary (YYYY-MM-DD)

**Example:** `GET /api/attendance/summary?startDate=2026-01-01&endDate=2026-01-31`

**Success Response (200):**
```json
{
  "statusCode": 200,
  "data": {
    "total": 150,
    "Present": 120,
    "Absent": 15,
    "Half-day": 10,
    "Leave": 5
  },
  "message": "Attendance summary retrieved successfully",
  "success": true
}
```

---

### 7. Export Attendance to Excel/CSV
**Endpoint:** `GET /api/attendance/export/excel`  
**Authentication:** Required (Admin)  
**Description:** Exports attendance records to CSV format

**Query Parameters:**
- `startDate` (optional): Start date filter
- `endDate` (optional): End date filter
- `status` (optional): Status filter
- `employeeId` (optional): Employee filter

**Response:** CSV file download with headers:
```
Employee Code,Employee Name,Department,Date,Check In,Check Out,Working Hours,Status,Notes
```

---

### 8. Export Employees List to Excel/CSV
**Endpoint:** `GET /api/attendance/export/employees`  
**Authentication:** Required (Admin)  
**Description:** Exports complete employee list to CSV format

**Response:** CSV file download with headers:
```
Employee Code,First Name,Last Name,Email,Department,Designation,Join Date,Phone,Status
```

---

### 9. Manually Mark Attendance
**Endpoint:** `POST /api/attendance/mark`  
**Authentication:** Required (Admin)  
**Description:** Manually create an attendance record for an employee

**Request Body:**
```json
{
  "employeeId": "employee_object_id",
  "date": "2026-01-03",
  "checkIn": "2026-01-03T09:00:00.000Z", // Optional
  "checkOut": "2026-01-03T18:00:00.000Z", // Optional
  "status": "Present", // Required: Present, Absent, Half-day, Leave
  "notes": "Manually marked by admin" // Optional
}
```

**Success Response (201):**
```json
{
  "statusCode": 201,
  "data": {
    "_id": "attendance_id",
    "employeeId": {...},
    "date": "2026-01-03T00:00:00.000Z",
    "checkIn": "2026-01-03T09:00:00.000Z",
    "checkOut": "2026-01-03T18:00:00.000Z",
    "workingHours": 9.0,
    "status": "Present",
    "notes": "Manually marked by admin"
  },
  "message": "Attendance marked successfully",
  "success": true
}
```

**Error Responses:**
- `400` - Missing required fields
- `400` - Attendance record already exists for this date
- `404` - Employee not found

---

### 10. Update Attendance Record
**Endpoint:** `PUT /api/attendance/:id`  
**Authentication:** Required (Admin)  
**Description:** Updates an existing attendance record

**URL Parameters:**
- `id`: Attendance record ID

**Request Body:**
```json
{
  "checkIn": "2026-01-03T09:00:00.000Z", // Optional
  "checkOut": "2026-01-03T18:00:00.000Z", // Optional
  "status": "Present", // Optional
  "notes": "Updated by admin" // Optional
}
```

**Success Response (200):**
```json
{
  "statusCode": 200,
  "data": {
    "_id": "attendance_id",
    // Updated attendance record
  },
  "message": "Attendance updated successfully",
  "success": true
}
```

**Error Responses:**
- `404` - Attendance record not found

---

### 11. Delete Attendance Record
**Endpoint:** `DELETE /api/attendance/:id`  
**Authentication:** Required (Admin)  
**Description:** Deletes an attendance record

**URL Parameters:**
- `id`: Attendance record ID

**Success Response (200):**
```json
{
  "statusCode": 200,
  "data": null,
  "message": "Attendance deleted successfully",
  "success": true
}
```

**Error Responses:**
- `404` - Attendance record not found

---

## Database Schema

### Attendance Model
```javascript
{
  employeeId: ObjectId (ref: Employee),
  userId: ObjectId (ref: User),
  companyId: ObjectId (ref: Company),
  date: Date,
  checkIn: Date,
  checkOut: Date,
  workingHours: Number (auto-calculated),
  status: String (enum: ["Present", "Absent", "Half-day", "Leave"]),
  notes: String,
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

### Automatic Calculations
- **Working Hours**: Automatically calculated when both checkIn and checkOut are present
- **Status**: Automatically determined based on working hours:
  - >= 8 hours: Present
  - >= 4 hours: Half-day
  - < 4 hours: Half-day

---

## Error Handling

All endpoints return errors in the following format:
```json
{
  "statusCode": 400,
  "data": null,
  "message": "Error message here",
  "success": false
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

---

## Usage Examples

### Frontend Integration Example

```javascript
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Check in
const checkIn = async (notes) => {
  try {
    const response = await axios.post(
      `${API_URL}/attendance/check-in`,
      { notes },
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error('Check in error:', error);
    throw error;
  }
};

// Get attendance history
const getMyAttendance = async (page = 1, limit = 10) => {
  try {
    const response = await axios.get(
      `${API_URL}/attendance/my-attendance?page=${page}&limit=${limit}`,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error('Get attendance error:', error);
    throw error;
  }
};

// Admin: Get all attendance
const getAllAttendance = async (filters) => {
  try {
    const params = new URLSearchParams(filters);
    const response = await axios.get(
      `${API_URL}/attendance/all?${params}`,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error('Get all attendance error:', error);
    throw error;
  }
};
```

---

## Testing with Postman/Thunder Client

### 1. Login First
```
POST http://localhost:5000/api/auth/login
Body: { "email": "user@example.com", "password": "password" }
```

### 2. Check In
```
POST http://localhost:5000/api/attendance/check-in
Body: { "notes": "Starting work" }
```

### 3. Check Out
```
POST http://localhost:5000/api/attendance/check-out
Body: { "notes": "Ending work" }
```

### 4. Get Today's Attendance
```
GET http://localhost:5000/api/attendance/today
```

### 5. Get Attendance History
```
GET http://localhost:5000/api/attendance/my-attendance?page=1&limit=10
```

---

## Notes

- All dates are stored in UTC format
- The system automatically creates a single attendance record per employee per day
- Employees can only check in once and check out once per day
- Admins have full access to all attendance records
- Working hours are calculated automatically when both check-in and check-out times exist
- CSV exports use the current filters applied in the request

---

## Future Enhancements

Potential features to add:
- Late arrival notifications
- Early departure tracking
- Overtime calculation
- Leave integration with attendance
- Biometric device integration
- Mobile app support
- Real-time attendance dashboard
- Automated attendance reports via email
- Shift-based attendance tracking
