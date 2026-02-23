import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Zap, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import API_BASE_URL from '../apiConfig';
import './Auth.css';

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
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
                setError(data.message || 'Login failed');
            }
        } catch (err) {
            setError('Could not connect to server');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-wrapper">
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
                    <p>Welcome back! Securely login to your account.</p>
                </div>

                <form onSubmit={handleLogin}>
                    {error && (
                        <div style={{ color: 'var(--admin-danger)', background: 'rgba(255, 77, 77, 0.1)', padding: '12px', borderRadius: '10px', marginBottom: '20px', fontSize: '0.9rem', border: '1px solid rgba(255, 77, 77, 0.2)' }}>
                            {error}
                        </div>
                    )}

                    <div className="auth-form-group">
                        <label>Email Address</label>
                        <div className="auth-input-wrapper">
                            <input
                                type="email"
                                className="auth-input"
                                placeholder="your@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <Mail className="auth-input-icon" size={18} />
                        </div>
                    </div>

                    <div className="auth-form-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <label style={{ marginBottom: 0 }}>Password</label>
                            <Link to="#" className="auth-link" style={{ fontSize: '0.8rem', fontWeight: 500 }}>Forgot Password?</Link>
                        </div>
                        <div className="auth-input-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                className="auth-input"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <Lock className="auth-input-icon" size={18} />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '16px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--text-secondary)',
                                    cursor: 'pointer'
                                }}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="btn-primary auth-btn shimmer-btn" disabled={loading}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            {loading ? 'Logging in...' : 'Login Now'}
                            <ArrowRight size={18} />
                        </div>
                    </button>
                </form>

                <div className="auth-footer">
                    Don't have an account?
                    <Link to="/register" className="auth-link">Sign Up Here</Link>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
