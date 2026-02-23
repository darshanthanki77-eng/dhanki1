import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowRight,
    Upload,
    Coins,
    DollarSign,
    CheckCircle2,
    AlertCircle,
    Activity,
    Wallet
} from 'lucide-react';
import './BuyToken.css';

const BuyToken = () => {
    const [amount, setAmount] = useState('');
    const [method, setMethod] = useState('USDT');
    const [step, setStep] = useState(1);
    const [txId, setTxId] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [history, setHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [screenshot, setScreenshot] = useState(null);
    const [tokenPrice, setTokenPrice] = useState(0.01);   // live from admin settings
    const [networkFee, setNetworkFee] = useState(2);       // live from admin settings
    const [priceLoading, setPriceLoading] = useState(true);
    const inrRate = 90;

    const calculateTokens = () => {
        if (!amount) return 0;
        const usdtAmount = method === 'INR' ? (amount / inrRate) : parseFloat(amount);
        return Math.floor(usdtAmount / tokenPrice);
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert('Address copied to clipboard!');
    };

    React.useEffect(() => {
        fetchPlatformSettings();
        fetchHistory();
    }, []);

    const fetchPlatformSettings = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/token/settings');
            if (res.ok) {
                const data = await res.json();
                if (data.dhankiPrice) setTokenPrice(data.dhankiPrice);
                if (data.networkFee) setNetworkFee(data.networkFee);
            }
        } catch (e) {
            console.error('Could not load platform settings, using defaults');
        } finally {
            setPriceLoading(false);
        }
    };

    const fetchHistory = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/token/history', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setHistory(data.data);
            }
        } catch (e) {
            console.error('History fetch error');
        } finally {
            setHistoryLoading(false);
        }
    };

    const handlePurchase = (e) => {
        e.preventDefault();
        setStep(2);
    };

    const handleConfirmPurchase = async () => {
        if (!txId) return setError('Transaction ID is required');
        if (!screenshot) return setError('Payment screenshot is required');

        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');

            // Use FormData to send file + fields together
            const formData = new FormData();
            formData.append('amount', amount);
            formData.append('method', method);
            formData.append('txHash', txId);
            formData.append('paymentScreenshot', screenshot);

            const response = await fetch('http://localhost:5000/api/token/purchase', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                    // Note: Do NOT set Content-Type — browser sets it with boundary for FormData
                },
                body: formData
            });

            const data = await response.json();
            if (response.ok) {
                setSuccess(true);
            } else {
                setError(data.message || 'Purchase failed');
            }
        } catch (err) {
            setError('Could not connect to server');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="buy-token-container">
            <motion.div
                className="page-header"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
                <div>
                    <h1>Buy <span className="gold-glow-text">Dhanik Token</span></h1>
                    <p>Acquire Dhanik tokens instantly using USDT or INR.</p>
                </div>
                <div className="price-tag">
                    <Activity size={16} />
                    {priceLoading ? (
                        <span>Loading price...</span>
                    ) : (
                        <span>Price: ${tokenPrice.toFixed(4)} / DHANKI</span>
                    )}
                </div>
            </motion.div>

            <div className="buy-grid">
                <motion.div
                    className="buy-card"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                >
                    <AnimatePresence mode="wait">
                        {success ? (
                            <motion.div
                                key="success"
                                className="payment-step"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                style={{ textAlign: 'center', padding: '2rem' }}
                            >
                                <CheckCircle2 size={64} color="var(--admin-success)" style={{ marginBottom: '1.5rem' }} />
                                <h3 style={{ fontSize: '1.5rem' }}>Request Submitted!</h3>
                                <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>
                                    Your purchase request for {calculateTokens().toLocaleString()} DHANKI has been received.
                                    It will be processed once verified.
                                </p>
                                <button
                                    className="btn-primary full-btn"
                                    style={{ marginTop: '2rem' }}
                                    onClick={() => window.location.href = '/dashboard'}
                                >
                                    Back to Dashboard
                                </button>
                            </motion.div>
                        ) : step === 1 ? (
                            <motion.form
                                key="form"
                                onSubmit={handlePurchase}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <div className="form-head">
                                    <h3>Token Purchase</h3>
                                    <p>Select your payment method and amount</p>
                                </div>

                                <div className="method-selector">
                                    <div
                                        className={`method-btn ${method === 'USDT' ? 'active' : ''}`}
                                        onClick={() => setMethod('USDT')}
                                    >
                                        <div className="icon"><DollarSign size={20} /></div>
                                        <span>USDT (Tether)</span>
                                    </div>
                                    <div
                                        className={`method-btn ${method === 'INR' ? 'active' : ''}`}
                                        onClick={() => setMethod('INR')}
                                    >
                                        <div className="icon">₹</div>
                                        <span>INR (Rupees)</span>
                                    </div>
                                </div>

                                <div className="input-group-prime">
                                    <label>Amount to Spend</label>
                                    <div className="premium-input-container">
                                        <div className="input-icon-box">
                                            {method === 'USDT' ? <DollarSign size={20} /> : <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>₹</span>}
                                        </div>
                                        <input
                                            type="number"
                                            className="premium-buy-input"
                                            placeholder={`Enter amount in ${method}`}
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            required
                                        />
                                        <div className="input-suffix">
                                            {method}
                                        </div>
                                    </div>
                                </div>

                                <div className="preview-box">
                                    <div className="preview-row">
                                        <span>Estimated Tokens</span>
                                        <span className="gold-glow-text">{calculateTokens().toLocaleString()} DHANKI</span>
                                    </div>
                                    <div className="preview-row">
                                        <span>Exchange Rate</span>
                                        <span>1 DHANKI = {tokenPrice.toFixed(4)} USDT</span>
                                    </div>
                                    <div className="preview-row">
                                        <span>Network Fee</span>
                                        <span>{networkFee} USDT</span>
                                    </div>
                                </div>

                                <button type="submit" className="btn-primary full-btn">
                                    Continue to Payment
                                    <ArrowRight size={20} />
                                </button>
                            </motion.form>
                        ) : (
                            <motion.div
                                key="payment"
                                className="payment-step"
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                            >
                                <div className="form-head">
                                    <h3>Finalize Payment</h3>
                                    <p>Send {amount} {method} to the address below</p>
                                </div>

                                {error && (
                                    <div style={{ color: '#FF4D4D', background: 'rgba(255, 77, 77, 0.1)', padding: '12px', borderRadius: '10px', marginBottom: '15px', fontSize: '0.9rem' }}>
                                        {error}
                                    </div>
                                )}

                                <div className="qr-container">
                                    <div className="qr-wrapper">
                                        <img
                                            src={method === 'USDT'
                                                ? "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=0x8b2A56C71D82496a738F9B6eE90a2c0F3d1"
                                                : "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=dhanik@upi&pn=Dhanik%20Token"
                                            }
                                            alt="Payment QR"
                                        />
                                    </div>
                                    <div className="address-box">
                                        <code>{method === 'USDT' ? '0x8b2A...F3d1' : 'dhanik@upi'}</code>
                                        <button
                                            className="copy-btn"
                                            onClick={() => copyToClipboard(method === 'USDT' ? '0x8b2A56C71D82496a738F9B6eE90a2c0F3d1' : 'dhanik@upi')}
                                        >
                                            Copy
                                        </button>
                                    </div>
                                </div>

                                <div className="input-group-prime">
                                    <label>Enter Transaction ID / Hash</label>
                                    <input
                                        type="text"
                                        placeholder="Paste transaction hash here"
                                        value={txId}
                                        onChange={(e) => setTxId(e.target.value)}
                                        className="prime-input"
                                    />
                                </div>

                                <div
                                    className={`upload-box-dashed ${screenshot ? 'has-file' : ''}`}
                                    onClick={() => document.getElementById('fileInput').click()}
                                >
                                    <input
                                        type="file"
                                        id="fileInput"
                                        hidden
                                        onChange={(e) => setScreenshot(e.target.files[0])}
                                    />
                                    {screenshot ? (
                                        <>
                                            <CheckCircle2 size={24} color="#22c55e" />
                                            <p style={{ color: '#22c55e' }}>{screenshot.name} Attached</p>
                                        </>
                                    ) : (
                                        <>
                                            <Upload size={24} />
                                            <p>Upload Payment Screenshot</p>
                                        </>
                                    )}
                                </div>

                                <div className="btn-row">
                                    <button className="btn-outline" onClick={() => setStep(1)} disabled={loading}>Back</button>
                                    <button
                                        className="btn-primary shimmer-btn"
                                        style={{ flex: 1 }}
                                        onClick={handleConfirmPurchase}
                                        disabled={loading}
                                    >
                                        {loading ? 'Processing...' : 'Confirm Purchase'}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                <motion.div
                    className="info-column"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                >
                    <div className="token-details-card">
                        <h3>Dhanik <span className="gold-glow-text">Tokenomics</span></h3>
                        <div className="token-stat">
                            <span>Total Supply</span>
                            <span>20 Crore</span>
                        </div>
                        <div className="token-stat">
                            <span>Network</span>
                            <span>BEP-20 (Binance)</span>
                        </div>
                        <div className="token-stat">
                            <span>Decimals</span>
                            <span>18</span>
                        </div>
                        <div className="token-stat">
                            <span>Symbol</span>
                            <span className="gold-glow-text">DHANKI</span>
                        </div>
                    </div>

                    <div className="referral-info-card">
                        <h3>Referral <span className="gold-glow-text">Bonuses</span></h3>
                        <div className="bonus-row">
                            <div className="level-dot">L1</div>
                            <span>Direct Referral</span>
                            <span className="pct">5%</span>
                        </div>
                        <div className="bonus-row">
                            <div className="level-dot">L2</div>
                            <span>Indirect Level 2</span>
                            <span className="pct">2%</span>
                        </div>
                        <div className="bonus-row">
                            <div className="level-dot">L3</div>
                            <span>Indirect Level 3</span>
                            <span className="pct">1%</span>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* History Section */}
            <motion.div
                className="buy-history-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2>Recent <span className="gold-glow-text">Purchase History</span></h2>
                </div>

                <div className="history-table-container">
                    <table className="history-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Method</th>
                                <th>Amount</th>
                                <th>Tokens</th>
                                <th>TX Hash</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {historyLoading ? (
                                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>Loading history...</td></tr>
                            ) : history.length > 0 ? (
                                history.map((item, idx) => (
                                    <tr key={item._id || idx}>
                                        <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                                        <td><span className="method-tag">{item.currency}</span></td>
                                        <td>{item.amount.toLocaleString()}</td>
                                        <td className="gold-glow-text">{item.tokens?.toLocaleString() || 0}</td>
                                        <td><code>{item.txHash?.substring(0, 10)}...</code></td>
                                        <td>
                                            <span className={`status-pill ${item.status?.toLowerCase()}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: '#9CA3AF' }}>
                                        No purchase records found accurately yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
};

export default BuyToken;
