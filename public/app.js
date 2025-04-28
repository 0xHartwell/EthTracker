document.addEventListener('DOMContentLoaded', function() {
    const addressInput = document.getElementById('addressInput');
    const addBtn = document.getElementById('addBtn');
    const historyBtn = document.getElementById('historyBtn');
    const addressList = document.getElementById('addressList');
    const transactionHistory = document.getElementById('transactionHistory');
    const transactionList = document.getElementById('transactionList');
    const closeHistory = document.getElementById('closeHistory');
    
    let addresses = [];
    let selectedAddress = '';
    
    addBtn.addEventListener('click', addAddress);
    historyBtn.addEventListener('click', loadTransactionHistory);
    closeHistory.addEventListener('click', closeTransactionHistory);
    
    addressInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addAddress();
        }
    });
    
    function addAddress() {
        const address = addressInput.value.trim();
        
        if (!address) {
            alert('Please enter an address');
            return;
        }
        
        if (!address.startsWith('0x') || address.length !== 42) {
            alert('Please enter a valid Ethereum address');
            return;
        }
        
        if (addresses.includes(address)) {
            alert('Address already added');
            return;
        }
        
        addresses.push(address);
        addressInput.value = '';
        renderAddresses();
    }
    
    function renderAddresses() {
        if (addresses.length === 0) {
            addressList.innerHTML = '<p>No addresses added yet.</p>';
            historyBtn.style.display = 'none';
            return;
        }
        
        let html = '';
        addresses.forEach((address, index) => {
            html += `
                <div class="address-item ${selectedAddress === address ? 'selected' : ''}">
                    <span class="address" onclick="selectAddress('${address}')">${address}</span>
                    <span class="balance" id="balance-${index}">Loading...</span>
                    <button onclick="removeAddress(${index})" class="remove-btn">Remove</button>
                </div>
            `;
        });
        
        addressList.innerHTML = html;
        loadBalances();
        
        if (selectedAddress) {
            historyBtn.style.display = 'inline-block';
        }
    }
    
    window.removeAddress = function(index) {
        if (addresses[index] === selectedAddress) {
            selectedAddress = '';
            historyBtn.style.display = 'none';
        }
        addresses.splice(index, 1);
        renderAddresses();
    };
    
    window.selectAddress = function(address) {
        selectedAddress = address;
        renderAddresses();
    };
    
    async function loadBalances() {
        for (let i = 0; i < addresses.length; i++) {
            try {
                const response = await fetch('/api/balance', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ address: addresses[i] }),
                });
                
                const data = await response.json();
                const balanceElement = document.getElementById(`balance-${i}`);
                if (balanceElement) {
                    balanceElement.textContent = `${data.balance.toFixed(4)} ETH`;
                }
            } catch (error) {
                const balanceElement = document.getElementById(`balance-${i}`);
                if (balanceElement) {
                    balanceElement.textContent = 'Error';
                }
            }
        }
    }
    
    async function loadTransactionHistory() {
        if (!selectedAddress) return;
        
        transactionList.innerHTML = '<div class="loading">🔄 Scanning recent blocks for transactions... This may take a minute.</div>';
        transactionHistory.style.display = 'block';
        
        try {
            const response = await fetch('/api/transactions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ address: selectedAddress, blockLimit: 500 }),
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.transactions.length === 0) {
                transactionList.innerHTML = '<p>No transactions found in recent blocks.</p>';
                return;
            }
            
            let html = '<div class="transaction-list">';
            data.transactions.forEach(tx => {
                const isIncoming = tx.to && tx.to.toLowerCase() === selectedAddress.toLowerCase();
                const direction = isIncoming ? 'IN' : 'OUT';
                const directionClass = isIncoming ? 'incoming' : 'outgoing';
                
                html += `
                    <div class="transaction-item ${directionClass}">
                        <div class="tx-header">
                            <span class="direction">${direction}</span>
                            <span class="value">${parseFloat(tx.value).toFixed(4)} ETH</span>
                        </div>
                        <div class="tx-details">
                            <div class="tx-hash">Hash: ${tx.hash.substring(0, 10)}...${tx.hash.substring(tx.hash.length - 8)}</div>
                            <div class="tx-addresses">
                                From: ${tx.from.substring(0, 10)}...${tx.from.substring(tx.from.length - 8)}<br>
                                To: ${tx.to ? tx.to.substring(0, 10) + '...' + tx.to.substring(tx.to.length - 8) : 'Contract Creation'}
                            </div>
                            <div class="tx-block">Block: ${tx.blockNumber}</div>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
            
            transactionList.innerHTML = html;
            
        } catch (error) {
            transactionList.innerHTML = '<p>Error loading transactions: ' + error.message + '</p>';
        }
    }
    
    function closeTransactionHistory() {
        transactionHistory.style.display = 'none';
    }
});