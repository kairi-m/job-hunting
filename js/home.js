class HomeManager {
    constructor() {
        this.calendar = null;
        this.currentEvent = null;
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
                right: 'dayGridMonth,timeGridWeek'
            },
            buttonText: {
                today: '今日',
                month: '月',
                week: '週'
            },
            events: (fetchInfo, successCallback, failureCallback) => {
                try {
                    const events = this.loadEvents();
                    successCallback(events);
                } catch (error) {
                    console.error('Error loading events:', error);
                    failureCallback(error);
                }
            },
            eventClick: (info) => {
                this.handleEventClick(info);
            },
            dateClick: (info) => {
                this.showEventModal(info.dateStr);
            },
            eventClassNames: (arg) => {
                const type = arg.event.extendedProps.type;
                return [`event-type-${type}`];
            },
            eventContent: (arg) => {
                let timeText = '';
                if (!arg.event.allDay && arg.event.start) {
                    timeText = new Date(arg.event.start).toLocaleTimeString('ja-JP', {
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                }
                
                return {
                    html: `
                        <div class="fc-event-main-content">
                            ${timeText ? `<div class="fc-event-time">${timeText}</div>` : ''}
                            <div class="fc-event-title">${arg.event.title}</div>
                        </div>
                    `
                };
            },
            eventDidMount: (arg) => {
                // イベントの背景色を設定
                const type = arg.event.extendedProps.type;
                let backgroundColor;
                switch (type) {
                    case 'personal':
                        backgroundColor = '#007bff';
                        break;
                    case 'interview':
                        backgroundColor = '#ffc107';
                        break;
                    case 'task':
                        backgroundColor = '#28a745';
                        break;
                    case 'deadline':
                        backgroundColor = '#dc3545';
                        break;
                    default:
                        backgroundColor = '#6c757d';
                }
                arg.el.style.backgroundColor = backgroundColor;
            },
            height: 'auto',
            // 日本語化
            dayHeaderContent: (arg) => {
                const day = arg.text.split(' ')[0];
                return day + '曜日';
            },
            dayCellContent: (arg) => {
                return arg.dayNumberText.replace('日', '');
            },
            // イベントの表示制限を解除
            dayMaxEvents: false,
            // イベントの表示を調整
            eventDisplay: 'block',
            displayEventTime: true,
            displayEventEnd: true
        });

        this.calendar.render();
        this.loadSummaryData();
    }

    // カレンダーイベントの取得
    loadEvents() {
        const events = [];
        
        try {
            // カスタムイベントの読み込み
            const customEvents = JSON.parse(localStorage.getItem('calendarEvents') || '[]');
            events.push(...customEvents.map(event => {
                // イベントデータの構造を確認し、必要に応じて修正
                const eventData = {
                    id: event.id || Date.now().toString(),
                    title: event.title,
                    start: event.start,
                    end: event.end,
                    allDay: event.allDay ?? true,
                    extendedProps: {
                        type: event.type || event.extendedProps?.type || 'other',
                        location: event.location || event.extendedProps?.location || '',
                        description: event.description || event.extendedProps?.description || '',
                        url: event.url || event.extendedProps?.url || ''
                    }
                };
                return eventData;
            }));

            // 進捗トラッカーの締切日を読み込み
            const companies = JSON.parse(localStorage.getItem('companies') || '[]');
            events.push(...companies
                .filter(company => company.deadline)
                .map(company => ({
                    id: `company_${company.id}`,
                    title: `${company.name}の締切日`,
                    start: company.deadline,
                    allDay: true,
                    extendedProps: {
                    type: 'deadline',
                        companyId: company.id
                    }
                })));

            // タスクの締切日を読み込み
            const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
            events.push(...tasks
                .filter(task => task.dueDate && !task.completed)
                .map(task => ({
                    id: `task_${task.id}`,
                    title: task.title,
                    start: task.dueDate,
                    allDay: true,
                    extendedProps: {
                        type: 'task',
                        taskId: task.id
                    }
                })));

        } catch (error) {
            console.error('Error in loadEvents:', error);
        }

        return events;
    }

    // 日付クリック時の処理
    handleDateClick(info) {
        // その日付のイベントを取得
        const events = this.getEventsForDate(info.dateStr);
        const deadlineEvents = events.filter(event => 
            event.extendedProps.type === 'deadline' && event.id.startsWith('company_')
        );

        if (deadlineEvents.length > 0) {
            // 進捗トラッカーの情報を表示
            this.showDeadlineInfo(deadlineEvents, info.dayEl);
        } else {
            // イベント追加モーダルを表示
            this.showEventModal(info.dateStr);
        }
    }

    // 指定日のイベントを取得
    getEventsForDate(date) {
        return this.calendar.getEvents().filter(event => {
            const eventDate = new Date(event.start);
            const targetDate = new Date(date);
            return eventDate.toDateString() === targetDate.toDateString();
        });
    }

    // 進捗トラッカーの情報を表示
    showDeadlineInfo(events, element) {
        // 既存のポップオーバーを削除
        const existingPopover = document.querySelector('.event-popover');
        if (existingPopover) {
            existingPopover.remove();
        }

        // 企業情報を取得
        const companies = JSON.parse(localStorage.getItem('companies') || '[]');
        const deadlineInfo = events.map(event => {
            const companyId = event.extendedProps.companyId;
            const company = companies.find(c => c.id === companyId);
            return company ? {
                name: company.name,
                status: company.status || '未着手',
                deadline: new Date(company.deadline).toLocaleDateString('ja-JP'),
                industry: company.industry || '未設定',
                location: company.location || '未設定'
            } : null;
        }).filter(Boolean);

        // ポップオーバーを作成
        const popover = document.createElement('div');
        popover.className = 'event-popover deadline-info';
        popover.innerHTML = `
            <div class="event-popover-header">
                <span class="event-popover-title">締切情報</span>
                <span class="event-popover-close">&times;</span>
            </div>
            <div class="event-popover-content">
                ${deadlineInfo.map(info => `
                    <div class="company-info">
                        <h4>${info.name}</h4>
                        <div class="info-grid">
                            <div class="info-item">
                                <span class="label">ステータス:</span>
                                <span class="value status-${info.status.replace(/\s+/g, '-')}">${info.status}</span>
                            </div>
                            <div class="info-item">
                                <span class="label">締切日:</span>
                                <span class="value">${info.deadline}</span>
                            </div>
                            <div class="info-item">
                                <span class="label">業界:</span>
                                <span class="value">${info.industry}</span>
                            </div>
                            <div class="info-item">
                                <span class="label">所在地:</span>
                                <span class="value">${info.location}</span>
                            </div>
                        </div>
                        <div class="company-actions">
                            <button class="btn-view" onclick="window.location.href='pages/tracker.html'">
                                詳細を見る
                            </button>
                        </div>
                    </div>
                `).join('<hr>')}
            </div>
        `;

        // ポップオーバーの位置を設定
        const rect = element.getBoundingClientRect();
        popover.style.top = `${rect.bottom + window.scrollY + 5}px`;
        popover.style.left = `${rect.left + window.scrollX}px`;

        document.body.appendChild(popover);

        // 閉じるボタンの処理
        const closeBtn = popover.querySelector('.event-popover-close');
        closeBtn.onclick = () => popover.remove();

        // ポップオーバー外クリックで閉じる
        document.addEventListener('click', (e) => {
            if (!popover.contains(e.target) && !element.contains(e.target)) {
                popover.remove();
            }
        });
    }

    // イベントクリック時の処理
    handleEventClick(info) {
        const event = info.event;
        const type = event.extendedProps.type;

        // イベントの種類に応じたポップオーバーを表示
        if (type === 'deadline') {
            this.showDeadlineEventPopover(event, info.el);
        } else if (type === 'task') {
            this.showTaskEventPopover(event, info.el);
        } else {
            this.showCustomEventPopover(event, info.el);
        }
    }

    // 締切イベントのポップオーバー表示
    showDeadlineEventPopover(event, element) {
        const companies = JSON.parse(localStorage.getItem('companies') || '[]');
        const companyId = event.extendedProps.companyId;
        const company = companies.find(c => c.id === companyId);

        if (!company) return;

        const popover = document.createElement('div');
        popover.className = 'event-popover deadline-info';
        popover.innerHTML = `
            <div class="event-popover-header">
                <span class="event-popover-title">${company.name}</span>
                <span class="event-popover-close">&times;</span>
            </div>
            <div class="event-popover-content">
                <div class="info-grid">
                    <div class="info-item">
                        <span class="label">ステータス:</span>
                        <span class="value status-${company.status?.replace(/\s+/g, '-') || '未着手'}">${company.status || '未着手'}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">締切日:</span>
                        <span class="value">${new Date(company.deadline).toLocaleDateString('ja-JP')}</span>
                    </div>
                </div>
                <div class="popover-actions">
                    <button class="btn-view" onclick="window.location.href='pages/tracker.html'">進捗トラッカーで確認</button>
                </div>
            </div>
        `;

        this.showPopover(popover, element);
    }

    // タスクイベントのポップオーバー表示
    showTaskEventPopover(event, element) {
        const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        const taskId = event.extendedProps.taskId;
        const task = tasks.find(t => t.id === taskId);

        if (!task) return;

        const popover = document.createElement('div');
        popover.className = 'event-popover task-info';
        popover.innerHTML = `
            <div class="event-popover-header">
                <span class="event-popover-title">${task.title}</span>
                <span class="event-popover-close">&times;</span>
            </div>
            <div class="event-popover-content">
                <div class="info-grid">
                    <div class="info-item">
                        <span class="label">期限:</span>
                        <span class="value">${new Date(task.dueDate).toLocaleDateString('ja-JP')}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">優先度:</span>
                        <span class="value priority-${task.priority}">${task.priority}</span>
                    </div>
                    ${task.description ? `
                        <div class="info-item">
                            <span class="label">詳細:</span>
                            <span class="value">${task.description}</span>
                        </div>
                    ` : ''}
                </div>
                <div class="popover-actions">
                    <button class="btn-view" onclick="window.location.href='pages/tasks.html'">タスク管理で確認</button>
                </div>
            </div>
        `;

        this.showPopover(popover, element);
    }

    // カスタムイベントのポップオーバー表示
    showCustomEventPopover(event, element) {
        const popover = document.createElement('div');
        popover.className = 'event-popover custom-event-info';
        popover.innerHTML = `
            <div class="event-popover-header">
                <span class="event-popover-title">${event.title}</span>
                <span class="event-popover-close">&times;</span>
            </div>
            <div class="event-popover-content">
                <div class="info-grid">
                    <div class="info-item">
                        <span class="label">タイプ:</span>
                        <span class="value event-type-${event.extendedProps.type}">${this.getEventTypeName(event.extendedProps.type)}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">日付:</span>
                        <span class="value">${new Date(event.start).toLocaleDateString('ja-JP', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            weekday: 'long'
                        })}</span>
                    </div>
                    ${!event.allDay ? `
                        <div class="info-item">
                            <span class="label">時間:</span>
                            <span class="value">
                                ${new Date(event.start).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                                ${event.end ? ` ～ ${new Date(event.end).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}` : ''}
                            </span>
                        </div>
                    ` : `
                        <div class="info-item">
                            <span class="label">時間:</span>
                            <span class="value">終日</span>
                        </div>
                    `}
                    ${event.extendedProps.location ? `
                        <div class="info-item">
                            <span class="label">場所:</span>
                            <span class="value">${event.extendedProps.location}</span>
                        </div>
                    ` : ''}
                    ${event.extendedProps.description ? `
                        <div class="info-item description">
                            <span class="label">詳細:</span>
                            <span class="value">${event.extendedProps.description.replace(/\n/g, '<br>')}</span>
                        </div>
                    ` : ''}
                    ${event.extendedProps.url ? `
                        <div class="info-item">
                            <span class="label">URL:</span>
                            <span class="value"><a href="${event.extendedProps.url}" target="_blank" rel="noopener noreferrer">${event.extendedProps.url}</a></span>
                        </div>
                    ` : ''}
                </div>
                <div class="popover-actions">
                    <button class="btn-edit">編集</button>
                    <button class="btn-delete">削除</button>
                </div>
            </div>
        `;

        this.showPopover(popover, element);

        // 編集ボタンの処理
        const editBtn = popover.querySelector('.btn-edit');
        editBtn.onclick = () => {
            popover.remove();
            this.showEventModal(event.startStr, event);
        };

        // 削除ボタンの処理
        const deleteBtn = popover.querySelector('.btn-delete');
        deleteBtn.onclick = () => {
            if (confirm('このイベントを削除してもよろしいですか？')) {
                let events = JSON.parse(localStorage.getItem('calendarEvents') || '[]');
                events = events.filter(e => e.id !== event.id);
                localStorage.setItem('calendarEvents', JSON.stringify(events));
                this.calendar.refetchEvents();
                popover.remove();
            }
        };
    }

    // ポップオーバーの共通表示処理
    showPopover(popover, element) {
        // 既存のポップオーバーを削除
        const existingPopover = document.querySelector('.event-popover');
        if (existingPopover) {
            existingPopover.remove();
        }

        // ポップオーバーの位置を設定
        const rect = element.getBoundingClientRect();
        popover.style.top = `${rect.bottom + window.scrollY + 5}px`;
        popover.style.left = `${rect.left + window.scrollX}px`;

        document.body.appendChild(popover);

        // 閉じるボタンの処理
        const closeBtn = popover.querySelector('.event-popover-close');
        closeBtn.onclick = () => popover.remove();

        // ポップオーバー外クリックで閉じる
        document.addEventListener('click', (e) => {
            if (!popover.contains(e.target) && !element.contains(e.target)) {
                popover.remove();
            }
        });
    }

    // イベントタイプの日本語名を取得
    getEventTypeName(type) {
        const typeNames = {
            'personal': '個人予定',
            'interview': '面接',
            'task': 'タスク',
            'deadline': '締切',
            'other': 'その他'
        };
        return typeNames[type] || 'その他';
    }

    // イベントの保存
    saveEvent(eventData, existingEvent = null) {
        try {
            const events = JSON.parse(localStorage.getItem('calendarEvents') || '[]');
            
            // タイムゾーンを考慮した日付処理
            let startDate = new Date(eventData.start);
            if (eventData.allDay) {
                // 終日イベントの場合、UTCの00:00に設定
                startDate = new Date(Date.UTC(
                    startDate.getFullYear(),
                    startDate.getMonth(),
                    startDate.getDate()
                ));
            }
            
            let endDate = null;
            if (eventData.end) {
                endDate = new Date(eventData.end);
                if (eventData.allDay) {
                    // 終日イベントの場合、UTCの00:00に設定
                    endDate = new Date(Date.UTC(
                        endDate.getFullYear(),
                        endDate.getMonth(),
                        endDate.getDate()
                    ));
                }
            }

            // 新しいイベントデータを作成
            const newEvent = {
                id: existingEvent?.id || Date.now().toString(),
                title: eventData.title,
                start: startDate.toISOString(),
                end: endDate ? endDate.toISOString() : null,
                allDay: eventData.allDay,
                type: eventData.type,
                extendedProps: {
                    type: eventData.type,
                    location: eventData.location || '',
                    description: eventData.description || '',
                    url: eventData.url || ''
                }
            };

            // 既存のイベントを更新または新規イベントを追加
            if (existingEvent) {
                const index = events.findIndex(e => e.id === existingEvent.id);
                if (index !== -1) {
                    events[index] = newEvent;
                } else {
                    events.push(newEvent);
                }
            } else {
                events.push(newEvent);
            }

            localStorage.setItem('calendarEvents', JSON.stringify(events));
            this.calendar.refetchEvents();
        } catch (error) {
            console.error('Error saving event:', error);
            throw error;
        }
    }

    // イベント追加/編集モーダルの表示
    showEventModal(date, existingEvent = null) {
        // 日付と時間の処理
        let defaultDate = date;
        let defaultStartTime = '09:00';
        let defaultEndTime = '10:00';
        let isAllDay = true;

        if (existingEvent) {
            // タイムゾーンを考慮した日付処理
            const startDate = new Date(existingEvent.start);
            // UTCからローカル時間に変換
            defaultDate = new Date(startDate.getTime() - (startDate.getTimezoneOffset() * 60000))
                .toISOString()
                .split('T')[0];
            
            if (!existingEvent.allDay) {
                isAllDay = false;
                defaultStartTime = startDate.toLocaleTimeString('ja-JP', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                });

                if (existingEvent.end) {
                    const endDate = new Date(existingEvent.end);
                    defaultEndTime = endDate.toLocaleTimeString('ja-JP', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                    });
                }
            }
        }

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${existingEvent ? 'イベントを編集' : '新規イベントを追加'}</h3>
                    <span class="close">&times;</span>
                </div>
                <div class="modal-body">
                    <form id="eventForm">
                        <div class="form-group">
                            <label for="eventTitle">タイトル</label>
                            <input type="text" id="eventTitle" required value="${existingEvent?.title || ''}">
                        </div>
                        <div class="form-group">
                            <label for="eventType">イベントタイプ</label>
                            <select id="eventType" required>
                                <option value="personal" class="type-personal" ${existingEvent?.extendedProps?.type === 'personal' ? 'selected' : ''}>👤 個人予定</option>
                                <option value="interview" class="type-interview" ${existingEvent?.extendedProps?.type === 'interview' ? 'selected' : ''}>🗣️ 面接</option>
                                <option value="other" class="type-other" ${existingEvent?.extendedProps?.type === 'other' ? 'selected' : ''}>📝 その他</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="eventDate">日付</label>
                            <input type="date" id="eventDate" required value="${defaultDate}">
                        </div>
                        <div class="form-group time-group">
                            <div class="checkbox-group">
                                <input type="checkbox" id="isAllDay" ${isAllDay ? 'checked' : ''}>
                                <label for="isAllDay">終日</label>
                            </div>
                            <div class="time-inputs" id="timeInputs" style="display: ${isAllDay ? 'none' : 'flex'}">
                                <div>
                                    <label for="startTime">開始時間</label>
                                    <input type="time" id="startTime" value="${defaultStartTime}">
                                </div>
                                <div>
                                    <label for="endTime">終了時間</label>
                                    <input type="time" id="endTime" value="${defaultEndTime}">
                                </div>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="eventLocation">場所</label>
                            <input type="text" id="eventLocation" value="${existingEvent?.extendedProps?.location || ''}">
                        </div>
                        <div class="form-group">
                            <label for="eventDescription">詳細</label>
                            <textarea id="eventDescription">${existingEvent?.extendedProps?.description || ''}</textarea>
                        </div>
                        <div class="form-group">
                            <label for="eventUrl">URL</label>
                            <input type="url" id="eventUrl" value="${existingEvent?.extendedProps?.url || ''}">
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn-cancel">キャンセル</button>
                    <button type="button" class="btn-save">保存</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // 終日チェックボックスの処理
        const isAllDayCheckbox = modal.querySelector('#isAllDay');
        const timeInputs = modal.querySelector('#timeInputs');
        isAllDayCheckbox.addEventListener('change', (e) => {
            timeInputs.style.display = e.target.checked ? 'none' : 'flex';
        });

        // モーダルを閉じる処理
        const closeModal = () => {
            modal.remove();
        };

        modal.querySelector('.close').onclick = closeModal;
        modal.querySelector('.btn-cancel').onclick = closeModal;

        // モーダル外クリックで閉じる
        modal.onclick = (e) => {
            if (e.target === modal) {
                closeModal();
            }
        };

        // 保存ボタンの処理
        modal.querySelector('.btn-save').onclick = () => {
            this.handleEventSave(modal, existingEvent);
        };
    }

    // イベント追加モーダルの保存ボタンの処理
    handleEventSave(modal, existingEvent = null) {
        const title = modal.querySelector('#eventTitle').value;
        const type = modal.querySelector('#eventType').value;
        const date = modal.querySelector('#eventDate').value;
        const isAllDay = modal.querySelector('#isAllDay').checked;
        const startTime = modal.querySelector('#startTime').value;
        const endTime = modal.querySelector('#endTime').value;
        const location = modal.querySelector('#eventLocation').value;
        const description = modal.querySelector('#eventDescription').value;
        const url = modal.querySelector('#eventUrl').value;

        if (!title || !date) {
            alert('タイトルと日付は必須です');
            return;
        }

        // タイムゾーンを考慮した日付処理
        const eventData = {
            title: title,
            start: isAllDay ? date : `${date}T${startTime}`,
            end: isAllDay ? null : `${date}T${endTime}`,
            allDay: isAllDay,
            type: type,
            location: location,
            description: description,
            url: url
        };

        this.saveEvent(eventData, existingEvent);
        modal.remove();
    }

    // イベントの削除
    deleteEvent(eventId) {
        try {
            let events = JSON.parse(localStorage.getItem('calendarEvents') || '[]');
            
            // eventsが配列でない場合は新しい配列を作成
            if (!Array.isArray(events)) {
                events = [];
            }

            // イベントを削除
            events = events.filter(e => e.id !== eventId);
            
            // 更新したイベントリストを保存
            localStorage.setItem('calendarEvents', JSON.stringify(events));
            
            // カレンダーを更新
            this.calendar.refetchEvents();
        } catch (error) {
            console.error('Error deleting event:', error);
            alert('イベントの削除中にエラーが発生しました。');
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

// HomeManagerのインスタンスを作成
const homeManager = new HomeManager();

// 保存された軸診断結果を表示
function displayAxisResults() {
    const savedResults = JSON.parse(localStorage.getItem('savedAxisResults') || '[]');
    const latestResultDiv = document.getElementById('latestAxisResult');
    const savedResultsSection = document.getElementById('savedAxisResults');
    const resultsContainer = savedResultsSection.querySelector('.results-container');

    if (savedResults.length > 0) {
        // 最新の結果を表示
        const latest = savedResults[savedResults.length - 1];
        latestResultDiv.innerHTML = `
            <div class="latest-result">
                <h4>${latest.type}</h4>
                <p class="catchphrase">${latest.mainType.catchphrase}</p>
                <div class="type-scores-mini">
                    ${Object.entries(latest.scores).map(([type, score]) => {
                        const maxScore = Math.max(...Object.values(latest.scores));
                        const percentage = (score / maxScore) * 100;
                        return `
                            <div class="score-bar-mini">
                                <span class="type-label-mini">タイプ${type}</span>
                                <div class="bar-container-mini">
                                    <div class="bar-mini" style="width: ${percentage}%"></div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
                <button class="view-details" onclick="showResultDetails(${savedResults.length - 1})">詳細を見る</button>
            </div>
        `;

        // 保存済みの結果一覧を表示
        if (savedResults.length > 1) {
            savedResultsSection.style.display = 'block';
            resultsContainer.innerHTML = savedResults.slice().reverse().map((result, index) => {
                const date = new Date(result.timestamp).toLocaleDateString('ja-JP');
                return `
                    <div class="saved-result-card">
                        <div class="result-header">
                            <h4>${result.type}</h4>
                            <span class="date">${date}</span>
                        </div>
                        <p class="catchphrase">${result.mainType.catchphrase}</p>
                        <div class="type-scores-mini">
                            ${Object.entries(result.scores).map(([type, score]) => {
                                const maxScore = Math.max(...Object.values(result.scores));
                                const percentage = (score / maxScore) * 100;
                                return `
                                    <div class="score-bar-mini">
                                        <span class="type-label-mini">タイプ${type}</span>
                                        <div class="bar-container-mini">
                                            <div class="bar-mini" style="width: ${percentage}%"></div>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                        <button class="btn-details" onclick="showResultDetails(${index})">詳細を表示</button>
                    </div>
                `;
            }).join('');
        }
    } else {
        // 結果がない場合
        latestResultDiv.innerHTML = `
            <div class="no-result">
                <p>まだ診断結果がありません</p>
                <a href="pages/axis.html" class="btn btn-primary">軸を診断する</a>
            </div>
        `;
    }
}

// 結果の詳細を表示するモーダル
function showResultDetails(index) {
    const savedResults = JSON.parse(localStorage.getItem('savedAxisResults') || '[]');
    const result = savedResults.slice().reverse()[index];
    
    // 既存のモーダルがあれば削除
    const existingModal = document.querySelector('.modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // モーダルを作成
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <div class="modal-header">
                <h3>${result.type}</h3>
                <span class="date">${new Date(result.timestamp).toLocaleDateString('ja-JP')}</span>
            </div>
            <p class="catchphrase">${result.mainType.catchphrase}</p>
            
            <div class="type-scores">
                ${Object.entries(result.scores).map(([type, score]) => {
                    const maxScore = Math.max(...Object.values(result.scores));
                    const percentage = (score / maxScore) * 100;
                    return `
                        <div class="score-bar">
                            <div class="type-info">
                                <span class="type-label">タイプ${type}</span>
                                <span class="type-description">${getTypeDescription(type)}</span>
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
            
            <h4>Must（譲れない価値観）</h4>
            <p>${result.mainType.must}</p>
            
            <h4>Want（できれば満たしたい働き方）</h4>
            <p>${result.mainType.want}</p>
            
            <h4>Negative（避けたい環境）</h4>
            <ul>
                ${result.mainType.negatives.map(item => `<li>${item}</li>`).join('')}
            </ul>
            
            <h4>向いている企業例</h4>
            <div class="suitable-companies">
                ${result.mainType.suitableCompanies.map(company => `
                    <span class="tag">${company}</span>
                `).join('')}
            </div>
            
            <h4>企業選定のポイント</h4>
            <div class="check-points">
                <h5>確認すべき資料</h5>
                <div class="materials">
                    ${result.mainType.checkPoints.materials.map(material => `
                        <span class="tag">${material}</span>
                    `).join('')}
                </div>
                
                <h5>見るべきポイント</h5>
                <p>${result.mainType.checkPoints.focus}</p>
                
                <h5>OB訪問で聞くこと</h5>
                <ul>
                    ${result.mainType.checkPoints.questions.map(q => `<li>${q}</li>`).join('')}
                </ul>
            </div>
        </div>
    `;

    // モーダルを表示
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);
    
    // 閉じるボタンの処理
    const closeBtn = modal.querySelector('.close');
    closeBtn.onclick = function() {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
    }
    
    // モーダル外クリックで閉じる
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        }
    }
}

// タイプの説明を取得する関数
function getTypeDescription(type) {
    const descriptions = {
        A: "社会基盤・共創型：社会インフラを支え、人々の暮らしを豊かにする人材",
        B: "成長牽引・挑戦型：高い目標を掲げ、新しい価値を創造する人材",
        C: "価値創造・プロダクト型：革新的なプロダクトで、ユーザー体験を向上させる人材",
        D: "専門性・課題解決型：専門性を活かし、複雑な課題を解決する人材",
        E: "地域共創・事業開発型：地域に根ざし、持続可能な価値を創造する人材"
    };
    return descriptions[type] || '';
}

// ページ読み込み時に実行
document.addEventListener('DOMContentLoaded', function() {
    displayAxisResults();
}); 