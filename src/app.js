const express = require('express');
const path = require('path');
require('dotenv').config();
const web3Service = require('./web3Service');

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