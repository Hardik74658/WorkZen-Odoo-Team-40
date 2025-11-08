import React, { useEffect } from 'react';
import axios from 'axios';
import { Route, Routes } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loggedIn, logout } from './redux/slices/authSlice.js';
import { getCurrentUser } from './services/auth.js';
import AuthLayout from './components/layout/AuthLayout.jsx';
import  Login  from './components/Regestration/Login';
import LandingPage from './components/LandingPage.jsx';
import CompanyRegistration from './components/Regestration/CompanyRegistration.jsx';
import ForgotPassword from './components/Regestration/ForgotPassword.jsx';
import ResetPassword from './components/Regestration/ResetPassword.jsx';
import { Employees } from './components/Employees.jsx';
import AddUser from './components/Pages/AddUser.jsx';


function App() {
  const dispatch = useDispatch();

  const  user1 = {
    "fullName": "Sheldon Lee Cooper",
    "email": "sheldon2@bazinga.com",
    "password": "$2b$12$naGEpkeQwT/htzycxVZPNuP/nk/QOnxbrt2sHttfbQheQ/QCpqi.G",
    "age": 22,
    "profilePicture": "",
    "bio": "Hey There, I am Physicist Sheldon.",
    "location": "texas, dallas",
    "roleId": "67c6779e4e8d102569b9813f",
    "followers": [],
    "following": [],
    "posts": [],
    "currentStartup": null,
    "isVerified": false,
    "isActive": true,
    "created_at": "2025-03-26T06:38:09.091000",
    "updated_at": "2025-03-26T06:38:09.091000",
    "_id": "67e3a0d18a1a4db84b341275",
    "role": {
        "_id": "67c6779e4e8d102569b9813f",
        "name": "Investor",
        "description": "Investing Role (Funds The Startups)"
    },
    "currentStartupData": null
}
  const currentUser=null;
  useEffect(() => {
    getCurrentUser()
      .then((response) => {
        if (response && response.data) {
          console.log('User data fetched:', response.data);
          const serializableUserData = {
            id: response.data._id,
            name: response.data.fullName,
            email: response.data.email,
            currentStartup: response.data.currentStartup,
            profilePicture: response.data.profilePicture,
            role : response.data.role?.name 
          };
          dispatch(loggedIn(serializableUserData));
        } else {
          console.log('No user data found, logging out.');
          dispatch(logout());
        }
      })
      .catch((error) => {
        console.error('Error fetching current user:', error);
        dispatch(logout());
      });
  }, [dispatch]);

  

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/signup"
        element={
          <AuthLayout authentication={false}>
            <CompanyRegistration />
          </AuthLayout>
        }
      />
      <Route
        path="/login"
        element={
          <AuthLayout authentication={false}>
            <Login />
          </AuthLayout>
        }
      />
      {/* Landing page is public and accessible to both logged in and logged out users */}
      <Route
        path="/"
        element={
          <AuthLayout authentication={false}>
            <LandingPage />
          </AuthLayout>
        }
      />
      <Route
        path="/landing_page"
        element={
          <AuthLayout authentication={false}>
            <LandingPage />
          </AuthLayout>
        }
      />

    {/* Protected Routes */}
      <Route
        path="/employees"
        element={
          <AuthLayout authentication={true}>
            <Employees />
          </AuthLayout>
        }
      />

      <Route
        path="/add-user"
        element={
          <AuthLayout authentication={true}>
            <AddUser />
          </AuthLayout>
        }
      />

    
      {/* <Route
        path="/signup2"
        element={
          <AuthLayout authentication={true}>
            <Signup />
          </AuthLayout>
        }
      /> */}
      <Route
        path="/forgotpwd"
        element={
          <AuthLayout authentication={false}>
            <ForgotPassword />
          </AuthLayout>
        }
      />
      <Route
        path="/resetpassword/:token"
        element={
          <AuthLayout authentication={false}>
            <ResetPassword />
          </AuthLayout>
        }
      />
      {/* <Route
        path="/users"
        element={
          <AuthLayout authentication={true}>
            <Users />
          </AuthLayout>
        }
      /> */}
    
      {/* <Route
        path="/admin"
        element={
          <AuthLayout authentication={true}>
            <AdminDashboard />
          </AuthLayout>
        }
      /> */}
     
    </Routes>
  );
}

export default App;
