import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(__dirname));

// API route untuk tokens
app.get('/api/tokens/generate', (req, res) => {
  console.log('🔄 API Token Generation Called');
  
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
  
  // Log ke console server (INI YANG AKAN MUNCUL DI ZEABUR RUNTIME LOG)
  console.log('🎉 TOKEN BARU DI-GENERATE:');
  console.log('================================');
  
  const tokensByCount = {};
  tokens.forEach(token => {
    if (!tokensByCount[token.count]) {
      tokensByCount[token.count] = [];
    }
    tokensByCount[token.count].push(token.code);
  });
  
  Object.keys(tokensByCount).sort((a, b) => a - b).forEach(count => {
    const tokenList = tokensByCount[count];
    console.log(`📦 ${tokenList.length} token berisi ${count} TCR:`);
    tokenList.forEach((token, index) => {
      console.log(`   ${index + 1}. ${token}`);
    });
  });
  
  console.log('================================');
  console.log(`📊 TOTAL: ${tokens.length} token aktif`);
  console.log(`🕐 Generated at: ${new Date().toISOString()}`);
  
  res.json({ 
    success: true, 
    tokens: tokens,
    generatedAt: new Date().toISOString(),
    message: 'Token berhasil di-generate dan tercatat di server log'
  });
});

// Serve index.html untuk semua route lainnya
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

function generateTokenCode(count) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomPart = '';
  
  for (let i = 0; i < 5; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  const countPart = count.toString().padStart(2, '0');
  return `TCR-${randomPart}-${countPart}`;
}

app.listen(PORT, () => {
  console.log('🚀 IQC Generator Server Started');
  console.log(`📍 Server running on port ${PORT}`);
  console.log('🔧 Token System Ready - Access /api/tokens/generate to generate tokens');
});
