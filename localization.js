// use hardcode localization
const lang_packs = {
    "ru": {
        "File": "Файл",
        "Paste": "Текст",
        "View": "Приложение",
        "help": "Помощь",
        "Speech": "Говорить",
        "about": "О нас",
        "services": "Сервисы",
        "hide": "Скрыть",
        "hideOthers": "Скрыть все",
        "unhide": "Показать",
        "quit": "Выйти",
        "close": "Закрыть",
        "undo": "Отменить",
        "redo": "Повторить",
        "cut": "Вырезать",
        "copy": "Копировать",
        "paste": "Вставить",
        "pasteAndMatchStyle": "Вставить (стильно)",
        "delete": "Удалить",
        "selectAll": "Выделить все",
        "startSpeaking": "Начать говорить",
        "stopSpeaking": "Закончить разговор",
        "reload": "Перезагрузка",
        "forceReload": "Перезагрузка (форсированная)",
        "toggleDevTools": "Средства разработчика",
        "resetZoom": "Сброс масштаба",
        "zoomIn": "Приблизить",
        "zoomOut": "Отдалить",
        "togglefullscreen": "Полноэкранный режим",
        "minimize": "Свернуть",
        "zoom": "Масштаб",
        "front": "Перед",
        "window": "Окно",
        "Learn More": "Подробная информация",
        "relaunch": "Перезапуск"
    },
    "en": {
        "File": "File",
        "Paste": "Text",
        "View": "App",
        "help": "Help",
        "Speech": "Speach",
        "about": "About us",
        "services": "Services",
        "hide": "Hide",
        "hideOthers": "Hide all",
        "unhide": "Unhide",
        "quit": "Quit",
        "close": "Close",
        "undo": "Undo",
        "redo": "Redo",
        "cut": "Cut",
        "copy": "Copy",
        "paste": "Paste",
        "pasteAndMatchStyle": "Past and match",
        "delete": "Delete",
        "selectAll": "Select all",
        "startSpeaking": "Start talking",
        "stopSpeaking": "Stop Speaking",
        "reload": "Reload",
        "forceReload": "Reload (force)",
        "toggleDevTools": "Dev tools",
        "resetZoom": "Reset Zoom",
        "zoomIn": "Zoom In",
        "zoomOut": "Zoom out",
        "togglefullscreen": "Fullscreen mode",
        "minimize": "Minimize",
        "zoom": "Zoom",
        "front": "Front",
        "window": "Window",
        "Learn More": "Learn more",
        "relaunch": "Relaunch"
    }
}

const getLangPack = lang => lang_packs[lang] ?? lang_packs['en'];

function getLangTemplate(lang = 'en', logoutHandler) {
    const lang_pack = getLangPack(lang);
    const t = key => lang_pack[key] || key;
    const isMac = process.platform === 'darwin'
    const template = [
        {
            label: t('View'),
            submenu: [
                { role: 'reload', label: t('reload') },
                {
                    role: 'forceReload',
                    label: t('forceReload')
                },
                { type: 'separator' },
                { role: 'resetZoom', label: t('resetZoom') },
                {
                    role: 'zoomIn',
                    label: t('zoomIn'),
                    accelerator: 'CmdOrCtrl+='
                },
                {
                    role: 'zoomOut',
                    label: t('zoomOut'),
                    accelerator: 'CmdOrCtrl+-'
                },
                { type: 'separator' },
                { role: 'togglefullscreen', label: t('togglefullscreen') },
                { role: 'minimize', label: t('minimize') },
                { type: 'separator' },
                { role: 'toggleDevTools', label: t('toggleDevTools'), visible: false },
                {
                    label: t('relaunch'),
                    click: async () => {
                        if (logoutHandler) await logoutHandler();
                    }
                },
                { role: 'quit', label: t('quit') }
            ]
        },
        {
            label: t('Paste'),
            submenu: [
                { role: 'undo', label: t('undo') },
                { role: 'redo', label: t('redo') },
                { type: 'separator' },
                { role: 'cut', label: t('cut') },
                { role: 'copy', label: t('copy') },
                { role: 'paste', label: t('paste') },
                ...(isMac
                    ? [
                        { role: 'pasteAndMatchStyle', label: t('pasteAndMatchStyle') },
                        { role: 'delete', label: t('delete') },
                        { role: 'selectAll', label: t('selectAll') },
                        { type: 'separator' }
                    ]
                    : [
                        { role: 'delete', label: t('delete') },
                        { type: 'separator' },
                        { role: 'selectAll', label: t('selectAll') }
                    ])
            ]
        }
    ]
    return template;
}

module.exports = { getLangTemplate };