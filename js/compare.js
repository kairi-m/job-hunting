// 企業比較管理クラス
class CompanyCompare {
    constructor() {
        this.companies = Storage.load('comparisonCompanies') || [];
        this.showAllDetails = false;
        this.setupEventListeners();
        this.render();
    }

    // イベントリスナーの設定
    setupEventListeners() {
        // フォーム送信イベント
        document.getElementById('companyForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveCompany();
        });

        // 検索イベント
        document.getElementById('searchCompany').addEventListener('input', () => {
            this.render();
        });
    }

    // 新しい企業情報を保存
    saveCompany() {
        const company = {
            id: Date.now(),
            name: document.getElementById('companyName').value,
            industry: document.getElementById('industry').value,
            businessDescription: document.getElementById('businessDescription').value,
            companyPhilosophy: document.getElementById('companyPhilosophy').value,
            salary: document.getElementById('salary').value,
            workLocation: document.getElementById('workLocation').value,
            workHours: document.getElementById('workHours').value,
            overtimeHours: document.getElementById('overtimeHours').value,
            benefits: document.getElementById('benefits').value,
            corporateCulture: document.getElementById('corporateCulture').value,
            evaluation: document.getElementById('evaluation').value,
            notes: document.getElementById('notes').value
        };

        this.companies.push(company);
        this.saveCompanies();
        document.getElementById('companyForm').reset();
        Alert.show('企業情報を保存しました');
        this.render();
    }

    // 企業情報を削除
    deleteCompany(id) {
        this.companies = this.companies.filter(company => company.id !== id);
        this.saveCompanies();
        Alert.show('企業情報を削除しました');
        this.render();
    }

    // 企業情報を編集
    editCompany(id) {
        const company = this.companies.find(c => c.id === id);
        if (!company) return;

        // フォームに値をセット
        document.getElementById('companyName').value = company.name;
        document.getElementById('industry').value = company.industry;
        document.getElementById('businessDescription').value = company.businessDescription;
        document.getElementById('companyPhilosophy').value = company.companyPhilosophy;
        document.getElementById('salary').value = company.salary;
        document.getElementById('workLocation').value = company.workLocation;
        document.getElementById('workHours').value = company.workHours;
        document.getElementById('overtimeHours').value = company.overtimeHours;
        document.getElementById('benefits').value = company.benefits;
        document.getElementById('corporateCulture').value = company.corporateCulture;
        document.getElementById('evaluation').value = company.evaluation;
        document.getElementById('notes').value = company.notes;

        // 既存の企業情報を削除
        this.deleteCompany(id);
        Alert.show('企業情報を編集モードにしました。編集後、保存ボタンを押してください。');
    }

    // 企業情報をローカルストレージに保存
    saveCompanies() {
        Storage.save('comparisonCompanies', this.companies);
    }

    // 全ての詳細表示/非表示を切り替え
    toggleAllDetails() {
        this.showAllDetails = !this.showAllDetails;
        this.render();
    }

    // 企業比較表を表示
    render() {
        const table = document.getElementById('comparisonTable');
        const searchKeyword = document.getElementById('searchCompany').value.toLowerCase();

        // 検索フィルター
        let filteredCompanies = this.companies;
        if (searchKeyword) {
            filteredCompanies = this.companies.filter(company => 
                company.name.toLowerCase().includes(searchKeyword) ||
                company.industry.toLowerCase().includes(searchKeyword)
            );
        }

        // ヘッダー行の作成
        const thead = table.querySelector('thead tr');
        thead.innerHTML = '<th>項目</th>';
        filteredCompanies.forEach(company => {
            thead.innerHTML += `
                <th>
                    ${company.name}
                    <div class="company-actions">
                        <button onclick="companyCompare.editCompany(${company.id})">編集</button>
                        <button onclick="companyCompare.deleteCompany(${company.id})">削除</button>
                    </div>
                </th>
            `;
        });

        // 比較データの行を作成
        const tbody = table.querySelector('tbody');
        tbody.innerHTML = '';

        // 比較項目の定義
        const comparisonItems = [
            { key: 'industry', label: '業界' },
            { key: 'businessDescription', label: '事業内容' },
            { key: 'companyPhilosophy', label: '企業理念' },
            { key: 'salary', label: '初任給', format: value => value ? `${value}円` : '-' },
            { key: 'workLocation', label: '勤務地' },
            { key: 'workHours', label: '勤務時間' },
            { key: 'overtimeHours', label: '平均残業時間', format: value => value ? `${value}時間/月` : '-' },
            { key: 'benefits', label: '福利厚生' },
            { key: 'corporateCulture', label: '社風・雰囲気' },
            { key: 'evaluation', label: '総合評価', format: value => '★'.repeat(value) },
            { key: 'notes', label: 'メモ・気になる点' }
        ];

        // 各項目の行を作成
        comparisonItems.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${item.label}</td>`;

            filteredCompanies.forEach(company => {
                const value = company[item.key];
                const displayValue = item.format ? item.format(value) : (value || '-');
                
                // 長いテキストは省略表示
                const isLongText = displayValue.length > 50;
                if (isLongText && !this.showAllDetails) {
                    tr.innerHTML += `
                        <td>
                            <div class="truncated-text">
                                ${displayValue.substring(0, 50)}...
                                <button class="show-more" onclick="this.parentElement.classList.add('show-full')">
                                    続きを読む
                                </button>
                            </div>
                            <div class="full-text hidden">
                                ${displayValue}
                                <button class="show-less" onclick="this.parentElement.classList.remove('show-full')">
                                    閉じる
                                </button>
                            </div>
                        </td>
                    `;
                } else {
                    tr.innerHTML += `<td>${displayValue}</td>`;
                }
            });

            tbody.appendChild(tr);
        });

        // 企業が登録されていない場合のメッセージ
        if (filteredCompanies.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="2" class="text-center">
                        企業情報が登録されていません。
                    </td>
                </tr>
            `;
        }
    }
}

// アプリケーションの初期化
const companyCompare = new CompanyCompare(); 