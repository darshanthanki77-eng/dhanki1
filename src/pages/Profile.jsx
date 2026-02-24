import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User,
    Mail,
    Phone,
    Calendar,
    Copy,
    ShieldCheck,
    Wallet,
    X,
    KeyRound,
    Award,
    ChevronRight,
    Camera,
    CheckCircle2,
    Clock,
    Users,
    Coins
} from 'lucide-react';
import './Profile.css';
import API_BASE_URL from '../apiConfig';

const Profile = () => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [copied, setCopied] = useState(false);

    // Form States
    const [formData, setFormData] = useState({
        name: user?.name || '',
        walletAddress: user?.walletAddress || ''
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [loading, setLoading] = useState(false);
    const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/profile`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setUser(data);
                setFormData({ name: data.name, walletAddress: data.walletAddress });
                localStorage.setItem('user', JSON.stringify(data));
            }
        } catch (error) {
            console.error('Fetch profile error:', error);
        }
    };

    const handleProfileUpdate = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        setStatusMsg({ type: '', text: '' });

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (response.ok) {
                setUser(data);
                localStorage.setItem('user', JSON.stringify(data));
                setIsEditing(false);
                setStatusMsg({ type: 'success', text: 'Profile updated successfully!' });
            } else {
                setStatusMsg({ type: 'error', text: data.message || 'Update failed' });
            }
        } catch (error) {
            setStatusMsg({ type: 'error', text: 'Server connection error' });
        } finally {
            setLoading(false);
            setTimeout(() => setStatusMsg({ type: '', text: '' }), 3000);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            return setStatusMsg({ type: 'error', text: 'Passwords do not match' });
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    password: passwordData.newPassword
                })
            });

            const data = await response.json();
            if (response.ok) {
                setShowPasswordModal(false);
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                alert('Password updated successfully!');
            } else {
                alert(data.message || 'Password update failed');
            }
        } catch (error) {
            alert('Server error');
        } finally {
            setLoading(false);
        }
    };

    const copyReferralLink = () => {
        const link = `${window.location.origin}/register?ref=${user?.referralId}`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const userStats = [
        { label: 'Token Earnings', value: `${(user?.income?.total || 0).toLocaleString()} DHANKI`, icon: <Coins size={18} />, color: '#FFD200' },
        { label: 'Direct Team', value: `${user?.referrals?.level1?.length || 0} Users`, icon: <Users size={18} />, color: '#00E5FF' },
        { label: 'Platform Rank', value: 'Starter', icon: <Award size={18} />, color: '#8B5CF6' },
        { label: 'Account Status', value: user?.status || 'Active', icon: <ShieldCheck size={18} />, color: '#00E676' },
    ];

    return (
        <div className="profile-container">
            {statusMsg.text && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`status-toast ${statusMsg.type}`}
                >
                    {statusMsg.text}
                </motion.div>
            )}

            <motion.div
                className="profile-header-prime"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
                <div>
                    <h1>My <span className="gold-glow-text">Profile</span></h1>
                    <p>Manage your account settings, personal information, and security preferences.</p>
                </div>
                <div className="account-status-tag">
                    <ShieldCheck size={16} />
                    {user?.kycStatus === 'Verified' ? 'Verified Member' : 'Account Active'}
                </div>
            </motion.div>

            <div className="profile-main-grid">
                <motion.div
                    className="profile-side-card"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                >
                    <div className="avatar-section-prime">
                        <div className="avatar-container">
                            <div className="avatar-img-placeholder">{user?.name?.[0]}</div>
                            <button className="change-avatar-btn"><Camera size={14} /></button>
                        </div>
                        <h2>{user?.name}</h2>
                        <span className="user-role-badge">Investor</span>
                    </div>

                    <div className="side-stats-list">
                        {userStats.map((stat, idx) => (
                            <div key={idx} className="side-stat-item">
                                <div className="icon-box" style={{ background: `${stat.color}15`, color: stat.color }}>
                                    {stat.icon}
                                </div>
                                <div className="info">
                                    <span className="label">{stat.label}</span>
                                    <span className="value">{stat.value}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="wallet-overview-mini">
                        <div className="mini-header">
                            <Wallet size={16} />
                            <span>Linked Wallet</span>
                        </div>
                        {isEditing ? (
                            <input
                                className="prime-input-small"
                                value={formData.walletAddress}
                                onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
                                placeholder="0x..."
                            />
                        ) : (
                            <p className="wallet-addr">{user?.walletAddress || 'No Wallet Linked'}</p>
                        )}
                        <button className="btn-outline-small" onClick={() => setIsEditing(!isEditing)}>
                            {isEditing ? 'Cancel' : 'Change Wallet'}
                        </button>
                    </div>
                </motion.div>

                <div className="profile-details-column">
                    <motion.div
                        className="details-card-prime"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <div className="card-header-flex">
                            <h3 className="section-title">Personal Information</h3>
                            <button
                                className={`edit-all-btn ${isEditing ? 'saving' : ''}`}
                                onClick={isEditing ? handleProfileUpdate : () => setIsEditing(true)}
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Edit Details'}
                            </button>
                        </div>

                        <div className="personal-info-grid-prime">
                            <div className="info-box-prime">
                                <div className="info-label"><User size={16} /><span>Full Name</span></div>
                                {isEditing ? (
                                    <input
                                        className="prime-input-inline"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                ) : (
                                    <p className="info-value">{user?.name || '---'}</p>
                                )}
                            </div>
                            <div className="info-box-prime">
                                <div className="info-label"><Mail size={16} /><span>Email Address</span></div>
                                <p className="info-value">{user?.email || '---'}</p>
                            </div>
                            <div className="info-box-prime">
                                <div className="info-label"><Award size={16} /><span>Referral ID</span></div>
                                <p className="info-value">{user?.referralId || '---'}</p>
                            </div>
                            <div className="info-box-prime">
                                <div className="info-label"><Calendar size={16} /><span>Member Since</span></div>
                                <p className="info-value">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '---'}</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        className="referral-prime-box"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <div className="ref-info">
                            <h3 className="gold-glow-text">Referral Program</h3>
                            <p>Invite your friends and earn up to 8% commission on their token purchases.</p>
                        </div>
                        <div className="ref-link-copy-box">
                            <div className="link-text">{`${window.location.origin}/register?ref=${user?.referralId}`}</div>
                            <button className="btn-primary shimmer-btn" onClick={copyReferralLink}>
                                {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                                {copied ? 'Copied' : 'Copy'}
                            </button>
                        </div>
                    </motion.div>

                    <div className="security-settings-row">
                        <motion.div
                            className="security-card-prime"
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 1.0, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <div className="security-icon-bg" style={{ background: 'rgba(255, 210, 0, 0.1)', color: '#FFD200' }}>
                                <KeyRound size={24} />
                            </div>
                            <h3>Password Settings</h3>
                            <p>Update your account password</p>
                            <button className="btn-outline-prime" onClick={() => setShowPasswordModal(true)}>Change Password</button>
                        </motion.div>

                        <motion.div
                            className="security-card-prime"
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 1.0, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <div className="security-icon-bg" style={{ background: 'rgba(0, 229, 255, 0.1)', color: '#00E5FF' }}>
                                <ShieldCheck size={24} />
                            </div>
                            <h3>Two-Factor Authentication</h3>
                            <p>Enhance your account security</p>
                            <button className="btn-outline-prime">Enable 2FA</button>
                        </motion.div>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {showPasswordModal && (
                    <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
                        <motion.div
                            className="modal-content-prime"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <h2>Change Password</h2>
                                <button className="close-btn" onClick={() => setShowPasswordModal(false)}><X size={20} /></button>
                            </div>

                            <form className="password-form" onSubmit={handlePasswordChange}>
                                <div className="input-group-prime">
                                    <label>Current Password</label>
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        className="prime-input"
                                        required
                                        value={passwordData.currentPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                    />
                                </div>
                                <div className="input-group-prime">
                                    <label>New Password</label>
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        className="prime-input"
                                        required
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    />
                                </div>
                                <div className="input-group-prime">
                                    <label>Confirm New Password</label>
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        className="prime-input"
                                        required
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    />
                                </div>

                                <div className="modal-actions">
                                    <button
                                        type="submit"
                                        className="btn-primary shimmer-btn"
                                        style={{ flex: 1 }}
                                        disabled={loading}
                                    >
                                        {loading ? 'Changing...' : 'Update Password'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Profile;
