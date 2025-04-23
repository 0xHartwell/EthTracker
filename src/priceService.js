const https = require('https');

class PriceService {
    constructor() {
        this.cache = new Map();
        this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
        this.priceHistory = [];
    }
    
    async getETHPrice() {
        const cacheKey = 'eth_price';
        const cached = this.cache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
            return cached.data;
        }
        
        try {
            const priceData = await this.fetchPriceFromAPI();
            
            this.cache.set(cacheKey, {
                data: priceData,
                timestamp: Date.now()
            });
            
            this.priceHistory.push({
                price: priceData.price,
                timestamp: Date.now()
            });
            
            // Keep only last 100 price points
            if (this.priceHistory.length > 100) {
                this.priceHistory = this.priceHistory.slice(-100);
            }
            
            return priceData;
        } catch (error) {
            console.error('Failed to fetch ETH price:', error);
            // Return cached data if available, even if expired
            if (cached) {
                return cached.data;
            }
            throw error;
        }
    }
    
    fetchPriceFromAPI() {
        return new Promise((resolve, reject) => {
            const url = 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_24hr_change=true&include_market_cap=true';
            
            https.get(url, (res) => {
                let data = '';
                
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    try {
                        const parsed = JSON.parse(data);
                        const ethData = parsed.ethereum;
                        
                        if (!ethData) {
                            throw new Error('Invalid API response');
                        }
                        
                        resolve({
                            price: ethData.usd,
                            change24h: ethData.usd_24h_change,
                            marketCap: ethData.usd_market_cap,
                            lastUpdated: new Date().toISOString()
                        });
                    } catch (parseError) {
                        reject(new Error('Failed to parse price data'));
                    }
                });
            }).on('error', (error) => {
                reject(error);
            });
        });
    }
    
    getPriceHistory(limit = 50) {
        return this.priceHistory.slice(-limit);
    }
    
    calculatePortfolioValue(ethBalance, priceData = null) {
        if (!priceData) {
            const cached = this.cache.get('eth_price');
            if (!cached) {
                throw new Error('Price data not available');
            }
            priceData = cached.data;
        }
        
        return {
            ethBalance,
            usdValue: ethBalance * priceData.price,
            pricePerEth: priceData.price,
            change24h: priceData.change24h
        };
    }
}

module.exports = new PriceService();