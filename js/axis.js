// 質問データの定義
const questions = [
    {
        id: 1,
        phase: 1,
        text: "あなたが「最高の仕事だ！」と感じるのは？",
        subText: "1つを「最も当てはまるもの」、2つを「次に当てはまるもの」として選んでください。",
        type: "ranked_checkbox",
        maxSelect: 3,
        options: [
            { value: "A", text: "困難な課題を、自分の知恵と工夫で解決できたとき", types: ["B", "D"] },
            { value: "B", text: "自分の仕事が「ありがとう」と感謝されたとき", types: ["A", "E"] },
            { value: "C", text: "チームで大きな目標を達成できたとき", types: ["A"] },
            { value: "D", text: "新しい知識やスキルが身についたとき", types: ["C"] },
            { value: "E", text: "自分の成果が事業の売上や利益に直結したとき", types: ["B"] },
            { value: "F", text: "自分のアイデアが形になり社会に影響を与えたとき", types: ["C", "E"] }
        ]
    },
    {
        id: 2,
        phase: 1,
        text: "チームで意見が割れたとき、あなたがとる行動は？",
        type: "radio",
        options: [
            { value: "A", text: "データで説得し主張を貫く", types: ["B"], trait: "論理・推進" },
            { value: "B", text: "傾聴し合意形成に動く", types: ["A"], trait: "協調・調整" },
            { value: "C", text: "客観的第三者に判断を仰ぐ", types: ["A"], trait: "安定・誠実" },
            { value: "D", text: "第三の案を考えて突破する", types: ["C"], trait: "創造・柔軟" }
        ]
    },
    {
        id: 3,
        phase: 1,
        text: "あなたが最もやりがいを感じるのは？",
        type: "radio",
        options: [
            { value: "A", text: "大きな責任あるプロジェクトに挑むこと", types: ["B"] },
            { value: "B", text: "困っている人の役に立ったとき", types: ["A"] },
            { value: "C", text: "自分のアイデアが採用され、形になったとき", types: ["C"] },
            { value: "D", text: "地域の課題を解決できたとき", types: ["E"] },
            { value: "E", text: "環境や医療など社会課題を研究・解決できたとき", types: ["D"] }
        ]
    },
    {
        id: 4,
        phase: 2,
        text: "あなたが「絶対に避けたい」と思う環境を3つ選んでください",
        type: "checkbox",
        maxSelect: 3,
        options: [
            { value: "N1", text: "年功序列で若手の意見が通らない" },
            { value: "N2", text: "個人主義でチーム協力がない" },
            { value: "N3", text: "成果に関係なく評価が一律" },
            { value: "N4", text: "変化を嫌い挑戦ができない" },
            { value: "N5", text: "頻繁な転勤や勤務地指定不可" },
            { value: "N6", text: "プライベートを侵食する付き合い文化" },
            { value: "N7", text: "将来性や社会性が不透明な事業" }
        ]
    },
    {
        id: 5,
        phase: 3,
        text: "難しすぎる仕事を任されたらどうする？",
        type: "radio",
        options: [
            { value: "A", text: "一人でやり遂げると決意し全力挑戦", types: ["B"] },
            { value: "B", text: "分からないことを整理して相談する", types: ["A"] },
            { value: "C", text: "上司の意図を読み、目的から逆算して動く", types: ["D", "B"] }
        ]
    },
    {
        id: 6,
        phase: 3,
        text: "企業サイトで最も注目する情報は？",
        type: "radio",
        options: [
            { value: "A", text: "社員インタビューやカルチャー紹介", types: ["A", "C"] },
            { value: "B", text: "事業内容や成長戦略", types: ["B"] },
            { value: "C", text: "地域密着型事業や社会課題への取り組み", types: ["A", "E"] },
            { value: "D", text: "プロダクトの特徴や開発フロー", types: ["C"] }
        ]
    },
    {
        id: 7,
        phase: 3,
        text: "5年後の自分の姿として最も近いものを選んでください",
        type: "radio",
        options: [
            { value: "A", text: "社会課題に強い専門家", types: ["D"] },
            { value: "B", text: "新しいビジネスを動かすリーダー", types: ["B"] },
            { value: "C", text: "地域に根ざした価値創造の担い手", types: ["E"] },
            { value: "D", text: "優れたUX/プロダクトを創る人", types: ["C"] },
            { value: "E", text: "調整役として組織に信頼される人", types: ["A"] }
        ]
    }
];

// 結果タイプの定義
const resultTypes = {
    typeA: {
        name: "A（社会基盤・共創型）",
        catchphrase: "社会インフラを支え、人々の暮らしを豊かにする",
        must: "社会的意義の高い仕事であること",
        want: "チームで協力し、大きな目標に挑戦できる環境",
        suitableCompanies: ["インフラ系企業", "公共サービス", "社会課題解決型企業"],
        checkPoints: {
            materials: ["統合報告書", "CSR報告書", "サステナビリティページ"],
            focus: "事業が社会にもたらす長期的価値をどう定義しているか",
            questions: [
                "社会の役に立ったと感じた仕事は？",
                "公共性と利益性をどうバランスさせていますか？"
            ]
        }
    },
    typeB: {
        name: "B（成長牽引・挑戦型）",
        catchphrase: "高い目標を掲げ、新しい価値を創造する",
        must: "成果に応じた評価と成長機会があること",
        want: "裁量権が大きく、挑戦を推奨する文化",
        suitableCompanies: ["成長企業", "ベンチャー", "新規事業部門"],
        checkPoints: {
            materials: ["中期経営計画", "IR資料", "新規事業ニュース"],
            focus: "若手にどの程度裁量があるか、成果主義が機能しているか",
            questions: [
                "入社数年で経験した最も大きな挑戦は？",
                "評価はどのようにされますか？"
            ]
        }
    },
    typeC: {
        name: "C（価値創造・プロダクト型）",
        catchphrase: "革新的なプロダクトで、ユーザー体験を向上させる",
        must: "プロダクト開発に携われること",
        want: "最新技術に触れ、創造性を活かせる環境",
        suitableCompanies: ["IT企業", "プロダクト開発企業", "デザイン重視の企業"],
        checkPoints: {
            materials: ["プロダクト開発ブログ", "UI/UX事例", "noteなど"],
            focus: "開発プロセスにユーザーの声が反映されているか、プロダクト開発の思想",
            questions: [
                "プロダクトにどれだけ関われますか？",
                "開発で苦労した点とそこから学んだことは？"
            ]
        }
    },
    typeD: {
        name: "D（専門性・課題解決型）",
        catchphrase: "専門性を活かし、複雑な課題を解決する",
        must: "専門性を高められる環境があること",
        want: "研究開発や技術革新に投資する企業文化",
        suitableCompanies: ["研究開発型企業", "コンサルティング", "専門サービス"],
        checkPoints: {
            materials: ["研究開発レポート", "技術系特集", "社会課題への取り組み"],
            focus: "長期的な技術投資・課題解決に本気かどうか",
            questions: [
                "どういった社会課題に取り組んでいますか？",
                "専門性をどう深められますか？"
            ]
        }
    },
    typeE: {
        name: "E（地域共創・事業開発型）",
        catchphrase: "地域に根ざし、持続可能な価値を創造する",
        must: "地域社会に貢献できる仕事であること",
        want: "現場の裁量が大きく、スピーディーな意思決定",
        suitableCompanies: ["地域金融機関", "まちづくり企業", "地域創生事業"],
        checkPoints: {
            materials: ["地域事業の実績", "自治体との連携内容", "ローカルな取り組み"],
            focus: "現場の裁量、地域との接点、スピード感ある事業展開",
            questions: [
                "地域の声が事業に反映された具体例は？",
                "現場主導で決断した経験はありますか？"
            ]
        }
    }
};

let currentQuestionIndex = 0;
let answers = {};

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    showQuestion(currentQuestionIndex);
    setupEventListeners();
    updateProgressBar();
});

// イベントリスナーの設定
function setupEventListeners() {
    const nextButton = document.getElementById('nextButton');
    const prevButton = document.getElementById('prevButton');
    const submitButton = document.getElementById('submitButton');

    nextButton.addEventListener('click', () => {
        if (validateCurrentAnswer()) {
            saveCurrentAnswer();
            currentQuestionIndex++;
            showQuestion(currentQuestionIndex);
            updateProgressBar();
        }
    });

    prevButton.addEventListener('click', () => {
        currentQuestionIndex--;
        showQuestion(currentQuestionIndex);
        updateProgressBar();
    });

    submitButton.addEventListener('click', showResults);
}

// プログレスバーの更新
function updateProgressBar() {
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    const progressBar = document.querySelector('.progress-bar-fill');
    if (progressBar) {
        progressBar.style.width = `${progress}%`;
    }
}

// 質問の表示
function showQuestion(index) {
    const question = questions[index];
    const container = document.getElementById('questionnaireContainer');
    
    // ボタンの状態更新
    updateNavigationButtons(index);
    
    // 質問カードの生成
    const questionCard = createQuestionCard(question);
    
    // 既存の回答があれば選択状態を復元
    if (answers[question.id]) {
        restoreAnswers(questionCard, answers[question.id]);
    }
    
    // 表示の更新
    const questionContent = container.querySelector('.question-card');
    if (questionContent) {
        questionContent.replaceWith(questionCard);
    } else {
        container.querySelector('.step-container').appendChild(questionCard);
    }

    // フェーズとステップの表示を更新
    updatePhaseAndStep(question);
}

// フェーズとステップの表示更新
function updatePhaseAndStep(question) {
    const phaseTexts = {
        1: "フェーズ1：自己理解の深化（What & Why）",
        2: "フェーズ2：ミスマッチの防止（リスクの排除）",
        3: "フェーズ3：企業評価眼の醸成（未来への接続）"
    };

    const stepTexts = {
        1: "ステップ1：価値観の探求",
        2: "ステップ2：強みと貢献方法の解像度向上",
        3: "ステップ3：許容できないことの明確化",
        4: "ステップ4：理想の環境とキャリアの具体化"
    };

    const phaseTitle = document.querySelector('.phase-container h3');
    const stepTitle = document.querySelector('.step-container h4');

    if (phaseTitle) phaseTitle.textContent = phaseTexts[question.phase] || "";
    if (stepTitle) stepTitle.textContent = stepTexts[question.step] || "";
}

// 質問カードの生成
function createQuestionCard(question) {
    const card = document.createElement('div');
    card.className = 'question-card';

    let inputHTML = '';
    if (question.type === 'ranked_checkbox') {
        inputHTML = `
            <div class="ranked-options">
                <div class="rank-group">
                    <h6>最も当てはまるもの（1つ）</h6>
                    ${question.options.map(option => `
                        <label class="option">
                            <input type="radio" name="q${question.id}_rank1" value="${option.value}">
                            ${option.text}
                        </label>
                    `).join('')}
                </div>
                <div class="rank-group">
                    <h6>次に当てはまるもの（2つ）</h6>
                    ${question.options.map(option => `
                        <label class="option">
                            <input type="checkbox" name="q${question.id}_rank2" value="${option.value}">
                            ${option.text}
                        </label>
                    `).join('')}
                </div>
            </div>
        `;
    } else if (question.type === 'checkbox' || question.type === 'radio') {
        inputHTML = question.options.map(option => `
            <label class="option">
                <input type="${question.type}" name="q${question.id}" value="${option.value}">
                ${option.text}
            </label>
        `).join('');
    }

    card.innerHTML = `
        <h5>質問${question.id}</h5>
        <p>${question.text}</p>
        ${question.subText ? `<p class="sub-text">${question.subText}</p>` : ''}
        <div class="options">
            ${inputHTML}
        </div>
    `;

    // ランク付き選択の場合、イベントリスナーを追加
    if (question.type === 'ranked_checkbox') {
        const rank1Inputs = card.querySelectorAll(`input[name="q${question.id}_rank1"]`);
        const rank2Inputs = card.querySelectorAll(`input[name="q${question.id}_rank2"]`);

        // 1位の選択を制限
        rank1Inputs.forEach(input => {
            input.addEventListener('change', () => {
                if (input.checked) {
                    // 2位の選択から1位を選択不可に
                    const rank2Input = card.querySelector(`input[name="q${question.id}_rank2"][value="${input.value}"]`);
                    if (rank2Input) rank2Input.checked = false;
                }
            });
        });

        // 2位の選択を制限（最大2つまで）
        rank2Inputs.forEach(input => {
            input.addEventListener('change', () => {
                const checkedCount = Array.from(rank2Inputs).filter(i => i.checked).length;
                if (checkedCount > 2) {
                    input.checked = false;
                }

                // 1位と同じものは選択不可
                const rank1Selected = Array.from(rank1Inputs).find(i => i.checked)?.value;
                if (rank1Selected === input.value) {
                    input.checked = false;
                }
            });
        });
    }

    return card;
}

// 回答の検証
function validateCurrentAnswer() {
    const question = questions[currentQuestionIndex];
    
    if (question.type === 'ranked_checkbox') {
        const rank1Selected = document.querySelector(`input[name="q${question.id}_rank1"]:checked`);
        const rank2Selected = document.querySelectorAll(`input[name="q${question.id}_rank2"]:checked`);
        
        if (!rank1Selected) {
            alert('最も当てはまるものを1つ選択してください。');
            return false;
        }
        if (rank2Selected.length !== 2) {
            alert('次に当てはまるものを2つ選択してください。');
            return false;
        }
        
        return true;
    } else if (question.type === 'checkbox' || question.type === 'radio') {
        const selectedInputs = document.querySelectorAll(`input[name="q${question.id}"]:checked`);
        if (selectedInputs.length === 0) {
            alert('選択してください。');
            return false;
        }
        if (question.maxSelect && selectedInputs.length > question.maxSelect) {
            alert(`最大${question.maxSelect}つまで選択してください。`);
            return false;
        }
        return true;
    }
    
    return true;
}

// 回答の保存
function saveCurrentAnswer() {
    const question = questions[currentQuestionIndex];
    
    if (question.type === 'ranked_checkbox') {
        const rank1Selected = document.querySelector(`input[name="q${question.id}_rank1"]:checked`);
        const rank2Selected = document.querySelectorAll(`input[name="q${question.id}_rank2"]:checked`);
        
        answers[question.id] = [
            rank1Selected.value,
            ...Array.from(rank2Selected).map(input => input.value)
        ];
    } else {
        const selectedInputs = document.querySelectorAll(`input[name="q${question.id}"]:checked`);
        answers[question.id] = Array.from(selectedInputs).map(input => input.value);
    }

    localStorage.setItem('axisAnswers', JSON.stringify(answers));
}

// ナビゲーションボタンの更新
function updateNavigationButtons(index) {
    const prevButton = document.getElementById('prevButton');
    const nextButton = document.getElementById('nextButton');
    const submitButton = document.getElementById('submitButton');
    
    prevButton.disabled = index === 0;
    
    if (index === questions.length - 1) {
        nextButton.style.display = 'none';
        submitButton.style.display = 'block';
    } else {
        nextButton.style.display = 'block';
        submitButton.style.display = 'none';
    }
}

// タイプの説明を追加
const typeDescriptions = {
    A: "社会基盤・共創型：社会インフラを支え、人々の暮らしを豊かにする人材",
    B: "成長牽引・挑戦型：高い目標を掲げ、新しい価値を創造する人材",
    C: "価値創造・プロダクト型：革新的なプロダクトで、ユーザー体験を向上させる人材",
    D: "専門性・課題解決型：専門性を活かし、複雑な課題を解決する人材",
    E: "地域共創・事業開発型：地域に根ざし、持続可能な価値を創造する人材"
};

// 結果の表示を更新
function showResults() {
    if (!validateCurrentAnswer()) return;
    saveCurrentAnswer();
    
    const result = determineResultType(answers);
    const resultContainer = document.getElementById('resultContainer');
    const resultTypeDiv = document.getElementById('resultType');
    const resultDetailsDiv = document.getElementById('resultDetails');
    const navigationButtons = document.querySelector('.navigation-buttons');
    
    let typeDisplay = '';
    if (result.isComplex) {
        typeDisplay = `複合タイプ：${result.types.map(t => t.name).join(' × ')}`;
    } else {
        typeDisplay = `タイプ${result.types[0].name}`;
    }

    resultTypeDiv.innerHTML = `
        <h4>${typeDisplay}</h4>
        <p class="catchphrase">${result.types[0].catchphrase}</p>
    `;

    const negativeChoices = answers[4] || [];
    const negativeItems = negativeChoices.map(choice => {
        const option = questions[3].options.find(opt => opt.value === choice);
        return option ? option.text : '';
    });

    const mainType = result.types[0];
    resultDetailsDiv.innerHTML = `
        <div class="must-want-negative">
            <h5>Must（譲れない価値観）</h5>
            <p>${mainType.must}</p>
            
            <h5>Want（できれば満たしたい働き方）</h5>
            <p>${mainType.want}</p>
            
            <h5>Negative（避けたい環境）</h5>
            <ul>
                ${negativeItems.map(item => `<li>${item}</li>`).join('')}
            </ul>
            
            <h5>向いている企業例</h5>
            <div class="suitable-companies">
                ${mainType.suitableCompanies.map(company => `
                    <span class="tag">${company}</span>
                `).join('')}
            </div>

            <h5>企業選定のポイント</h5>
            <div class="check-points">
                <h6>確認すべき資料</h6>
                <div class="materials">
                    ${mainType.checkPoints.materials.map(material => `
                        <span class="tag">${material}</span>
                    `).join('')}
                </div>
                
                <h6>見るべきポイント</h6>
                <p>${mainType.checkPoints.focus}</p>
                
                <h6>OB訪問で聞くこと</h6>
                <ul>
                    ${mainType.checkPoints.questions.map(q => `<li>${q}</li>`).join('')}
                </ul>
            </div>

            <h5>タイプ適合度</h5>
            <div class="type-scores">
                ${Object.entries(result.scores).map(([type, score]) => {
                    const maxScore = Math.max(...Object.values(result.scores));
                    const percentage = (score / maxScore) * 100;
                    return `
                        <div class="score-bar">
                            <div class="type-info">
                                <span class="type-label">タイプ${type}</span>
                                <span class="type-description">${typeDescriptions[type]}</span>
                            </div>
                            <div class="bar-container">
                                <div class="bar" style="width: ${percentage}%">
                                    <span class="score-text">${score}点</span>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>

            <div class="action-buttons">
                <button id="saveResultBtn" class="btn btn-primary">結果を保存</button>
            </div>
        </div>
    `;
    
    resultContainer.style.display = 'block';
    document.querySelector('.phase-container').style.display = 'none';
    
    // ナビゲーションボタンを非表示に
    if (navigationButtons) {
        navigationButtons.style.display = 'none';
    }

    // 保存ボタンのイベントリスナーを追加
    document.getElementById('saveResultBtn').addEventListener('click', function() {
        const resultData = {
            timestamp: new Date().toISOString(),
            type: typeDisplay,
            scores: result.scores,
            answers: answers,
            mainType: {
                name: mainType.name,
                catchphrase: mainType.catchphrase,
                must: mainType.must,
                want: mainType.want,
                negatives: negativeItems,
                suitableCompanies: mainType.suitableCompanies,
                checkPoints: mainType.checkPoints
            }
        };

        // 既存の保存結果を取得
        let savedResults = JSON.parse(localStorage.getItem('savedAxisResults') || '[]');
        // 新しい結果を追加
        savedResults.push(resultData);
        // LocalStorageに保存
        localStorage.setItem('savedAxisResults', JSON.stringify(savedResults));

        alert('結果を保存しました！');
    });
}

// スコア計算ロジック
function calculateTypeScores(answers) {
    const scores = {
        A: 0, // 社会基盤・共創型
        B: 0, // 事業牽引・成長追求型
        C: 0, // 価値創造・プロダクト探求型
        D: 0, // 専門性・課題解決追求型
        E: 0  // 地域共創・事業開発型
    };

    // Q1の処理（ランク付きの選択）
    const q1Answers = answers[1] || [];
    if (q1Answers.length > 0) {
        // 1位の選択（2点）
        const firstChoice = q1Answers[0];
        const firstChoiceOption = questions[0].options.find(opt => opt.value === firstChoice);
        if (firstChoiceOption) {
            firstChoiceOption.types.forEach(type => scores[type] += 2);
        }

        // 2位、3位の選択（各1点）
        for (let i = 1; i < q1Answers.length; i++) {
            const choice = q1Answers[i];
            const choiceOption = questions[0].options.find(opt => opt.value === choice);
            if (choiceOption) {
                choiceOption.types.forEach(type => scores[type] += 1);
            }
        }
    }

    // Q2-Q3, Q5-Q7の処理（単一選択）
    [2, 3, 5, 6, 7].forEach(qId => {
        const answer = answers[qId];
        if (answer) {
            const question = questions[qId - 1];
            const option = question.options.find(opt => opt.value === answer);
            if (option && option.types) {
                option.types.forEach(type => scores[type] += 1);
            }
        }
    });

    return scores;
}

// 結果タイプの判定
function determineResultType(answers) {
    const scores = calculateTypeScores(answers);
    
    // 最高スコアを持つタイプを見つける
    const maxScore = Math.max(...Object.values(scores));
    const topTypes = Object.entries(scores)
        .filter(([_, score]) => score === maxScore)
        .map(([type]) => type);

    // 同点の場合は複合タイプとして扱う
    if (topTypes.length > 1) {
        // 複合タイプの処理
        return {
            isComplex: true,
            types: topTypes.map(type => resultTypes[`type${type}`]),
            scores: scores
        };
    }

    return {
        isComplex: false,
        types: [resultTypes[`type${topTypes[0]}`]],
        scores: scores
    };
}

// 回答の復元
function restoreAnswers(questionCard, savedAnswers) {
    const question = questions[currentQuestionIndex];
    
    if (question.type === 'ranked_checkbox') {
        if (savedAnswers.length > 0) {
            // 1位の回答を復元
            const rank1Input = questionCard.querySelector(`input[name="q${question.id}_rank1"][value="${savedAnswers[0]}"]`);
            if (rank1Input) rank1Input.checked = true;
            
            // 2位の回答を復元
            savedAnswers.slice(1).forEach(value => {
                const rank2Input = questionCard.querySelector(`input[name="q${question.id}_rank2"][value="${value}"]`);
                if (rank2Input) rank2Input.checked = true;
            });
        }
    } else {
        if (Array.isArray(savedAnswers)) {
            savedAnswers.forEach(value => {
                const input = questionCard.querySelector(`input[value="${value}"]`);
                if (input) input.checked = true;
            });
        }
    }
}

// 保存された回答の読み込み
function loadSavedAnswers() {
    const savedAnswers = localStorage.getItem('axisAnswers');
    if (savedAnswers) {
        answers = JSON.parse(savedAnswers);
        return true;
    }
    return false;
} 