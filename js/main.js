// ローカルストレージ操作のユーティリティ関数
const Storage = {
    // データの保存
    save: (key, data) => {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('データの保存に失敗しました:', error);
            return false;
        }
    },

    // データの取得
    load: (key) => {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('データの読み込みに失敗しました:', error);
            return null;
        }
    },

    // データの削除
    remove: (key) => {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('データの削除に失敗しました:', error);
            return false;
        }
    }
};

// 日付フォーマット用ユーティリティ
const DateUtils = {
    formatDate: (date) => {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    // 日付の差分を計算（日数）
    getDaysDiff: (date1, date2) => {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        const diffTime = Math.abs(d2 - d1);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
};

// アラート表示用ユーティリティ
const Alert = {
    show: (message, type = 'success') => {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type}`;
        alertDiv.textContent = message;

        // 既存のアラートがあれば削除
        const existingAlert = document.querySelector('.alert');
        if (existingAlert) {
            existingAlert.remove();
        }

        // アラートを表示
        document.body.insertBefore(alertDiv, document.body.firstChild);

        // 3秒後に自動的に消える
        setTimeout(() => {
            alertDiv.remove();
        }, 3000);
    }
};

// フォームバリデーション用ユーティリティ
const Validator = {
    required: (value) => {
        return value !== null && value !== undefined && value.toString().trim() !== '';
    },

    maxLength: (value, max) => {
        return value.toString().length <= max;
    },

    date: (value) => {
        return !isNaN(new Date(value).getTime());
    },

    email: (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
    }
};

// ページ読み込み時の共通処理
document.addEventListener('DOMContentLoaded', () => {
    // ナビゲーションの現在のページをハイライト
    const currentPage = window.location.pathname;
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
        if (link.getAttribute('href').includes(currentPage)) {
            link.style.backgroundColor = '#34495e';
        }
    });
}); 