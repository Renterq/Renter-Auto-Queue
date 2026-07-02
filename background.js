// Firefox/Chrome uyumlu API
const ext = (typeof browser !== 'undefined') ? browser : chrome;

// Toolbar butonuna basilinca: SADECE aktif sekmeye content.js enjekte et.
// Ikinci basista content.js paneli gizler/gosterir (toggle).
ext.browserAction.onClicked.addListener((tab) => {
    try {
        ext.tabs.executeScript(tab.id, { file: "content.js" });
    } catch (e) {
        console.warn("Queue plugin inject error:", e);
    }
});
