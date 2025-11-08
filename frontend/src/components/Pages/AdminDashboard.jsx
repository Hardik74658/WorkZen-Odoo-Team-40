import React, { useState, useEffect } from "react";
import { Line, Pie, Bar, Doughnut } from "react-chartjs-2";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Add useNavigate
import { useSelector } from "react-redux"; // Add useSelector
import { getCurrentUser } from "../../services/auth"; // Add getCurrentUser import
import Loader from "../layout/Loader"; // Import Loader
import Toast from "../layout/Toast"; // Import Toast
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
} from "chart.js";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
);

const AdminDashboard = () => {
  // Navigation hook
  const navigate = useNavigate();
  
  // Get current user from Redux store
  const currentUserFromRedux = useSelector((state) => state.auth.user);

  // State management
  const [activeTab, setActiveTab] = useState("Overview");
  const [loading, setLoading] = useState(true); // Set loading to true initially
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState("30days");
  
  // Authorization states
  const [authorized, setAuthorized] = useState(false);
  const [completeUserData, setCompleteUserData] = useState(null);
  
  // Data states
  const [users, setUsers] = useState([]);
  const [startups, setStartups] = useState([]);
  const [investors, setInvestors] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    founders: 0,
    investors: 0,
    monthlyGrowth: []
  });
  
  const [startupStats, setStartupStats] = useState({
    totalStartups: 0,
    fundingRounds: 0,
    approvalPending: 0,
    industries: []
  });

  // Chart states
  const [userGrowthData, setUserGrowthData] = useState({
    labels: [],
    datasets: []
  });
  
  const [investorDistributionData, setInvestorDistributionData] = useState({
    labels: [],
    datasets: []
  });

  // Security check - Fetch complete user data to check admin role
  useEffect(() => {
    const checkAuthorization = async () => {
      if (!currentUserFromRedux) {
        setError("You must be logged in to access this page.");
        setLoading(false);
        setTimeout(() => navigate("/login"), 2000);
        return;
      }

      try {
        // Fetch complete user data to check roles
        const userResponse = await getCurrentUser();

        if (!userResponse || !userResponse.data) {
          setError("Failed to fetch user details.");
          setLoading(false);
          return;
        }

        const userData = userResponse.data;
        setCompleteUserData(userData);

        console.log("Complete user data:", userData);
        console.log("Role ID:", userData.role?._id);
        console.log("Role name:", userData.role?.name);

        // Check if user has admin role
        const hasAdminRole =
          userData.role?._id === "6801a22a7ca4ac4eff8fbf15" ||
          userData.role?.name?.toLowerCase() === "admin";

        if (!hasAdminRole) {
          setError("You don't have permission to access this page.");
          setLoading(false);
          setTimeout(() => navigate("/"), 2000);
          return;
        }

        // User is authorized
        setAuthorized(true);
        setLoading(false);
      } catch (error) {
        console.error("Error checking authorization:", error);
        setError("Failed to verify your access. Please try again.");
        setLoading(false);
      }
    };

    checkAuthorization();
  }, [currentUserFromRedux, navigate]);

  // Get month names for the last 6 months
  const getLastSixMonths = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const today = new Date();
    const last6Months = [];
    
    for (let i = 5; i >= 0; i--) {
      const month = today.getMonth() - i;
      const adjustedMonth = month < 0 ? month + 12 : month;
      last6Months.push(months[adjustedMonth]);
    }
    
    return last6Months;
  };

  // Get data for the selected time range
  const getDateRangeData = (range) => {
    switch(range) {
      case "7days":
        return {
          labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          data: [5, 8, 3, 7, 2, 6, 4]
        };
      case "30days":
        return {
          labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
          data: [14, 18, 12, 20]
        };
      case "3months":
        return {
          labels: ["Month 1", "Month 2", "Month 3"],
          data: [30, 45, 38]
        };
      case "6months":
      default:
        return {
          labels: getLastSixMonths(),
          data: [15, 30, 20, 45, 35, 40]
        };
    }
  };

  // Handle time range change
  const handleTimeRangeChange = (e) => {
    const newRange = e.target.value;
    setTimeRange(newRange);
    
    const rangeData = getDateRangeData(newRange);
    
    setUserGrowthData({
      labels: rangeData.labels,
      datasets: [
        {
          label: 'New Users',
          data: rangeData.data,
          fill: true,
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderColor: 'rgba(59, 130, 246, 1)',
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: 'white',
          pointBorderColor: 'rgba(59, 130, 246, 1)',
          pointBorderWidth: 2,
        }
      ]
    });
  };

  // Fetch data from APIs
  useEffect(() => {
    // Only fetch dashboard data if user is authorized
    if (!authorized) return;
    
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch all users
        const usersResponse = await axios.get('/api/users/');
        const usersData = usersResponse.data;
        setUsers(usersData);
        
        // Get recent users (last 5)
        const sortedUsers = [...usersData].sort((a, b) => 
          new Date(b.created_at || b.createdAt || Date.now()) - 
          new Date(a.created_at || a.createdAt || Date.now())
        );
        setRecentUsers(sortedUsers.slice(0, 5));
        
        // Calculate user statistics
        const foundersCount = usersData.filter(user => 
          user.role === '67c677834e8d102569b9813e' || user.role?.name === 'founder'
        ).length;
        
        const investorsCount = usersData.filter(user => 
          user.role === '67c6779e4e8d102569b9813f' || user.role?.name === 'investor'
        ).length;
        
        setUserStats({
          totalUsers: usersData.length,
          founders: foundersCount,
          investors: investorsCount,
          monthlyGrowth: [15, 30, 20, 45, 35, 40] // Sample data for monthly growth
        });

        // Fetch startups
        const startupsResponse = await axios.get('/api/startups/');
        const startupsData = startupsResponse.data;
        setStartups(startupsData);
        
        // Industry distribution data
        const industries = {};
        startupsData.forEach(startup => {
          const industry = startup.industry || 'Other';
          industries[industry] = (industries[industry] || 0) + 1;
        });
        
        // Set startup stats
        setStartupStats({
          totalStartups: startupsData.length,
          fundingRounds: startupsData.reduce((acc, s) => 
            acc + (s.previous_fundings?.length || 0), 0),
          approvalPending: startupsData.filter(s => s.status === 'pending').length,
          industries: Object.entries(industries).map(([name, count]) => ({ name, count }))
        });
        
        // Set initial chart data based on default time range
        const rangeData = getDateRangeData(timeRange);
        setUserGrowthData({
          labels: rangeData.labels,
          datasets: [
            {
              label: 'New Users',
              data: rangeData.data,
              fill: true,
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              borderColor: 'rgba(59, 130, 246, 1)',
              tension: 0.4,
              pointRadius: 4,
              pointBackgroundColor: 'white',
              pointBorderColor: 'rgba(59, 130, 246, 1)',
              pointBorderWidth: 2,
            }
          ]
        });
        
        // Get actual investor types from data
        // Count individual vs institutional investors
        const individualInvestors = usersData.filter(user => 
          (user.role === 'investor' || user.role?.name === 'investor') && 
          (!user.investorType || user.investorType === 'individual')
        ).length;
        
        const institutionalInvestors = usersData.filter(user => 
          (user.role === 'investor' || user.role?.name === 'investor') && 
          user.investorType === 'institutional'
        ).length;
        
        // If we don't have investor type data, make reasonable estimates
        const totalInvestors = investorsCount || 1; // Avoid division by zero
        const indPercentage = individualInvestors > 0 ? 
          Math.round((individualInvestors / totalInvestors) * 100) : 70;
        
        const instPercentage = institutionalInvestors > 0 ? 
          Math.round((institutionalInvestors / totalInvestors) * 100) : 30;
        
        // Calculate actual percentages or use reasonable defaults
        setInvestorDistributionData({
          labels: ['Individual', 'Institutional'],
          datasets: [{
            data: [indPercentage, instPercentage],
            backgroundColor: [
              'rgba(59, 130, 246, 0.7)',
              'rgba(139, 92, 246, 0.7)'
            ],
            borderWidth: 0,
          }]
        });

        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError("Failed to load dashboard data. Please try again.");
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [timeRange, authorized]); // Add authorized as a dependency
  
  // Chart options
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: { size: 14 },
        bodyFont: { size: 13 },
        padding: 12,
        displayColors: false,
        callbacks: {
          title: function(tooltipItems) {
            return `${tooltipItems[0].label}`;
          },
          label: function(context) {
            return `New users: ${context.raw}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          font: {
            size: 12,
          }
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
          }
        }
      },
    },
    elements: {
      line: {
        tension: 0.4,
      },
      point: {
        radius: 4,
        hoverRadius: 6,
      }
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
  };
  
  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: { size: 12 },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle'
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: { size: 14 },
        bodyFont: { size: 13 },
        padding: 12,
      },
    },
    cutout: '65%',
  };
  
  // Calculate role percentages
  const calculateRolePercentages = () => {
    const total = userStats.totalUsers;
    if (total === 0) return { founders: 0, investors: 0 };
    
    return {
      founders: Math.round((userStats.founders / total) * 100),
      investors: Math.round((userStats.investors / total) * 100),
    };
  };
  
  const percentages = calculateRolePercentages();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Toast Positioning */}
      <div className="fixed top-5 right-5 z-50">
        {error && (
          <Toast
            show={!!error}
            message={error}
            onUndo={() => {}}
            onClose={() => setError(null)}
          />
        )}
      </div>
      {/* Loader Centered */}
      {(loading) && (
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-60 z-50">
          <Loader />
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 py-6" style={{ filter: loading ? 'blur(2px)' : 'none', pointerEvents: loading ? 'none' : 'auto' }}>
        {/* Only show content if not loading and not error */}
        {!loading && !error && authorized ? (
          <>
            {/* Header with Logo and Navigation */}
            <header className="flex flex-col md:flex-row justify-between items-center mb-8">
              {/* Logo and Brand */}
              <div className="flex items-center mb-4 md:mb-0">
                <div className="bg-gradient-to-r from-orange-500 to-orange-400 rounded-xl p-3 mr-3 shadow-md">
                  <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Founders Nexus</h1>
                </div>
              </div>
              
              {/* Navigation Tabs */}
              <nav className="flex items-center space-x-6">
                <button
                  className={`px-3 py-2 rounded-full transition-all ${activeTab === "Overview" 
                    ? "text-blue-600 font-medium bg-blue-50 shadow-sm" 
                    : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"}`}
                  onClick={() => setActiveTab("Overview")}
                >
                  Overview
                </button>
                <button
                  className={`px-3 py-2 rounded-full transition-all ${activeTab === "User Management" 
                    ? "text-blue-600 font-medium bg-blue-50 shadow-sm" 
                    : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"}`}
                  onClick={() => setActiveTab("User Management")}
                >
                  User Management
                </button>
                <button
                  className={`px-3 py-2 rounded-full transition-all ${activeTab === "Startups" 
                    ? "text-blue-600 font-medium bg-blue-50 shadow-sm" 
                    : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"}`}
                  onClick={() => setActiveTab("Startups")}
                >
                  Startups
                </button>
                <div className="ml-4 bg-blue-100 rounded-full p-2">
                  <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14m-7-7h14" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </nav>
            </header>

            {/* Page Title */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Overview & Dashboard</h1>
              <p className="text-gray-600 mt-2">Platform insights and key metrics at a glance.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Overview Card - Spans 2 columns */}
              <div className="lg:col-span-2">
                <div className="bg-white p-6 rounded-2xl shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">Platform Overview</h2>
                    <div className="flex space-x-2">
                      <select 
                        className="bg-blue-50 text-blue-600 text-sm rounded-lg px-3 py-2 border-none focus:ring-2 focus:ring-blue-500"
                        value={timeRange}
                        onChange={handleTimeRangeChange}
                      >
                        <option value="7days">Last 7 Days</option>
                        <option value="30days">Last 30 Days</option>
                        <option value="3months">Last 3 Months</option>
                        <option value="6months">Last 6 Months</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100 shadow-sm">
                      <div className="flex items-center mb-2">
                        <div className="bg-blue-100 p-2 rounded-lg mr-3">
                          <svg className="w-6 h-6 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zm-8 8a2 2 0 100-4 2 2 0 000 4zm0 2a3 3 0 100-6 3 3 0 000 6zm8 0a2 2 0 100-4 2 2 0 000 4zm0 2a3 3 0 100-6 3 3 0 000 6z" />
                          </svg>
                        </div>
                        <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
                      </div>
                      <p className="text-3xl font-bold text-gray-800">{userStats.totalUsers}</p>
                      <div className="mt-2 flex items-center">
                        <span className="text-xs text-green-600 font-medium bg-green-100 px-2 py-1 rounded-full">
                          +12% this month
                        </span>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100 shadow-sm">
                      <div className="flex items-center mb-2">
                        <div className="bg-blue-100 p-2 rounded-lg mr-3">
                          <svg className="w-6 h-6 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M5.5 16a3.5 3.5 0 01-.369-.019l-.667.667A4.5 4.5 0 002.5 17a4.5 4.5 0 01-1.8-8.651A4.5 4.5 0 014.331 5.5a4.5 4.5 0 018.669 0A4.5 4.5 0 0117.5 8a4.5 4.5 0 01-2.5 4.031v-1.5a3 3 0 00-2.5-2.953A3 3 0 005.5 10.5V16z" />
                          </svg>
                        </div>
                        <h3 className="text-sm font-medium text-gray-500">New Signups</h3>
                      </div>
                      <p className="text-3xl font-bold text-gray-800">{recentUsers.length}</p>
                      <div className="mt-2 flex items-center">
                        <span className="text-xs text-green-600 font-medium bg-green-100 px-2 py-1 rounded-full">
                          Last 7 days
                        </span>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100 shadow-sm">
                      <div className="flex items-center mb-2">
                        <div className="bg-blue-100 p-2 rounded-lg mr-3">
                          <svg className="w-6 h-6 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <h3 className="text-sm font-medium text-gray-500">Startups</h3>
                      </div>
                      <p className="text-3xl font-bold text-gray-800">{startupStats.totalStartups}</p>
                      <div className="mt-2 flex items-center">
                        <span className="text-xs text-blue-600 font-medium bg-blue-100 px-2 py-1 rounded-full">
                          {startupStats.approvalPending} Pending
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Growth Chart */}
                  <div className="h-56 mb-6">
                    <h3 className="text-sm font-medium text-gray-600 mb-4">User Growth Trend</h3>
                    <Line 
                      data={userGrowthData} 
                      options={lineChartOptions} 
                    />
                  </div>
                  
                  {/* User Distribution */}
                  <div className="mt-8">
                    <h3 className="text-sm font-medium text-gray-600 mb-4">User Role Distribution</h3>
                    <div className="flex items-center space-x-8">
                      <div className="flex-1 flex items-center">
                        <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                        <span className="text-sm">Founders: {percentages.founders}%</span>
                      </div>
                      <div className="flex-1 flex items-center">
                        <div className="w-3 h-3 rounded-full bg-indigo-500 mr-2"></div>
                        <span className="text-sm">Investors: {percentages.investors}%</span>
                      </div>
                      <div className="flex-1 flex items-center">
                        <div className="w-3 h-3 rounded-full bg-gray-300 mr-2"></div>
                        <span className="text-sm">Others: {100 - percentages.founders - percentages.investors}%</span>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full mt-2 overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: `${percentages.founders}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white p-6 rounded-2xl shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Recent Activity</h2>
                  <a href="#" className="text-sm text-blue-600 hover:underline">View All</a>
                </div>
                
                <div className="space-y-6">
                  {recentUsers.length > 0 ? (
                    recentUsers.map((user, idx) => (
                      <div key={idx} className="flex items-center gap-4">
                        <img 
                          src={user.profilePicture || `https://ui-avatars.com/api/?name=${user.fullName || 'User'}&background=random`} 
                          alt={user.fullName || 'User'} 
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <p className="font-medium text-gray-900">{user.fullName || 'New User'}</p>
                            <span className="text-xs text-gray-500">{new Date(user.createdAt || Date.now()).toLocaleDateString()}</span>
                          </div>
                          <p className="text-sm text-gray-600">{user.role?.name || user.role || 'Joined the platform'}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No recent activities</p>
                  )}
                </div>
                
                <div className="mt-6 border-t border-gray-100 pt-4 flex justify-between">
                  <button className="text-blue-600 text-sm font-medium bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors">
                    Account Actions
                  </button>
                  <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                    Bulk Actions
                  </button>
                </div>
              </div>

              {/* Startup Industries */}
              <div className="bg-white p-6 rounded-2xl shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Startup Industries</h2>
                  <a href="#" className="text-sm text-blue-600 hover:underline">View Details</a>
                </div>
                
                <div className="h-56">
                  <Doughnut
                    data={{
                      labels: startupStats.industries.map(i => i.name).slice(0, 5),
                      datasets: [{
                        data: startupStats.industries.map(i => i.count).slice(0, 5),
                        backgroundColor: [
                          'rgba(59, 130, 246, 0.8)',
                          'rgba(139, 92, 246, 0.8)',
                          'rgba(16, 185, 129, 0.8)',
                          'rgba(245, 158, 11, 0.8)',
                          'rgba(239, 68, 68, 0.8)',
                        ],
                        hoverBackgroundColor: [
                          'rgba(37, 99, 235, 0.9)',
                          'rgba(124, 58, 237, 0.9)',
                          'rgba(5, 150, 105, 0.9)',
                          'rgba(217, 119, 6, 0.9)',
                          'rgba(220, 38, 38, 0.9)',
                        ],
                        borderWidth: 0,
                      }]
                    }}
                    options={pieOptions}
                  />
                </div>
                
                <div className="mt-4 space-y-2">
                  {startupStats.industries.slice(0, 3).map((industry, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full ${idx === 0 ? 'bg-blue-500' : idx === 1 ? 'bg-indigo-500' : 'bg-green-500'} mr-2`}></div>
                        <span className="text-sm font-medium">{industry.name}</span>
                      </div>
                      <span className="text-sm">{industry.count} startups</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Investor Distribution */}
              <div className="bg-white p-6 rounded-2xl shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Investor Types</h2>
                </div>
                
                <div className="flex space-x-8 mb-6">
                  <div className="w-1/2">
                    <div className="relative h-32 w-32 mx-auto">
                      <Pie data={investorDistributionData} options={pieOptions} />
                    </div>
                  </div>
                  <div className="w-1/2 space-y-2">
                    {investorDistributionData.labels.map((label, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full ${
                            idx === 0 ? 'bg-blue-500' : 'bg-indigo-500'
                          } mr-2`}></div>
                          <span className="text-sm">{label}</span>
                        </div>
                        <span className="text-sm font-medium">{investorDistributionData.datasets[0].data[idx]}%</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mt-4">
                  <button className="text-blue-600 text-sm font-medium hover:underline">Investor Directory</button>
                </div>
              </div>
              
              {/* Funding Rounds */}
              <div className="bg-white p-6 rounded-2xl shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Funding Rounds</h2>
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Total Rounds</span>
                    <span className="text-sm font-bold">{startupStats.fundingRounds}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-green-600 h-2.5 rounded-full" style={{ width: "65%" }}></div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <div>
                      <p className="font-medium">Seed</p>
                      <p className="text-xs text-gray-500">8 startups</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">$2.4M</p>
                      <p className="text-xs text-gray-500">Avg: $300K</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <div>
                      <p className="font-medium">Series A</p>
                      <p className="text-xs text-gray-500">5 startups</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">$12M</p>
                      <p className="text-xs text-gray-500">Avg: $2.4M</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <button className="text-blue-600 text-sm font-medium hover:underline">View All Rounds</button>
                </div>
              </div>

              {/* Analytics & Reporting */}
              <div className="bg-white p-6 rounded-2xl shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Analytics & Reporting</h2>
                <div className="space-y-4 mb-4">
                  <div className="flex items-center">
                    <span className="text-sm font-medium w-36 mr-2">User Growth</span>
                    <div className="flex-1 h-2 bg-blue-50 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" style={{ width: '70%' }}></div>
                    </div>
                    <span className="ml-2 text-xs font-medium">70%</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium w-36 mr-2">Startup Success</span>
                    <div className="flex-1 h-2 bg-blue-50 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" style={{ width: '55%' }}></div>
                    </div>
                    <span className="ml-2 text-xs font-medium">55%</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium w-36 mr-2">Investor Engagement</span>
                    <div className="flex-1 h-2 bg-blue-50 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                    <span className="ml-2 text-xs font-medium">85%</span>
                  </div>
                </div>
                <button className="bg-blue-100 text-blue-600 px-3 py-1 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors">
                  Generate Custom Report
                </button>
              </div>

              {/* Security & Access Control */}
              <div className="bg-white p-6 rounded-2xl shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Security & Access Control</h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer">
                    <span className="text-sm font-medium flex items-center">
                      <svg className="w-5 h-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      Audit Logs
                    </span>
                    <div className="flex items-center">
                      <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full mr-2">12 New</span>
                      <svg className="w-5 h-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer">
                    <span className="text-sm font-medium flex items-center">
                      <svg className="w-5 h-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944A11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      IP Whitelisting
                    </span>
                    <svg className="w-5 h-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer">
                    <span className="text-sm font-medium flex items-center">
                      <svg className="w-5 h-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                      Admin Access
                    </span>
                    <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                      Enabled
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default AdminDashboard;
