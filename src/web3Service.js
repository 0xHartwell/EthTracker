const { Web3 } = require('web3');

class Web3Service {
    constructor() {
        this.web3 = null;
        this.isConnected = false;
    }
    
    async connect() {
        try {
            const infuraUrl = process.env.INFURA_URL;
            if (!infuraUrl) {
                console.log('Using public RPC endpoint');
                this.web3 = new Web3('https://rpc.ankr.com/eth');
            } else {
                this.web3 = new Web3(infuraUrl);
            }
            
            const blockNumber = await this.web3.eth.getBlockNumber();
            console.log(`Connected to Ethereum. Latest block: ${blockNumber}`);
            this.isConnected = true;
            return true;
        } catch (error) {
            console.error('Failed to connect to Ethereum:', error.message);
            return false;
        }
    }
    
    async getBalance(address) {
        if (!this.isConnected) {
            throw new Error('Web3 not connected');
        }
        
        try {
            const balanceWei = await this.web3.eth.getBalance(address);
            const balanceEth = this.web3.utils.fromWei(balanceWei, 'ether');
            return parseFloat(balanceEth);
        } catch (error) {
            throw new Error(`Failed to get balance: ${error.message}`);
        }
    }
    
    async getTransactionHistory(address, blockLimit = 1000) {
        if (!this.isConnected) {
            throw new Error('Web3 not connected');
        }
        
        try {
            const latestBlock = await this.web3.eth.getBlockNumber();
            const fromBlock = Math.max(0, Number(latestBlock) - blockLimit);
            
            const transactions = [];
            
            for (let i = fromBlock; i <= latestBlock; i++) {
                const block = await this.web3.eth.getBlock(i, true);
                if (block && block.transactions) {
                    for (const tx of block.transactions) {
                        if (tx.from.toLowerCase() === address.toLowerCase() || 
                            (tx.to && tx.to.toLowerCase() === address.toLowerCase())) {
                            transactions.push({
                                hash: tx.hash,
                                blockNumber: tx.blockNumber,
                                from: tx.from,
                                to: tx.to,
                                value: this.web3.utils.fromWei(tx.value, 'ether'),
                                gasUsed: tx.gas,
                                gasPrice: tx.gasPrice,
                                timestamp: block.timestamp
                            });
                        }
                    }
                }
            }
            
            return transactions.sort((a, b) => b.timestamp - a.timestamp);
        } catch (error) {
            throw new Error(`Failed to get transaction history: ${error.message}`);
        }
    }
    
    isValidAddress(address) {
        return this.web3 && this.web3.utils.isAddress(address);
    }
}

module.exports = new Web3Service();