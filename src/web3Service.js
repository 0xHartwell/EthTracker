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
    
    isValidAddress(address) {
        return this.web3 && this.web3.utils.isAddress(address);
    }
}

module.exports = new Web3Service();