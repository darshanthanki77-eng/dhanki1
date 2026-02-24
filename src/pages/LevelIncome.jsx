import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart3,
    TrendingUp,
    Users,
    DollarSign,
    ArrowUpRight,
    Search,
    Filter,
    Activity,
    AlertCircle
} from 'lucide-react';
import './LevelIncome.css';
import API_BASE_URL from '../apiConfig';

const LevelIncome = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [network, setNetwork] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const [networkRes, historyRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/api/referral/network`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }),
                    fetch(`${API_BASE_URL}/api/referral/income-history`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    })
                ]);

                if (networkRes.ok && historyRes.ok) {
                    const networkData = await networkRes.json();
                    const historyData = await historyRes.json();
                    setNetwork(networkData);
                    setHistory(historyData);
                } else {
                    setError('Failed to fetch income data');
                }
            } catch (err) {
                setError('Could not connect to server');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const incomeStats = useMemo(() => {
        if (!network) return [
            { label: 'Level 1 Income', value: '0 DHANKI', pct: '5%', color: '#FFD200', count: 0 },
            { label: 'Level 2 Income', value: '0 DHANKI', pct: '2%', color: '#00E5FF', count: 0 },
            { label: 'Level 3 Income', value: '0 DHANKI', pct: '1%', color: '#8B5CF6', count: 0 },
        ];

        return [
            {
                label: 'Level 1 Income',
                value: `${(network.levelStats?.l1?.income || 0).toLocaleString()} DHANKI`,
                pct: '5%',
                color: '#FFD200',
                count: network.summary?.l1Count || 0
            },
            {
                label: 'Level 2 Income',
                value: `${(network.levelStats?.l2?.income || 0).toLocaleString()} DHANKI`,
                pct: '2%',
                color: '#00E5FF',
                count: network.summary?.l2Count || 0
            },
            {
                label: 'Level 3 Income',
                value: `${(network.levelStats?.l3?.income || 0).toLocaleString()} DHANKI`,
                pct: '1%',
                color: '#8B5CF6',
                count: network.summary?.l3Count || 0
            },
        ];
    }, [network]);

    const filteredHistory = useMemo(() => {
        return history.filter(item => {
            const searchStr = searchTerm.toLowerCase();
            return (
                item._id?.toLowerCase().includes(searchStr) ||
                item.fromUser?.name?.toLowerCase().includes(searchStr) ||
                item.fromUser?.referralId?.toLowerCase().includes(searchStr)
            );
        });
    }, [searchTerm, history]);

    if (loading) return (
        <div className="loading-state" style={{ padding: '100px', textAlign: 'center', color: 'white' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} style={{ marginBottom: '20px' }}>
                <Activity size={48} color="#FFD200" />
            </motion.div>
            <h3>Analyzing Your Earnings...</h3>
        </div>
    );

    if (error) return (
        <div className="error-state" style={{ padding: '100px', textAlign: 'center', color: 'white' }}>
            <AlertCircle size={48} color="#FF4D4D" style={{ marginBottom: '20px' }} />
            <h3 style={{ color: '#FF4D4D' }}>{error}</h3>
            <button onClick={() => window.location.reload()} className="btn-primary shimmer-btn" style={{ marginTop: '20px', padding: '10px 30px' }}>
                Try Again
            </button>
        </div>
    );

    return (
        <div className="level-income-container">
            <motion.div
                className="page-header"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
                <div>
                    <h1>Level <span className="gold-glow-text">Income</span></h1>
                    <p>Track your referral commissions across the 3-level structure.</p>
                </div>
                <div className="total-earnings-badge">
                    <TrendingUp size={16} />
                    <span>Total: {(network?.summary?.totalLevelIncome || 0).toLocaleString()} DHANKI</span>
                </div>
            </motion.div>

            <div className="income-stats-grid">
                {incomeStats.map((stat, idx) => (
                    <motion.div
                        key={idx}
                        className="income-stat-card"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: idx * 0.15, ease: [0.16, 1, 0.3, 1] }}
                        whileHover={{ y: -5 }}
                    >
                        <div className="stat-header">
                            <span className="level-label" style={{ color: stat.color }}>{stat.label}</span>
                            <span className="pct-badge" style={{ background: `${stat.color}15`, color: stat.color }}>{stat.pct}</span>
                        </div>
                        <h2 className="stat-value">{stat.value}</h2>
                        <div className="stat-footer">
                            <Users size={14} />
                            <span>{stat.count} Members contributing</span>
                        </div>
                        <div className="stat-progress-bg">
                            <div className="stat-progress-fill" style={{ background: stat.color, width: stat.count > 0 ? '100%' : '10%' }}></div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="income-history-section">
                <div className="section-header-flex">
                    <div className="title-area">
                        <h2>Commission <span className="gold-glow-text">History</span></h2>
                        <p>Detailed log of all level commissions earned</p>
                    </div>
                    <div className="controls">
                        <div className="search-box-prime">
                            <Search size={18} />
                            <input
                                type="text"
                                placeholder="Search by name or ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button className="filter-btn"><Filter size={18} /></button>
                    </div>
                </div>

                <motion.div
                    className="history-table-card"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                    <div className="table-responsive">
                        <table className="premium-table">
                            <thead>
                                <tr>
                                    <th>Ref. User</th>
                                    <th>Level</th>
                                    <th>Comm. (%)</th>
                                    <th>Earnings</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredHistory.map((item, idx) => (
                                    <tr key={item._id || idx}>
                                        <td>
                                            <div className="user-info">
                                                <div className="avatar-mini">{(item.fromUser?.name || 'U')[0]}</div>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span style={{ fontWeight: 600 }}>{item.fromUser?.name || 'Deleted User'}</span>
                                                    <code style={{ fontSize: '0.7rem', opacity: 0.6 }}>{item.fromUser?.referralId}</code>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`level-tag l${item.level}`}>Level {item.level}</span>
                                        </td>
                                        <td style={{ color: 'var(--text-secondary)' }}>
                                            {item.level === 1 ? '5%' : item.level === 2 ? '2%' : '1%'}
                                        </td>
                                        <td className="comm-amt">
                                            <div className="amt-flex" style={{ color: '#00E5FF' }}>
                                                <ArrowUpRight size={14} />
                                                {item.amount.toLocaleString()} DHANKI
                                            </div>
                                        </td>
                                        <td className="date-cell">{new Date(item.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <span className={`status-pill ${item.status.toLowerCase()}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {filteredHistory.length === 0 && (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                                            No commission history found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default LevelIncome;
