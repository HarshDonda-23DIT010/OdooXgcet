import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { User, Mail, Phone, MapPin, Calendar, Briefcase, DollarSign, FileText, Upload, Trash2, Save, X, Edit, Camera } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:5000/api';

const ProfileNew = () => {
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'HR';
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [documentFile, setDocumentFile] = useState(null);
  const [documentType, setDocumentType] = useState('Resume');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/profile/me`, { withCredentials: true });
      setProfile(response.data.data);
      setFormData(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch profile');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested objects (allowances, deductions)
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleImageUpload = async () => {
    if (!imageFile) {
      toast.error('Please select an image');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await axios.post(
        `${API_URL}/profile/${profile._id}/upload-picture`,
        formData,
        {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );

      setProfile(response.data.data);
      setImageFile(null);
      setImagePreview(null);
      toast.success('Profile picture updated successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(error.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleDocumentUpload = async () => {
    if (!documentFile) {
      toast.error('Please select a document');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('document', documentFile);
      formData.append('type', documentType);

      const response = await axios.post(
        `${API_URL}/profile/${profile._id}/upload-document`,
        formData,
        {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );

      setProfile(response.data.data);
      setDocumentFile(null);
      setDocumentType('Resume');
      toast.success('Document uploaded successfully');
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error(error.response?.data?.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleDocumentDelete = async (documentId) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      const response = await axios.delete(
        `${API_URL}/profile/${profile._id}/document/${documentId}`,
        { withCredentials: true }
      );

      setProfile(response.data.data);
      toast.success('Document deleted successfully');
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error(error.response?.data?.message || 'Failed to delete document');
    }
  };

  const handleUpdate = async () => {
    try {
      const response = await axios.put(
        `${API_URL}/profile/${profile._id}`,
        formData,
        { withCredentials: true }
      );

      setProfile(response.data.data);
      setFormData(response.data.data);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    setFormData(profile);
    setIsEditing(false);
    setImageFile(null);
    setImagePreview(null);
  };

  const calculateTotalSalary = () => {
    if (!profile) return 0;
    const allowancesTotal = Object.values(profile.allowances || {}).reduce((sum, val) => sum + (val || 0), 0);
    return (profile.basicSalary || 0) + allowancesTotal;
  };

  const calculateTotalDeductions = () => {
    if (!profile) return 0;
    return Object.values(profile.deductions || {}).reduce((sum, val) => sum + (val || 0), 0);
  };

  const calculateNetSalary = () => {
    return calculateTotalSalary() - calculateTotalDeductions();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#097087]"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#097087] text-white rounded-lg hover:bg-[#075a6a] transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleUpdate}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Profile Picture */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Profile Picture</h2>
        <div className="flex items-center gap-6">
          <div className="relative">
            <img
              src={imagePreview || profile.profileImage || 'https://via.placeholder.com/150'}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover border-4 border-[#097087]"
            />
            {isEditing && (
              <label className="absolute bottom-0 right-0 bg-[#097087] text-white p-2 rounded-full cursor-pointer hover:bg-[#075a6a] transition-colors">
                <Camera className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </label>
            )}
          </div>
          {imageFile && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">New image selected: {imageFile.name}</p>
              <div className="flex gap-2">
                <button
                  onClick={handleImageUpload}
                  disabled={uploading}
                  className="px-4 py-2 bg-[#097087] text-white rounded-lg hover:bg-[#075a6a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Uploading...' : 'Upload Image'}
                </button>
                <button
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-[#097087]" />
          Personal Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            {isEditing && isAdmin ? (
              <input
                type="text"
                name="firstName"
                value={formData.firstName || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097087] focus:border-transparent"
              />
            ) : (
              <p className="text-gray-900">{profile.firstName || 'N/A'}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            {isEditing && isAdmin ? (
              <input
                type="text"
                name="lastName"
                value={formData.lastName || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097087] focus:border-transparent"
              />
            ) : (
              <p className="text-gray-900">{profile.lastName || 'N/A'}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <p className="text-gray-900">{profile.userId?.email || 'N/A'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            {isEditing ? (
              <input
                type="tel"
                name="phone"
                value={formData.phone || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097087] focus:border-transparent"
              />
            ) : (
              <p className="text-gray-900">{profile.phone || 'N/A'}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
            {isEditing && isAdmin ? (
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth?.split('T')[0] || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097087] focus:border-transparent"
              />
            ) : (
              <p className="text-gray-900">
                {profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : 'N/A'}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            {isEditing && isAdmin ? (
              <select
                name="gender"
                value={formData.gender || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097087] focus:border-transparent"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            ) : (
              <p className="text-gray-900">{profile.gender || 'N/A'}</p>
            )}
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-[#097087]" />
          Address
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
            {isEditing ? (
              <input
                type="text"
                name="address"
                value={formData.address || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097087] focus:border-transparent"
              />
            ) : (
              <p className="text-gray-900">{profile.address || 'N/A'}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            {isEditing ? (
              <input
                type="text"
                name="city"
                value={formData.city || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097087] focus:border-transparent"
              />
            ) : (
              <p className="text-gray-900">{profile.city || 'N/A'}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
            {isEditing ? (
              <input
                type="text"
                name="state"
                value={formData.state || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097087] focus:border-transparent"
              />
            ) : (
              <p className="text-gray-900">{profile.state || 'N/A'}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
            {isEditing ? (
              <input
                type="text"
                name="zipCode"
                value={formData.zipCode || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097087] focus:border-transparent"
              />
            ) : (
              <p className="text-gray-900">{profile.zipCode || 'N/A'}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
            {isEditing ? (
              <input
                type="text"
                name="country"
                value={formData.country || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097087] focus:border-transparent"
              />
            ) : (
              <p className="text-gray-900">{profile.country || 'N/A'}</p>
            )}
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Phone className="w-5 h-5 text-[#097087]" />
          Emergency Contact
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
            {isEditing ? (
              <input
                type="text"
                name="emergencyContactName"
                value={formData.emergencyContactName || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097087] focus:border-transparent"
              />
            ) : (
              <p className="text-gray-900">{profile.emergencyContactName || 'N/A'}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
            {isEditing ? (
              <input
                type="tel"
                name="emergencyContactPhone"
                value={formData.emergencyContactPhone || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097087] focus:border-transparent"
              />
            ) : (
              <p className="text-gray-900">{profile.emergencyContactPhone || 'N/A'}</p>
            )}
          </div>
        </div>
      </div>

      {/* Job Details */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-[#097087]" />
          Job Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employee Code</label>
            <p className="text-gray-900">{profile.employeeCode || 'N/A'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            {isEditing && isAdmin ? (
              <input
                type="text"
                name="department"
                value={formData.department || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097087] focus:border-transparent"
              />
            ) : (
              <p className="text-gray-900">{profile.department || 'N/A'}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
            {isEditing && isAdmin ? (
              <input
                type="text"
                name="designation"
                value={formData.designation || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097087] focus:border-transparent"
              />
            ) : (
              <p className="text-gray-900">{profile.designation || 'N/A'}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Joining Date</label>
            {isEditing && isAdmin ? (
              <input
                type="date"
                name="joiningDate"
                value={formData.joiningDate?.split('T')[0] || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097087] focus:border-transparent"
              />
            ) : (
              <p className="text-gray-900">
                {profile.joiningDate ? new Date(profile.joiningDate).toLocaleDateString() : 'N/A'}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type</label>
            {isEditing && isAdmin ? (
              <select
                name="employmentType"
                value={formData.employmentType || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097087] focus:border-transparent"
              >
                <option value="">Select Type</option>
                <option value="Full-Time">Full-Time</option>
                <option value="Part-Time">Part-Time</option>
                <option value="Contract">Contract</option>
                <option value="Intern">Intern</option>
              </select>
            ) : (
              <p className="text-gray-900">{profile.employmentType || 'N/A'}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Work Location</label>
            {isEditing && isAdmin ? (
              <select
                name="workLocation"
                value={formData.workLocation || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097087] focus:border-transparent"
              >
                <option value="">Select Location</option>
                <option value="Office">Office</option>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            ) : (
              <p className="text-gray-900">{profile.workLocation || 'N/A'}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
              profile.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {profile.status || 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Salary Structure - Admin Only */}
      {isAdmin && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[#097087]" />
            Salary Structure
          </h2>
          <div className="space-y-6">
            {/* Basic Salary */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Basic Salary</label>
              {isEditing ? (
                <input
                  type="number"
                  name="basicSalary"
                  value={formData.basicSalary || 0}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097087] focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900 text-lg font-semibold">₹{profile.basicSalary?.toLocaleString() || 0}</p>
              )}
            </div>

            {/* Allowances */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Allowances</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['hra', 'transport', 'medical', 'other'].map((key) => (
                  <div key={key}>
                    <label className="block text-sm text-gray-600 mb-1 capitalize">{key}</label>
                    {isEditing ? (
                      <input
                        type="number"
                        name={`allowances.${key}`}
                        value={formData.allowances?.[key] || 0}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097087] focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900">₹{profile.allowances?.[key]?.toLocaleString() || 0}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Deductions */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Deductions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['tax', 'providentFund', 'insurance', 'other'].map((key) => (
                  <div key={key}>
                    <label className="block text-sm text-gray-600 mb-1 capitalize">
                      {key === 'providentFund' ? 'Provident Fund' : key}
                    </label>
                    {isEditing ? (
                      <input
                        type="number"
                        name={`deductions.${key}`}
                        value={formData.deductions?.[key] || 0}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097087] focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900">₹{profile.deductions?.[key]?.toLocaleString() || 0}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            {!isEditing && (
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Salary:</span>
                  <span className="font-semibold text-gray-900">₹{calculateTotalSalary().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Deductions:</span>
                  <span className="font-semibold text-red-600">-₹{calculateTotalDeductions().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span className="text-gray-800">Net Salary:</span>
                  <span className="text-[#097087]">₹{calculateNetSalary().toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Documents */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#097087]" />
          Documents
        </h2>

        {/* Upload New Document */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Upload New Document</h3>
          <div className="flex flex-col md:flex-row gap-3">
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097087] focus:border-transparent"
            >
              <option value="Resume">Resume</option>
              <option value="ID Proof">ID Proof</option>
              <option value="Address Proof">Address Proof</option>
              <option value="Education Certificate">Education Certificate</option>
              <option value="Experience Letter">Experience Letter</option>
              <option value="Other">Other</option>
            </select>
            <input
              type="file"
              onChange={(e) => setDocumentFile(e.target.files[0])}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097087] focus:border-transparent"
            />
            <button
              onClick={handleDocumentUpload}
              disabled={!documentFile || uploading}
              className="px-4 py-2 bg-[#097087] text-white rounded-lg hover:bg-[#075a6a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </div>

        {/* Document List */}
        {profile.documents && profile.documents.length > 0 ? (
          <div className="space-y-2">
            {profile.documents.map((doc) => (
              <div
                key={doc._id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-[#097087]" />
                  <div>
                    <p className="font-medium text-gray-900">{doc.type}</p>
                    <p className="text-sm text-gray-500">
                      {doc.name || 'Unnamed'} • Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 text-sm text-[#097087] hover:bg-[#097087] hover:text-white border border-[#097087] rounded-lg transition-colors"
                  >
                    View
                  </a>
                  <button
                    onClick={() => handleDocumentDelete(doc._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-6">No documents uploaded yet</p>
        )}
      </div>
    </div>
  );
};

export default ProfileNew;
