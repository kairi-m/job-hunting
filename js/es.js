// ES・面接ノート管理クラス
class EsManager {
    constructor() {
        this.templates = Storage.load('esTemplates') || [];
        let companyAnswers = Storage.load('companyAnswers') || [];
        
        // 古い形式のデータを新しい形式に移行
        this.companyAnswers = companyAnswers.map(answer => {
            // 古い形式のデータの場合、新しい形式に変換
            if (!Array.isArray(answer.questions)) {
                return {
                    id: answer.id,
                    companyName: answer.companyName,
                    questions: [{
                        questionType: answer.questionType || '自己PR',
                        question: answer.question || '',
                        answer: answer.answer || ''
                    }]
                };
            }
            return answer;
        });

        // 移行したデータを保存
        Storage.save('companyAnswers', this.companyAnswers);

        this.questionSetCount = 1;
        this.setupEventListeners();
        this.setupCharacterCount();
        this.render();
    }

    // イベントリスナーの設定
    setupEventListeners() {
        // テンプレートフォームの送信
        document.getElementById('templateForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveTemplate();
        });

        // 企業別ESフォームの送信
        document.getElementById('companyEsForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveCompanyAnswer();
        });

        // 保存済み回答の表示/非表示
        document.getElementById('toggleSavedAnswers').addEventListener('click', () => {
            const section = document.getElementById('savedAnswersSection');
            const button = document.getElementById('toggleSavedAnswers');
            const isVisible = section.style.display !== 'none';
            
            section.style.display = isVisible ? 'none' : 'block';
            button.textContent = isVisible ? '保存済みの回答一覧を表示' : '保存済みの回答一覧を非表示';

            if (!isVisible) {
                this.render(); // 表示時に回答一覧を更新
            }
        });

        // 検索とフィルター
        document.getElementById('searchKeyword').addEventListener('input', () => this.render());
        document.getElementById('categoryFilter').addEventListener('change', () => this.render());
    }

    // 文字数カウントの設定
    setupCharacterCount() {
        const setupCounter = (textareaId, counterId) => {
            const textarea = document.getElementById(textareaId);
            const counter = document.getElementById(counterId);
            if (textarea && counter) {
                textarea.addEventListener('input', () => {
                    counter.textContent = textarea.value.length;
                });
            }
        };

        setupCounter('templateContent', 'templateCharCount');
        setupCounter('answer-0', 'answerCharCount-0');
    }

    // 新しい設問セットを追加
    addQuestionSet() {
        const container = document.getElementById('questionContainer');
        const newSetId = this.questionSetCount++;
        
        const questionSet = document.createElement('div');
        questionSet.className = 'question-set mb-2';
        questionSet.innerHTML = `
            <div class="form-group">
                <label for="questionType-${newSetId}">設問種類</label>
                <select id="questionType-${newSetId}" class="question-type" required>
                    <option value="自己PR">自己PR</option>
                    <option value="ガクチカ">ガクチカ</option>
                    <option value="志望動機">志望動機</option>
                    <option value="長所">長所</option>
                    <option value="短所">短所</option>
                    <option value="その他">その他</option>
                </select>
            </div>
            <div class="form-group">
                <label for="question-${newSetId}">設問内容</label>
                <input type="text" id="question-${newSetId}" class="question" required>
            </div>
            <div class="form-group">
                <label for="answer-${newSetId}">回答</label>
                <textarea id="answer-${newSetId}" class="answer" rows="5" required></textarea>
                <div class="character-count">文字数: <span id="answerCharCount-${newSetId}">0</span></div>
            </div>
            <button type="button" class="remove-question" onclick="esManager.removeQuestionSet(${newSetId})">この設問を削除</button>
        `;

        container.appendChild(questionSet);
        
        // 最初の設問の削除ボタンを表示
        if (this.questionSetCount === 2) {
            document.querySelector('.remove-question').style.display = 'block';
        }

        // 新しい設問の文字数カウンターを設定
        this.setupCharacterCount(`answer-${newSetId}`, `answerCharCount-${newSetId}`);
    }

    // 設問セットを削除
    removeQuestionSet(setId) {
        const questionSets = document.querySelectorAll('.question-set');
        if (questionSets.length > 1) {
            const targetSet = document.getElementById(`questionType-${setId}`).closest('.question-set');
            targetSet.remove();
            this.questionSetCount--;

            // 最後の1つの場合は削除ボタンを非表示
            if (questionSets.length === 2) {
                document.querySelector('.remove-question').style.display = 'none';
            }
        }
    }

    // テンプレートを保存
    saveTemplate() {
        const template = {
            id: Date.now(),
            category: document.getElementById('templateCategory').value,
            title: document.getElementById('templateTitle').value,
            content: document.getElementById('templateContent').value
        };

        this.templates.push(template);
        Storage.save('esTemplates', this.templates);
        document.getElementById('templateForm').reset();
        document.getElementById('templateCharCount').textContent = '0';
        Alert.show('テンプレートを保存しました');
        this.render();
    }

    // 企業別の回答を保存
    saveCompanyAnswer() {
        const companyName = document.getElementById('companyName').value;
        const questions = [];

        // 全ての設問セットから情報を収集
        document.querySelectorAll('.question-set').forEach((set, index) => {
            questions.push({
                questionType: document.getElementById(`questionType-${index}`).value,
                question: document.getElementById(`question-${index}`).value,
                answer: document.getElementById(`answer-${index}`).value
            });
        });

        const answer = {
            id: Date.now(),
            companyName: companyName,
            questions: questions
        };

        this.companyAnswers.push(answer);
        Storage.save('companyAnswers', this.companyAnswers);
        document.getElementById('companyEsForm').reset();
        document.querySelectorAll('[id^=answerCharCount-]').forEach(counter => {
            counter.textContent = '0';
        });

        // 追加の設問セットを削除
        const container = document.getElementById('questionContainer');
        while (container.children.length > 1) {
            container.removeChild(container.lastChild);
        }
        document.querySelector('.remove-question').style.display = 'none';
        this.questionSetCount = 1;

        Alert.show('回答を保存しました');
        this.render();
    }

    // テンプレートを削除
    deleteTemplate(id) {
        this.templates = this.templates.filter(template => template.id !== id);
        Storage.save('esTemplates', this.templates);
        Alert.show('テンプレートを削除しました');
        this.render();
    }

    // 企業別回答を削除
    deleteCompanyAnswer(id) {
        this.companyAnswers = this.companyAnswers.filter(answer => answer.id !== id);
        Storage.save('companyAnswers', this.companyAnswers);
        Alert.show('回答を削除しました');
        this.render();
    }

    // テンプレートを編集用にフォームにセット
    editTemplate(id) {
        const template = this.templates.find(t => t.id === id);
        if (!template) return;

        document.getElementById('templateCategory').value = template.category;
        document.getElementById('templateTitle').value = template.title;
        document.getElementById('templateContent').value = template.content;
        document.getElementById('templateCharCount').textContent = template.content.length;

        this.deleteTemplate(id);
        Alert.show('テンプレートを編集モードにしました。編集後、保存ボタンを押してください。');
    }

    // 企業別回答を編集用にフォームにセット
    editCompanyAnswer(id) {
        const answer = this.companyAnswers.find(a => a.id === id);
        if (!answer) return;

        // 基本情報をセット
        document.getElementById('companyName').value = answer.companyName;

        // 既存の設問セットをクリア
        const container = document.getElementById('questionContainer');
        container.innerHTML = '';

        // 各設問をフォームに追加
        answer.questions.forEach((q, index) => {
            if (index === 0) {
                // 最初の設問セット
                container.innerHTML = `
                    <div class="question-set mb-2">
                        <div class="form-group">
                            <label for="questionType-0">設問種類</label>
                            <select id="questionType-0" class="question-type" required>
                                <option value="自己PR">自己PR</option>
                                <option value="ガクチカ">ガクチカ</option>
                                <option value="志望動機">志望動機</option>
                                <option value="長所">長所</option>
                                <option value="短所">短所</option>
                                <option value="その他">その他</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="question-0">設問内容</label>
                            <input type="text" id="question-0" class="question" required>
                        </div>
                        <div class="form-group">
                            <label for="answer-0">回答</label>
                            <textarea id="answer-0" class="answer" rows="5" required></textarea>
                            <div class="character-count">文字数: <span id="answerCharCount-0">0</span></div>
                        </div>
                        <button type="button" class="remove-question" onclick="esManager.removeQuestionSet(0)" style="display: none;">この設問を削除</button>
                    </div>
                `;
            } else {
                // 追加の設問セット
                this.addQuestionSet();
            }

            // 値をセット
            document.getElementById(`questionType-${index}`).value = q.questionType;
            document.getElementById(`question-${index}`).value = q.question;
            document.getElementById(`answer-${index}`).value = q.answer;
            document.getElementById(`answerCharCount-${index}`).textContent = q.answer.length;
        });

        // 削除ボタンの表示/非表示を設定
        const removeButtons = document.querySelectorAll('.remove-question');
        removeButtons.forEach(button => {
            button.style.display = answer.questions.length > 1 ? 'block' : 'none';
        });

        this.questionSetCount = answer.questions.length;
        this.deleteCompanyAnswer(id);
        Alert.show('回答を編集モードにしました。編集後、保存ボタンを押してください。');
    }

    // テンプレートをコピー
    copyTemplate(id) {
        const template = this.templates.find(t => t.id === id);
        if (!template) return;

        navigator.clipboard.writeText(template.content).then(() => {
            Alert.show('テンプレートをクリップボードにコピーしました');
        });
    }

    // 企業別回答をコピー
    copyCompanyAnswer(id) {
        const answer = this.companyAnswers.find(a => a.id === id);
        if (!answer) return;

        const text = answer.questions.map(q => 
            `[${q.questionType}]\n${q.question}\n\n${q.answer}\n`
        ).join('\n---\n\n');

        navigator.clipboard.writeText(text).then(() => {
            Alert.show('回答をクリップボードにコピーしました');
        });
    }

    // テンプレート一覧を表示
    renderTemplates() {
        const templatesSection = document.createElement('div');
        templatesSection.innerHTML = '<h3 class="mb-2">テンプレート一覧</h3>';
        
        this.templates.forEach(template => {
            const card = document.createElement('div');
            card.className = 'template-card mb-2';
            card.innerHTML = `
                <div class="card-header">
                    <span class="category-badge">${template.questionType}</span>
                </div>
                <div class="card-content">
                    <div class="item-row">
                        <span class="item-label">設問内容:</span>
                        <p class="question">${template.question}</p>
                        <span class="char-count">(${template.question.length}文字)</span>
                    </div>
                    <div class="item-row">
                        <span class="item-label">回答例:</span>
                        <p class="answer-text">${template.answer}</p>
                        <span class="char-count">(${template.answer.length}文字)</span>
                    </div>
                </div>
                <div class="card-actions">
                    <button onclick="esManager.editTemplate(${template.id})">編集</button>
                    <button onclick="esManager.copyTemplate(${template.id})">コピー</button>
                    <button onclick="esManager.deleteTemplate(${template.id})">削除</button>
                </div>
            `;
            templatesSection.appendChild(card);
        });
        
        return templatesSection;
    }

    // 保存済み回答を表示
    render() {
        let filteredTemplates = [...this.templates];
        let filteredAnswers = [...this.companyAnswers];

        // 検索とフィルターを適用
        const searchKeyword = document.getElementById('searchKeyword').value.toLowerCase();
        const categoryFilter = document.getElementById('categoryFilter').value;

        if (searchKeyword || categoryFilter) {
            // テンプレートのフィルタリング
            filteredTemplates = filteredTemplates.filter(template => {
                const matchesKeyword = 
                    template.title.toLowerCase().includes(searchKeyword) ||
                    template.content.toLowerCase().includes(searchKeyword);
                const matchesCategory = !categoryFilter || template.category === categoryFilter;
                return matchesKeyword && matchesCategory;
            });

            // 企業別回答のフィルタリング
            filteredAnswers = filteredAnswers.filter(answer => {
                const matchesKeyword = 
                    answer.companyName.toLowerCase().includes(searchKeyword) ||
                    answer.questions.some(q => 
                        q.question.toLowerCase().includes(searchKeyword) ||
                        q.answer.toLowerCase().includes(searchKeyword)
                    );
                const matchesCategory = !categoryFilter || 
                    answer.questions.some(q => q.questionType === categoryFilter);
                return matchesKeyword && matchesCategory;
            });
        }

        // 表示をクリア
        const savedAnswers = document.getElementById('savedAnswers');
        savedAnswers.innerHTML = '';

        // テンプレートを表示
        if (filteredTemplates.length > 0) {
            const templatesSection = document.createElement('div');
            templatesSection.innerHTML = '<h3 class="mb-2">テンプレート</h3>';
            filteredTemplates.forEach(template => {
                const card = document.createElement('div');
                card.className = 'answer-card mb-2';
                card.innerHTML = `
                    <div class="card-header">
                        <h4>${template.title}</h4>
                        <span class="category-badge">${template.category}</span>
                    </div>
                    <div class="card-content">
                        <p>${template.content}</p>
                        <span class="char-count">（${template.content.length}文字）</span>
                    </div>
                    <div class="card-actions">
                        <button onclick="esManager.editTemplate(${template.id})">編集</button>
                        <button onclick="esManager.copyTemplate(${template.id})">コピー</button>
                        <button onclick="esManager.deleteTemplate(${template.id})">削除</button>
                    </div>
                `;
                templatesSection.appendChild(card);
            });
            savedAnswers.appendChild(templatesSection);
        }

        // 企業別回答を表示
        if (filteredAnswers.length > 0) {
            const answersSection = document.createElement('div');
            answersSection.innerHTML = '<h3 class="mb-2">企業別回答</h3>';
            filteredAnswers.forEach(answer => {
                const card = document.createElement('div');
                card.className = 'answer-card mb-2';
                card.innerHTML = `
                    <div class="card-header">
                        <h4>企業名: ${answer.companyName}</h4>
                        <span class="badge">${answer.questions.length}個の設問</span>
                    </div>
                    <div class="card-content">
                        ${answer.questions.map(q => `
                            <div class="question-answer-set">
                                <div class="item-row">
                                    <span class="item-label">設問種類:</span>
                                    <span class="category-badge">${q.questionType}</span>
                                </div>
                                <div class="item-row">
                                    <span class="item-label">設問内容:</span>
                                    <p class="question">${q.question}</p>
                                </div>
                                <div class="item-row">
                                    <span class="item-label">回答:</span>
                                    <p class="answer-text">${q.answer}</p>
                                    <span class="char-count">(${q.answer.length}文字)</span>
                                </div>
                            </div>
                        `).join('<hr>')}
                    </div>
                    <div class="card-actions">
                        <button onclick="esManager.editCompanyAnswer(${answer.id})">編集</button>
                        <button onclick="esManager.copyCompanyAnswer(${answer.id})">コピー</button>
                        <button onclick="esManager.deleteCompanyAnswer(${answer.id})">削除</button>
                    </div>
                `;
                answersSection.appendChild(card);
            });
            savedAnswers.appendChild(answersSection);
        }

        // 検索結果が0件の場合
        if (filteredTemplates.length === 0 && filteredAnswers.length === 0) {
            savedAnswers.innerHTML = '<p class="text-center">該当する回答が見つかりませんでした。</p>';
        }
    }
}

// アプリケーションの初期化
const esManager = new EsManager(); 