// 企業データを管理するクラス
class CompanyTracker {
    constructor() {
        this.companies = Storage.load('companies') || [];
        this.setupEventListeners();
        this.render();
        this.checkDeadlines();
    }

    // イベントリスナーの設定
    setupEventListeners() {
        // フォーム送信イベント
        document.getElementById('companyForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addCompany();
        });

        // ステータスフィルターの変更イベント
        document.getElementById('statusFilter').addEventListener('change', () => {
            this.render();
        });
    }

    // 新しい企業を追加
    addCompany() {
        const company = {
            id: Date.now(), // ユニークIDとして現在のタイムスタンプを使用
            name: document.getElementById('companyName').value,
            position: document.getElementById('position').value,
            status: document.getElementById('status').value,
            applicationDate: document.getElementById('applicationDate').value,
            deadline: document.getElementById('deadline').value,
            notes: document.getElementById('notes').value
        };

        this.companies.push(company);
        this.saveCompanies();
        this.render();
        this.resetForm();
        Alert.show('企業情報を登録しました');
    }

    // 企業情報を更新
    updateCompany(id) {
        const company = this.companies.find(c => c.id === id);
        if (!company) return;

        // フォームに現在の値をセット
        document.getElementById('companyName').value = company.name;
        document.getElementById('position').value = company.position;
        document.getElementById('status').value = company.status;
        document.getElementById('applicationDate').value = company.applicationDate;
        document.getElementById('deadline').value = company.deadline;
        document.getElementById('notes').value = company.notes;

        // 既存の企業を削除
        this.deleteCompany(id);

        Alert.show('企業情報を編集モードにしました。編集後、登録ボタンを押してください。');
    }

    // 企業を削除
    deleteCompany(id) {
        this.companies = this.companies.filter(company => company.id !== id);
        this.saveCompanies();
        this.render();
        Alert.show('企業情報を削除しました');
    }

    // 企業リストを保存
    saveCompanies() {
        Storage.save('companies', this.companies);
    }

    // フォームをリセット
    resetForm() {
        document.getElementById('companyForm').reset();
    }

    // 企業リストを表示
    render() {
        const tbody = document.querySelector('#companyTable tbody');
        const statusFilter = document.getElementById('statusFilter').value;
        
        // フィルター適用
        let filteredCompanies = this.companies;
        if (statusFilter) {
            filteredCompanies = this.companies.filter(company => company.status === statusFilter);
        }

        // テーブルの内容をクリア
        tbody.innerHTML = '';

        // 企業情報を表示
        filteredCompanies.forEach(company => {
            const tr = document.createElement('tr');
            
            // ステータスに応じた背景色を設定
            switch (company.status) {
                case '内定':
                    tr.style.backgroundColor = '#d4edda';
                    break;
                case '不合格':
                    tr.style.backgroundColor = '#f8d7da';
                    break;
                case '最終面接':
                    tr.style.backgroundColor = '#fff3cd';
                    break;
            }

            tr.innerHTML = `
                <td>${company.name}</td>
                <td>${company.position}</td>
                <td>${company.status}</td>
                <td>${DateUtils.formatDate(company.applicationDate)}</td>
                <td>${company.deadline ? DateUtils.formatDate(company.deadline) : '-'}</td>
                <td>${company.notes}</td>
                <td>
                    <button onclick="companyTracker.updateCompany(${company.id})">編集</button>
                    <button onclick="companyTracker.deleteCompany(${company.id})">削除</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    // 締切日のチェック
    checkDeadlines() {
        const today = new Date();
        this.companies.forEach(company => {
            if (!company.deadline) return;

            const deadline = new Date(company.deadline);
            const daysUntilDeadline = DateUtils.getDaysDiff(today, deadline);

            if (daysUntilDeadline <= 3 && daysUntilDeadline > 0) {
                Alert.show(
                    `${company.name}の締切日まであと${daysUntilDeadline}日です！`,
                    'warning'
                );
            }
        });
    }
}

// 締切日でソート
function sortByDeadline() {
    companyTracker.companies.sort((a, b) => {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline) - new Date(b.deadline);
    });
    companyTracker.render();
}

// アプリケーションの初期化
const companyTracker = new CompanyTracker(); 