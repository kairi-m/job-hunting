// カレンダーとホーム画面の管理クラス
class HomeManager {
    constructor() {
        this.calendar = null;
        // DOMContentLoadedイベントで初期化
        document.addEventListener('DOMContentLoaded', () => {
            this.initializeCalendar();
            this.loadSummaryData();
        });
    }

    // カレンダーの初期化
    initializeCalendar() {
        const calendarEl = document.getElementById('calendar');
        if (!calendarEl) return;

        this.calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            locale: 'ja',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth'
            },
            buttonText: {
                today: '今日'
            },
            events: this.loadEvents.bind(this),
            eventClick: this.handleEventClick.bind(this),
            height: 'auto',
            // 日本語化
            dayHeaderContent: (arg) => {
                const days = ['日', '月', '火', '水', '木', '金', '土'];
                return days[arg.date.getDay()];
            },
            // イベントの表示設定
            displayEventTime: false,
            dayMaxEvents: 3,
            // 日付セルの設定
            dayCellContent: (arg) => {
                return arg.dayNumberText.replace('日', '');
            },
            // イベントの内容を日付セルに表示
            eventContent: (arg) => {
                const event = arg.event;
                return {
                    html: `
                        <div class="calendar-event">
                            <span class="event-dot"></span>
                            <span class="event-title">${event.title}</span>
                        </div>
                    `
                };
            }
        });

        // カレンダーの初期化後にイベントを再読み込み
        this.calendar.render();
        setTimeout(() => {
            this.calendar.refetchEvents();
        }, 100);
    }

    // イベントの読み込み
    loadEvents() {
        const events = [];
        
        // 進捗トラッカーのイベントを読み込み
        const companies = Storage.load('companies') || [];
        companies.forEach(company => {
            // 締切日があれば追加
            if (company.deadline) {
                events.push({
                    title: `${company.name} - 締切日`,
                    start: company.deadline,
                    display: 'block',
                    className: ['calendar-event', 'deadline-event'],
                    type: 'deadline',
                    companyId: company.id,
                    allDay: true
                });
            }
        });

        // タスクのイベントを読み込み
        const tasks = Storage.load('tasks') || [];
        console.log('Loaded tasks:', tasks);
        tasks.forEach(task => {
            if (task.dueDate && !task.completed) {
                console.log('Adding task to calendar:', task);
                const priorityClass = task.priority === '高' ? 'priority-高' :
                                    task.priority === '中' ? 'priority-中' :
                                    task.priority === '低' ? 'priority-低' : 'priority-中';
                
                events.push({
                    title: `${task.title} (${task.priority})`,
                    start: task.dueDate,
                    display: 'block',
                    className: ['calendar-event', 'task-event', priorityClass],
                    type: 'task',
                    taskId: task.id,
                    allDay: true,
                    extendedProps: {
                        description: task.description,
                        priority: task.priority
                    }
                });
            }
        });

        // ES・面接ノートの締切日を読み込み
        const companyAnswers = Storage.load('companyAnswers') || [];
        companyAnswers.forEach(answer => {
            if (answer.deadline) {
                events.push({
                    title: `${answer.companyName} - ES締切`,
                    start: answer.deadline,
                    display: 'block',
                    className: ['calendar-event', 'es-event'],
                    type: 'es',
                    answerId: answer.id,
                    allDay: true
                });
            }
        });

        console.log('Calendar events:', events);
        return events;
    }

    // イベントクリック時の処理
    handleEventClick(info) {
        const event = info.event;
        switch (event.extendedProps.type) {
            case 'tracker':
            case 'deadline':
                window.location.href = 'pages/tracker.html';
                break;
            case 'task':
                window.location.href = 'pages/tasks.html';
                break;
            case 'es':
                window.location.href = 'pages/es.html';
                break;
        }
    }

    // サマリーデータの読み込みと表示
    loadSummaryData() {
        // 進捗状況のサマリー
        const applications = Storage.load('applications') || [];
        const activeApps = applications.filter(app => app.status !== '不合格' && app.status !== '辞退');
        const passedApps = applications.filter(app => app.status === '内定' || app.status === '次選考へ');
        
        document.getElementById('activeApplications').textContent = activeApps.length;
        document.getElementById('passRate').textContent = 
            applications.length > 0 
                ? Math.round((passedApps.length / applications.length) * 100) 
                : 0;

        // 直近のタスク
        const tasks = Storage.load('tasks') || [];
        const upcomingTasks = tasks
            .filter(task => !task.completed && task.dueDate)
            .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
            .slice(0, 5);

        const tasksList = document.getElementById('tasksList');
        tasksList.innerHTML = upcomingTasks.length > 0
            ? upcomingTasks.map(task => `
                <li>
                    <span class="task-date">${new Date(task.dueDate).toLocaleDateString()}</span>
                    ${task.title}
                </li>
            `).join('')
            : '<li>予定されているタスクはありません</li>';

        // 最近のES・面接ノート
        const notes = Storage.load('companyAnswers') || [];
        const recentNotes = notes
            .slice(-5)
            .reverse();

        const notesList = document.getElementById('notesList');
        notesList.innerHTML = recentNotes.length > 0
            ? recentNotes.map(note => `
                <li>${note.companyName} - ${note.questions.length}個の設問</li>
            `).join('')
            : '<li>保存されたES・面接ノートはありません</li>';

        // 注目の企業
        const companies = Storage.load('companies') || [];
        const featuredCompanies = companies
            .filter(company => company.rating >= 4)
            .slice(0, 5);

        const companiesList = document.getElementById('companiesList');
        companiesList.innerHTML = featuredCompanies.length > 0
            ? featuredCompanies.map(company => `
                <li>
                    ${company.name}
                    <span class="rating">★${company.rating}</span>
                </li>
            `).join('')
            : '<li>注目企業は登録されていません</li>';
    }
}

// アプリケーションの初期化
window.homeManager = new HomeManager(); 