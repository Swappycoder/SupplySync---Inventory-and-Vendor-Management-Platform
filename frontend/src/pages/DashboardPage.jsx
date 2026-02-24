import React, { useEffect, useState } from "react";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

const DashboardPage = () => {
  const [message, setMessage] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedData, setSelectedData] = useState("amount");
  //veruble to store and set transaction data formated for chart display
  const [transactionData, setTransactionData] = useState({});
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [stats, setStats] = useState({ totalTransactions: 0, totalQuantity: 0, totalAmount: 0 });
  const userRole = ApiService.getRole();
  const [shiftStartTime, setShiftStartTime] = useState(() => {
    const stored = localStorage.getItem("shiftStartTime");
    return stored ? new Date(stored) : new Date();
  });
  const [itemsSoldToday, setItemsSoldToday] = useState(0);
  const [lowStockItems, setLowStockItems] = useState([]);

  // Store shift start time on mount
  useEffect(() => {
    if (!localStorage.getItem("shiftStartTime")) {
      const now = new Date();
      localStorage.setItem("shiftStartTime", now.toISOString());
      setShiftStartTime(now);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const transactionResponse = await ApiService.getAllTransactions();
        if (transactionResponse.status === 200) {
            const allTx = transactionResponse.transactions || [];
            // compute simple stats for staff view
            const totalTransactions = allTx.length;
            const totalQuantity = allTx.reduce((s, t) => s + (t.totalProducts || 0), 0);
            const totalAmount = allTx.reduce((s, t) => s + (t.totalPrice || 0), 0);
            setStats({ totalTransactions, totalQuantity, totalAmount });
            // count items sold today (SELL type transactions on current date)
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
            // keep recent transactions for staff
            setRecentTransactions(
              allTx
                .slice()
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 5)
            );
            setTransactionData(
            transformTransactionData(
              transactionResponse.transactions,
              selectedMonth,
              selectedYear
            )
          );
        }
      } catch (error) {
        showMessage(
          error.response?.data?.message || "Error Loggin in a User: " + error
        );
      }
    };

    const fetchLowStockProducts = async () => {
      try {
        const productsResponse = await ApiService.getAllProducts();
        if (productsResponse.status === 200) {
          const allProducts = productsResponse.products || [];
          const lowStock = allProducts.filter(p => (p.quantity || 0) < 10).slice(0, 5);
          setLowStockItems(lowStock);
        }
      } catch (error) {
        showMessage(
          error.response?.data?.message || "Error fetching products: " + error
        );
      }
    };
    fetchData();
    fetchLowStockProducts();
  }, [selectedMonth, selectedYear, selectedData]);

  const transformTransactionData = (transactions, month, year) => {
    const dailyData = {};
    //get nimber of dayas in the selected month year
    const daysInMonths = new Date(year, month, 0).getDate();
    //initilaize each day in the month with default values
    for (let day = 1; day <= daysInMonths; day++) {
      dailyData[day] = {
        day,
        count: 0,
        quantity: 0,
        amount: 0,
      };
    }
    //process each transactions to accumulate daily counts, quantity and amount
    transactions.forEach((transaction) => {
      const transactionDate = new Date(transaction.createdAt);
      const transactionMonth = transactionDate.getMonth() + 1;
      const transactionYear = transactionDate.getFullYear();

      //If transaction falls withing selected month and year, accumulate data for the day
      if (transactionMonth === month && transactionYear === year) {
        const day = transactionDate.getDate();
        dailyData[day].count += 1;
        dailyData[day].quantity += transaction.totalProducts;
        dailyData[day].amount += transaction.totalPrice;
      }
    });
    //convert dailyData object for chart compatibility
    return Object.values(dailyData);
  };

  //event handler for month selection or change
  const handleMonthChange = (e) => {
    setSelectedMonth(parseInt(e.target.value, 10));
  };

  //event handler for year selection or change
  const handleYearChange = (e) => {
    setSelectedYear(parseInt(e.target.value, 10));
  };

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => {
      setMessage("");
    }, 4000);
  };

  return (
    <Layout>
      {message && <div className="message">{message}</div>}
      <div className="dashboard-page">
        {userRole === "STAFF" ? (
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
                <p className="shift-time">{shiftStartTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              <div className="stat-card">
                <h4>Items Sold Today</h4>
                <p>{itemsSoldToday}</p>
              </div>
            </div>

            <div className="low-stock-section">
              <h3>Low Stock Items (Below 10)</h3>
              {lowStockItems.length === 0 ? (
                <p className="no-items">All items are in stock</p>
              ) : (
                <ul className="low-stock-list">
                  {lowStockItems.map((item) => (
                    <li key={item.id} className="stock-item">
                      <div className="stock-name">{item.name}</div>
                      <div className="stock-qty">
                        <span className="qty-label">Stock:</span>
                        <span className="qty-value">{item.quantity}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="recent-section">
              <h3>Recent Transactions</h3>
              <ul className="recent-list">
                {recentTransactions.length === 0 && <li>No recent transactions</li>}
                {recentTransactions.map((tx) => (
                  <li key={tx.id} className="recent-item">
                    <div>{new Date(tx.createdAt).toLocaleString()}</div>
                    <div>Type: {tx.type}</div>
                    <div>Products: {tx.totalProducts}</div>
                    <div>Amount: {tx.totalPrice}</div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <>
            <div className="button-group">
              <button onClick={() => setSelectedData("count")}>ToTal No Of Transactions</button>
              <button onClick={() => setSelectedData("quantity")}>Product Quantity</button>
              <button onClick={() => setSelectedData("amount")}>Amount</button>
            </div>

            <div className="dashboard-content">
              <div className="filter-section">
                <label htmlFor="month-select">Select Month:</label>
                <select id="month-select" value={selectedMonth} onChange={handleMonthChange}>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(0, i).toLocaleString("default", { month: "long" })}
                    </option>
                  ))}
                </select>

                <label htmlFor="year-select">Select Year:</label>
                <select id="year-select" value={selectedYear} onChange={handleYearChange}>
                  {Array.from({ length: 5 }, (_, i) => {
                    const year = new Date().getFullYear() - i;
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Display the chart */}
              <div className="chart-section">
                <div className="chart-container">
                  <h3>Daily Transactions</h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={transactionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" label={{ value: "Day", position: "insideBottomRight", offset: -5 }} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type={"monotone"}
                        dataKey={selectedData}
                        stroke="#008080"
                        fillOpacity={0.3}
                        fill="#008080"
                      />
                    </LineChart>
                  </ResponsiveContainer>

                </div>

              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};
export default DashboardPage;
