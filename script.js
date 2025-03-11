class PasswordGenerator {
    constructor() {
        this.characters = {
            uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            lowercase: 'abcdefghijklmnopqrstuvwxyz',
            numbers: '0123456789',
            symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
        };
        
        this.initEventListeners();
    }
    
    initEventListeners() {
        const generateBtn = document.getElementById('generate');
        const copyBtn = document.getElementById('copy');
        const lengthInput = document.getElementById('length');
        
        generateBtn.addEventListener('click', () => this.generatePassword());
        copyBtn.addEventListener('click', () => this.copyToClipboard());
        lengthInput.addEventListener('input', () => this.generatePassword());
        
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
        this.updateStrengthMeter(this.calculateStrength(password));
    }
    
    calculateStrength(password) {
        let score = 0;
        const length = password.length;
        
        if (length >= 8) score += 25;
        if (length >= 12) score += 25;
        
        if (/[a-z]/.test(password)) score += 10;
        if (/[A-Z]/.test(password)) score += 10;
        if (/[0-9]/.test(password)) score += 10;
        if (/[^A-Za-z0-9]/.test(password)) score += 20;
        
        return Math.min(score, 100);
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
}

document.addEventListener('DOMContentLoaded', () => {
    new PasswordGenerator();
});