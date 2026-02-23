import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    User,
    Mail,
    Briefcase,
    DollarSign,
    IdCard,
    Search,
    ChevronRight,
    Activity,
    Layers,
    TrendingUp,
    ExternalLink,
    Filter,
    ArrowUpRight,
    Star,
    Award,
    AlertCircle
} from 'lucide-react';
import './ReferralNetwork.css';
import API_BASE_URL from '../apiConfig';
import { useNavigate } from 'react-router-dom';

const ReferralNetwork = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLevel, setSelectedLevel] = useState('All');
    const [viewMode, setViewMode] = useState('table');
    const [network, setNetwork] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchNetwork = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                const response = await fetch('${API_BASE_URL}/api/referral/network', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    setNetwork(data);
                } else {
                    setError('Failed to load network');
                }
            } catch (err) {
                setError('Could not connect to server');
            } finally {
                setLoading(false);
            }
        };

        fetchNetwork();
    }, [navigate]);

    const levels = useMemo(() => {
        if (!network || !network.summary || !network.levelStats) return [];
        try {
            return [
                {
                    level: 1,
                    members: network.summary.l1Count || 0,
                    business: (network.levelStats.l1?.business || 0).toFixed(2),
                    income: (network.levelStats.l1?.income || 0).toFixed(2),
                    percentage: 5,
                    color: '#FFD200',
                    performance: network.summary.l1Count > 0 ? 100 : 0
                },
                {
                    level: 2,
                    members: network.summary.l2Count || 0,
                    business: (network.levelStats.l2?.business || 0).toFixed(2),
                    income: (network.levelStats.l2?.income || 0).toFixed(2),
                    percentage: 2,
                    color: '#00E5FF',
                    performance: network.summary.l2Count > 0 ? 100 : 0
                },
                {
                    level: 3,
                    members: network.summary.l3Count || 0,
                    business: (network.levelStats.l3?.business || 0).toFixed(2),
                    income: (network.levelStats.l3?.income || 0).toFixed(2),
                    percentage: 1,
                    color: '#8B5CF6',
                    performance: network.summary.l3Count > 0 ? 100 : 0
                },
            ];
        } catch (err) {
            console.error('Levels calculation error:', err);
            return [];
        }
    }, [network]);

    const teamMembers = useMemo(() => {
        if (!network) return [];
        const flattened = [];

        if (network.level1) network.level1.forEach(m => flattened.push({ ...m, level: 1 }));
        if (network.level2) network.level2.forEach(m => flattened.push({ ...m, level: 2 }));
        if (network.level3) network.level3.forEach(m => flattened.push({ ...m, level: 3 }));

        return flattened.map(m => ({
            id: m._id,
            name: m.name || 'Unknown',
            email: m.email || 'N/A',
            address: m.referralId || 'N/A',
            level: m.level,
            joinDate: m.createdAt ? new Date(m.createdAt).toLocaleDateString() : 'N/A',
            investment: `$${(m.totalInvestment || 0).toLocaleString()}`,
            income: `${(m.income?.total || 0).toLocaleString()} DHANKI`,
            status: m.status || 'Active',
            rank: 'Starter'
        }));
    }, [network]);

    const filteredMembers = useMemo(() => {
        return teamMembers.filter(m => {
            const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                m.address.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesLevel = selectedLevel === 'All' || m.level === parseInt(selectedLevel);
            return matchesSearch && matchesLevel;
        });
    }, [searchTerm, selectedLevel, teamMembers]);

    const [user, setUser] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('user') || '{}');
        } catch (e) {
            return {};
        }
    });

    const activeLevelsCount = levels.filter(l => l.members > 0).length;

    if (loading) return (
        <div className="loading-state" style={{ padding: '100px', textAlign: 'center', color: 'white' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} style={{ marginBottom: '20px' }}>
                <Activity size={48} color="#FFD200" />
            </motion.div>
            <h3>Loading Your Network...</h3>
        </div>
    );

    if (error) return (
        <div className="error-state" style={{ padding: '100px', textAlign: 'center', color: 'white' }}>
            <AlertCircle size={48} color="#FF4D4D" style={{ marginBottom: '20px' }} />
            <h3 style={{ color: '#FF4D4D' }}>{error}</h3>
            <button
                onClick={() => window.location.reload()}
                className="btn-primary shimmer-btn"
                style={{ marginTop: '20px', padding: '10px 30px' }}
            >
                Try Again
            </button>
        </div>
    );

    return (
        <div className="referral-network-container">
            <motion.div
                className="network-header-prime"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
                <div className="header-content">
                    <h1>Referral <span className="gold-glow-text">Network</span></h1>
                    <p>Track your team growth, monitor multi-level performance, and skyrocket your earnings.</p>
                </div>
                <div className="quick-network-stats">
                    <div className="q-stat">
                        <span className="q-label">Active Levels</span>
                        <span className="q-value">{activeLevelsCount}/3</span>
                    </div>
                    <div className="q-divider"></div>
                    <div className="q-stat">
                        <span className="q-label">Total Team</span>
                        <span className="q-value">{network?.summary?.totalTeam || 0}</span>
                    </div>
                </div>
            </motion.div>

            {/* User Profile Card */}
            <motion.div
                className="user-network-card"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
                <div className="user-profile-header">
                    <div className="avatar-wrapper">
                        <div className="avatar-main">{user?.name?.[0]}</div>
                        <div className="rank-badge"><Star size={12} fill="currentColor" /> Starter</div>
                    </div>
                    <div className="user-primary-info">
                        <h3>{user?.name}</h3>
                        <p>ID: {user?.referralId} <span className="dot-sep">•</span> {user?.email}</p>
                    </div>
                    <div className="network-total-income">
                        <span className="label">Total Level Income</span>
                        <span className="value gold-glow-text">{(network?.summary?.totalLevelIncome || 0).toLocaleString()} DHANKI</span>
                    </div>
                </div>

                <div className="profile-stats-grid-prime">
                    <div className="p-stat-card-prime">
                        <div className="icon" style={{ background: 'rgba(255, 210, 0, 0.1)', color: '#FFD200' }}><IdCard size={20} /></div>
                        <div className="info">
                            <label>Sponsor ID</label>
                            <p>{user?.referredBy || 'System'}</p>
                        </div>
                    </div>
                    <div className="p-stat-card-prime">
                        <div className="icon" style={{ background: 'rgba(0, 229, 255, 0.1)', color: '#00E5FF' }}><Users size={20} /></div>
                        <div className="info">
                            <label>Direct Members</label>
                            <p>{network?.summary?.l1Count || 0} Active</p>
                        </div>
                    </div>
                    <div className="p-stat-card-prime">
                        <div className="icon" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8B5CF6' }}><Briefcase size={20} /></div>
                        <div className="info">
                            <label>Total Business</label>
                            <p>${(network?.summary?.totalBusiness || 0).toFixed(2)}</p>
                        </div>
                    </div>
                    <div className="p-stat-card-prime">
                        <div className="icon" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}><TrendingUp size={20} /></div>
                        <div className="info">
                            <label>Network Growth</label>
                            <p>+0.0%</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Levels Breakdown */}
            <div className="level-breakdown-section">
                <div className="section-header">
                    <div className="title-area">
                        <h2>Level <span className="gold-glow-text">Performance</span></h2>
                        <p>Detailed performance analytics across all 10 levels</p>
                    </div>
                </div>

                <div className="levels-scroller">
                    {levels.map((lvl, idx) => (
                        <motion.div
                            key={lvl.level}
                            className={`level-stat-card ${selectedLevel === lvl.level ? 'active' : ''} ${lvl.members === 0 ? 'empty' : ''}`}
                            onClick={() => setSelectedLevel(selectedLevel === lvl.level ? 'All' : lvl.level)}
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.8, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                            whileHover={{ y: -5 }}
                        >
                            <div className="level-indicator" style={{ background: lvl.color }}>
                                L{lvl.level}
                            </div>
                            <div className="level-main-info">
                                <h3>{lvl.members} <span className="unit">Members</span></h3>
                                <p className="business">Vol: {lvl.business}</p>
                            </div>
                            <div className="level-income-mini">
                                <span className="pct">{lvl.percentage}%</span>
                                <span className="val">{parseFloat(lvl.income).toLocaleString()} DHANKI</span>
                            </div>
                            <div className="perf-mini-bar">
                                <div className="bar-fill" style={{ width: `${lvl.performance}%`, background: lvl.color }}></div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Team Management */}
            <div className="team-management-section">
                <div className="section-header-flex">
                    <div className="title-area">
                        <h2>Team <span className="gold-glow-text">Management</span></h2>
                        <p>Browse and manage your {selectedLevel === 'All' ? 'entire' : `Level ${selectedLevel}`} network</p>
                    </div>
                    <div className="controls">
                        <div className="search-box-prime">
                            <Search size={18} />
                            <input
                                type="text"
                                placeholder="Search by name, wallet..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="filter-dropdown-prime">
                            <Filter size={18} />
                            <select value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)}>
                                <option value="All">All Levels</option>
                                {[1, 2, 3].map(l => (
                                    <option key={l} value={l}>Level {l}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <motion.div
                    className="team-list-card-prime"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.0, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                    <div className="table-wrapper">
                        <table className="team-premium-table">
                            <thead>
                                <tr>
                                    <th>Member Details</th>
                                    <th>Level</th>
                                    <th>Rank</th>
                                    <th>Join Date</th>
                                    <th>Investment</th>
                                    <th>Earnings</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence mode="popLayout">
                                    {filteredMembers.map((member, idx) => (
                                        <motion.tr
                                            key={member.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 10 }}
                                            transition={{ delay: idx * 0.05 }}
                                        >
                                            <td>
                                                <div className="member-cell">
                                                    <div className="avatar-small">{member.name.charAt(0)}</div>
                                                    <div className="info">
                                                        <h5>{member.name}</h5>
                                                        <code>{member.address}</code>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`level-tag l${member.level}`}>Level {member.level}</span>
                                            </td>
                                            <td>
                                                <div className="rank-td">
                                                    <Award size={14} />
                                                    {member.rank}
                                                </div>
                                            </td>
                                            <td className="date-td">{member.joinDate}</td>
                                            <td className="invest-td">{member.investment}</td>
                                            <td>
                                                <div className="earn-td">
                                                    <span className="val">{member.income}</span>
                                                    <span className="type">Income</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`status-tag ${member.status.toLowerCase()}`}>
                                                    {member.status}
                                                </span>
                                            </td>
                                            <td>
                                                <button className="view-more-btn">
                                                    <ArrowUpRight size={16} />
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>

                        {filteredMembers.length === 0 && (
                            <div className="empty-team-state">
                                <Users size={48} className="empty-icon" />
                                <h3>No Team Members Found</h3>
                                <p>Try adjusting your search or filters to find what you're looking for.</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ReferralNetwork;
