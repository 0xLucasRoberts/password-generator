class PasswordGenerator {
    constructor() {
        this.characters = {
            uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            lowercase: 'abcdefghijklmnopqrstuvwxyz',
            numbers: '0123456789',
            symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
        };
        
        this.passwordHistory = JSON.parse(localStorage.getItem('passwordHistory')) || [];
        this.maxHistorySize = 10;
        
        this.initEventListeners();
        this.updateHistoryDisplay();
    }
    
    initEventListeners() {
        const generateBtn = document.getElementById('generate');
        const copyBtn = document.getElementById('copy');
        const lengthInput = document.getElementById('length');
        const clearHistoryBtn = document.getElementById('clearHistory');
        const advancedToggle = document.getElementById('advancedToggle');
        const customCharsInput = document.getElementById('customChars');
        
        generateBtn.addEventListener('click', () => this.generatePassword());
        copyBtn.addEventListener('click', () => this.copyToClipboard());
        lengthInput.addEventListener('input', () => this.generatePassword());
        clearHistoryBtn.addEventListener('click', () => this.clearHistory());
        advancedToggle.addEventListener('click', () => this.toggleAdvancedOptions());
        customCharsInput.addEventListener('input', () => this.generatePassword());
        
        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => this.generatePassword());
        });
        
        this.generatePassword();
    }
    
    getSelectedCharacters() {
        let chars = '';
        
        if (document.getElementById('uppercase').checked) {
            chars += this.characters.uppercase;
        }
        if (document.getElementById('lowercase').checked) {
            chars += this.characters.lowercase;
        }
        if (document.getElementById('numbers').checked) {
            chars += this.characters.numbers;
        }
        if (document.getElementById('symbols').checked) {
            chars += this.characters.symbols;
        }
        
        const customChars = document.getElementById('customChars').value;
        if (customChars) {
            chars += customChars;
        }
        
        if (document.getElementById('excludeSimilar').checked) {
            chars = chars.replace(/[0O1lI]/g, '');
        }
        
        if (document.getElementById('excludeAmbiguous').checked) {
            chars = chars.replace(/[{}[\]()]/g, '');
        }
        
        return chars;
    }
    
    generatePassword() {
        const length = parseInt(document.getElementById('length').value);
        const characters = this.getSelectedCharacters();
        
        if (characters.length === 0) {
            document.getElementById('password').value = '请至少选择一种字符类型';
            this.updateStrengthMeter(0);
            return;
        }
        
        if (length < 4 || length > 128) {
            document.getElementById('password').value = '密码长度应在4-128之间';
            this.updateStrengthMeter(0);
            return;
        }
        
        let password = '';
        
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            password += characters[randomIndex];
        }
        
        document.getElementById('password').value = password;
        const strength = this.calculateStrength(password);
        this.updateStrengthMeter(strength);
        this.showSecurityTips(password, strength);
        this.addToHistory(password);
    }
    
    calculateStrength(password) {
        let score = 0;
        const length = password.length;
        
        if (length >= 8) score += 15;
        if (length >= 12) score += 15;
        if (length >= 16) score += 10;
        
        const hasLower = /[a-z]/.test(password);
        const hasUpper = /[A-Z]/.test(password);
        const hasNumbers = /[0-9]/.test(password);
        const hasSymbols = /[^A-Za-z0-9]/.test(password);
        
        if (hasLower) score += 10;
        if (hasUpper) score += 10;
        if (hasNumbers) score += 10;
        if (hasSymbols) score += 15;
        
        const charTypes = [hasLower, hasUpper, hasNumbers, hasSymbols].filter(Boolean).length;
        if (charTypes >= 3) score += 10;
        if (charTypes === 4) score += 5;
        
        if (this.hasRepeatedChars(password)) score -= 10;
        if (this.hasSequentialChars(password)) score -= 10;
        
        return Math.max(0, Math.min(score, 100));
    }
    
    hasRepeatedChars(password) {
        const repeatedPattern = /(.)\1{2,}/;
        return repeatedPattern.test(password);
    }
    
    hasSequentialChars(password) {
        const sequences = ['123', 'abc', 'ABC', 'qwe', 'QWE'];
        return sequences.some(seq => password.toLowerCase().includes(seq));
    }
    
    updateStrengthMeter(strength) {
        const strengthFill = document.querySelector('.strength-fill');
        const strengthText = document.querySelector('.strength-text');
        
        strengthFill.style.width = strength + '%';
        
        if (strength < 30) {
            strengthFill.style.backgroundColor = '#dc3545';
            strengthText.textContent = '密码强度: 弱';
        } else if (strength < 60) {
            strengthFill.style.backgroundColor = '#ffc107';
            strengthText.textContent = '密码强度: 中等';
        } else if (strength < 80) {
            strengthFill.style.backgroundColor = '#28a745';
            strengthText.textContent = '密码强度: 强';
        } else {
            strengthFill.style.backgroundColor = '#17a2b8';
            strengthText.textContent = '密码强度: 很强';
        }
    }
    
    copyToClipboard() {
        const passwordField = document.getElementById('password');
        const copyBtn = document.getElementById('copy');
        
        if (passwordField.value && !passwordField.value.includes('请') && !passwordField.value.includes('密码长度')) {
            navigator.clipboard.writeText(passwordField.value).then(() => {
                const originalText = copyBtn.textContent;
                copyBtn.textContent = '已复制!';
                copyBtn.style.backgroundColor = '#28a745';
                
                setTimeout(() => {
                    copyBtn.textContent = originalText;
                    copyBtn.style.backgroundColor = '#28a745';
                }, 2000);
            }).catch(err => {
                passwordField.select();
                document.execCommand('copy');
                
                const originalText = copyBtn.textContent;
                copyBtn.textContent = '已复制!';
                
                setTimeout(() => {
                    copyBtn.textContent = originalText;
                }, 2000);
            });
        }
    }
    
    showSecurityTips(password, strength) {
        const tipsElement = document.getElementById('securityTips');
        let tips = [];
        
        if (strength < 50) {
            if (password.length < 12) {
                tips.push('建议密码长度至少12位');
            }
            
            const hasLower = /[a-z]/.test(password);
            const hasUpper = /[A-Z]/.test(password);
            const hasNumbers = /[0-9]/.test(password);
            const hasSymbols = /[^A-Za-z0-9]/.test(password);
            
            if (!hasLower) tips.push('添加小写字母可提高安全性');
            if (!hasUpper) tips.push('添加大写字母可提高安全性');
            if (!hasNumbers) tips.push('添加数字可提高安全性');
            if (!hasSymbols) tips.push('添加特殊符号可显著提高安全性');
            
            if (this.hasRepeatedChars(password)) {
                tips.push('避免连续重复字符');
            }
            
            if (this.hasSequentialChars(password)) {
                tips.push('避免使用键盘序列或字母序列');
            }
        }
        
        if (tips.length > 0) {
            tipsElement.innerHTML = `<strong>安全建议：</strong><br>${tips.join('<br>')}`;
            tipsElement.className = 'security-tips show';
        } else {
            tipsElement.className = 'security-tips';
        }
    }
    
    addToHistory(password) {
        if (this.passwordHistory.includes(password)) {
            return;
        }
        
        this.passwordHistory.unshift(password);
        
        if (this.passwordHistory.length > this.maxHistorySize) {
            this.passwordHistory.pop();
        }
        
        localStorage.setItem('passwordHistory', JSON.stringify(this.passwordHistory));
        this.updateHistoryDisplay();
    }
    
    updateHistoryDisplay() {
        const historyList = document.getElementById('historyList');
        
        if (this.passwordHistory.length === 0) {
            historyList.innerHTML = '<p class="no-history">暂无历史记录</p>';
            return;
        }
        
        historyList.innerHTML = this.passwordHistory.map(password => `
            <div class="history-item">
                <span class="history-password">${password}</span>
                <button class="history-copy" onclick="navigator.clipboard.writeText('${password}')">复制</button>
            </div>
        `).join('');
    }
    
    clearHistory() {
        this.passwordHistory = [];
        localStorage.removeItem('passwordHistory');
        this.updateHistoryDisplay();
        
        const clearBtn = document.getElementById('clearHistory');
        const originalText = clearBtn.textContent;
        clearBtn.textContent = '已清空';
        clearBtn.style.backgroundColor = '#6c757d';
        
        setTimeout(() => {
            clearBtn.textContent = originalText;
            clearBtn.style.backgroundColor = '#dc3545';
        }, 1500);
    }
    
    toggleAdvancedOptions() {
        const panel = document.getElementById('advancedPanel');
        const toggle = document.getElementById('advancedToggle');
        
        if (panel.classList.contains('expanded')) {
            panel.classList.remove('expanded');
            toggle.textContent = '高级选项 ▼';
        } else {
            panel.classList.add('expanded');
            toggle.textContent = '高级选项 ▲';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new PasswordGenerator();
});