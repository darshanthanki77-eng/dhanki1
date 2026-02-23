import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Zap, User, ArrowRight, ShieldCheck, Users } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import API_BASE_URL from '../apiConfig';
import './Auth.css';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        referralCode: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            return setError('Passwords do not match');
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    referralCode: formData.referralCode
                }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data));

                // Redirect based on isAdmin field (1 = Admin, 0 = User)
                if (data.isAdmin === 1) {
                    navigate('/dhanki-admin');
                } else {
                    navigate('/dashboard');
                }
            } else {
                setError(data.message || 'Registration failed');
            }
        } catch (err) {
            setError('Could not connect to server');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-wrapper" style={{ padding: '4rem 1rem' }}>
            <motion.div
                className="auth-card"
                initial={{ opacity: 0, y: 30, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
                <div className="auth-header">
                    <div className="auth-logo">
                        <div className="auth-logo-icon">
                            <Zap size={24} fill="#05090C" />
                        </div>
                        <span className="auth-logo-text gold-glow-text">DHANIK</span>
                    </div>
                    <p>Create your account and start your financial journey.</p>
                </div>

                <form onSubmit={handleRegister}>
                    {error && (
                        <div style={{ color: 'var(--admin-danger)', background: 'rgba(255, 77, 77, 0.1)', padding: '12px', borderRadius: '10px', marginBottom: '20px', fontSize: '0.9rem', border: '1px solid rgba(255, 77, 77, 0.2)' }}>
                            {error}
                        </div>
                    )}

                    <div className="auth-form-group">
                        <label>Full Name</label>
                        <div className="auth-input-wrapper">
                            <input
                                type="text"
                                className="auth-input"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                            <User className="auth-input-icon" size={18} />
                        </div>
                    </div>

                    <div className="auth-form-group">
                        <label>Email Address</label>
                        <div className="auth-input-wrapper">
                            <input
                                type="email"
                                className="auth-input"
                                placeholder="your@email.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                            <Mail className="auth-input-icon" size={18} />
                        </div>
                    </div>

                    <div className="auth-form-group">
                        <label>Password</label>
                        <div className="auth-input-wrapper">
                            <input
                                type="password"
                                className="auth-input"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                            <Lock className="auth-input-icon" size={18} />
                        </div>
                    </div>

                    <div className="auth-form-group">
                        <label>Confirm Password</label>
                        <div className="auth-input-wrapper">
                            <input
                                type="password"
                                className="auth-input"
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                required
                            />
                            <ShieldCheck className="auth-input-icon" size={18} />
                        </div>
                    </div>

                    <div className="auth-form-group">
                        <label>Referral Code (Optional)</label>
                        <div className="auth-input-wrapper">
                            <input
                                type="text"
                                className="auth-input"
                                placeholder="Enter referral or sponsor code"
                                value={formData.referralCode}
                                onChange={(e) => setFormData({ ...formData, referralCode: e.target.value })}
                            />
                            <Users className="auth-input-icon" size={18} />
                        </div>
                    </div>

                    <button type="submit" className="btn-primary auth-btn shimmer-btn" disabled={loading}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            {loading ? 'Creating Account...' : 'Create Account'}
                            <ArrowRight size={18} />
                        </div>
                    </button>
                </form>

                <div className="auth-footer">
                    Already have an account?
                    <Link to="/login" className="auth-link">Login Here</Link>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
