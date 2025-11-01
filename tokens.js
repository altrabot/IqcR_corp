// Token System for IQC Generator - Fixed Version
window.tokenSystem = (function() {
    // Token storage key for localStorage
    const TOKEN_STORAGE_KEY = 'iqc_tokens_data';
    const USED_TOKENS_KEY = 'iqc_used_tokens';
    const LAST_GENERATION_KEY = 'iqc_last_generation';
    
    // Token configuration - SESUAI PERMINTAAN
    const TOKEN_CONFIG = [
        { count: 5, quantity: 50 },    // 50 token berisi 5 TCR
        { count: 30, quantity: 20 },   // 20 token berisi 30 TCR  
        { count: 80, quantity: 10 },   // 10 token berisi 80 TCR
        { count: 150, quantity: 10 }   // 10 token berisi 150 TCR
    ];
    
    // Initialize token system dengan logging ke console
    function init() {
        console.log('🔧 IQC Generator Token System Initializing...');
        
        const now = Date.now();
        const lastGeneration = localStorage.getItem(LAST_GENERATION_KEY);
        const oneDayInMs = 24 * 60 * 60 * 1000;
        
        // Generate new tokens if it's the first time or if 24 hours have passed
        if (!lastGeneration || (now - parseInt(lastGeneration)) > oneDayInMs) {
            console.log('🔄 Generating new tokens (24-hour cycle)...');
            generateTokens();
            localStorage.setItem(LAST_GENERATION_KEY, now.toString());
            
            // Log semua token yang baru di-generate
            const activeTokens = getActiveTokens();
            console.log('🎉 TOKEN BARU TELAH DI-GENERATE:');
            console.log('================================');
            
            // Group tokens by count untuk logging yang rapi
            const tokensByCount = {};
            activeTokens.forEach(token => {
                if (!tokensByCount[token.count]) {
                    tokensByCount[token.count] = [];
                }
                tokensByCount[token.count].push(token.code);
            });
            
            // Log berdasarkan kategori
            Object.keys(tokensByCount).sort((a, b) => a - b).forEach(count => {
                const tokens = tokensByCount[count];
                console.log(`📦 ${tokens.length} token berisi ${count} TCR:`);
                tokens.forEach((token, index) => {
                    console.log(`   ${index + 1}. ${token}`);
                });
            });
            
            console.log('================================');
            console.log(`📊 TOTAL: ${activeTokens.length} token aktif`);
            
        } else {
            const nextGeneration = parseInt(lastGeneration) + oneDayInMs;
            const timeUntilNextGen = nextGeneration - now;
            const hoursLeft = Math.floor(timeUntilNextGen / (60 * 60 * 1000));
            const minutesLeft = Math.floor((timeUntilNextGen % (60 * 60 * 1000)) / (60 * 1000));
            
            console.log(`⏰ Token generation akan reset dalam: ${hoursLeft} jam ${minutesLeft} menit`);
            
            // Log token stats yang aktif
            const activeTokens = getActiveTokens();
            const stats = getTokenStats();
            console.log('📊 TOKEN STATS:');
            console.log(`   ✅ Aktif: ${stats.active} token`);
            console.log(`   ❌ Terpakai: ${stats.used} token`);
            console.log(`   📈 Total: ${stats.total} token`);
        }
        
        // Log initial active tokens
        const activeTokens = getActiveTokens();
        if (activeTokens.length > 0) {
            console.log('🔑 TOKEN AKTIF SAAT INI:');
            activeTokens.slice(0, 5).forEach((token, index) => {
                console.log(`   ${index + 1}. ${token.code} (${token.count} TCR)`);
            });
            if (activeTokens.length > 5) {
                console.log(`   ... dan ${activeTokens.length - 5} token lainnya`);
            }
        }
    }
    
    // Generate tokens based on configuration
    function generateTokens() {
        const tokens = [];
        
        TOKEN_CONFIG.forEach(config => {
            for (let i = 0; i < config.quantity; i++) {
                const token = {
                    code: generateTokenCode(config.count),
                    count: config.count,
                    used: false,
                    createdAt: new Date().toISOString()
                };
                tokens.push(token);
            }
        });
        
        // Shuffle tokens
        shuffleArray(tokens);
        
        // Save to localStorage
        localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens));
        
        // Initialize used tokens list if not exists
        if (!localStorage.getItem(USED_TOKENS_KEY)) {
            localStorage.setItem(USED_TOKENS_KEY, JSON.stringify([]));
        }
    }
    
    // Generate a random token code
    function generateTokenCode(count) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let randomPart = '';
        
        for (let i = 0; i < 5; i++) {
            randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        const countPart = count.toString().padStart(2, '0');
        return `TCR-${randomPart}-${countPart}`;
    }
    
    // Shuffle array (Fisher-Yates algorithm)
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    // Get all active tokens
    function getActiveTokens() {
        const tokensJson = localStorage.getItem(TOKEN_STORAGE_KEY);
        if (!tokensJson) return [];
        
        const tokens = JSON.parse(tokensJson);
        return tokens.filter(token => !token.used);
    }
    
    // Get all tokens (active + used)
    function getAllTokens() {
        const tokensJson = localStorage.getItem(TOKEN_STORAGE_KEY);
        return tokensJson ? JSON.parse(tokensJson) : [];
    }
    
    // Validate a token
    function validateToken(tokenCode) {
        const tokensJson = localStorage.getItem(TOKEN_STORAGE_KEY);
        if (!tokensJson) {
            console.log(`❌ Token validation failed: No tokens found`);
            return null;
        }
        
        const tokens = JSON.parse(tokensJson);
        const token = tokens.find(t => t.code === tokenCode && !t.used);
        
        if (token) {
            console.log(`✅ Token valid: ${tokenCode} (${token.count} TCR)`);
            return {
                code: token.code,
                count: token.count
            };
        } else {
            console.log(`❌ Token invalid atau sudah digunakan: ${tokenCode}`);
            return null;
        }
    }
    
    // Mark a token as used
    function markTokenAsUsed(tokenCode) {
        const tokensJson = localStorage.getItem(TOKEN_STORAGE_KEY);
        if (!tokensJson) {
            console.log(`❌ Failed to mark token as used: No tokens found`);
            return false;
        }
        
        const tokens = JSON.parse(tokensJson);
        const tokenIndex = tokens.findIndex(t => t.code === tokenCode);
        
        if (tokenIndex !== -1) {
            tokens[tokenIndex].used = true;
            tokens[tokenIndex].usedAt = new Date().toISOString();
            localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens));
            
            // Add to used tokens list
            const usedTokensJson = localStorage.getItem(USED_TOKENS_KEY);
            const usedTokens = usedTokensJson ? JSON.parse(usedTokensJson) : [];
            usedTokens.push({
                code: tokenCode,
                count: tokens[tokenIndex].count,
                usedAt: new Date().toISOString()
            });
            localStorage.setItem(USED_TOKENS_KEY, JSON.stringify(usedTokens));
            
            console.log(`🔐 Token digunakan: ${tokenCode}`);
            console.log(`📉 Sisa token aktif: ${getActiveTokens().length}`);
            
            return true;
        }
        
        console.log(`❌ Token tidak ditemukan: ${tokenCode}`);
        return false;
    }
    
    // Get used tokens
    function getUsedTokens() {
        const usedTokensJson = localStorage.getItem(USED_TOKENS_KEY);
        return usedTokensJson ? JSON.parse(usedTokensJson) : [];
    }
    
    // Get token statistics
    function getTokenStats() {
        const activeTokens = getActiveTokens();
        const usedTokens = getUsedTokens();
        
        return {
            active: activeTokens.length,
            used: usedTokens.length,
            total: activeTokens.length + usedTokens.length
        };
    }
    
    // Manual token generation (for testing)
    function manualGenerateTokens() {
        console.log('🔄 Manual token generation triggered...');
        generateTokens();
        localStorage.setItem(LAST_GENERATION_KEY, Date.now().toString());
        init(); // Re-initialize to log new tokens
    }
    
    // Check token status
    function checkTokenStatus() {
        const stats = getTokenStats();
        const activeTokens = getActiveTokens();
        
        console.log('🔍 TOKEN STATUS CHECK:');
        console.log(`   📦 Total Token: ${stats.total}`);
        console.log(`   ✅ Aktif: ${stats.active}`);
        console.log(`   ❌ Terpakai: ${stats.used}`);
        
        // Show token distribution
        const distribution = {};
        activeTokens.forEach(token => {
            if (!distribution[token.count]) {
                distribution[token.count] = 0;
            }
            distribution[token.count]++;
        });
        
        console.log('📊 Distribusi Token Aktif:');
        Object.keys(distribution).sort((a, b) => a - b).forEach(count => {
            console.log(`   ${count} TCR: ${distribution[count]} token`);
        });
        
        return stats;
    }
    
    // Initialize on load
    // Delay initialization to ensure everything is loaded
    setTimeout(() => {
        init();
    }, 1000);
    
    // Public API
    return {
        validateToken,
        markTokenAsUsed,
        getActiveTokens,
        getUsedTokens,
        getTokenStats,
        getAllTokens,
        manualGenerateTokens,
        checkTokenStatus,
        init
    };
})();

// Export for Node.js environment (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.tokenSystem;
                                 }
