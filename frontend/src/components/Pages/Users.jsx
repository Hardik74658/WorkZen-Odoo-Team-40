import React, { useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Loader from '../layout/Loader';
import Toast from '../layout/Toast';

export default function Users() {
  const [selectedTab, setSelectedTab] = useState('all');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [foundersCount, setFoundersCount] = useState(0);
  const [investorsCount, setInvestorsCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState({ show: false, message: '' });

  const [cachedData, setCachedData] = useState({
    founders: { users: [], totalCount: 0, lastFetched: null },
    investors: { users: [], totalCount: 0, lastFetched: null },
    all: { users: [], totalCount: 0, lastFetched: null }
  });
  
  const [initialCountsFetched, setInitialCountsFetched] = useState(false);

  const currentTabKey = useMemo(() => {
    return selectedTab === 'founders' ? 'founders' : 
           selectedTab === 'investors' ? 'investors' : 'all';
  }, [selectedTab]);

  const fetchUsersAndCounts = useCallback(async (page = 1, forceRefresh = false) => {
    setLoading(true);
    
    try {
      let endpoint;
      if (selectedTab === 'founders') {
        endpoint = `/api/users/founders/`;
      } else if (selectedTab === 'investors') {
        endpoint = `/api/users/investors/`;
      } else {
        endpoint = `/api/users/`;
      }
      
      const now = new Date();
      const cacheExpiration = 5 * 60 * 1000;
      const cachedTabData = cachedData[currentTabKey];
      
      const isCacheValid = cachedTabData.lastFetched && 
                          (now - cachedTabData.lastFetched) < cacheExpiration &&
                          !forceRefresh &&
                          !searchTerm;
      
      let userData;
      let totalItems;
      
      if (isCacheValid && cachedTabData.users.length > 0) {
        console.log(`Using cached data for ${currentTabKey}`, cachedTabData);
        userData = cachedTabData.users;
        totalItems = cachedTabData.totalCount;
      } else {
        console.log(`Fetching fresh data for ${currentTabKey}`);
        const params = new URLSearchParams({
          page: page,
          limit: itemsPerPage * 5,
          ...(searchTerm && { search: searchTerm }),
        });
        
        try {
          const response = await axios.get(`${endpoint}?${params.toString()}`);
          userData = response.data;
          
          if (Array.isArray(userData)) {
            totalItems = userData.length;
            
            if (!searchTerm) {
              setCachedData(prevCache => ({
                ...prevCache,
                [currentTabKey]: {
                  users: userData,
                  totalCount: totalItems,
                  lastFetched: new Date()
                }
              }));
            }
          } else if (userData && userData.results) {
            userData = userData.results;
            totalItems = userData.total || userData.count || userData.length;
            
            if (!searchTerm) {
              setCachedData(prevCache => ({
                ...prevCache,
                [currentTabKey]: {
                  users: userData,
                  totalCount: totalItems,
                  lastFetched: new Date()
                }
              }));
            }
          } else {
            console.warn("Unexpected API response format:", userData);
            userData = [];
            totalItems = 0;
          }
        } catch (error) {
          console.error(`Error fetching ${currentTabKey}:`, error);
          userData = [];
          totalItems = 0;
        }
      }
      
      const totalPagesCount = Math.max(1, Math.ceil(totalItems / itemsPerPage));
      
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedUsers = Array.isArray(userData) ? 
                            userData.slice(startIndex, endIndex) : 
                            userData;
      
      setUsers(paginatedUsers || []);
      setTotalPages(totalPagesCount);
      
      if (selectedTab === 'founders') {
        setFoundersCount(totalItems);
      } else if (selectedTab === 'investors') {
        setInvestorsCount(totalItems);
      } else {
        setTotalCount(totalItems);
      }
      
      if (!initialCountsFetched) {
        fetchAllCounts();
      }
    } catch (err) {
      console.error("Error in fetchUsersAndCounts:", err);
      setUsers([]);
      setTotalPages(1);
      setToast({ show: true, message: 'Error fetching users' });
    } finally {
      setLoading(false);
    }
  }, [selectedTab, itemsPerPage, searchTerm, cachedData, currentTabKey, initialCountsFetched]);

  const fetchAllCounts = useCallback(async () => {
    try {
      console.log("Fetching all counts...");
      const promises = [
        axios.get('/api/users/founders/').catch(err => {
          console.error("Error fetching founders:", err);
          return { data: [] };
        }),
        axios.get('/api/users/investors/').catch(err => {
          console.error("Error fetching investors:", err);
          return { data: [] };
        }),
        axios.get('/api/users/').catch(err => {
          console.error("Error fetching all users:", err);
          return { data: [] };
        })
      ];
      
      const [foundersResponse, investorsResponse, allResponse] = await Promise.all(promises);
      
      const foundersData = foundersResponse.data;
      const investorsData = investorsResponse.data;
      const allData = allResponse.data;
      
      const foundersTotal = Array.isArray(foundersData) ? foundersData.length : 
                           (foundersData.total || foundersData.count || 0);
                           
      const investorsTotal = Array.isArray(investorsData) ? investorsData.length : 
                            (investorsData.total || investorsData.count || 0);
                            
      const allTotal = Array.isArray(allData) ? allData.length : 
                      (allData.total || allData.count || 0);
      
      console.log("Counts fetched:", {foundersTotal, investorsTotal, allTotal});
      
      setFoundersCount(foundersTotal);
      setInvestorsCount(investorsTotal);
      setTotalCount(allTotal);
      
      setCachedData({
        founders: { 
          users: Array.isArray(foundersData) ? foundersData : (foundersData.results || []), 
          totalCount: foundersTotal,
          lastFetched: new Date()
        },
        investors: { 
          users: Array.isArray(investorsData) ? investorsData : (investorsData.results || []), 
          totalCount: investorsTotal,
          lastFetched: new Date()
        },
        all: { 
          users: Array.isArray(allData) ? allData : (allData.results || []), 
          totalCount: allTotal,
          lastFetched: new Date()
        }
      });
      
      setInitialCountsFetched(true);
      console.log("Initial counts fetched successfully");
    } catch (err) {
      console.error("Error in fetchAllCounts:", err);
      setInitialCountsFetched(true);
      setToast({ show: true, message: 'Error fetching user counts' });
    }
  }, []);

  useEffect(() => {
    console.log("Component mounted, fetching data...");
    fetchAllCounts();
    fetchUsersAndCounts(1, true);
  }, []);

  useEffect(() => {
    console.log("Tab changed to:", selectedTab);
    setCurrentPage(1);
    fetchUsersAndCounts(1, false);
  }, [selectedTab]);

  useEffect(() => {
    if (currentPage > 1 || initialCountsFetched) {
      console.log("Page changed to:", currentPage);
      fetchUsersAndCounts(currentPage, false);
    }
  }, [currentPage]);

  const handlePageChange = useCallback((pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages || pageNumber === currentPage) {
      return;
    }
    
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage, totalPages]);

  const paginationGroup = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + 4);
    
    if (end === totalPages) {
      start = Math.max(1, totalPages - 4);
    }
    
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [currentPage, totalPages]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    const debounceTimer = setTimeout(() => {
      setCurrentPage(1);
      fetchUsersAndCounts(1, true);
    }, 500);
    
    return () => clearTimeout(debounceTimer);
  };

  const getColorFromName = (name) => {
    if (!name) return 'bg-teal-500';
    
    const colors = [
      'bg-blue-500', 'bg-emerald-500', 'bg-indigo-500', 
      'bg-violet-500', 'bg-rose-500', 'bg-amber-500'
    ];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  const safeValue = (value, fallback = '-') => {
    if (value === null || value === undefined) return fallback;
    if (typeof value === 'object') {
      return value.name || value.title || value.value || JSON.stringify(value);
    }
    return value;
  };

  const getRoleBadgeClass = (roleName) => {
    const roleClasses = {
      'Founder': 'bg-indigo-50 text-indigo-700 border-indigo-200',
      'Investor': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'Mentor': 'bg-amber-50 text-amber-700 border-amber-200',
      'Admin': 'bg-purple-50 text-purple-700 border-purple-200'
    };
    return roleClasses[roleName] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const FALLBACK_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%23f1f1f1'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='20' text-anchor='middle' dominant-baseline='middle' fill='%23888888'%3E?%3C/text%3E%3C/svg%3E";

  return (
    <>
      {/* Toast Positioning */}
      <div className="fixed top-5 right-5 z-50">
        <Toast
          show={toast.show}
          message={toast.message}
          onUndo={() => setToast({ ...toast, show: false })}
          onClose={() => setToast({ ...toast, show: false })}
        />
      </div>
      {/* Loader Centered */}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-60 z-50">
          <Loader />
        </div>
      )}
      <div className="min-h-screen bg-gray-50 py-8 px-6 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
              <h1 className="text-xl font-medium text-gray-800 mb-4 md:mb-0">
                {selectedTab === 'founders' ? 'Founders' : selectedTab === 'investors' ? 'Investors' : 'All Users'}
              </h1>
              
              <div className="flex space-x-2 bg-gray-100 p-1 rounded-full shadow-inner">
                <button 
                  className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ease-in-out ${
                    selectedTab === 'all' 
                      ? 'bg-white text-gray-800 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedTab('all')}
                >
                  All <span className="ml-1 inline-block bg-gray-200 text-gray-600 px-1.5 py-0.5 text-xs rounded-full">{totalCount}</span>
                </button>
                <button 
                  className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ease-in-out ${
                    selectedTab === 'founders' 
                      ? 'bg-white text-gray-800 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedTab('founders')}
                >
                  Founders <span className="ml-1 inline-block bg-gray-200 text-gray-600 px-1.5 py-0.5 text-xs rounded-full">{foundersCount}</span>
                </button>
                <button 
                  className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ease-in-out ${
                    selectedTab === 'investors' 
                      ? 'bg-white text-gray-800 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedTab('investors')}
                >
                  Investors <span className="ml-1 inline-block bg-gray-200 text-gray-600 px-1.5 py-0.5 text-xs rounded-full">{investorsCount}</span>
                </button>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex items-center group">
                <svg className="w-4 h-4 text-gray-500 absolute left-3.5 group-hover:text-indigo-600 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                <input 
                  type="search" 
                  className="pl-10 pr-4 py-2 w-full md:w-64 bg-white border border-gray-200 text-sm rounded-full focus:outline-none focus:ring-1 focus:ring-indigo-300 focus:border-indigo-300" 
                  placeholder="Search" 
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
              
              <div className="flex items-center space-x-3">
                <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-full hover:bg-gray-50">
                  <svg className="w-4 h-4 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                  </svg>
                  Invite
                </button>
                
                <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-full hover:bg-gray-50">
                  <svg className="w-4 h-4 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
                  </svg>
                  Export
                </button>
                
                <button className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-full hover:bg-indigo-700">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                  </svg>
                  Message
                </button>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <h2 className="text-sm text-gray-600 font-medium">
              {loading ? 'Loading...' : `${totalCount} ${totalCount === 1 ? 'result' : 'results'}`}
            </h2>
          </div>

          <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-gray-100">
              <div className="col-span-4 text-xs font-medium text-gray-500">Name</div>
              <div className="col-span-4 text-xs font-medium text-gray-500">Contact</div>
              <div className="col-span-2 text-xs font-medium text-gray-500">Role</div>
              <div className="col-span-2 text-xs font-medium text-gray-500">Location</div>
            </div>

            {loading ? (
              <div className="px-6 py-16 text-center">
                <Loader />
              </div>
            ) : users && users.length > 0 ? (
              users.map((user, index) => (
                <Link 
                  to={`/user/${user._id}`} 
                  key={user._id || index}
                  className="block hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100 last:border-b-0"
                >
                  <div className="grid grid-cols-12 gap-4 px-6 py-4">
                    <div className="col-span-4">
                      <div className="flex items-center group">
                        {user.profilePicture ? (
                          <img 
                            src={user.profilePicture} 
                            alt={typeof user.fullName === 'string' ? user.fullName : 'User'} 
                            className="w-10 h-10 rounded-full object-cover mr-3 border border-gray-200"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = FALLBACK_AVATAR;
                            }}
                          />
                        ) : (
                          <div className={`w-10 h-10 rounded-full ${getColorFromName(typeof user.fullName === 'string' ? user.fullName : '')} flex items-center justify-center text-white font-medium mr-3`}>
                            {typeof user.fullName === 'string' && user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900 group-hover:text-indigo-600">
                            {safeValue(user.fullName, 'Unknown User')}
                          </div>
                          <div className="text-xs text-gray-500">
                            {user.bio ? (user.bio.length > 30 ? user.bio.substring(0, 30) + '...' : user.bio) : 'No bio'}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-span-4 text-sm text-gray-600 self-center">{safeValue(user.email)}</div>
                    <div className="col-span-2 self-center">
                      {user.role && (
                        <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-medium rounded-full border ${getRoleBadgeClass(user.role.name)}`}>
                          {user.role.name || 'Member'}
                        </span>
                      )}
                    </div>
                    <div className="col-span-2 text-sm text-gray-600 self-center">
                      {user.location || '-'}
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="px-6 py-10 text-center text-gray-500">
                <svg className="w-10 h-10 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                </svg>
                <p className="text-base">No users found</p>
              </div>
            )}
          </div>
          
          {users && users.length > 0 && totalPages > 1 && (
            <div className="flex justify-between items-center mt-5 px-2">
              <div className="text-sm text-gray-500">
                Showing <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalCount)}</span> of <span className="font-medium">{totalCount}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 ${
                    currentPage === 1 
                      ? 'text-gray-300 cursor-not-allowed bg-gray-50' 
                      : 'text-gray-600 hover:bg-gray-100 bg-white/80 hover:bg-gray-100/90 border border-gray-200'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                  </svg>
                </button>
                
                {paginationGroup.map((page) => (
                  <button 
                    key={page} 
                    onClick={() => handlePageChange(page)}
                    className={`w-8 h-8 flex items-center justify-center text-xs rounded-full transition-all duration-200 ${
                      currentPage === page
                        ? 'bg-indigo-600 text-white font-medium shadow-sm'
                        : 'text-gray-600 hover:bg-gray-100 bg-white/80 hover:bg-gray-100/90 border border-gray-200'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button 
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 ${
                    currentPage === totalPages
                      ? 'text-gray-300 cursor-not-allowed bg-gray-50'
                      : 'text-gray-600 hover:bg-gray-100 bg-white/80 hover:bg-gray-100/90 border border-gray-200'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </button>
              </div>
            </div>
          )}

          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(10px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .animate-fadeIn {
              animation: fadeIn 0.3s ease-out forwards;
            }
          `}</style>
        </div>
      </div>
    </>
  );
}
