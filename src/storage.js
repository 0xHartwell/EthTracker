const fs = require('fs');
const path = require('path');

class Storage {
    constructor() {
        this.dataDir = path.join(__dirname, '../data');
        this.ensureDataDir();
    }
    
    ensureDataDir() {
        if (!fs.existsSync(this.dataDir)) {
            fs.mkdirSync(this.dataDir, { recursive: true });
        }
    }
    
    getFilePath(key) {
        return path.join(this.dataDir, `${key}.json`);
    }
    
    save(key, data) {
        try {
            const filePath = this.getFilePath(key);
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
            return true;
        } catch (error) {
            console.error(`Failed to save ${key}:`, error);
            return false;
        }
    }
    
    load(key) {
        try {
            const filePath = this.getFilePath(key);
            if (!fs.existsSync(filePath)) {
                return null;
            }
            const data = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error(`Failed to load ${key}:`, error);
            return null;
        }
    }
    
    exists(key) {
        const filePath = this.getFilePath(key);
        return fs.existsSync(filePath);
    }
    
    delete(key) {
        try {
            const filePath = this.getFilePath(key);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                return true;
            }
            return false;
        } catch (error) {
            console.error(`Failed to delete ${key}:`, error);
            return false;
        }
    }
    
    list() {
        try {
            const files = fs.readdirSync(this.dataDir);
            return files
                .filter(file => file.endsWith('.json'))
                .map(file => file.replace('.json', ''));
        } catch (error) {
            console.error('Failed to list storage keys:', error);
            return [];
        }
    }
}

module.exports = new Storage();