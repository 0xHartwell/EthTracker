const storage = require('./storage');

class PortfolioManager {
    constructor() {
        this.portfolios = new Map();
        this.loadFromStorage();
    }
    
    loadFromStorage() {
        const savedPortfolios = storage.load('portfolios');
        if (savedPortfolios) {
            savedPortfolios.forEach(portfolio => {
                this.portfolios.set(portfolio.name, portfolio);
            });
        }
    }
    
    saveToStorage() {
        const portfolioArray = Array.from(this.portfolios.values());
        return storage.save('portfolios', portfolioArray);
    }
    
    createPortfolio(name, addresses = []) {
        if (this.portfolios.has(name)) {
            throw new Error('Portfolio already exists');
        }
        
        const portfolio = {
            name,
            addresses: [...addresses],
            createdAt: new Date(),
            totalBalance: 0
        };
        
        this.portfolios.set(name, portfolio);
        this.saveToStorage();
        return portfolio;
    }
    
    getPortfolio(name) {
        return this.portfolios.get(name);
    }
    
    getAllPortfolios() {
        return Array.from(this.portfolios.values());
    }
    
    addAddressToPortfolio(portfolioName, address) {
        const portfolio = this.portfolios.get(portfolioName);
        if (!portfolio) {
            throw new Error('Portfolio not found');
        }
        
        if (!portfolio.addresses.includes(address)) {
            portfolio.addresses.push(address);
            this.saveToStorage();
        }
        
        return portfolio;
    }
    
    removeAddressFromPortfolio(portfolioName, address) {
        const portfolio = this.portfolios.get(portfolioName);
        if (!portfolio) {
            throw new Error('Portfolio not found');
        }
        
        const index = portfolio.addresses.indexOf(address);
        if (index > -1) {
            portfolio.addresses.splice(index, 1);
            this.saveToStorage();
        }
        
        return portfolio;
    }
    
    deletePortfolio(name) {
        const result = this.portfolios.delete(name);
        if (result) {
            this.saveToStorage();
        }
        return result;
    }
    
    updatePortfolioBalance(name, totalBalance) {
        const portfolio = this.portfolios.get(name);
        if (portfolio) {
            portfolio.totalBalance = totalBalance;
            portfolio.lastUpdated = new Date();
            this.saveToStorage();
        }
        return portfolio;
    }
}

module.exports = new PortfolioManager();