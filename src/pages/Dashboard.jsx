import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    TrendingUp,
    Coins,
    UserCheck,
    ArrowUpRight,
    Users,
    History,
    User,
    Wallet,
    LogOut,
    Copy,
    Zap,
    ShieldCheck,
    Globe,
    BarChart3,
    ChevronRight,
    Activity,
    Menu,
    X
} from 'lucide-react';
import './Dashboard.css';
import API_BASE_URL from '../apiConfig';
import BuyToken from './BuyToken';
import logo from '../assets/DHANIK.png';
import LevelIncome from './LevelIncome';
import Support from './Support';
import ReferralNetwork from './ReferralNetwork';
import Profile from './Profile';
import { BrowserProvider } from 'ethers';

const Dashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isWalletConnected, setIsWalletConnected] = useState(false);
    const [walletAddress, setWalletAddress] = useState('');

    const handleConnectWallet = async () => {
        if (typeof window.ethereum !== 'undefined') {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                if (accounts.length > 0) {
                    setIsWalletConnected(true);
                    setWalletAddress(accounts[0]);

                    // Optional: persist in localStorage for visual consistency
                    localStorage.setItem('walletAddress', accounts[0]);
                }
            } catch (err) {
                console.error('Wallet connection error:', err);
                if (err.code === 4001) {
                    alert('Connection rejected by user.');
                }
            }
        } else {
            alert('Please install MetaMask to connect your wallet!');
            window.open('https://metamask.io/download/', '_blank');
        }
    };

    const handleDisconnect = () => {
        setIsWalletConnected(false);
        setWalletAddress('');
        localStorage.removeItem('walletAddress');
    };

    useEffect(() => {
        const checkConnection = async () => {
            if (typeof window.ethereum !== 'undefined') {
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                if (accounts.length > 0) {
                    setIsWalletConnected(true);
                    setWalletAddress(accounts[0]);
                }

                window.ethereum.on('accountsChanged', (accounts) => {
                    if (accounts.length > 0) {
                        setWalletAddress(accounts[0]);
                        setIsWalletConnected(true);
                    } else {
                        setIsWalletConnected(false);
                        setWalletAddress('');
                    }
                });

                window.ethereum.on('chainChanged', () => {
                    window.location.reload();
                });
            }
        };
        checkConnection();

        return () => {
            if (window.ethereum && window.ethereum.removeListener) {
                window.ethereum.removeListener('accountsChanged', () => { });
                window.ethereum.removeListener('chainChanged', () => { });
            }
        };
    }, []);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                const response = await fetch(`${API_BASE_URL}/api/profile`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    setUser(data);
                    // Update localStorage to keep it relatively in sync
                    localStorage.setItem('user', JSON.stringify(data));
                } else if (response.status === 401) {
                    navigate('/login');
                }
            } catch (err) {
                console.error('Profile fetch error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    // Sync activeTab with URL path
    const getActiveTabFromPath = (path) => {
        if (path === '/buy-token') return 'Buy Token';
        if (path === '/referral') return 'Referral';
        if (path === '/level-income') return 'Level Income';
        if (path === '/profile') return 'Profile';
        if (path === '/support') return 'Support';
        return 'Dashboard';
    };

    const activeTab = getActiveTabFromPath(location.pathname);
    const [scrolled, setScrolled] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1024);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 1024) {
                setSidebarOpen(true);
            } else {
                setSidebarOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.3,
                ease: [0.16, 1, 0.3, 1]
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
    };

    const menuItems = [
        { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
        { name: 'Buy Token', icon: <Coins size={20} />, path: '/buy-token' },
        { name: 'Referral', icon: <Users size={20} />, path: '/referral' },
        { name: 'Level Income', icon: <BarChart3 size={20} />, path: '/level-income' },
        { name: 'Profile', icon: <User size={20} />, path: '/profile' },
        { name: 'Support', icon: <ShieldCheck size={20} />, path: '/support' },
    ];

    return (
        <div className="dashboard-container">
            {/* Sidebar */}
            <motion.aside
                className={`sidebar ${sidebarOpen ? 'open' : 'mini'}`}
                initial={false}
                animate={{
                    width: (window.innerWidth <= 1024) ? 280 : (sidebarOpen ? 280 : 80),
                    x: (window.innerWidth <= 1024 && !sidebarOpen) ? -280 : 0
                }}
                transition={{ type: 'spring', damping: 30, stiffness: 200, mass: 0.8 }}
            >
                <div className="sidebar-toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
                    {sidebarOpen ? <X size={20} /> : <ChevronRight size={20} />}
                </div>
                <div className="logo-section">
                    <img src={logo} alt="DHANIK" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                    <span className="logo-text gold-glow-text">DHANIK</span>
                </div>

                <nav className="nav-menu">
                    {menuItems.map((item) => (
                        <motion.div
                            key={item.name}
                            className={`nav-item ${activeTab === item.name ? 'active' : ''}`}
                            onClick={() => {
                                navigate(item.path);
                                if (window.innerWidth <= 1024) setSidebarOpen(false);
                            }}
                            whileHover={{ x: 5 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span className="nav-name">{item.name}</span>
                            {activeTab === item.name && (
                                <motion.div
                                    className="active-indicator"
                                    layoutId="active-nav"
                                    style={{
                                        position: 'absolute',
                                        right: 0,
                                        width: '4px',
                                        height: '20px',
                                        background: 'white',
                                        borderRadius: '4px 0 0 4px'
                                    }}
                                />
                            )}
                        </motion.div>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="nav-item" onClick={handleLogout}>
                        <span className="nav-icon"><LogOut size={20} /></span>
                        <span className="nav-name">Logout</span>
                    </div>
                </div>
            </motion.aside>

            <motion.main
                className={`main-content ${!sidebarOpen ? 'mini-sidebar' : ''}`}
                animate={{
                    marginLeft: (window.innerWidth <= 1024) ? 0 : (sidebarOpen ? 280 : 80)
                }}
                transition={{ type: 'spring', damping: 30, stiffness: 200, mass: 0.8 }}
            >
                {/* Mobile Hamburger (only shows on mobile when sidebar is closed) */}
                {(window.innerWidth <= 1024 && !sidebarOpen) && (
                    <motion.div
                        className="menu-toggle"
                        onClick={() => setSidebarOpen(true)}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <Menu size={24} />
                    </motion.div>
                )}

                <AnimatePresence mode="wait">
                    {activeTab === 'Dashboard' ? (
                        <motion.div
                            key="dashboard"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            exit={{ opacity: 0, y: -20 }}
                        >
                            {/* Header section */}
                            <motion.section className="hero-card" variants={itemVariants}>
                                <div className="hero-info">
                                    <motion.h1
                                        initial={{ opacity: 0, x: -30 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                    >
                                        Welcome, <span className="gold-glow-text">{user?.name || 'Dhanik User'}</span>
                                    </motion.h1>
                                    <p>Start your journey with Dhanik Tokenomics and earn consistent rewards.</p>

                                    <div className="wallet-actions">
                                        <button
                                            className={`btn-primary shimmer-btn wallet-btn ${isWalletConnected ? 'connected' : ''}`}
                                            onClick={handleConnectWallet}
                                        >
                                            <Wallet size={18} />
                                            {isWalletConnected ? '✓ Wallet Connected' : 'Connect Wallet'}
                                        </button>
                                        {isWalletConnected && (
                                            <button className="btn-outline disconnect-btn" onClick={handleDisconnect}>Disconnect</button>
                                        )}
                                    </div>

                                    <div style={{ marginTop: '20px', position: 'relative', width: '300px' }}>
                                        <p style={{ fontSize: '0.8rem', color: '#9CA3AF', marginBottom: '8px' }}>Your Referral Link</p>
                                        <div style={{
                                            display: 'flex',
                                            background: 'rgba(255,255,255,0.05)',
                                            padding: '10px',
                                            borderRadius: '10px',
                                            border: '1px solid var(--card-border)'
                                        }}>
                                            <input
                                                type="text"
                                                readOnly
                                                value={`dhanki.io/ref/${user?.referralId || '----'}`}
                                                style={{
                                                    background: 'transparent',
                                                    border: 'none',
                                                    color: 'white',
                                                    width: '100%',
                                                    outline: 'none',
                                                    fontSize: '0.85rem'
                                                }}
                                            />
                                            <Copy size={18} className="gold-glow-text" style={{ cursor: 'pointer' }} onClick={() => navigator.clipboard.writeText(`dhanki.io/ref/${user?.referralId}`)} />
                                        </div>
                                    </div>
                                </div>

                                <div className="hero-balance">
                                    <div className="wallet-balance-card">
                                        <p style={{ color: '#9CA3AF', fontSize: '0.9rem', marginBottom: '8px' }}>Total USDT Balance</p>
                                        <span className="balance-amount gold-glow-text">$ {user?.wallet?.balance || '0.00'}</span>
                                        <div style={{ display: 'flex', gap: '10px', marginTop: '15px', justifyContent: 'flex-end' }}>
                                            <button
                                                className="btn-primary shimmer-btn"
                                                style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                                                onClick={handleConnectWallet}
                                            >
                                                {isWalletConnected ? 'Wallet Active' : 'Connect Wallet'}
                                            </button>
                                            <button
                                                className="btn-outline"
                                                style={{ padding: '8px 12px', borderColor: 'var(--card-border)', color: 'white' }}
                                                onClick={() => {
                                                    if (isWalletConnected) {
                                                        navigator.clipboard.writeText(walletAddress);
                                                        alert('Wallet address copied!');
                                                    } else {
                                                        handleConnectWallet();
                                                    }
                                                }}
                                            >
                                                <Copy size={16} />
                                            </button>
                                        </div>
                                        {isWalletConnected && (
                                            <div style={{ marginTop: '10px' }}>
                                                <code style={{ fontSize: '0.65rem', color: '#00E5FF', opacity: 0.8, background: 'rgba(0,229,255,0.05)', padding: '4px 8px', borderRadius: '4px', display: 'inline-block' }}>
                                                    {walletAddress}
                                                </code>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.section>

                            {/* Token Overview Cards */}
                            <div className="overview-grid">
                                {[
                                    { label: 'Dhanik Token Balance', value: `${user?.wallet?.dhanki || 0} DHANKI`, icon: <Coins />, subValue: `≈ $${((user?.wallet?.dhanki || 0) * 0.01).toFixed(2)}`, path: '/buy-token' },
                                    { label: 'Registration Date', value: new Date(user?.createdAt).toLocaleDateString(), icon: <TrendingUp />, subValue: 'Active Member', path: '/profile' },
                                    { label: 'User Status', value: user?.status || 'Active', icon: <Globe />, subValue: 'Verified Account', path: '/profile' }
                                ].map((stat, index) => (
                                    <motion.div
                                        key={index}
                                        className="stat-card"
                                        variants={itemVariants}
                                        whileHover={{ y: -10, rotate: index % 2 === 0 ? 1 : -1 }}
                                        onClick={() => navigate(stat.path)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div className="stat-icon">{stat.icon}</div>
                                        <p style={{ color: '#9CA3AF', fontSize: '0.9rem' }}>{stat.label}</p>
                                        <h3 style={{ fontSize: '1.8rem', margin: '10px 0' }} className="gold-glow-text">{stat.value}</h3>
                                        <p style={{ color: '#00E5FF', fontSize: '0.85rem' }}>{stat.subValue}</p>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="dashboard-grid">
                                {/* Income Breakdown */}
                                <motion.div className="income-section" variants={itemVariants}>
                                    <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Income Breakdown</h2>
                                    <div className="income-grid">
                                        {[
                                            { label: 'Level 1 Income', value: `$${(user?.income?.level1 || 0).toFixed(2)}`, trend: 'Direct' },
                                            { label: 'Level 2 Income', value: `$${(user?.income?.level2 || 0).toFixed(2)}`, trend: 'Indirect' },
                                            { label: 'Level 3 Income', value: `$${(user?.income?.level3 || 0).toFixed(2)}`, trend: 'Indirect' },
                                            { label: 'Total Earnings', value: `$${(user?.income?.total || 0).toFixed(2)}`, trend: 'All Time' }
                                        ].map((item, idx) => (
                                            <motion.div
                                                key={idx}
                                                className="income-card"
                                                whileHover={{ scale: 1.05 }}
                                                onClick={() => navigate('/level-income')}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <p style={{ color: '#9CA3AF', marginBottom: '10px' }}>{item.label}</p>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                                    <h3 style={{ fontSize: '1.5rem' }}>{item.value}</h3>
                                                    <span style={{ color: '#00E5FF', fontSize: '0.8rem' }}>{item.trend}</span>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>

                                {/* Mining Center */}
                                <motion.div className="mining-card" variants={itemVariants}>
                                    <div className="mining-header">
                                        <h3>Staking Rewards</h3>
                                        <div className="status-badge">
                                            <span className="pulse-dot"></span>
                                            Active
                                        </div>
                                    </div>

                                    <div style={{ textAlign: 'center', position: 'relative', margin: '2rem 0' }}>
                                        <svg width="150" height="150" viewBox="0 0 100 100">
                                            <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                                            <motion.circle
                                                cx="50" cy="50" r="45" fill="none" stroke="url(#goldGradient)" strokeWidth="8"
                                                strokeDasharray="283"
                                                initial={{ strokeDashoffset: 283 }}
                                                animate={{ strokeDashoffset: 283 - (283 * 0.998) }}
                                                transition={{ duration: 1.5, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
                                                strokeLinecap="round"
                                            />
                                            <defs>
                                                <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                    <stop offset="0%" stopColor="#FFD200" />
                                                    <stop offset="100%" stopColor="#FFAE00" />
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                                            <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>99.8%</span>
                                            <p style={{ fontSize: '0.6rem', color: '#9CA3AF' }}>UPTIME</p>
                                        </div>
                                    </div>

                                    <div className="mining-details">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', margin: '15px 0' }}>
                                            <span style={{ color: '#9CA3AF' }}>Commission Share</span>
                                            <span style={{ fontWeight: 'bold' }}>8% Total</span>
                                        </div>
                                        <div className="progress-container">
                                            <div className="progress-bar-bg">
                                                <motion.div
                                                    className="progress-bar-fill"
                                                    initial={{ width: '0%' }}
                                                    animate={{ width: '8%' }}
                                                    transition={{ duration: 1.5, delay: 0.5 }}
                                                ></motion.div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                                            <span style={{ color: '#9CA3AF' }}>Max MLM Income</span>
                                            <span className="gold-glow-text" style={{ fontWeight: 'bold' }}>8% Max</span>
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '2rem' }}>
                                            <button
                                                className="btn-primary shimmer-btn claim-rewards-btn"
                                                style={{ width: '100%' }}
                                                onClick={() => navigate('/level-income')}
                                            >
                                                <ArrowUpRight size={18} />
                                                Claim Rewards
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Referral Program */}
                            <motion.section className="referral-section" variants={itemVariants}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <h2>Referral Structure (3-Levels)</h2>
                                    <button
                                        className="btn-primary shimmer-btn manage-team-btn"
                                        style={{ padding: '10px 20px', fontSize: '0.82rem', gap: '6px' }}
                                        onClick={() => navigate('/referral')}
                                    >
                                        <Users size={15} />
                                        Manage Team
                                    </button>
                                </div>

                                <div className="referral-stats">
                                    {[
                                        { label: 'Referral ID', value: user?.referralId || '----', icon: <User /> },
                                        { label: 'Direct Sponsor', value: user?.referredBy || 'System', icon: <ShieldCheck /> },
                                        { label: 'Direct Team (L1)', value: `${user?.referrals?.level1?.length || 0} Active`, icon: <Users /> },
                                        { label: 'L1 Income (5%)', value: `$${(user?.income?.level1 || 0).toFixed(2)}`, icon: <BarChart3 /> },
                                        { label: 'L2 Income (2%)', value: `$${(user?.income?.level2 || 0).toFixed(2)}`, icon: <Activity /> },
                                        { label: 'L3 Income (1%)', value: `$${(user?.income?.level3 || 0).toFixed(2)}`, icon: <TrendingUp /> }
                                    ].map((stat, idx) => (
                                        <div
                                            key={idx}
                                            className="ref-stat-item"
                                            onClick={() => navigate('/referral')}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <div style={{
                                                width: '35px', height: '35px',
                                                borderRadius: '50%',
                                                background: 'rgba(245, 197, 24, 0.1)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                margin: '0 auto 10px',
                                                color: '#F5C518'
                                            }}>
                                                {stat.icon}
                                            </div>
                                            <p style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>{stat.label}</p>
                                            <p style={{ fontWeight: 'bold', fontSize: '1rem' }}>{stat.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </motion.section>
                        </motion.div>
                    ) : activeTab === 'Buy Token' ? (
                        <motion.div key="buy" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <BuyToken />
                        </motion.div>
                    ) : activeTab === 'Referral' ? (
                        <motion.div key="referral" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <ReferralNetwork />
                        </motion.div>
                    ) : activeTab === 'Level Income' ? (
                        <motion.div key="income" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <LevelIncome />
                        </motion.div>
                    ) : activeTab === 'Profile' ? (
                        <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <Profile />
                        </motion.div>
                    ) : activeTab === 'Support' ? (
                        <motion.div key="support" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <Support />
                        </motion.div>
                    ) : (
                        <div style={{ padding: '2rem' }}>Page Not Found</div>
                    )}
                </AnimatePresence>
            </motion.main>

            {/* Overlay for mobile sidebar */}
            <AnimatePresence>
                {sidebarOpen && window.innerWidth <= 1024 && (
                    <motion.div
                        className="sidebar-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSidebarOpen(false)}
                    />
                )}
            </AnimatePresence>

            <style>{`
        .pulse-dot {
          width: 8px;
          height: 8px;
          background: #00E5FF;
          border-radius: 50%;
          display: inline-block;
          margin-right: 8px;
          box-shadow: 0 0 10px #00E5FF;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(0, 229, 255, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(0, 229, 255, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(0, 229, 255, 0); }
        }
      `}</style>
        </div >
    );
};

export default Dashboard;
