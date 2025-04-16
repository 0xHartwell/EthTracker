document.addEventListener('DOMContentLoaded', function() {
    const addressInput = document.getElementById('addressInput');
    const addBtn = document.getElementById('addBtn');
    const addressList = document.getElementById('addressList');
    
    let addresses = [];
    
    addBtn.addEventListener('click', addAddress);
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
            return;
        }
        
        let html = '';
        addresses.forEach((address, index) => {
            html += `
                <div class="address-item">
                    <span class="address">${address}</span>
                    <button onclick="removeAddress(${index})" class="remove-btn">Remove</button>
                </div>
            `;
        });
        
        addressList.innerHTML = html;
    }
    
    window.removeAddress = function(index) {
        addresses.splice(index, 1);
        renderAddresses();
    };
});