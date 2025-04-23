const express = require('express');
const path = require('path');
require('dotenv').config();
const web3Service = require('./web3Service');
const portfolioManager = require('./portfolioManager');
const priceService = require('./priceService');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.post('/api/balance', async (req, res) => {
    try {
        const { address } = req.body;
        
        if (!address) {
            return res.status(400).json({ error: 'Address is required' });
        }
        
        if (!web3Service.isValidAddress(address)) {
            return res.status(400).json({ error: 'Invalid Ethereum address' });
        }
        
        const balance = await web3Service.getBalance(address);
        res.json({ address, balance });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/transactions', async (req, res) => {
    try {
        const { address, blockLimit } = req.body;
        
        if (!address) {
            return res.status(400).json({ error: 'Address is required' });
        }
        
        if (!web3Service.isValidAddress(address)) {
            return res.status(400).json({ error: 'Invalid Ethereum address' });
        }
        
        const transactions = await web3Service.getTransactionHistory(address, blockLimit);
        res.json({ address, transactions, count: transactions.length });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/portfolio', async (req, res) => {
    try {
        const { name, addresses } = req.body;
        
        if (!name) {
            return res.status(400).json({ error: 'Portfolio name is required' });
        }
        
        const portfolio = portfolioManager.createPortfolio(name, addresses || []);
        res.json(portfolio);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/portfolios', (req, res) => {
    try {
        const portfolios = portfolioManager.getAllPortfolios();
        res.json(portfolios);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/portfolio/:name/balance', async (req, res) => {
    try {
        const { name } = req.params;
        const portfolio = portfolioManager.getPortfolio(name);
        
        if (!portfolio) {
            return res.status(404).json({ error: 'Portfolio not found' });
        }
        
        let totalBalance = 0;
        const addressBalances = [];
        
        for (const address of portfolio.addresses) {
            try {
                const balance = await web3Service.getBalance(address);
                totalBalance += balance;
                addressBalances.push({ address, balance });
            } catch (err) {
                addressBalances.push({ address, balance: 0, error: err.message });
            }
        }
        
        portfolioManager.updatePortfolioBalance(name, totalBalance);
        
        res.json({
            portfolio: portfolio.name,
            totalBalance,
            addresses: addressBalances
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/price', async (req, res) => {
    try {
        const priceData = await priceService.getETHPrice();
        res.json(priceData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/price/history', (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const history = priceService.getPriceHistory(limit);
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/portfolio/:name/value', async (req, res) => {
    try {
        const { name } = req.params;
        const portfolio = portfolioManager.getPortfolio(name);
        
        if (!portfolio) {
            return res.status(404).json({ error: 'Portfolio not found' });
        }
        
        const priceData = await priceService.getETHPrice();
        const portfolioValue = priceService.calculatePortfolioValue(portfolio.totalBalance, priceData);
        
        res.json({
            portfolio: portfolio.name,
            ...portfolioValue,
            addresses: portfolio.addresses.length,
            lastUpdated: portfolio.lastUpdated
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

async function startServer() {
    console.log('Connecting to Ethereum...');
    const connected = await web3Service.connect();
    
    if (!connected) {
        console.error('Failed to connect to Ethereum. Server will start anyway.');
    }
    
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

startServer();