const express = require('express');
const { purchaseTokens, getIncomeStats, getPurchaseHistory } = require('../controllers/tokenController');
const { protect } = require('../middleware/authMiddleware');
const Settings = require('../models/Settings');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Multer setup — save screenshots. Use /tmp on Vercel for local processing.
const uploadDir = process.env.VERCEL ? '/tmp' : path.join(__dirname, '../uploads');

if (!process.env.VERCEL && !fs.existsSync(uploadDir)) {
    try {
        fs.mkdirSync(uploadDir, { recursive: true });
    } catch (err) {
        console.error('Failed to create upload directory:', err);
    }
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `proof_${Date.now()}${ext}`);
    }
});
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }
});

// Public route - get platform settings (price, fees etc.) for the buy page
router.get('/settings', async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) settings = await Settings.create({});
        res.json({
            dhankiPrice: settings.dhankiPrice,
            networkFee: settings.networkFee,
            minWithdrawal: settings.minWithdrawal,
            maintenanceMode: settings.maintenanceMode
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/purchase', protect, upload.single('paymentScreenshot'), purchaseTokens);
router.get('/stats', protect, getIncomeStats);
router.get('/history', protect, getPurchaseHistory);

module.exports = router;
