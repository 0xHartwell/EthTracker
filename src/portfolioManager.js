class PortfolioManager {
    constructor() {
        this.portfolios = new Map();
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
        }
        
        return portfolio;
    }
    
    deletePortfolio(name) {
        return this.portfolios.delete(name);
    }
    
    updatePortfolioBalance(name, totalBalance) {
        const portfolio = this.portfolios.get(name);
        if (portfolio) {
            portfolio.totalBalance = totalBalance;
            portfolio.lastUpdated = new Date();
        }
        return portfolio;
    }
}

module.exports = new PortfolioManager();