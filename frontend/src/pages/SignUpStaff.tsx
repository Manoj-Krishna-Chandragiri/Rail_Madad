import React, { useState } from 'react';
import axios from 'axios';

const expertiseOptions = [
  'Technical Support',
  'Booking Issues',
  'Refunds',
  'Complaint Resolution',
  'General Inquiries',
  'Passenger Assistance',
  'Feedback Management',
  'Escalation Management',
  'Security Concerns',
  'Technical Troubleshooting',
];
const languageOptions = [
  'English',
  'Hindi',
  'Tamil',
  'Telugu',
  'Bengali',
  'Marathi',
  'Gujarati',
  'Kannada',
  'Malayalam',
  'Punjabi',
  'Urdu',
];
const communicationOptions = [
  'Chat',
  'Voice',
  'Video',
];
const departmentOptions = [
  'Customer Service',
  'Technical Support',
  'Complaint Management',
  'Refunds',
  'Security',
];
const roleOptions = [
  'Support Manager',
  'Support Agent',
  'Technical Support',
  'Customer Service',
  'Complaint Handler',
];

const SignUpStaff = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    gender: '',
    address: '',
    employee_id: '',
    department: '',
    role: '',
    location: '',
    expertise: [],
    languages: [],
    communication_preferences: [],
    password: '',
    confirmPassword: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);


  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleCheckboxGroupChange = (name, option) => {
    setForm((prev) => {
      const arr = prev[name] || [];
      if (arr.includes(option)) {
        return { ...prev, [name]: arr.filter((v) => v !== option) };
      } else {
        return { ...prev, [name]: [...arr, option] };
      }
    });
  };

  const validate = () => {
    const errors = {};
    if (!form.name) errors.name = 'Full Name is required';
    if (!form.email) errors.email = 'Email is required';
    if (!form.phone) errors.phone = 'Phone Number is required';
    if (!form.gender) errors.gender = 'Gender is required';
    if (!form.employee_id) errors.employee_id = 'Employee ID is required';
    if (!form.department) errors.department = 'Department is required';
    if (!form.role) errors.role = 'Role is required';
    if (!form.location) errors.location = 'Location is required';
    if (!form.password) errors.password = 'Password is required';
    if (form.password !== form.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setSubmitting(true);
    try {
      // Replace with your API endpoint
      await axios.post('/api/accounts/staff/signup/', form);
      alert('Staff account created successfully!');
      setForm({
        name: '', email: '', phone: '', gender: '', address: '', employee_id: '', department: '', role: '', location: '', expertise: [], languages: [], communication_preferences: [], password: '', confirmPassword: ''
      });
    } catch (err) {
      alert('Error creating staff account.');
    }
    setSubmitting(false);
  };

  return (
    <div
      className="w-full max-w-2xl mx-auto p-4 bg-white rounded-lg shadow-lg"
      style={{ maxHeight: '90vh', overflowY: 'auto' }}
    >
      <h2 className="text-2xl font-bold mb-4">Register as a Railway Staff Member</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold">Full Name *</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} className="w-full border rounded p-2" />
            {formErrors.name && <p className="text-red-500 text-sm">{formErrors.name}</p>}
          </div>
          <div>
            <label className="block font-semibold">Email *</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full border rounded p-2" />
            {formErrors.email && <p className="text-red-500 text-sm">{formErrors.email}</p>}
          </div>
          <div>
            <label className="block font-semibold">Phone Number *</label>
            <input type="text" name="phone" value={form.phone} onChange={handleChange} className="w-full border rounded p-2" />
            {formErrors.phone && <p className="text-red-500 text-sm">{formErrors.phone}</p>}
          </div>
          <div>
            <label className="block font-semibold">Gender *</label>
            <select name="gender" value={form.gender} onChange={handleChange} className="w-full border rounded p-2">
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            {formErrors.gender && <p className="text-red-500 text-sm">{formErrors.gender}</p>}
          </div>
          <div className="md:col-span-2">
            <label className="block font-semibold">Address</label>
            <input type="text" name="address" value={form.address} onChange={handleChange} className="w-full border rounded p-2" />
          </div>
          <div>
            <label className="block font-semibold">Employee ID *</label>
            <input type="text" name="employee_id" value={form.employee_id} onChange={handleChange} className="w-full border rounded p-2" />
            {formErrors.employee_id && <p className="text-red-500 text-sm">{formErrors.employee_id}</p>}
          </div>
          <div>
            <label className="block font-semibold">Department *</label>
            <select name="department" value={form.department} onChange={handleChange} className="w-full border rounded p-2">
              <option value="">Select Department</option>
              {departmentOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            {formErrors.department && <p className="text-red-500 text-sm">{formErrors.department}</p>}
          </div>
          <div>
            <label className="block font-semibold">Role *</label>
            <select name="role" value={form.role} onChange={handleChange} className="w-full border rounded p-2">
              <option value="">Select Role</option>
              {roleOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            {formErrors.role && <p className="text-red-500 text-sm">{formErrors.role}</p>}
          </div>
          <div>
            <label className="block font-semibold">Location *</label>
            <input type="text" name="location" value={form.location} onChange={handleChange} className="w-full border rounded p-2" placeholder="e.g., Mumbai Central Station" />
            {formErrors.location && <p className="text-red-500 text-sm">{formErrors.location}</p>}
          </div>
          <div>
            <label className="block font-semibold">Areas of Expertise</label>
            <div className="flex flex-wrap gap-2">
              {expertiseOptions.map(opt => (
                <label key={opt} className="flex items-center space-x-1">
                  <input
                    type="checkbox"
                    checked={form.expertise.includes(opt)}
                    onChange={() => handleCheckboxGroupChange('expertise', opt)}
                    className="form-checkbox"
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block font-semibold">Languages Spoken</label>
            <div className="flex flex-wrap gap-2">
              {languageOptions.map(opt => (
                <label key={opt} className="flex items-center space-x-1">
                  <input
                    type="checkbox"
                    checked={form.languages.includes(opt)}
                    onChange={() => handleCheckboxGroupChange('languages', opt)}
                    className="form-checkbox"
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block font-semibold">Preferred Communication Channels</label>
            <div className="flex flex-wrap gap-2">
              {communicationOptions.map(opt => (
                <label key={opt} className="flex items-center space-x-1">
                  <input
                    type="checkbox"
                    checked={form.communication_preferences.includes(opt)}
                    onChange={() => handleCheckboxGroupChange('communication_preferences', opt)}
                    className="form-checkbox"
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
            <span className="text-xs text-gray-500">These determine how staff can be contacted through the support system</span>
          </div>
          <div className="md:col-span-2">
            <label className="block font-semibold">Password *</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} className="w-full border rounded p-2" />
            {formErrors.password && <p className="text-red-500 text-sm">{formErrors.password}</p>}
          </div>
          <div className="md:col-span-2">
            <label className="block font-semibold">Confirm Password *</label>
            <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} className="w-full border rounded p-2" />
            {formErrors.confirmPassword && <p className="text-red-500 text-sm">{formErrors.confirmPassword}</p>}
          </div>
        </div>
        <div className="flex items-center mt-4">
          <input type="checkbox" required className="mr-2" />
          <span>I agree to the Terms of Service and Privacy Policy</span>
        </div>
        <div className="flex justify-between mt-4">
          <button type="button" className="px-4 py-2 bg-gray-300 rounded" onClick={() => setForm({
            name: '', email: '', phone: '', gender: '', address: '', employee_id: '', department: '', role: '', location: '', expertise: [], languages: [], communication_preferences: [], password: '', confirmPassword: ''
          })}>Cancel</button>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded" disabled={submitting}>{submitting ? 'Signing Up...' : 'Sign up'}</button>
        </div>
      </form>
    </div>
  );
};

export default SignUpStaff;
