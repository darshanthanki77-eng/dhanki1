const path = require('path');
// Only load dotenv in development. Vercel provides environment variables directly.
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config({ path: path.join(__dirname, '.env') });
}

const express = require('express');
const cors = require('cors');

// Connect to Database
const connectDB = require('./config/db');
if (process.env.MONGO_URI) {
    connectDB().catch(err => console.error('Database connection failed:', err));
} else {
    console.error('CRITICAL: MONGO_URI is not defined in environment variables!');
}

// Temporary Migration: Promote admin users and sync referrals
const User = require('./models/User');

const syncReferrals = async () => {
    try {
        console.log('🔄 Syncing referral data...');
        const allUsers = await User.find({});

        // Reset all referral arrays first to ensure clean state
        await User.updateMany({}, {
            $set: {
                'referrals.level1': [],
                'referrals.level2': [],
                'referrals.level3': []
            }
        });

        for (const user of allUsers) {
            if (user.referredBy) {
                const cleanRefL1 = user.referredBy.trim();
                const sponsorL1 = await User.findOne({ referralId: cleanRefL1 });
                if (sponsorL1) {
                    sponsorL1.referrals.level1.push(user._id);
                    await sponsorL1.save();

                    if (sponsorL1.referredBy) {
                        const cleanRefL2 = sponsorL1.referredBy.trim();
                        const sponsorL2 = await User.findOne({ referralId: cleanRefL2 });
                        if (sponsorL2) {
                            sponsorL2.referrals.level2.push(user._id);
                            await sponsorL2.save();

                            if (sponsorL2.referredBy) {
                                const cleanRefL3 = sponsorL2.referredBy.trim();
                                const sponsorL3 = await User.findOne({ referralId: cleanRefL3 });
                                if (sponsorL3) {
                                    sponsorL3.referrals.level3.push(user._id);
                                    await sponsorL3.save();
                                }
                            }
                        }
                    }
                }
            }
        }
        console.log('✅ Referral data synced successfully');
    } catch (err) {
        console.error('Sync error:', err);
    }
};

const runMigrations = async () => {
    try {
        const adminEmails = ['admin1@gmail.com', 'admin@gmail.com'];
        await User.updateMany(
            { email: { $in: adminEmails } },
            { $set: { isAdmin: 1 } }
        );
        console.log('✅ Registered admins promoted successfully');

        await syncReferrals();
    } catch (err) {
        console.error('Migration error:', err);
    }
};
// Migrations moved to local listener block

const app = express();

// Middleware
app.use(cors({
    origin: ['https://dhanik.vercel.app', 'http://localhost:5173', 'http://localhost:3000'],
    credentials: true
}));
// Middleware to ensure DB connection before handling requests
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        res.status(500).json({ message: 'Database connection error', error: err.message });
    }
});

app.use(express.json());

// Serve uploaded proof screenshots
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/token', require('./routes/tokenRoutes'));
app.use('/api/referral', require('./routes/referralRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/support', require('./routes/supportRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

app.get('/', (req, res) => {
    res.json({ message: 'DHANKI API is running...', status: 'Online' });
});

// Run listener only when not in Vercel environment
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server running locally on port ${PORT}`);
        // Run migrations only in local environment to avoid Vercel timeouts
        runMigrations();
    });
}

module.exports = app;
