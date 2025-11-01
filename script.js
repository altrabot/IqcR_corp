// DOM Elements
const loginPage = document.getElementById('login-page');
const mainPage = document.getElementById('main-page');
const donatePage = document.getElementById('donate-page');
const loginForm = document.getElementById('login-form');
const chatForm = document.getElementById('chat-form');
const usernameInput = document.getElementById('username');
const tokenInput = document.getElementById('token');
const userNameDisplay = document.getElementById('user-name');
const tokenCountDisplay = document.getElementById('token-count');
const chatTextInput = document.getElementById('chat-text');
const timeInput = document.getElementById('time');
const networkInput = document.getElementById('network');
const batteryInput = document.getElementById('battery');
const batteryPercent = document.getElementById('battery-percent');
const batteryLevel = document.getElementById('battery-level');
const generateBtn = document.getElementById('generate-btn');
const donateBtn = document.getElementById('donate-btn');
const orderBtn = document.getElementById('order-btn');
const backBtn = document.getElementById('back-btn');
const resultContainer = document.getElementById('result-container');
const screenshotContainer = document.getElementById('screenshot-container');
const downloadBtn = document.getElementById('download-btn');
const shareBtn = document.getElementById('share-btn');
const loginError = document.getElementById('login-error');

// State Management
let currentUser = null;
let remainingTokens = 0;

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('iqc_user');
    const savedTokens = localStorage.getItem('iqc_tokens');
    
    if (savedUser && savedTokens) {
        currentUser = savedUser;
        remainingTokens = parseInt(savedTokens);
        showMainPage();
    } else {
        showLoginPage();
    }
    
    // Initialize battery display
    updateBatteryDisplay();
});

// Event Listeners
loginForm.addEventListener('submit', handleLogin);
chatForm.addEventListener('submit', handleGenerateScreenshot);
donateBtn.addEventListener('click', showDonatePage);
orderBtn.addEventListener('click', handleOrderToken);
backBtn.addEventListener('click', showMainPage);
batteryInput.addEventListener('input', updateBatteryDisplay);
downloadBtn.addEventListener('click', downloadScreenshot);
shareBtn.addEventListener('click', shareScreenshot);

// Functions
function showLoginPage() {
    loginPage.classList.add('active');
    mainPage.classList.remove('active');
    donatePage.classList.remove('active');
}

function showMainPage() {
    loginPage.classList.remove('active');
    mainPage.classList.add('active');
    donatePage.classList.remove('active');
    
    if (currentUser) {
        userNameDisplay.textContent = currentUser;
        tokenCountDisplay.textContent = remainingTokens;
        
        // Disable generate button if no tokens left
        if (remainingTokens <= 0) {
            generateBtn.disabled = true;
            generateBtn.textContent = 'Token kamu sudah habis, silakan order ulang.';
        }
    }
}

function showDonatePage() {
    loginPage.classList.remove('active');
    mainPage.classList.remove('active');
    donatePage.classList.add('active');
}

function handleLogin(e) {
    e.preventDefault();
    
    const username = usernameInput.value.trim();
    const token = tokenInput.value.trim().toUpperCase();
    
    if (!username || !token) {
        showError('Harap isi semua field');
        return;
    }
    
    // Validate token format
    if (!isValidTokenFormat(token)) {
        showError('Format token tidak valid. Format: TCR-xxxxx-XX');
        return;
    }
    
    // Check if token exists and is valid
    const tokenData = validateToken(token);
    
    if (!tokenData) {
        showError('Token salah atau sudah digunakan.');
        return;
    }
    
    // Login successful
    currentUser = username;
    remainingTokens = tokenData.count;
    
    // Save to localStorage
    localStorage.setItem('iqc_user', currentUser);
    localStorage.setItem('iqc_tokens', remainingTokens.toString());
    
    // Mark token as used
    markTokenAsUsed(token);
    
    // Show main page
    showMainPage();
    
    // Clear form
    usernameInput.value = '';
    tokenInput.value = '';
}

function handleGenerateScreenshot(e) {
    e.preventDefault();
    
    if (remainingTokens <= 0) {
        showError('Token kamu sudah habis, silakan order ulang.');
        return;
    }
    
    const chatText = chatTextInput.value.trim();
    const time = timeInput.value.trim();
    const network = networkInput.value.trim();
    const battery = batteryInput.value;
    
    if (!chatText || !time || !network) {
        showError('Harap isi semua field');
        return;
    }
    
    // Generate screenshot
    generateScreenshot(chatText, time, network, battery);
    
    // Decrease token count
    remainingTokens--;
    localStorage.setItem('iqc_tokens', remainingTokens.toString());
    tokenCountDisplay.textContent = remainingTokens;
    
    // Disable generate button if no tokens left
    if (remainingTokens <= 0) {
        generateBtn.disabled = true;
        generateBtn.textContent = 'Token kamu sudah habis, silakan order ulang.';
    }
    
    // Show result container
    resultContainer.classList.remove('hidden');
}

function handleOrderToken() {
    window.open('https://wa.me/6283131871328', '_blank');
}

function updateBatteryDisplay() {
    const batteryValue = batteryInput.value;
    batteryPercent.textContent = `${batteryValue}%`;
    batteryLevel.style.width = `${batteryValue}%`;
    
    // Change color based on battery level
    if (batteryValue <= 20) {
        batteryLevel.style.backgroundColor = '#ff3b30';
    } else if (batteryValue <= 50) {
        batteryLevel.style.backgroundColor = '#ff9500';
    } else {
        batteryLevel.style.backgroundColor = '#4cd964';
    }
}

function generateScreenshot(chatText, time, network, battery) {
    // Clear previous screenshot
    screenshotContainer.innerHTML = '';
    
    // Create WhatsApp screenshot
    const screenshot = document.createElement('div');
    screenshot.className = 'whatsapp-screenshot';
    
    // Status bar
    const statusBar = document.createElement('div');
    statusBar.className = 'status-bar';
    
    const timeDisplay = document.createElement('div');
    timeDisplay.className = 'time';
    timeDisplay.textContent = time;
    
    const statusIcons = document.createElement('div');
    statusIcons.className = 'status-icons';
    
    const networkDisplay = document.createElement('span');
    networkDisplay.textContent = network;
    
    const batteryDisplay = document.createElement('span');
    batteryDisplay.textContent = `${battery}%`;
    
    statusIcons.appendChild(networkDisplay);
    statusIcons.appendChild(batteryDisplay);
    
    statusBar.appendChild(timeDisplay);
    statusBar.appendChild(statusIcons);
    
    // Chat container
    const chatContainer = document.createElement('div');
    chatContainer.className = 'chat-container';
    
    // Chat bubble (received message)
    const chatBubble = document.createElement('div');
    chatBubble.className = 'chat-bubble received';
    
    const messageText = document.createElement('div');
    messageText.textContent = chatText;
    
    const messageTime = document.createElement('div');
    messageTime.className = 'chat-time';
    messageTime.textContent = time;
    
    // Reactions (random emoji)
    const reactions = document.createElement('div');
    reactions.className = 'reactions';
    reactions.innerHTML = getRandomReaction();
    
    chatBubble.appendChild(messageText);
    chatBubble.appendChild(messageTime);
    chatBubble.appendChild(reactions);
    
    chatContainer.appendChild(chatBubble);
    
    // Assemble screenshot
    screenshot.appendChild(statusBar);
    screenshot.appendChild(chatContainer);
    
    screenshotContainer.appendChild(screenshot);
}

function getRandomReaction() {
    const reactions = ['👍', '❤️', '😂', '😮', '😢', '🙏'];
    const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
    return randomReaction;
}

function downloadScreenshot() {
    // In a real implementation, you would use html2canvas or similar library
    // For this demo, we'll just show an alert
    alert('Fungsi download akan mengunduh gambar screenshot. Di implementasi nyata, gunakan library seperti html2canvas.');
    
    // Example implementation with html2canvas (uncomment when library is added):
    /*
    html2canvas(screenshotContainer).then(canvas => {
        const link = document.createElement('a');
        link.download = `whatsapp-screenshot-${Date.now()}.png`;
        link.href = canvas.toDataURL();
        link.click();
    });
    */
}

function shareScreenshot() {
    // In a real implementation, you would use the Web Share API
    // For this demo, we'll just show an alert
    alert('Fungsi share akan membagikan screenshot. Di implementasi nyata, gunakan Web Share API.');
    
    // Example implementation with Web Share API (uncomment when needed):
    /*
    if (navigator.share) {
        html2canvas(screenshotContainer).then(canvas => {
            canvas.toBlob(blob => {
                const file = new File([blob], 'whatsapp-screenshot.png', { type: 'image/png' });
                navigator.share({
                    files: [file],
                    title: 'WhatsApp Screenshot',
                    text: 'Check out this WhatsApp screenshot I created!'
                });
            });
        });
    } else {
        // Fallback for browsers that don't support Web Share API
        downloadScreenshot();
    }
    */
}

function showError(message) {
    loginError.textContent = message;
    loginError.style.display = 'block';
    
    // Hide error after 5 seconds
    setTimeout(() => {
        loginError.style.display = 'none';
    }, 5000);
}

function isValidTokenFormat(token) {
    const tokenRegex = /^TCR-[A-Z0-9]{5}-[0-9]{2}$/;
    return tokenRegex.test(token);
}

// Token validation functions (will be implemented in tokens.js)
function validateToken(token) {
    return window.tokenSystem.validateToken(token);
}

function markTokenAsUsed(token) {
    window.tokenSystem.markTokenAsUsed(token);
                                             }
