// タスク管理クラス
class TaskManager {
    constructor() {
        this.tasks = Storage.load('tasks') || [];
        this.setupEventListeners();
        this.render();
    }

    // イベントリスナーの設定
    setupEventListeners() {
        // タスク登録フォームの送信
        document.getElementById('taskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTask();
        });

        // タスク一覧の表示/非表示
        document.getElementById('toggleTaskList').addEventListener('click', () => {
            const section = document.getElementById('taskListSection');
            const button = document.getElementById('toggleTaskList');
            const isVisible = section.style.display !== 'none';
            
            section.style.display = isVisible ? 'none' : 'block';
            button.textContent = isVisible ? 'タスク一覧を表示' : 'タスク一覧を非表示';
        });

        // 並び替え
        document.getElementById('sortBy').addEventListener('change', () => this.render());

        // フィルター
        document.getElementById('filterStatus').addEventListener('change', () => this.render());

        // 検索
        document.getElementById('searchTask').addEventListener('input', () => this.render());
    }

    // タスクの追加
    addTask() {
        // 優先度の値を日本語に統一
        const priorityMap = {
            'high': '高',
            'medium': '中',
            'low': '低'
        };

        const task = {
            id: Date.now(),
            title: document.getElementById('taskTitle').value,
            description: document.getElementById('taskDescription').value,
            dueDate: document.getElementById('taskDueDate').value,
            priority: document.getElementById('taskPriority').value,
            completed: false,
            createdAt: new Date().toISOString()
        };

        // 英語の優先度を日本語に変換
        if (priorityMap[task.priority]) {
            task.priority = priorityMap[task.priority];
        }

        console.log('Adding new task:', task); // デバッグ用ログ
        this.tasks.push(task);
        Storage.save('tasks', this.tasks);
        document.getElementById('taskForm').reset();
        Alert.show('タスクを追加しました');
        this.render();

        // ホーム画面のカレンダーを更新
        const homeManager = window.opener?.homeManager;
        if (homeManager) {
            homeManager.calendar.refetchEvents();
        }
    }

    // タスクの削除
    deleteTask(id) {
        this.tasks = this.tasks.filter(task => task.id !== id);
        Storage.save('tasks', this.tasks);
        Alert.show('タスクを削除しました');
        this.render();
    }

    // タスクの完了状態を切り替え
    toggleComplete(id) {
        const task = this.tasks.find(task => task.id === id);
        if (task) {
            task.completed = !task.completed;
            Storage.save('tasks', this.tasks);
            this.render();

            // ホーム画面のカレンダーを更新
            const homeManager = window.opener?.homeManager;
            if (homeManager) {
                homeManager.calendar.refetchEvents();
            }
        }
    }

    // タスクの編集
    editTask(id) {
        const task = this.tasks.find(task => task.id === id);
        if (!task) return;

        document.getElementById('taskTitle').value = task.title;
        document.getElementById('taskDescription').value = task.description;
        document.getElementById('taskDueDate').value = task.dueDate;
        document.getElementById('taskPriority').value = task.priority;

        // 編集中のタスクを削除
        this.deleteTask(id);
        Alert.show('タスクを編集モードにしました。編集後、追加ボタンを押してください。');
    }

    // タスク一覧の表示
    render() {
        let filteredTasks = [...this.tasks];

        // 検索フィルター
        const searchQuery = document.getElementById('searchTask').value.toLowerCase();
        if (searchQuery) {
            filteredTasks = filteredTasks.filter(task =>
                task.title.toLowerCase().includes(searchQuery) ||
                task.description.toLowerCase().includes(searchQuery)
            );
        }

        // ステータスフィルター
        const statusFilter = document.getElementById('filterStatus').value;
        if (statusFilter !== 'all') {
            filteredTasks = filteredTasks.filter(task =>
                statusFilter === 'completed' ? task.completed : !task.completed
            );
        }

        // 並び替え
        const sortBy = document.getElementById('sortBy').value;
        filteredTasks.sort((a, b) => {
            switch (sortBy) {
                case 'dueDate':
                    return new Date(a.dueDate) - new Date(b.dueDate);
                case 'priority':
                    const priorityOrder = { '高': 0, '中': 1, '低': 2 };
                    return priorityOrder[a.priority] - priorityOrder[b.priority];
                case 'created':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                default:
                    return 0;
            }
        });

        // タスク一覧の描画
        const taskList = document.getElementById('taskList');
        taskList.innerHTML = filteredTasks.map(task => `
            <div class="task-item ${task.completed ? 'completed' : ''} ${task.priority.toLowerCase()}-priority">
                <div class="task-content">
                    <div class="item-row">
                        <span class="item-label">タスク名:</span>
                        <div class="task-title">${task.title}</div>
                    </div>
                    ${task.description ? `
                        <div class="item-row">
                            <span class="item-label">詳細:</span>
                            <div class="task-description">${task.description}</div>
                        </div>
                    ` : ''}
                    <div class="task-details">
                        <div class="item-row">
                            <span class="item-label">期限:</span>
                            <span>${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '未設定'}</span>
                        </div>
                        <div class="item-row">
                            <span class="item-label">優先度:</span>
                            <span>${task.priority}</span>
                        </div>
                        <div class="item-row">
                            <span class="item-label">状態:</span>
                            <span>${task.completed ? '完了' : '未完了'}</span>
                        </div>
                    </div>
                </div>
                <div class="task-actions">
                    <button class="complete-btn" onclick="taskManager.toggleComplete(${task.id})">
                        ${task.completed ? '未完了に戻す' : '完了'}
                    </button>
                    <button class="edit-btn" onclick="taskManager.editTask(${task.id})">編集</button>
                    <button class="delete-btn" onclick="taskManager.deleteTask(${task.id})">削除</button>
                </div>
            </div>
        `).join('');
    }
}

// アプリケーションの初期化
const taskManager = new TaskManager(); 