// Token System for IQC Generator - Updated with API
window.tokenSystem = (function() {
    const TOKEN_STORAGE_KEY = 'iqc_tokens_data';
    const USED_TOKENS_KEY = 'iqc_used_tokens';
    const LAST_GENERATION_KEY = 'iqc_last_generation';
    
    const TOKEN_CONFIG = [
        { count: 5, quantity: 50 },
        { count: 30, quantity: 20 },
        { count: 80, quantity: 10 },
        { count: 150, quantity: 10 }
    ];
    
    async function init() {
        console.log('🔧 IQC Generator Token System Initializing...');
        
        const now = Date.now();
        const lastGeneration = localStorage.getItem(LAST_GENERATION_KEY);
        const oneDayInMs = 24 * 60 * 60 * 1000;
        
        if (!lastGeneration || (now - parseInt(lastGeneration)) > oneDayInMs) {
            console.log('🔄 Generating new tokens (24-hour cycle)...');
            
            try {
                // Coba panggil API server untuk generate token
                const response = await fetch('/api/tokens/generate');
                if (response.ok) {
                    const data = await response.json();
                    console.log('✅ Tokens generated via API');
                    saveTokensToLocalStorage(data.tokens);
                } else {
                    // Fallback ke client-side generation
                    console.log('⚠️ API unavailable, using client-side generation');
                    generateTokensClientSide();
                }
            } catch (error) {
                // Fallback ke client-side generation
                console.log('⚠️ API error, using client-side generation');
                generateTokensClientSide();
            }
            
            localStorage.setItem(LAST_GENERATION_KEY, now.toString());
        } else {
            const nextGeneration = parseInt(lastGeneration) + oneDayInMs;
            const timeUntilNextGen = nextGeneration - now;
            const hoursLeft = Math.floor(timeUntilNextGen / (60 * 60 * 1000));
            const minutesLeft = Math.floor((timeUntilNextGen % (60 * 60 * 1000)) / (60 * 1000));
            
            console.log(`⏰ Token generation akan reset dalam: ${hoursLeft} jam ${minutesLeft} menit`);
        }
        
        // Log token stats
        const stats = getTokenStats();
        console.log('📊 TOKEN STATS:');
        console.log(`   ✅ Aktif: ${stats.active} token`);
        console.log(`   ❌ Terpakai: ${stats.used} token`);
    }
    
    function generateTokensClientSide() {
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
        
        shuffleArray(tokens);
        saveTokensToLocalStorage(tokens);
        
        // Client-side log (hanya muncul di browser console)
        console.log('🎉 TOKEN BARU DI-GENERATE (Client-side):');
        const tokensByCount = {};
        tokens.forEach(token => {
            if (!tokensByCount[token.count]) tokensByCount[token.count] = [];
            tokensByCount[token.count].push(token.code);
        });
        
        Object.keys(tokensByCount).sort((a, b) => a - b).forEach(count => {
            console.log(`📦 ${tokensByCount[count].length} token berisi ${count} TCR`);
        });
    }
    
    function saveTokensToLocalStorage(tokens) {
        localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens));
        if (!localStorage.getItem(USED_TOKENS_KEY)) {
            localStorage.setItem(USED_TOKENS_KEY, JSON.stringify([]));
        }
    }
    
    function generateTokenCode(count) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let randomPart = '';
        for (let i = 0; i < 5; i++) {
            randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        const countPart = count.toString().padStart(2, '0');
        return `TCR-${randomPart}-${countPart}`;
    }
    
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    function getActiveTokens() {
        const tokensJson = localStorage.getItem(TOKEN_STORAGE_KEY);
        if (!tokensJson) return [];
        const tokens = JSON.parse(tokensJson);
        return tokens.filter(token => !token.used);
    }
    
    function validateToken(tokenCode) {
        const tokensJson = localStorage.getItem(TOKEN_STORAGE_KEY);
        if (!tokensJson) return null;
        
        const tokens = JSON.parse(tokensJson);
        const token = tokens.find(t => t.code === tokenCode && !t.used);
        
        if (token) {
            console.log(`✅ Token valid: ${tokenCode} (${token.count} TCR)`);
            return { code: token.code, count: token.count };
        }
        
        return null;
    }
    
    function markTokenAsUsed(tokenCode) {
        const tokensJson = localStorage.getItem(TOKEN_STORAGE_KEY);
        if (!tokensJson) return false;
        
        const tokens = JSON.parse(tokensJson);
        const tokenIndex = tokens.findIndex(t => t.code === tokenCode);
        
        if (tokenIndex !== -1) {
            tokens[tokenIndex].used = true;
            tokens[tokenIndex].usedAt = new Date().toISOString();
            localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens));
            
            const usedTokensJson = localStorage.getItem(USED_TOKENS_KEY);
            const usedTokens = usedTokensJson ? JSON.parse(usedTokensJson) : [];
            usedTokens.push({
                code: tokenCode,
                count: tokens[tokenIndex].count,
                usedAt: new Date().toISOString()
            });
            localStorage.setItem(USED_TOKENS_KEY, JSON.stringify(usedTokens));
            
            console.log(`🔐 Token digunakan: ${tokenCode}`);
            return true;
        }
        
        return false;
    }
    
    function getTokenStats() {
        const activeTokens = getActiveTokens();
        const usedTokens = getUsedTokens();
        return {
            active: activeTokens.length,
            used: usedTokens.length,
            total: activeTokens.length + usedTokens.length
        };
    }
    
    function getUsedTokens() {
        const usedTokensJson = localStorage.getItem(USED_TOKENS_KEY);
        return usedTokensJson ? JSON.parse(usedTokensJson) : [];
    }
    
    // Manual trigger untuk testing
    async function manualGenerateTokens() {
        console.log('🔄 Manual token generation triggered...');
        localStorage.removeItem(LAST_GENERATION_KEY);
        await init();
    }
    
    // Initialize
    setTimeout(() => {
        init();
    }, 1000);
    
    return {
        validateToken,
        markTokenAsUsed,
        getActiveTokens,
        getTokenStats,
        manualGenerateTokens,
        init
    };
})();
