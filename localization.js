const fs = require('fs');
const path = require('path');

const lang_packs = JSON.parse(fs.readFileSync(path.join(__dirname, 'config', 'lang.json'), 'utf-8'));
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