import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Users,
    ReceiptText,
    Settings,
    LogOut,
    TrendingUp,
    ShieldCheck,
    Wallet,
    Bell,
    Search,
    Filter,
    Menu,
    X,
    ChevronRight,
    Download,
    CheckCircle2,
    XCircle,
    UserSearch,
    CreditCard,
    ArrowUpRight,
    Activity,
    Edit,
    Ban,
    Shield,
    UserPlus,
    Coins,
    BarChart2,
    DollarSign,
    TrendingDown,
    FileText,
    PanelLeftClose,
    PanelLeftOpen,
    RefreshCw,
    Trophy,
    ArrowRight
} from 'lucide-react';
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer, ComposedChart
} from 'recharts';
import './AdminDashboard.css';

// Animated Counter Component
const CountUp = ({ value, duration = 1.5 }) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
        let start = 0;
        const end = parseInt(value);
        if (start === end) return;
        let totalMilisecondsDur = duration * 1000;
        let incrementTime = (totalMilisecondsDur / end) > 10 ? (totalMilisecondsDur / end) : 10;
        let timer = setInterval(() => {
            start += Math.ceil(end / (totalMilisecondsDur / incrementTime));
            if (start >= end) {
                setCount(end);
                clearInterval(timer);
            } else {
                setCount(start);
            }
        }, incrementTime);
        return () => clearInterval(timer);
    }, [value, duration]);
    return <span>{count.toLocaleString()}</span>;
};

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('Overview');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [settings, setSettings] = useState({
        dhankiPrice: 0.015,
        networkFee: 2.0,
        minWithdrawal: 10,
        maintenanceMode: false
    });
    const [loading, setLoading] = useState(true);
    const [txSearch, setTxSearch] = useState('');
    const [txFilter, setTxFilter] = useState('all');
    const [proofImage, setProofImage] = useState(null);
    const [financeRange, setFinanceRange] = useState('30D');

    const fetchAdminData = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };

            const [statsRes, usersRes, txRes, setRes] = await Promise.all([
                fetch('http://localhost:5000/api/admin/stats', { headers }),
                fetch('http://localhost:5000/api/admin/users', { headers }),
                fetch('http://localhost:5000/api/admin/transactions', { headers }),
                fetch('http://localhost:5000/api/admin/settings', { headers })
            ]);

            if (statsRes.ok) setStats(await statsRes.json());
            if (usersRes.ok) {
                const data = await usersRes.json();
                if (Array.isArray(data)) setUsers(data);
            }
            if (txRes.ok) {
                const data = await txRes.json();
                if (Array.isArray(data)) setTransactions(data);
            }
            if (setRes.ok) setSettings(await setRes.json());

        } catch (error) {
            console.error('Admin fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdminData();
    }, []);

    const handleTransactionAction = async (id, status) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:5000/api/admin/transactions/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ status })
            });
            if (res.ok) {
                alert(`Transaction ${status} successfully`);
                fetchAdminData();
            }
        } catch (error) { alert('Server error'); }
    };

    const handleUpdateSettings = async (e) => {
        if (e) e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/admin/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(settings)
            });
            if (res.ok) alert('Settings updated successfully');
        } catch (error) { alert('Server error'); }
    };

    const handleUserAction = async (id, status) => {
        if (!window.confirm(`Change user status to "${status}"?`)) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:5000/api/admin/users/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ status })
            });
            if (res.ok) fetchAdminData();
        } catch (error) { alert('Server error'); }
    };

    const [userModal, setUserModal] = useState(null);
    const [editForm, setEditForm] = useState({});

    const openUserModal = (type, user) => {
        setUserModal({ type, user });
        if (type === 'edit') {
            setEditForm({
                name: user.name || '',
                email: user.email || '',
                dhanki: user.wallet?.dhanki || 0,
            });
        }
    };

    const handleSaveUserEdit = async () => {
        const { user } = userModal;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:5000/api/admin/users/${user._id}/edit`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(editForm)
            });
            if (res.ok) {
                alert('User updated successfully!');
                setUserModal(null);
                fetchAdminData();
            }
        } catch { alert('Server error'); }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    // Mini Sparkline Data
    const sparkData = [
        { v: 400 }, { v: 600 }, { v: 500 }, { v: 800 }, { v: 700 }, { v: 900 }, { v: 1000 }
    ];

    const adminStats = [
        { label: 'Total Platform Users', value: stats?.totalUsers || '0', icon: <Users size={22} />, trend: '+12.5%', color: '#F5C518', sparkColor: '#F5C518' },
        { label: 'Total Revenue (INR)', value: `₹${(stats?.revenue || 0).toLocaleString()}`, icon: <Wallet size={22} />, trend: '+8.2%', color: '#00E676', sparkColor: '#00E676' },
        { label: 'Dhanki Sold', value: (stats?.tokenSold || 0).toLocaleString(), icon: <TrendingUp size={22} />, trend: '+24%', color: '#00E5FF', sparkColor: '#00E5FF' },
        { label: 'Platform Nodes', value: stats?.activeNodes || '0', icon: <ShieldCheck size={22} />, trend: 'Stable', color: '#FF4D4D', sparkColor: '#FF4D4D' }
    ];

    const menuItems = [
        { name: 'Overview', icon: <LayoutDashboard size={20} /> },
        { name: 'Token Requests', icon: <Coins size={20} />, badge: transactions.filter(t => t.type === 'purchase' && t.status === 'pending').length },
        { name: 'User Management', icon: <UserSearch size={20} /> },
        { name: 'Transactions', icon: <ReceiptText size={20} /> },
        { name: 'Finance', icon: <BarChart2 size={20} /> },
        { name: 'Settings', icon: <Settings size={20} /> },
    ];

    return (
        <div className="admin-container">
            <div className="neon-accent accent-gold"></div>
            <div className="neon-accent accent-purple"></div>

            <aside className={`admin-sidebar ${isSidebarCollapsed ? 'sidebar-collapsed' : ''} ${isSidebarOpen ? 'sidebar-open' : ''}`}>
                <div className="admin-logo">
                    <div className="logo-icon">
                        <ShieldCheck size={22} color="#000" />
                    </div>
                    <span className="logo-text">DHANKI ADMIN</span>
                </div>

                <nav className="admin-nav">
                    {menuItems.map((item) => (
                        <div
                            key={item.name}
                            className={`admin-nav-item ${activeTab === item.name ? 'active' : ''}`}
                            onClick={() => {
                                setActiveTab(item.name);
                                if (window.innerWidth <= 1024) setIsSidebarOpen(false);
                            }}
                        >
                            {item.icon}
                            <span>{item.name}</span>
                            {item.badge > 0 && <span className="sidebar-badge">{item.badge}</span>}
                        </div>
                    ))}
                </nav>


                <div className="admin-nav" style={{ marginTop: 'auto' }}>
                    <div className="admin-nav-item" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}>
                        {isSidebarCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
                        <span>{isSidebarCollapsed ? 'Expand' : 'Collapse'}</span>
                    </div>
                    <div className="admin-nav-item" style={{ color: 'var(--admin-danger)' }} onClick={handleLogout}>
                        <LogOut size={20} />
                        <span>Logout</span>
                    </div>
                </div>
            </aside>

            <main className={`admin-main ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
                <header className="admin-header">
                    <div className="header-left">
                        <motion.h1 key={activeTab} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                            {activeTab}
                        </motion.h1>
                        <p style={{ color: 'var(--admin-text-dim)', fontSize: '0.95rem', fontWeight: 500 }}>
                            System Status: <span style={{ color: 'var(--admin-success)' }}>Operational</span>
                        </p>
                    </div>

                    <div className="header-right">
                        <div className="icon-btn-utility" onClick={fetchAdminData}>
                            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                        </div>
                        <div className="admin-notification-btn">
                            <Bell size={20} />
                            <span className="notification-dot"></span>
                        </div>
                        <div className="admin-user-profile">
                            <div className="admin-avatar">AD</div>
                            <div className="profile-info">
                                <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>Super Admin</p>
                                <p style={{ fontSize: '0.72rem', color: 'var(--admin-text-dim)' }}>Administrator</p>
                            </div>
                        </div>
                    </div>
                </header>

                <AnimatePresence mode="wait">
                    {activeTab === 'Overview' && (
                        <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                            <div className="admin-stats-grid">
                                {adminStats.map((stat, idx) => (
                                    <div key={idx} className="admin-stat-card">
                                        <div className="stat-icon" style={{ background: `${stat.color}15`, color: stat.color }}>
                                            {stat.icon}
                                        </div>
                                        <div className="stat-value">
                                            {typeof stat.value === 'string' && stat.value.includes('₹') ? '₹' : ''}
                                            <CountUp value={stat.value.toString().replace(/[^0-9]/g, '')} />
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span className="stat-label">{stat.label}</span>
                                            <span className={`stat-trend ${stat.trend.includes('+') ? 'trend-up' : ''}`}>
                                                {stat.trend}
                                            </span>
                                        </div>
                                        <div className="mini-chart">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={sparkData}>
                                                    <Line type="monotone" dataKey="v" stroke={stat.sparkColor} strokeWidth={2} dot={false} />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="charts-layout-grid">
                                <div className="admin-content-card">
                                    <div className="card-header">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <Activity size={20} color="var(--admin-gold)" />
                                            <h3>Token Purchase Activity</h3>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            {['Today', 'Weekly', 'Monthly'].map(f => (
                                                <button key={f} className="btn-outline-small">{f}</button>
                                            ))}
                                        </div>
                                    </div>
                                    <div style={{ padding: '24px' }}>
                                        <ResponsiveContainer width="100%" height={320}>
                                            <AreaChart data={transactions.slice(-10).map((t, i) => ({ name: `T${i}`, val: t.amount || 0 }))}>
                                                <defs>
                                                    <linearGradient id="glowG" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="var(--admin-gold)" stopOpacity={0.4} />
                                                        <stop offset="95%" stopColor="var(--admin-gold)" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                                <XAxis dataKey="name" hide />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--admin-text-dim)', fontSize: 11 }} />
                                                <Tooltip contentStyle={{ background: '#0B1120', border: '1px solid var(--admin-border)', borderRadius: '12px' }} />
                                                <Area type="monotone" dataKey="val" stroke="var(--admin-gold)" strokeWidth={3} fill="url(#glowG)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="admin-content-card">
                                    <div className="card-header">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <Trophy size={20} color="var(--admin-neon-blue)" />
                                            <h3>Top Earners</h3>
                                        </div>
                                    </div>
                                    <div className="top-earners-card">
                                        {users.slice(0, 5).sort((a, b) => (b.income?.total || 0) - (a.income?.total || 0)).map((u, i) => (
                                            <div key={i} className="earner-row">
                                                <div className="earner-rank">{i + 1}</div>
                                                <div style={{ flex: 1 }}>
                                                    <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>{u.name}</p>
                                                    <p style={{ fontSize: '0.72rem', color: 'var(--admin-text-dim)' }}>ID: {u.referralId}</p>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <p style={{ fontWeight: 800, color: 'var(--admin-success)' }}>₹{u.income?.total?.toLocaleString()}</p>
                                                    <p style={{ fontSize: '0.7rem', color: 'var(--admin-text-dim)' }}>Total Profit</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="admin-content-card animate-slide-up" style={{ marginTop: '24px' }}>
                                <div className="card-header">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <FileText size={20} color="var(--admin-gold)" />
                                        <h3>Recent System Transactions</h3>
                                    </div>
                                    <button className="btn-outline-small" onClick={() => setActiveTab('Transactions')}>View All Ledger</button>
                                </div>
                                <div className="table-responsive">
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>Ref ID</th>
                                                <th>User</th>
                                                <th>Type</th>
                                                <th>Amount</th>
                                                <th>Status</th>
                                                <th>Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {transactions.slice(0, 6).map((tx, i) => (
                                                <tr key={tx._id || i}>
                                                    <td><span style={{ fontSize: '0.8rem', color: 'var(--admin-gold)', fontWeight: 600 }}>#{tx.user?.referralId || 'SYS'}</span></td>
                                                    <td>{tx.user?.name || 'Unknown'}</td>
                                                    <td><span style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)' }}>{tx.type}</span></td>
                                                    <td style={{ fontWeight: 700 }}>{tx.amount?.toLocaleString()} {tx.currency}</td>
                                                    <td><span className={`status-badge status-${(tx.status || 'pending').toLowerCase()}`}>{tx.status}</span></td>
                                                    <td style={{ color: 'var(--admin-text-dim)', fontSize: '0.8rem' }}>{new Date(tx.createdAt).toLocaleDateString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'Finance' && (() => {
                        const purchaseTxs = transactions.filter(t => t.type === 'purchase');
                        const levelTxs = transactions.filter(t => t.type?.toLowerCase().includes('income'));
                        const withdrawTxs = transactions.filter(t => t.type === 'withdrawal');

                        const totalIncome = purchaseTxs.reduce((s, t) => s + (t.amount || 0), 0);
                        const totalExpenses = withdrawTxs.reduce((s, t) => s + (t.amount || 0), 0) + levelTxs.reduce((s, t) => s + (t.amount || 0), 0);
                        const netProfit = totalIncome - totalExpenses;

                        const dayMap = {};
                        transactions.forEach(tx => {
                            const d = new Date(tx.createdAt);
                            const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                            if (!dayMap[key]) dayMap[key] = { date: key, income: 0, expense: 0 };
                            if (tx.type === 'purchase') dayMap[key].income += (tx.amount || 0);
                            else dayMap[key].expense += (tx.amount || 0);
                        });
                        const chartData = Object.values(dayMap).slice(-14);

                        const revPie = [
                            { name: 'Purchases', value: totalIncome || 1, color: '#00E676' },
                            { name: 'Expenses', value: totalExpenses || 0, color: '#FF4D4D' },
                        ];

                        return (
                            <motion.div key="finance" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <div className="admin-stats-grid">
                                    <div className="admin-stat-card">
                                        <p className="stat-label">Total Platform Revenue</p>
                                        <p className="stat-value" style={{ color: 'var(--admin-success)' }}>₹<CountUp value={totalIncome} /></p>
                                        <p className="stat-trend trend-up"><ArrowUpRight size={14} /> +12% vs last month</p>
                                    </div>
                                    <div className="admin-stat-card">
                                        <p className="stat-label">Total Payouts</p>
                                        <p className="stat-value" style={{ color: 'var(--admin-danger)' }}>₹<CountUp value={totalExpenses} /></p>
                                        <p className="stat-trend trend-down"><TrendingDown size={14} /> -3% vs last month</p>
                                    </div>
                                    <div className="admin-stat-card">
                                        <p className="stat-label">Net Profit Margin</p>
                                        <p className="stat-value" style={{ color: 'var(--admin-neon-blue)' }}>₹<CountUp value={netProfit} /></p>
                                        <p className="stat-trend trend-up"><Activity size={14} /> Healthy Surplus</p>
                                    </div>
                                </div>

                                <div className="charts-layout-grid">
                                    <div className="admin-content-card">
                                        <div className="card-header">
                                            <h3>Revenue vs Expenditure (Premium View)</h3>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button className="icon-btn-utility"><Download size={18} /></button>
                                                <button className="btn-primary shimmer-btn" style={{ padding: '8px 16px' }}>Export Detailed CSV</button>
                                            </div>
                                        </div>
                                        <div style={{ padding: '30px' }}>
                                            <ResponsiveContainer width="100%" height={320}>
                                                <ComposedChart data={chartData}>
                                                    <defs>
                                                        <linearGradient id="incG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#00E676" stopOpacity={0.3} /><stop offset="95%" stopColor="#00E676" stopOpacity={0} /></linearGradient>
                                                        <linearGradient id="expG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#FF4D4D" stopOpacity={0.3} /><stop offset="95%" stopColor="#FF4D4D" stopOpacity={0} /></linearGradient>
                                                        <linearGradient id="barIncG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#00E676" stopOpacity={0.8} /><stop offset="95%" stopColor="#00E676" stopOpacity={0.2} /></linearGradient>
                                                        <linearGradient id="barExpG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#FF4D4D" stopOpacity={0.8} /><stop offset="95%" stopColor="#FF4D4D" stopOpacity={0.2} /></linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                                    <XAxis dataKey="date" tick={{ fill: 'var(--admin-text-dim)', fontSize: 11 }} />
                                                    <YAxis axisLine={false} tick={{ fill: 'var(--admin-text-dim)', fontSize: 11 }} />
                                                    <Tooltip contentStyle={{ background: '#0B1120', border: '1px solid var(--admin-border)', borderRadius: '16px' }} />
                                                    <Legend />
                                                    <Bar name="Income Volume" dataKey="income" fill="url(#barIncG)" radius={[6, 6, 0, 0]} barSize={30} />
                                                    <Bar name="Expense Volume" dataKey="expense" fill="url(#barExpG)" radius={[6, 6, 0, 0]} barSize={20} />
                                                    <Area type="monotone" name="Income Trend" dataKey="income" stroke="#00E676" strokeWidth={3} fill="url(#incG)" />
                                                    <Area type="monotone" name="Expense Trend" dataKey="expense" stroke="#FF4D4D" strokeWidth={3} fill="url(#expG)" />
                                                </ComposedChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    <div className="admin-content-card">
                                        <div className="card-header"><h3>Allocation</h3></div>
                                        <div style={{ padding: '30px', position: 'relative' }}>
                                            <ResponsiveContainer width="100%" height={260}>
                                                <PieChart>
                                                    <Pie data={revPie} innerRadius={75} outerRadius={95} paddingAngle={8} dataKey="value">
                                                        {revPie.map((e, i) => <Cell key={i} fill={e.color} />)}
                                                    </Pie>
                                                    <Tooltip />
                                                </PieChart>
                                            </ResponsiveContainer>
                                            <div className="donut-center-label">
                                                <span className="donut-center-value">₹{(totalIncome / 1000).toFixed(1)}K</span>
                                                <span className="donut-center-text">Total Rev</span>
                                            </div>
                                            <div style={{ marginTop: '20px' }}>
                                                {revPie.map(r => (
                                                    <div key={r.name} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: r.color }}></div>
                                                            <span style={{ fontSize: '0.85rem', color: 'var(--admin-text-dim)' }}>{r.name}</span>
                                                        </div>
                                                        <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{((r.value / (totalIncome + totalExpenses)) * 100).toFixed(1)}%</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })()}

                    {activeTab === 'Token Requests' && (
                        <motion.div key="requests" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <div className="admin-content-card">
                                <div className="card-header">
                                    <h3>Pending Verification Requests</h3>
                                    <span className="count-badge">{transactions.filter(t => t.type === 'purchase' && t.status === 'pending').length} Action Required</span>
                                </div>
                                <div className="table-responsive">
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>User</th>
                                                <th>Amount</th>
                                                <th>DHT Tokens</th>
                                                <th>Transaction ID</th>
                                                <th>Proof</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {transactions.filter(t => t.type === 'purchase' && t.status === 'pending').map((tx, i) => (
                                                <tr key={tx._id || i}>
                                                    <td>
                                                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                            <div className="admin-avatar" style={{ width: 36, height: 36 }}>{tx.user?.name?.[0]}</div>
                                                            <div><p style={{ fontWeight: 700 }}>{tx.user?.name}</p><p style={{ fontSize: '0.7rem', color: 'var(--admin-text-dim)' }}>{tx.user?.email}</p></div>
                                                        </div>
                                                    </td>
                                                    <td style={{ fontWeight: 800 }}>₹{tx.amount?.toLocaleString()}</td>
                                                    <td style={{ color: 'var(--admin-gold)', fontWeight: 800 }}>{tx.tokens?.toLocaleString()} DHT</td>
                                                    <td><code style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '6px' }}>{tx.transactionId || 'N/A'}</code></td>
                                                    <td>
                                                        {tx.paymentScreenshot ? (
                                                            <button className="btn-outline-small" onClick={() => setProofImage('http://localhost:5000/uploads/' + tx.paymentScreenshot)}>View Proof</button>
                                                        ) : '—'}
                                                    </td>
                                                    <td>
                                                        <div style={{ display: 'flex', gap: '8px' }}>
                                                            <button onClick={() => handleTransactionAction(tx._id, 'completed')} className="admin-btn btn-approve">Approve</button>
                                                            <button onClick={() => handleTransactionAction(tx._id, 'rejected')} className="admin-btn btn-reject">Reject</button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'User Management' && (
                        <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <div className="admin-content-card">
                                <div className="card-header admin-search-header">
                                    <div className="search-bar-wrapper">
                                        <Search size={18} className="search-icon" />
                                        <input type="text" placeholder="Search accounts..." className="search-input-prime" />
                                    </div>
                                    <button className="btn-primary" style={{ padding: '10px 20px' }}><UserPlus size={18} /> New User</button>
                                </div>
                                <div className="table-responsive">
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>User Profile</th>
                                                <th>Assets Detail</th>
                                                <th>Activity Stats</th>
                                                <th>Network (L1/L2/L3)</th>
                                                <th>Status</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map((user, i) => (
                                                <tr key={user._id || i}>
                                                    <td>
                                                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                            <div className="admin-avatar" style={{ borderRadius: '12px' }}>{user.name?.[0]}</div>
                                                            <div>
                                                                <p style={{ fontWeight: 700 }}>{user.name}</p>
                                                                <p style={{ fontSize: '0.72rem', color: 'var(--admin-text-dim)' }}>ID: {user.referralId}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="assets-cell">
                                                            <div className="main-balance">₹{(user.wallet?.inrBalance || 0).toLocaleString()}</div>
                                                            <div className="sub-asset gold">{user.wallet?.dhanki?.toLocaleString() || 0} DHT</div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="tx-stat-cell">
                                                            <div className="tx-in">+{user.totalInvestment || 0} In</div>
                                                            <div className="tx-out">-{user.totalWithdrawal || 0} Out</div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="network-badge-row">
                                                            <span className="net-badge l1">L1: {user.referrals?.l1Count || 0}</span>
                                                            <span className="net-badge l2">L2: {user.referrals?.l2Count || 0}</span>
                                                            <span className="net-badge l3">L3: {user.referrals?.l3Count || 0}</span>
                                                        </div>
                                                    </td>
                                                    <td><span className={`status-badge status-${(user.status || 'Active').toLowerCase()}`}>{user.status || 'Active'}</span></td>
                                                    <td>
                                                        <div className="admin-action-row">
                                                            <button className="action-icon-btn edit" onClick={() => openUserModal('edit', user)}><Edit size={16} /></button>
                                                            <button className="action-icon-btn users" onClick={() => openUserModal('referrals', user)}><Users size={16} /></button>
                                                            <button className="action-icon-btn ban" onClick={() => handleUserAction(user._id, user.status === 'Banned' ? 'Active' : 'Banned')}><Ban size={16} /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'Transactions' && (
                        <motion.div key="tx" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <div className="admin-content-card">
                                <div className="card-header">
                                    <h3>Platform Ledger</h3>
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        <button className="btn-outline-small">Export History</button>
                                        <div className="search-bar-wrapper" style={{ maxWidth: '200px' }}>
                                            <Search size={16} className="search-icon" />
                                            <input type="text" placeholder="Filter ID..." className="search-input-prime" />
                                        </div>
                                    </div>
                                </div>
                                <div className="table-responsive">
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>User</th>
                                                <th>Type</th>
                                                <th>Volume</th>
                                                <th>TX Hash</th>
                                                <th>Status</th>
                                                <th>Timestamp</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {transactions.map((tx, i) => (
                                                <tr key={tx._id || i}>
                                                    <td>{tx.user?.name || 'System'}</td>
                                                    <td><span style={{ textTransform: 'capitalize' }}>{tx.type?.replace('_', ' ')}</span></td>
                                                    <td style={{ fontWeight: 700 }}>{tx.amount?.toLocaleString()} {tx.currency}</td>
                                                    <td><code style={{ fontSize: '0.7rem' }}>{tx.txHash?.substring(0, 12)}...</code></td>
                                                    <td><span className={`status-badge status-${(tx.status || 'pending').toLowerCase()}`}>{tx.status}</span></td>
                                                    <td style={{ fontSize: '0.8rem', color: 'var(--admin-text-dim)' }}>{new Date(tx.createdAt).toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'Settings' && (
                        <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="settings-grid">
                            <div className="admin-content-card" style={{ padding: '2.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem' }}>
                                    <Settings size={22} color="var(--admin-gold)" />
                                    <h3>Site Parameters</h3>
                                </div>
                                <form onSubmit={handleUpdateSettings}>
                                    <div className="form-group-admin">
                                        <label>Dhanki Token Price (USDT)</label>
                                        <input type="number" step="0.0001" className="admin-input-prime" value={settings.dhankiPrice || ''} onChange={(e) => setSettings({ ...settings, dhankiPrice: parseFloat(e.target.value) })} />
                                    </div>
                                    <div className="form-group-admin">
                                        <label>Network Fee (USDT)</label>
                                        <input type="number" className="admin-input-prime" value={settings.networkFee || ''} onChange={(e) => setSettings({ ...settings, networkFee: parseFloat(e.target.value) })} />
                                    </div>
                                    <button type="submit" className="btn-primary shimmer-btn" style={{ width: '100%', padding: '14px', borderRadius: '14px', marginTop: '1rem' }}>Apply New Global Parameters</button>
                                </form>
                            </div>

                            <div className="admin-content-card" style={{ padding: '2.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem' }}>
                                    <ShieldCheck size={22} color="var(--admin-danger)" />
                                    <h3>Platform Governance</h3>
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--admin-border)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                        <div>
                                            <p style={{ fontWeight: 700 }}>Maintenance Mode</p>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--admin-text-dim)' }}>Disable all user transactions</p>
                                        </div>
                                        <div onClick={() => { setSettings(s => ({ ...s, maintenanceMode: !s.maintenanceMode })); handleUpdateSettings(); }} style={{ width: '50px', height: '26px', background: settings.maintenanceMode ? 'var(--admin-danger)' : 'rgba(255,255,255,0.1)', borderRadius: '20px', cursor: 'pointer', transition: '0.3s', padding: '3px' }}>
                                            <div style={{ width: '20px', height: '20px', background: 'white', borderRadius: '50%', transform: settings.maintenanceMode ? 'translateX(24px)' : 'translateX(0)', transition: '0.3s' }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {userModal && (
                <div className="sidebar-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setUserModal(null)}>
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} onClick={e => e.stopPropagation()} className="admin-content-card" style={{ width: '100%', maxWidth: userModal.type === 'referrals' ? '600px' : '450px', padding: '2.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0 }}>{userModal.type === 'edit' ? 'Commit User Overrides' : 'Network Hierarchy'}</h3>
                            <button onClick={() => setUserModal(null)} className="icon-btn-utility"><X size={18} /></button>
                        </div>

                        {userModal.type === 'edit' ? (
                            <>
                                <p style={{ color: 'var(--admin-text-dim)', fontSize: '0.85rem', marginBottom: '20px' }}>Modifying profile for {userModal.user?.name}</p>
                                <div className="form-group-admin">
                                    <label>DHT Token Balance (Override)</label>
                                    <input type="number" className="admin-input-prime" value={editForm.dhanki} onChange={e => setEditForm({ ...editForm, dhanki: parseFloat(e.target.value) })} />
                                </div>
                                <div style={{ display: 'flex', gap: '12px', marginTop: '2.5rem' }}>
                                    <button className="btn-outline" style={{ flex: 1 }} onClick={() => setUserModal(null)}>Cancel</button>
                                    <button className="btn-primary shimmer-btn" style={{ flex: 1 }} onClick={handleSaveUserEdit}>Commit Changes</button>
                                </div>
                            </>
                        ) : (
                            <div className="referrals-view">
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '25px' }}>
                                    <div style={{ padding: '15px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '15px', textAlign: 'center', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                                        <p style={{ fontSize: '0.7rem', color: '#8B5CF6', fontWeight: 700 }}>LEVEL 1</p>
                                        <p style={{ fontSize: '1.4rem', fontWeight: 800 }}>{userModal.user?.referrals?.l1Count || 0}</p>
                                    </div>
                                    <div style={{ padding: '15px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '15px', textAlign: 'center', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                                        <p style={{ fontSize: '0.7rem', color: '#3B82F6', fontWeight: 700 }}>LEVEL 2</p>
                                        <p style={{ fontSize: '1.4rem', fontWeight: 800 }}>{userModal.user?.referrals?.l2Count || 0}</p>
                                    </div>
                                    <div style={{ padding: '15px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '15px', textAlign: 'center', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                        <p style={{ fontSize: '0.7rem', color: '#10B981', fontWeight: 700 }}>LEVEL 3</p>
                                        <p style={{ fontSize: '1.4rem', fontWeight: 800 }}>{userModal.user?.referrals?.l3Count || 0}</p>
                                    </div>
                                </div>
                                <div style={{ padding: '15px', background: 'var(--admin-card)', borderRadius: '15px', border: '1px solid var(--admin-border)' }}>
                                    <p style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '10px' }}>Upline Connection</p>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--admin-text-dim)' }}>Referred By: <span style={{ color: 'var(--admin-gold)', fontWeight: 700 }}>{userModal.user?.referredBy || 'Direct Platform Signup'}</span></p>
                                </div>
                                <button className="btn-outline" style={{ width: '100%', marginTop: '20px' }} onClick={() => setUserModal(null)}>Close View</button>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}

            {proofImage && (
                <div className="sidebar-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setProofImage(null)}>
                    <div onClick={e => e.stopPropagation()} style={{ position: 'relative' }}>
                        <img src={proofImage} alt="Payment Proof" style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: '20px', border: '2px solid var(--admin-border)' }} />
                        <button onClick={() => setProofImage(null)} style={{ position: 'absolute', top: -20, right: -20, background: 'var(--admin-danger)', color: 'white', border: 'none', borderRadius: '50%', width: 40, height: 40, cursor: 'pointer', fontWeight: 900 }}>X</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
