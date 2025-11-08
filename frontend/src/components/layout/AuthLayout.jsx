import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar, { SIDEBAR_LINKS } from './Sidebar';
import Loader from './Loader';
import { getCookie } from '../../utils/cookies.js';
import { loggedIn } from '../../redux/slices/authSlice.js';

const parseCookieJSON = (cookieValue) => {
  if (!cookieValue) return null;
  try {
    return JSON.parse(cookieValue);
  } catch (error) {
    console.error('Failed to parse cookie JSON:', error);
    return null;
  }
};

const layoutHiddenRoutes = ['/', '/landing_page', '/login', '/signup', '/forgotpwd'];

const AuthLayout = ({ children, authentication }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const authStatus = useSelector((state) => state.auth.status);
  const isLoading = useSelector((state) => state.auth.isLoading);
  const user = useSelector((state) => state.auth.user);
  const rawUserDataCookie = getCookie('userData');
  const rawUserProfileCookie = getCookie('userProfile');
  const tokenCookie = getCookie('authToken');
  const rawUserRoleCookie = getCookie('userRole');
  const cookieUserData = useMemo(() => parseCookieJSON(rawUserDataCookie), [rawUserDataCookie]);
  const cookieUserProfile = useMemo(() => parseCookieJSON(rawUserProfileCookie), [rawUserProfileCookie]);
  const cookieRole = useMemo(() => {
    const fromUserData = cookieUserData?.role;
    const fromProfile = cookieUserProfile?.role;
    const standalone = rawUserRoleCookie;
    return fromUserData || fromProfile || standalone || null;
  }, [cookieUserData, cookieUserProfile, rawUserRoleCookie]);

  const normalizedRole = useMemo(() => {
    const candidate = user || cookieUserData || cookieUserProfile;
    if (!candidate) return null;
    const extract = (value) => {
      if (!value) return null;
      if (typeof value === 'string') return value.toLowerCase();
      if (typeof value === 'object') {
        if (value.name) return String(value.name).toLowerCase();
        if (value.role_name) return String(value.role_name).toLowerCase();
      }
      return null;
    };

    return (
      extract(user.role) ||
      extract(user.role_name) ||
      extract(user.roleName) ||
      extract(cookieUserData?.role) ||
      extract(cookieUserData?.role_name) ||
      extract(cookieUserProfile?.role) ||
      extract(cookieRole) ||
      null
    );
  }, [user, cookieUserData, cookieUserProfile, cookieRole]);

  const allowedRolesForPath = useMemo(() => {
    const match = SIDEBAR_LINKS.find((link) => link.path === location.pathname);
    if (!match || !match.allowedRoles) return null;
    return match.allowedRoles;
  }, [location.pathname]);

  const shouldHideLayout =
    layoutHiddenRoutes.includes(location.pathname) ||
    location.pathname.startsWith('/resetpassword');

  useEffect(() => {
    if (!authStatus && tokenCookie) {
      const fallbackName = getCookie('userName') || '';
      const fallbackRole = cookieRole || '';
      const fallbackEid = getCookie('userId') || '';
      const payload = cookieUserData || cookieUserProfile || {
        eid: fallbackEid,
        name: fallbackName,
        role: fallbackRole,
      };

      if (payload && (payload.eid || payload.name || payload.role)) {
        dispatch(loggedIn(payload));
      }
    }
  }, [authStatus, tokenCookie, cookieUserData, cookieUserProfile, cookieRole, dispatch]);

  useEffect(() => {
    if (!isLoading) {
      const isAuthenticated = authStatus || Boolean(tokenCookie);

      if (authentication && !isAuthenticated) {
        navigate('/login');
      } else if (!authentication && authStatus) {
        if (
          location.pathname === '/login' ||
          location.pathname === '/signup' ||
          location.pathname.startsWith('/resetpassword') ||
          location.pathname === '/forgotpwd'
        ) {
          navigate('/employees');
        }
      }

      if (
        authentication &&
        isAuthenticated &&
        allowedRolesForPath &&
        normalizedRole &&
        !allowedRolesForPath.includes(normalizedRole)
      ) {
        navigate('/employees');
      }
    }
  }, [authentication, authStatus, isLoading, navigate, location.pathname, allowedRolesForPath, normalizedRole, tokenCookie]);

  if (isLoading && !tokenCookie) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader/>
      </div>
    );
  }

  if (shouldHideLayout) {
    return <div className="min-h-screen bg-white">{children}</div>;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar userRole={normalizedRole} />
      <div className="flex flex-1 flex-col">
        <Navbar />
        <main className="flex-1 overflow-y-auto px-6 py-8">{children}</main>
      </div>
    </div>
  );
};

export default AuthLayout;
