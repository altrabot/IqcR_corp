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
const qrisImage = document.getElementById('qris-image');

// State Management
let currentUser = null;
let remainingTokens = 0;

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 IQC Generator Started');
    
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
    
    // Force token system initialization
    if (window.tokenSystem && window.tokenSystem.init) {
        setTimeout(() => {
            window.tokenSystem.init();
        }, 2000);
    }
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
        
        updateGenerateButton();
    }
}

function showDonatePage() {
    loginPage.classList.remove('active');
    mainPage.classList.remove('active');
    donatePage.classList.add('active');
    
    // Pastikan gambar QRIS dimuat
    if (qrisImage) {
        qrisImage.onerror = function() {
            console.log('QRIS image failed to load, using placeholder');
            this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmZmYiLz48cGF0aCBkPSJNNTAgNzVIMTUwVjEyNUg1MFY3NVoiIGZpbGw9IiMyNWQzNjYiLz48L3N2Zz4=';
        };
    }
}

function handleLogin(e) {
    e.preventDefault();
    
    const username = usernameInput.value.trim();
    const token = tokenInput.value.trim().toUpperCase();
    
    if (!username || !token) {
        showError('Harap isi semua field');
        return;
    }
    
    if (!isValidTokenFormat(token)) {
        showError('Format token tidak valid. Format: TCR-xxxxx-XX');
        return;
    }
    
    const tokenData = validateToken(token);
    
    if (!tokenData) {
        showError('Token salah atau sudah digunakan.');
        return;
    }
    
    // Login successful
    currentUser = username;
    remainingTokens = tokenData.count;
    
    localStorage.setItem('iqc_user', currentUser);
    localStorage.setItem('iqc_tokens', remainingTokens.toString());
    
    markTokenAsUsed(token);
    
    showMainPage();
    
    usernameInput.value = '';
    tokenInput.value = '';
}

function handleGenerateScreenshot(e) {
    e.preventDefault();
    
    if (remainingTokens <= 0) {
        showPopup('Token Habis', 'Token TCR kamu sudah habis. Silakan order token baru untuk dapat menggunakan fitur generate screenshot.', 'error');
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
    
    if (!isValidTimeFormat(time)) {
        showError('Format jam tidak valid. Gunakan format: HH:MM (contoh: 21:18)');
        return;
    }
    
    // Show loading state
    generateBtn.innerHTML = '<span class="loading"></span> Generating...';
    generateBtn.disabled = true;
    
    // Simulate processing delay
    setTimeout(() => {
        generateScreenshot(chatText, time, network, battery);
        
        // Decrease token count
        remainingTokens--;
        localStorage.setItem('iqc_tokens', remainingTokens.toString());
        tokenCountDisplay.textContent = remainingTokens;
        
        updateGenerateButton();
        
        resultContainer.classList.remove('hidden');
        
        // Scroll to result
        resultContainer.scrollIntoView({ behavior: 'smooth' });
        
        // Reset button
        generateBtn.innerHTML = 'Generate Screenshot';
        generateBtn.disabled = false;
        
        console.log(`📸 Screenshot generated by: ${currentUser}`);
        console.log(`📉 Sisa TCR: ${remainingTokens}`);
    }, 1000);
}

function handleOrderToken() {
    window.open('https://wa.me/6283131871328', '_blank');
}

function updateBatteryDisplay() {
    const batteryValue = batteryInput.value;
    batteryPercent.textContent = `${batteryValue}%`;
    batteryLevel.style.width = `${batteryValue}%`;
    
    if (batteryValue <= 20) {
        batteryLevel.style.backgroundColor = '#ff3b30';
    } else if (batteryValue <= 50) {
        batteryLevel.style.backgroundColor = '#ff9500';
    } else {
        batteryLevel.style.backgroundColor = '#4cd964';
    }
}

function updateGenerateButton() {
    if (remainingTokens <= 0) {
        generateBtn.disabled = true;
        generateBtn.textContent = 'Token Habis - Order Sekarang';
        generateBtn.style.background = '#666';
    } else {
        generateBtn.disabled = false;
        generateBtn.textContent = 'Generate Screenshot';
        generateBtn.style.background = '';
    }
}

function generateScreenshot(chatText, time, network, battery) {
    // Clear previous screenshot
    screenshotContainer.innerHTML = '';
    
    // Create WhatsApp screenshot container
    const screenshot = document.createElement('div');
    screenshot.className = 'whatsapp-screenshot';
    
    // iPhone notch
    const notch = document.createElement('div');
    notch.className = 'iphone-notch';
    screenshot.appendChild(notch);
    
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
    batteryDisplay.style.fontWeight = '600';
    
    statusIcons.appendChild(networkDisplay);
    statusIcons.appendChild(batteryDisplay);
    
    statusBar.appendChild(timeDisplay);
    statusBar.appendChild(statusIcons);
    
    // WhatsApp header
    const header = document.createElement('div');
    header.className = 'whatsapp-header';
    
    const avatar = document.createElement('div');
    avatar.className = 'contact-avatar';
    avatar.textContent = '😊';
    
    const contactInfo = document.createElement('div');
    contactInfo.className = 'contact-info';
    
    const contactName = document.createElement('div');
    contactName.className = 'contact-name';
    contactName.textContent = 'Teman WhatsApp';
    
    const contactStatus = document.createElement('div');
    contactStatus.className = 'contact-status';
    contactStatus.textContent = 'online';
    
    contactInfo.appendChild(contactName);
    contactInfo.appendChild(contactStatus);
    
    header.appendChild(avatar);
    header.appendChild(contactInfo);
    
    // Chat container
    const chatContainer = document.createElement('div');
    chatContainer.className = 'chat-container';
    
    // Received message bubble
    const chatBubble = document.createElement('div');
    chatBubble.className = 'chat-bubble received';
    
    const messageText = document.createElement('div');
    messageText.style.marginBottom = '5px';
    messageText.textContent = chatText;
    
    const messageTime = document.createElement('div');
    messageTime.className = 'chat-time';
    messageTime.textContent = time;
    
    // Reactions
    const reactions = document.createElement('div');
    reactions.className = 'reactions';
    reactions.innerHTML = getRandomReaction();
    
    chatBubble.appendChild(messageText);
    chatBubble.appendChild(messageTime);
    chatBubble.appendChild(reactions);
    
    chatContainer.appendChild(chatBubble);
    
    // Assemble everything
    screenshot.appendChild(statusBar);
    screenshot.appendChild(header);
    screenshot.appendChild(chatContainer);
    
    screenshotContainer.appendChild(screenshot);
}

function getRandomReaction() {
    const reactions = ['👍', '❤️', '😂', '😮', '😢', '🙏', '🔥', '👏'];
    const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
    return randomReaction;
}

function downloadScreenshot() {
    showPopup('Fitur Download', 'Fitur download screenshot akan segera tersedia. Saat ini Anda bisa screenshot manual dengan tombol print screen di device Anda.', 'info');
}

function shareScreenshot() {
    showPopup('Fitur Share', 'Fitur berbagi screenshot akan segera tersedia. Saat ini Anda bisa screenshot manual dan membagikannya ke media sosial.', 'info');
}

function showError(message) {
    loginError.textContent = message;
    loginError.style.display = 'block';
    
    setTimeout(() => {
        loginError.style.display = 'none';
    }, 5000);
}

// Custom Popup Function
function showPopup(title, message, type = 'info') {
    // Remove existing popup
    const existingPopup = document.getElementById('custom-popup');
    if (existingPopup) {
        existingPopup.remove();
    }
    
    // Create popup overlay
    const popupOverlay = document.createElement('div');
    popupOverlay.className = 'popup-overlay';
    popupOverlay.id = 'custom-popup';
    
    // Create popup content
    const popupContent = document.createElement('div');
    popupContent.className = 'popup-content';
    
    // Set icon based on type
    let icon = 'ℹ️';
    let titleColor = '#25d366';
    
    if (type === 'error') {
        icon = '❌';
        titleColor = '#ff4444';
    } else if (type === 'warning') {
        icon = '⚠️';
        titleColor = '#ff9500';
    } else if (type === 'success') {
        icon = '✅';
        titleColor = '#25d366';
    }
    
    popupContent.innerHTML = `
        <div class="popup-icon">${icon}</div>
        <div class="popup-title" style="color: ${titleColor}">${title}</div>
        <div class="popup-message">${message}</div>
        <div class="popup-actions">
            <button class="btn-primary" onclick="closePopup()">Mengerti</button>
            ${type === 'error' ? '<button class="btn-secondary" onclick="handleOrderToken(); closePopup()">Order Token</button>' : ''}
        </div>
    `;
    
    popupOverlay.appendChild(popupContent);
    document.body.appendChild(popupOverlay);
    
    // Show popup
    setTimeout(() => {
        popupOverlay.style.display = 'flex';
    }, 100);
    
    // Close on overlay click
    popupOverlay.addEventListener('click', function(e) {
        if (e.target === popupOverlay) {
            closePopup();
        }
    });
}

function closePopup() {
    const popup = document.getElementById('custom-popup');
    if (popup) {
        popup.remove();
    }
}

function isValidTokenFormat(token) {
    const tokenRegex = /^TCR-[A-Z0-9]{5}-[0-9]{2}$/;
    return tokenRegex.test(token);
}

function isValidTimeFormat(time) {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
}

// Token validation functions
function validateToken(token) {
    if (window.tokenSystem && window.tokenSystem.validateToken) {
        return window.tokenSystem.validateToken(token);
    } else {
        console.error('Token system not available');
        return null;
    }
}

function markTokenAsUsed(token) {
    if (window.tokenSystem && window.tokenSystem.markTokenAsUsed) {
        return window.tokenSystem.markTokenAsUsed(token);
    } else {
        console.error('Token system not available');
        return false;
    }
}

// Make functions globally available for onclick events
window.handleOrderToken = handleOrderToken;
window.closePopup = closePopup;
