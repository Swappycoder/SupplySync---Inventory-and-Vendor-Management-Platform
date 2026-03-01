import React, { useEffect, useState } from "react";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";

const DashboardPage = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedData, setSelectedData] = useState("amount");
  const [transactionData, setTransactionData] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [stats, setStats] = useState({ totalTransactions: 0, totalQuantity: 0, totalAmount: 0 });

  const userRole = ApiService.getRole();

  const [shiftStartTime, setShiftStartTime] = useState(() => {
    const stored = localStorage.getItem("shiftStartTime");
    return stored ? new Date(stored) : null;
  });

  const [isClockedIn, setIsClockedIn] = useState(() => {
    return localStorage.getItem("shiftStartTime") !== null;
  });

  const [isClocking, setIsClocking] = useState(false);

  const [itemsSoldToday, setItemsSoldToday] = useState(0);
  const [lowStockItems, setLowStockItems] = useState([]);

  // Staff analysis states
  const [staffAnalysis, setStaffAnalysis] = useState([]);
  const [defaulters, setDefaulters] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState({});
  const [analysisMonth, setAnalysisMonth] = useState(new Date().getMonth() + 1);
  const [analysisYear, setAnalysisYear] = useState(new Date().getFullYear());

  const COLORS = ['#008080', '#FF9800', '#4CAF50', '#F44336', '#9C27B0'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const transactionResponse = await ApiService.getAllTransactions();
        if (transactionResponse.status === 200) {
          const allTx = transactionResponse.transactions || [];
          const totalTransactions = allTx.length;
          const totalQuantity = allTx.reduce((s, t) => s + (t.totalProducts || 0), 0);
          const totalAmount = allTx.reduce((s, t) => s + (t.totalPrice || 0), 0);
          setStats({ totalTransactions, totalQuantity, totalAmount });

          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const itemsSold = allTx
            .filter(tx => {
              const txDate = new Date(tx.createdAt);
              txDate.setHours(0, 0, 0, 0);
              return txDate.getTime() === today.getTime() && tx.type === "SELL";
            })
            .reduce((sum, tx) => sum + (tx.totalProducts || 0), 0);

          setItemsSoldToday(itemsSold);

          setRecentTransactions(
            allTx.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)
          );

          setTransactionData(
            transformTransactionData(transactionResponse.transactions, selectedMonth, selectedYear)
          );
        }
      } catch (error) {
        showMessage(error.response?.data?.message || "Error fetching data");
      }
    };

    const fetchLowStockProducts = async () => {
      try {
        const productsResponse = await ApiService.getAllProducts();
        if (productsResponse.status === 200) {
          const lowStock = (productsResponse.products || [])
            .filter(p => {
              const qty = p.stockQuantity != null ? Number(p.stockQuantity) : 0;
              return qty > 0 && qty < 10;
            })
            .slice(0, 5);
          setLowStockItems(lowStock);
        }
      } catch (error) {
        showMessage("Error fetching products");
      }
    };

    const fetchStaffAnalysis = async () => {
      if (userRole === "ADMIN") {
        try {
          const startDate = `${analysisYear}-${String(analysisMonth).padStart(2, '0')}-01`;
          const endDate = new Date(analysisYear, analysisMonth, 0).toISOString().split('T')[0];

          const analysisResponse = await ApiService.getStaffAttendanceAnalysis(startDate, endDate);
          const defaultersResponse = await ApiService.getDefaultersList(startDate, endDate);
          const statsResponse = await ApiService.getAttendanceStats();

          if (analysisResponse.status === 200) setStaffAnalysis(analysisResponse.staffAnalysis || []);
          if (defaultersResponse.status === 200) setDefaulters(defaultersResponse.defaulters || []);
          if (statsResponse.status === 200) setAttendanceStats(statsResponse.attendanceStats || {});
        } catch (error) {
          console.error("Error fetching staff analysis:", error);
        }
      }
    };

    fetchData();
    fetchLowStockProducts();
    fetchStaffAnalysis();
  }, [selectedMonth, selectedYear, selectedData, userRole, analysisMonth, analysisYear]);

  const transformTransactionData = (transactions, month, year) => {
    const dailyData = {};
    const daysInMonths = new Date(year, month, 0).getDate();

    for (let day = 1; day <= daysInMonths; day++) {
      dailyData[day] = { day, count: 0, quantity: 0, amount: 0 };
    }

    transactions.forEach(transaction => {
      const date = new Date(transaction.createdAt);
      if (date.getMonth() + 1 === month && date.getFullYear() === year) {
        const day = date.getDate();
        dailyData[day].count += 1;
        dailyData[day].quantity += transaction.totalProducts;
        dailyData[day].amount += transaction.totalPrice;
      }
    });

    return Object.values(dailyData);
  };

  const showMessage = msg => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 4000);
  };

  const handleClockToggle = async () => {
    if (isClocking) return;
    
    setIsClocking(true);
    try {
      if (isClockedIn) {
        console.log("Attempting to clock out...");
        const response = await ApiService.clockOut();
        console.log("Clock out response:", response);
        
        if (response.status === 200) {
          localStorage.removeItem("shiftStartTime");
          setShiftStartTime(null);
          setIsClockedIn(false);
          showMessage("Clocked out successfully");
        } else {
          showMessage(response.message || "Failed to clock out");
        }
      } else {
        console.log("Attempting to clock in...");
        const response = await ApiService.clockIn();
        console.log("Clock in response:", response);
        
        if (response.status === 200) {
          const now = new Date();
          localStorage.setItem("shiftStartTime", now.toISOString());
          setShiftStartTime(now);
          setIsClockedIn(true);
          if (response.message && response.message.includes("LATE")) {
            showMessage("Warning: You are late! " + response.message);
          } else {
            showMessage("Clocked in successfully");
          }
        } else {
          // If error is "Already clocked in today", offer to reset
          if (response.message === "Already clocked in today") {
            const confirmReset = window.confirm("You have an incomplete clock-in record. Would you like to reset and try again?");
            if (confirmReset) {
              try {
                const resetResponse = await ApiService.resetIncompleteRecord();
                showMessage(resetResponse.message);
                // Clear local storage and retry clock in
                localStorage.removeItem("shiftStartTime");
                setShiftStartTime(null);
                setIsClockedIn(false);
              } catch (resetError) {
                showMessage("Error resetting: " + (resetError.response?.data?.message || resetError.message));
              }
            }
          } else {
            showMessage(response.message || "Failed to clock in");
          }
        }
      }
    } catch (error) {
      console.error("Clock error:", error);
      const errorMsg = error.response?.data?.message || error.message || "An error occurred";
      
      // If error is "Already clocked in today", offer to reset
      if (errorMsg === "Already clocked in today") {
        const confirmReset = window.confirm("You have an incomplete clock-in record. Would you like to reset and try again?");
        if (confirmReset) {
          try {
            const resetResponse = await ApiService.resetIncompleteRecord();
            showMessage(resetResponse.message);
            // Clear local storage
            localStorage.removeItem("shiftStartTime");
            setShiftStartTime(null);
            setIsClockedIn(false);
          } catch (resetError) {
            showMessage("Error resetting: " + (resetError.response?.data?.message || resetError.message));
          }
        }
      } else {
        showMessage("Error: " + errorMsg);
      }
    } finally {
      setIsClocking(false);
    }
  };

  // Navigate to transaction details
  const navigateToTransactionDetails = (transactionId) => {
    navigate(`/transaction/${transactionId}`);
  };

  // ================= STAFF VIEW =================
  if (userRole === "STAFF") {
    return (
      <Layout>
        {message && <div className="message">{message}</div>}
        <div className="dashboard-page">
          <div className="dashboard-content staff-view">
            <div className="stats-row">
              <div className="stat-card">
                <h4>Total Transactions</h4>
                <p>{stats.totalTransactions}</p>
              </div>
              <div className="stat-card">
                <h4>Total Quantity</h4>
                <p>{stats.totalQuantity}</p>
              </div>
              <div className="stat-card">
                <h4>Total Amount</h4>
                <p>{stats.totalAmount}</p>
              </div>
              <div className="stat-card">
                <h4>Shift Started At</h4>
                <p>{shiftStartTime ? shiftStartTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Not Clocked In"}</p>
              </div>
              <div className="stat-card">
                <h4>Items Sold Today</h4>
                <p>{itemsSoldToday}</p>
              </div>
            </div>

            <div className="clock-section" style={{ margin: '20px 0', textAlign: 'center' }}>
              <button 
                onClick={handleClockToggle} 
                disabled={isClocking}
                className="clock-btn" 
                style={{ 
                  padding: '12px 30px', 
                  fontSize: '16px', 
                  backgroundColor: isClockedIn ? '#F44336' : '#4CAF50', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '5px', 
                  cursor: isClocking ? 'not-allowed' : 'pointer',
                  opacity: isClocking ? 0.7 : 1
                }}
              >
                {isClocking ? 'Processing...' : (isClockedIn ? 'Clock Out' : 'Clock In')}
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
              {/* Low Stock Card */}
              <div className="staff-card low-stock-section" style={{
                backgroundColor: '#ffffff',
                padding: '20px', 
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
              }}>
                <h3 style={{ marginBottom: '15px', color: '#008080', fontSize: '18px', borderBottom: '2px solid #008080', paddingBottom: '8px' }}>
                  ⚠️ Low Stock Items (Below 10)
                </h3>
                {lowStockItems.length === 0 ? (
                  <p style={{ color: '#28a745', padding: '15px', backgroundColor: '#e8f5e9', borderRadius: '8px', textAlign: 'center' }}>
                    ✓ All items are in stock
                  </p>
                ) : (
                  <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {lowStockItems.map(item => (
                      <div key={item.id} style={{ 
                        padding: '12px', 
                        borderBottom: '1px solid #eee',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span style={{ fontWeight: '500', color: '#333' }}>{item.name}</span>
                        <span style={{ 
                          backgroundColor: '#ffebee', 
                          color: '#dc3545', 
                          padding: '4px 10px', 
                          borderRadius: '12px',
                          fontWeight: 'bold',
                          fontSize: '13px'
                        }}>
                          {item.stockQuantity} units
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Transactions Card - Now Clickable */}
              <div className="staff-card recent-section" style={{
                backgroundColor: '#ffffff',
                padding: '20px', 
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
              }}>
                <h3 style={{ marginBottom: '15px', color: '#008080', fontSize: '18px', borderBottom: '2px solid #008080', paddingBottom: '8px' }}>
                  📊 Recent Transactions
                </h3>
                {recentTransactions.length === 0 ? (
                  <p style={{ color: '#666', padding: '15px', textAlign: 'center' }}>No recent transactions</p>
                ) : (
                  <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {recentTransactions.map(tx => (
                      <div 
                        key={tx.id} 
                        onClick={() => navigateToTransactionDetails(tx.id)}
                        style={{ 
                          padding: '12px', 
                          borderBottom: '1px solid #eee',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s',
                          borderRadius: '4px',
                          marginBottom: '4px'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <span style={{ color: '#666', fontSize: '13px' }}>
                          {new Date(tx.createdAt).toLocaleString()}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ 
                            backgroundColor: tx.type === 'SELL' ? '#e8f5e9' : '#e3f2fd',
                            color: tx.type === 'SELL' ? '#28a745' : '#1976d2',
                            padding: '4px 10px', 
                            borderRadius: '12px',
                            fontWeight: '600',
                            fontSize: '12px'
                          }}>
                            {tx.type}
                          </span>
                          <span style={{ color: '#008080', fontSize: '12px' }}>👁️</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // ================= ADMIN VIEW =================
  return (
    <Layout>
      {message && <div className="message">{message}</div>}
      <div className="dashboard-page">
        {/* Transaction Charts Section */}
        <div className="section-header">
          <h2>Transaction Analysis</h2>
        </div>
        
        <div className="button-group">
          <button onClick={() => setSelectedData("count")}>Total No Of Transactions</button>
          <button onClick={() => setSelectedData("quantity")}>Product Quantity</button>
          <button onClick={() => setSelectedData("amount")}>Amount</button>
        </div>

        <div className="dashboard-content">
          <div className="filter-section" style={{ marginBottom: '20px' }}>
            <label>Select Month: </label>
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))}>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString("default", { month: "long" })}</option>
              ))}
            </select>
            <label style={{ marginLeft: '15px' }}>Select Year: </label>
            <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))}>
              {Array.from({ length: 5 }, (_, i) => (
                <option key={new Date().getFullYear() - i} value={new Date().getFullYear() - i}>{new Date().getFullYear() - i}</option>
              ))}
            </select>
          </div>
          
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={transactionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey={selectedData} stroke="#008080" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Staff Attendance Analysis Section */}
        <div style={{ 
          marginTop: '40px', 
          padding: '30px', 
          backgroundColor: '#ffffff', 
          borderRadius: '15px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          border: '1px solid #e8e8e8'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '25px',
            borderBottom: '2px solid #008080',
            paddingBottom: '15px'
          }}>
            <h2 style={{ margin: 0, color: '#008080', fontSize: '24px', fontWeight: '600' }}>Staff Attendance Analysis</h2>
          </div>
          
          <div className="filter-section" style={{ 
            marginBottom: '25px', 
            display: 'flex', 
            gap: '15px',
            flexWrap: 'wrap',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontWeight: '500', color: '#333' }}>Month:</label>
              <select 
                value={analysisMonth} 
                onChange={(e) => setAnalysisMonth(parseInt(e.target.value))}
                style={{ 
                  padding: '8px 12px', 
                  borderRadius: '6px', 
                  border: '1px solid #ddd',
                  backgroundColor: '#fff',
                  fontSize: '14px'
                }}
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString("default", { month: "long" })}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontWeight: '500', color: '#333' }}>Year:</label>
              <select 
                value={analysisYear} 
                onChange={(e) => setAnalysisYear(parseInt(e.target.value))}
                style={{ 
                  padding: '8px 12px', 
                  borderRadius: '6px', 
                  border: '1px solid #ddd',
                  backgroundColor: '#fff',
                  fontSize: '14px'
                }}
              >
                {Array.from({ length: 5 }, (_, i) => (
                  <option key={new Date().getFullYear() - i} value={new Date().getFullYear() - i}>{new Date().getFullYear() - i}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Stats Cards */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '20px',
            marginBottom: '35px'
          }}>
            <div style={{ 
              backgroundColor: '#e3f2fd', 
              padding: '20px', 
              borderRadius: '12px',
              textAlign: 'center',
              borderLeft: '4px solid #1565c0'
            }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Staff</h4>
              <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#1565c0' }}>{attendanceStats.totalStaff || 0}</p>
            </div>
            <div style={{ 
              backgroundColor: '#e8f5e9', 
              padding: '20px', 
              borderRadius: '12px',
              textAlign: 'center',
              borderLeft: '4px solid #2e7d32'
            }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Clocked In Today</h4>
              <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#2e7d32' }}>{attendanceStats.clockedInToday || 0}</p>
            </div>
            <div style={{ 
              backgroundColor: '#fff3e0', 
              padding: '20px', 
              borderRadius: '12px',
              textAlign: 'center',
              borderLeft: '4px solid #ef6c00'
            }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Clocked Out Today</h4>
              <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#ef6c00' }}>{attendanceStats.clockedOutToday || 0}</p>
            </div>
            <div style={{ 
              backgroundColor: '#f3e5f5', 
              padding: '20px', 
              borderRadius: '12px',
              textAlign: 'center',
              borderLeft: '4px solid #7b1fa2'
            }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Attendance Rate</h4>
              <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#7b1fa2' }}>{attendanceStats.attendanceRate ? `${attendanceStats.attendanceRate.toFixed(1)}%` : '0%'}</p>
            </div>
          </div>

          {/* Staff Performance Chart */}
          <div style={{ marginBottom: '40px' }}>
            <h3 style={{ marginBottom: '20px', color: '#333', fontSize: '18px', fontWeight: '600', borderLeft: '4px solid #008080', paddingLeft: '12px' }}>Staff Attendance Performance</h3>
            <div style={{ backgroundColor: '#fafafa', padding: '20px', borderRadius: '10px' }}>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={staffAnalysis} layout="vertical" margin={{ left: 20, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis type="number" stroke="#666" />
                  <YAxis dataKey="userName" type="category" width={120} stroke="#666" tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #ddd', 
                      borderRadius: '8px',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                    }} 
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="onTimeDays" fill="#4CAF50" name="On Time (9AM)" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="lateDays" fill="#FF9800" name="Late (>9AM)" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="clockedOutDays" fill="#2196F3" name="Completed Shifts (5PM)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Defaulters List */}
          <div style={{ marginBottom: '40px' }}>
            <h3 style={{ marginBottom: '20px', color: '#d32f2f', fontSize: '18px', fontWeight: '600', borderLeft: '4px solid #d32f2f', paddingLeft: '12px' }}>
              ⚠️ Late Clock-in Defaulters (After 9:00 AM)
            </h3>
            {defaulters.length === 0 ? (
              <div style={{ padding: '30px', backgroundColor: '#e8f5e9', borderRadius: '10px', textAlign: 'center' }}>
                <p style={{ color: '#2e7d32', margin: 0, fontSize: '16px', fontWeight: '500' }}>🎉 No defaulters this month! Great job!</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', backgroundColor: '#fff', borderRadius: '10px', overflow: 'hidden' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#d32f2f', color: 'white' }}>
                      <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Staff Name</th>
                      <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Email</th>
                      <th style={{ padding: '15px', textAlign: 'center', fontWeight: '600' }}>Late Count</th>
                      <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Late Dates</th>
                    </tr>
                  </thead>
                  <tbody>
                    {defaulters.map((defaulter, index) => (
                      <tr key={defaulter.userId} style={{ borderBottom: '1px solid #eee', backgroundColor: index % 2 === 0 ? '#ffebee' : '#fff' }}>
                        <td style={{ padding: '15px', fontWeight: '500' }}>{defaulter.userName}</td>
                        <td style={{ padding: '15px', color: '#666' }}>{defaulter.userEmail}</td>
                        <td style={{ padding: '15px', textAlign: 'center' }}>
                          <span style={{ 
                            backgroundColor: '#d32f2f', 
                            color: 'white', 
                            padding: '5px 12px', 
                            borderRadius: '20px',
                            fontWeight: 'bold',
                            fontSize: '14px'
                          }}>
                            {defaulter.lateCount}
                          </span>
                        </td>
                        <td style={{ padding: '15px', color: '#666', fontSize: '13px' }}>{defaulter.lateDates?.join(', ') || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Staff Attendance Details Table */}
          <div>
            <h3 style={{ marginBottom: '20px', color: '#333', fontSize: '18px', fontWeight: '600', borderLeft: '4px solid #008080', paddingLeft: '12px' }}>📊 Staff Attendance Details</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', backgroundColor: '#fff', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <thead>
                  <tr style={{ backgroundColor: '#008080', color: 'white' }}>
                    <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Staff Name</th>
                    <th style={{ padding: '15px', textAlign: 'center', fontWeight: '600' }}>Total Days</th>
                    <th style={{ padding: '15px', textAlign: 'center', fontWeight: '600', backgroundColor: '#00695c' }}>On Time</th>
                    <th style={{ padding: '15px', textAlign: 'center', fontWeight: '600', backgroundColor: '#e65100' }}>Late</th>
                    <th style={{ padding: '15px', textAlign: 'center', fontWeight: '600' }}>Completed</th>
                    <th style={{ padding: '15px', textAlign: 'center', fontWeight: '600' }}>Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {staffAnalysis.map((staff, index) => (
                    <tr key={staff.userId} style={{ borderBottom: '1px solid #eee', backgroundColor: index % 2 === 0 ? '#f8fafa' : '#fff' }}>
                      <td style={{ padding: '15px', fontWeight: '500' }}>{staff.userName}</td>
                      <td style={{ padding: '15px', textAlign: 'center', color: '#666' }}>{staff.totalDays}</td>
                      <td style={{ padding: '15px', textAlign: 'center' }}>
                        <span style={{ 
                          backgroundColor: '#e8f5e9', 
                          color: '#2e7d32', 
                          padding: '4px 10px', 
                          borderRadius: '15px',
                          fontWeight: '600',
                          fontSize: '13px'
                        }}>
                          {staff.onTimeDays}
                        </span>
                      </td>
                      <td style={{ padding: '15px', textAlign: 'center' }}>
                        <span style={{ 
                          backgroundColor: '#fff3e0', 
                          color: '#ef6c00', 
                          padding: '4px 10px', 
                          borderRadius: '15px',
                          fontWeight: '600',
                          fontSize: '13px'
                        }}>
                          {staff.lateDays}
                        </span>
                      </td>
                      <td style={{ padding: '15px', textAlign: 'center', color: '#666' }}>{staff.clockedOutDays}</td>
                      <td style={{ padding: '15px', textAlign: 'center' }}>
                        <span style={{ 
                          backgroundColor: staff.attendancePercentage >= 80 ? '#e8f5e9' : staff.attendancePercentage >= 60 ? '#fff3e0' : '#ffebee',
                          color: staff.attendancePercentage >= 80 ? '#2e7d32' : staff.attendancePercentage >= 60 ? '#ef6c00' : '#d32f2f',
                          padding: '6px 14px', 
                          borderRadius: '20px',
                          fontWeight: 'bold',
                          fontSize: '14px'
                        }}>
                          {staff.attendancePercentage ? `${staff.attendancePercentage.toFixed(1)}%` : '0%'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
