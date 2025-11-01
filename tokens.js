// Token System for IQC Generator
window.tokenSystem = (function() {
    // Token storage key for localStorage
    const TOKEN_STORAGE_KEY = 'iqc_tokens_data';
    const USED_TOKENS_KEY = 'iqc_used_tokens';
    const LAST_GENERATION_KEY = 'iqc_last_generation';
    
    // Token configuration
    const TOKEN_CONFIG = [
        { count: 5, quantity: 50 },
        { count: 30, quantity: 20 },
        { count: 80, quantity: 10 },
        { count: 150, quantity: 10 }
    ];
    
    // Initialize token system
    function init() {
        const now = Date.now();
        const lastGeneration = localStorage.getItem(LAST_GENERATION_KEY);
        const oneDayInMs = 24 * 60 * 60 * 1000;
        
        // Generate new tokens if it's the first time or if 24 hours have passed
        if (!lastGeneration || (now - parseInt(lastGeneration)) > oneDayInMs) {
            generateTokens();
            localStorage.setItem(LAST_GENERATION_KEY, now.toString());
            console.log('Token baru telah di-generate:', getActiveTokens());
        }
        
        // Log active tokens to console
        console.log('Token aktif:', getActiveTokens());
    }
    
    // Generate tokens based on configuration
    function generateTokens() {
        const tokens = [];
        
        TOKEN_CONFIG.forEach(config => {
            for (let i = 0; i < config.quantity; i++) {
                const token = {
                    code: generateTokenCode(config.count),
                    count: config.count,
                    used: false
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
    
    // Validate a token
    function validateToken(tokenCode) {
        const tokensJson = localStorage.getItem(TOKEN_STORAGE_KEY);
        if (!tokensJson) return null;
        
        const tokens = JSON.parse(tokensJson);
        const token = tokens.find(t => t.code === tokenCode && !t.used);
        
        if (token) {
            return {
                code: token.code,
                count: token.count
            };
        }
        
        return null;
    }
    
    // Mark a token as used
    function markTokenAsUsed(tokenCode) {
        const tokensJson = localStorage.getItem(TOKEN_STORAGE_KEY);
        if (!tokensJson) return false;
        
        const tokens = JSON.parse(tokensJson);
        const tokenIndex = tokens.findIndex(t => t.code === tokenCode);
        
        if (tokenIndex !== -1) {
            tokens[tokenIndex].used = true;
            localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens));
            
            // Add to used tokens list
            const usedTokensJson = localStorage.getItem(USED_TOKENS_KEY);
            const usedTokens = usedTokensJson ? JSON.parse(usedTokensJson) : [];
            usedTokens.push({
                code: tokenCode,
                usedAt: new Date().toISOString()
            });
            localStorage.setItem(USED_TOKENS_KEY, JSON.stringify(usedTokens));
            
            return true;
        }
        
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
    
    // Initialize on load
    init();
    
    // Public API
    return {
        validateToken,
        markTokenAsUsed,
        getActiveTokens,
        getUsedTokens,
        getTokenStats
    };
})();
