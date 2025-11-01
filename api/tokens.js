// API untuk generate token - ini akan dijalankan di server side
export default function handler(req, res) {
  if (req.method === 'GET') {
    // Generate tokens sesuai permintaan
    const tokens = generateTokens();
    
    // Log ke console server (akan muncul di Zeabur runtime log)
    console.log('🎉 TOKEN BARU DI-GENERATE:');
    console.log('================================');
    
    // Group tokens by count
    const tokensByCount = {};
    tokens.forEach(token => {
      if (!tokensByCount[token.count]) {
        tokensByCount[token.count] = [];
      }
      tokensByCount[token.count].push(token.code);
    });
    
    // Log berdasarkan kategori
    Object.keys(tokensByCount).sort((a, b) => a - b).forEach(count => {
      const tokenList = tokensByCount[count];
      console.log(`📦 ${tokenList.length} token berisi ${count} TCR:`);
      tokenList.forEach((token, index) => {
        console.log(`   ${index + 1}. ${token}`);
      });
    });
    
    console.log('================================');
    console.log(`📊 TOTAL: ${tokens.length} token aktif`);
    
    res.status(200).json({ 
      success: true, 
      tokens: tokens,
      generatedAt: new Date().toISOString()
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

function generateTokens() {
  const TOKEN_CONFIG = [
    { count: 5, quantity: 50 },
    { count: 30, quantity: 20 },
    { count: 80, quantity: 10 },
    { count: 150, quantity: 10 }
  ];
  
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
  
  return shuffleArray(tokens);
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
