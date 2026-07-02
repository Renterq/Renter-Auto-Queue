(function() {
    const ROOT_ID = 'qc-container';

    // Toolbar'a tekrar basildiysa: paneli gizle/goster, kodu yeniden kurma.
    if (window.__queuePluginInjected) {
        const c = document.getElementById(ROOT_ID);
        if (c) c.style.display = (c.style.display === 'none') ? 'block' : 'none';
        return;
    }
    window.__queuePluginInjected = true;

    let clickCount = 0;
    let isRunning = false;
    let audioContext = null;
    let wakeLock = null;
    let observer = null;
    let aggressiveInterval = null;
    let heartbeatInterval = null;
    let audioOscillator = null;

    let targetText = 'Join Queue';

    function getTarget() {
        const input = document.getElementById('qc-target');
        const v = input ? input.value.trim() : '';
        return v.length ? v : 'Join Queue';
    }

    // ---- Arka plan koruma: sekme arka plandayken bile calismaya devam ----
    function setupUltimateBackgroundProtection() {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            audioOscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            gainNode.gain.value = 0.000001;
            audioOscillator.frequency.value = 1;
            audioOscillator.type = 'sine';
            audioOscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            audioOscillator.start(0);
            setInterval(() => {
                if (audioContext && audioContext.state === 'suspended') audioContext.resume();
            }, 1000);
        } catch(e) { console.warn('Audio failed:', e); }

        async function requestWakeLock() {
            if ('wakeLock' in navigator) {
                try {
                    wakeLock = await navigator.wakeLock.request('screen');
                    wakeLock.addEventListener('release', () => {
                        if (isRunning) setTimeout(requestWakeLock, 100);
                    });
                } catch(e) {}
            }
        }
        requestWakeLock();

        aggressiveInterval = setInterval(() => { if(isRunning) findAndClickButton(); }, 30);
        heartbeatInterval = setInterval(() => { if(isRunning) console.log(`💓 ${document.hidden?'BACKGROUND':'foreground'} - clicks ${clickCount}`); }, 5000);

        document.addEventListener('visibilitychange', () => {
            if(!document.hidden && isRunning && audioContext && audioContext.state==='suspended') audioContext.resume();
            if(isRunning) findAndClickButton();
        });
        window.addEventListener('focus', () => { if(isRunning) findAndClickButton(); });
        setInterval(() => { if(isRunning) document.dispatchEvent(new Event('mousemove')); }, 3000);
    }

    function setupInstantDetection() {
        observer = new MutationObserver(() => { if(isRunning) findAndClickButton(); });
        observer.observe(document.body, { childList:true, subtree:true, attributes:true, attributeFilter:['disabled','class','style','hidden','aria-disabled'] });
    }

    let cachedButton=null, cachedSelector=null;
    function matches(btn) {
        return btn.textContent.trim() === targetText && !btn.disabled;
    }
    function findAndClickButton() {
        try {
            const t = getTarget();
            if (t !== targetText) { targetText = t; cachedButton = null; cachedSelector = null; }

            if(cachedButton && document.body.contains(cachedButton) && matches(cachedButton)) { performClick(cachedButton); return true; }
            if(cachedSelector) { const b=document.querySelector(cachedSelector); if(b && matches(b)) { cachedButton=b; performClick(b); return true; } }
            const buttons=document.querySelectorAll('button, [role="button"], input[type="button"], input[type="submit"]');
            for(const btn of buttons){ if(matches(btn)){ cachedButton=btn; if(btn.id) cachedSelector=`#${btn.id}`; else if(btn.className && typeof btn.className==='string'){ const classes=btn.className.split(' ').filter(c=>c); if(classes.length>0) cachedSelector=`${btn.tagName.toLowerCase()}.${classes[0]}`;} performClick(btn); return true; } }
            return false;
        } catch(e){ return false; }
    }

    let lastClickTime=0;
    function performClick(button) {
        try{
            const now=Date.now();
            if(now-lastClickTime<20) return;
            lastClickTime=now;
            try{button.focus();}catch(e){}
            button.click();
            try{
                const rect=button.getBoundingClientRect(), x=rect.left+rect.width/2, y=rect.top+rect.height/2;
                ['mousedown','mouseup','click'].forEach(type => button.dispatchEvent(new MouseEvent(type,{bubbles:true,cancelable:true,view:window,clientX:x,clientY:y,button:0})));
            }catch(e){}
            try{['pointerdown','pointerup'].forEach(type=>button.dispatchEvent(new PointerEvent(type,{bubbles:true,cancelable:true,view:window,pointerId:1,pointerType:'mouse',isPrimary:true})));}catch(e){}
            try{['touchstart','touchend'].forEach(type=>button.dispatchEvent(new TouchEvent(type,{bubbles:true,cancelable:true,view:window})));}catch(e){}
            clickCount++;
            updateUI();
        }catch(e){}
    }

    function updateUI() { try{ const el=document.getElementById('qc-clicks'); if(el) el.textContent=clickCount; }catch(e){} }

    // ---------------- Discord tarzi arayuz ----------------
    const style=document.createElement('style');
    style.textContent=`
        .qc-container{
            position:fixed;top:20px;right:20px;z-index:2147483647;width:300px;
            background:#313338;border-radius:8px;
            box-shadow:0 8px 24px rgba(0,0,0,0.6);
            font-family:"gg sans","Noto Sans","Helvetica Neue",Helvetica,Arial,sans-serif;
            color:#f2f3f5;overflow:hidden;
            -webkit-font-smoothing:antialiased;
        }
        .qc-header{
            background:#2b2d31;padding:14px 16px;display:flex;align-items:center;gap:10px;
            cursor:grab;position:relative;border-bottom:1px solid #1f2023;
        }
        .qc-header:active{cursor:grabbing;}
        .qc-dot{width:10px;height:10px;border-radius:50%;background:#5865f2;flex:0 0 auto;box-shadow:0 0 8px rgba(88,101,242,0.7);}
        .qc-logo{font-size:16px;font-weight:700;margin:0;line-height:1;color:#f2f3f5;letter-spacing:0.2px;}
        .qc-sub{font-size:11px;color:#949ba4;margin:2px 0 0 0;font-weight:500;}
        .qc-titlewrap{display:flex;flex-direction:column;}
        .qc-close-btn{
            position:absolute;top:10px;right:10px;background:transparent;border:none;color:#949ba4;
            width:22px;height:22px;cursor:pointer;font-size:20px;line-height:22px;border-radius:4px;
            display:flex;align-items:center;justify-content:center;transition:all .12s;font-weight:400;
        }
        .qc-close-btn:hover{color:#f2f3f5;background:#da373c;}
        .qc-body{padding:16px;background:#313338;}
        .qc-label{display:block;font-size:11px;color:#b5bac1;font-weight:700;text-transform:uppercase;letter-spacing:.4px;margin-bottom:8px;}
        .qc-input{
            width:100%;box-sizing:border-box;padding:11px 12px;background:#1e1f22;border:1px solid #1e1f22;
            border-radius:4px;color:#dbdee1;font-size:14px;outline:none;transition:border .12s;
            font-family:inherit;margin-bottom:16px;
        }
        .qc-input:focus{border-color:#5865f2;}
        .qc-input::placeholder{color:#6d6f78;}
        .qc-stats{background:#2b2d31;border-radius:8px;padding:16px;margin-bottom:16px;text-align:center;}
        .qc-clicks-label{font-size:11px;color:#949ba4;font-weight:700;text-transform:uppercase;letter-spacing:.4px;margin-bottom:8px;}
        .qc-clicks-value{font-size:38px;font-weight:800;color:#f2f3f5;line-height:1;font-variant-numeric:tabular-nums;}
        .qc-status{margin-top:12px;display:flex;align-items:center;justify-content:center;gap:7px;}
        .qc-status-led{width:9px;height:9px;border-radius:50%;background:#80848e;}
        .qc-status-text{font-size:12px;font-weight:600;color:#b5bac1;}
        .qc-active .qc-status-led{background:#23a55a;box-shadow:0 0 8px rgba(35,165,90,.7);}
        .qc-active .qc-status-text{color:#23a55a;}
        .qc-controls{display:flex;gap:8px;margin-bottom:14px;}
        .qc-button{
            flex:1;padding:12px;border:none;border-radius:4px;font-size:14px;font-weight:600;cursor:pointer;
            transition:background .12s;font-family:inherit;color:#fff;
        }
        .qc-start{background:#248046;}
        .qc-start:hover:not(:disabled){background:#1a6334;}
        .qc-stop{background:#da373c;}
        .qc-stop:hover:not(:disabled){background:#a12d2d;}
        .qc-button:disabled{opacity:.4;cursor:not-allowed;}
        .qc-info{background:#2b2d31;border-radius:8px;padding:12px;font-size:12px;color:#949ba4;text-align:center;line-height:1.5;}
        .qc-info-target{color:#5865f2;font-weight:700;}
        .qc-footer{background:#2b2d31;padding:11px;text-align:center;border-top:1px solid #1f2023;}
        .qc-credit{font-size:12px;color:#80848e;margin:0;}
        .qc-credit-by{color:#5865f2;font-weight:700;}
    `;
    document.head.appendChild(style);

    const container=document.createElement('div');
    container.className='qc-container';
    container.id=ROOT_ID;
    container.innerHTML=`
        <div class="qc-header">
            <span class="qc-dot"></span>
            <div class="qc-titlewrap">
                <h1 class="qc-logo">Queue</h1>
                <p class="qc-sub">Auto Queue</p>
            </div>
            <button class="qc-close-btn" id="qc-close-main">×</button>
        </div>
        <div class="qc-body">
            <label class="qc-label" for="qc-target">Hedef Buton Metni</label>
            <input type="text" id="qc-target" class="qc-input" value="Join Queue" placeholder="Join Queue" />
            <div class="qc-stats">
                <div class="qc-clicks-label">Toplam Tiklama</div>
                <div class="qc-clicks-value" id="qc-clicks">0</div>
                <div class="qc-status" id="qc-status-wrap">
                    <span class="qc-status-led"></span>
                    <span class="qc-status-text" id="qc-status-text">Durduruldu</span>
                </div>
            </div>
            <div class="qc-controls">
                <button class="qc-button qc-start" id="qc-start">Baslat</button>
                <button class="qc-button qc-stop" id="qc-stop" disabled>Durdur</button>
            </div>
            <div class="qc-info">Hedef: <span class="qc-info-target" id="qc-info-target">"Join Queue"</span><br>Arka plan sekmelerde de calisir</div>
        </div>
        <div class="qc-footer">
            <p class="qc-credit">made by <span class="qc-credit-by">Renter</span></p>
        </div>
    `;
    document.body.appendChild(container);

    const startBtn=document.getElementById('qc-start');
    const stopBtn=document.getElementById('qc-stop');
    const closeBtn=document.getElementById('qc-close-main');
    const statusWrap=document.getElementById('qc-status-wrap');
    const statusText=document.getElementById('qc-status-text');
    const targetInput=document.getElementById('qc-target');
    const infoTarget=document.getElementById('qc-info-target');

    const extAPI = (typeof browser !== 'undefined') ? browser : (typeof chrome !== 'undefined' ? chrome : null);

    targetInput.addEventListener('input', ()=>{
        infoTarget.textContent='"'+getTarget()+'"';
        try { if(extAPI && extAPI.storage) extAPI.storage.local.set({ qc_target: getTarget() }); } catch(e){}
    });

    startBtn.addEventListener('click',()=>{
        isRunning=true; targetText=getTarget(); cachedButton=null; cachedSelector=null;
        setupUltimateBackgroundProtection(); setupInstantDetection(); findAndClickButton();
        startBtn.disabled=true; stopBtn.disabled=false;
        statusWrap.classList.add('qc-active'); statusText.textContent='Aktif';
        console.log('🚀 Queue ACTIVE -> "'+targetText+'"');
    });
    stopBtn.addEventListener('click',()=>{
        isRunning=false;
        if(observer) observer.disconnect();
        if(aggressiveInterval) clearInterval(aggressiveInterval);
        if(heartbeatInterval) clearInterval(heartbeatInterval);
        if(audioOscillator) try{audioOscillator.stop();}catch(e){}
        if(audioContext) try{audioContext.close();}catch(e){}
        if(wakeLock) try{wakeLock.release();}catch(e){}
        cachedButton=null; cachedSelector=null;
        startBtn.disabled=false; stopBtn.disabled=true;
        statusWrap.classList.remove('qc-active'); statusText.textContent='Durduruldu';
        console.log('⏹️ Queue STOPPED');
    });
    closeBtn.addEventListener('click',()=>{
        if(isRunning) stopBtn.click();
        container.remove(); style.remove();
        window.__queuePluginInjected=false; // tekrar toolbar'a basinca yeniden acilabilsin
    });

    // ---- surukleme ----
    let isDragging=false, offsetX=0, offsetY=0;
    const header = container.querySelector('.qc-header');
    header.addEventListener('mousedown', (e)=>{
        if(e.target.id==='qc-close-main') return;
        isDragging=true;
        offsetX = e.clientX - container.offsetLeft;
        offsetY = e.clientY - container.offsetTop;
    });
    document.addEventListener('mousemove', (e)=>{
        if(isDragging){
            container.style.left = (e.clientX - offsetX)+'px';
            container.style.top = (e.clientY - offsetY)+'px';
            container.style.right = 'auto';
        }
    });
    document.addEventListener('mouseup', ()=>{ isDragging=false; });

    // ---- Tek tikla otomatik baslat ----
    // Toolbar'a basip enjekte olunca kaydedilmis hedefi yukle ve HEMEN baslat.
    function autoStart(){ if(!isRunning) startBtn.click(); }
    try {
        if (extAPI && extAPI.storage) {
            const res = extAPI.storage.local.get('qc_target');
            if (res && typeof res.then === 'function') {
                res.then((data)=>{
                    if (data && data.qc_target) { targetInput.value = data.qc_target; infoTarget.textContent='"'+getTarget()+'"'; }
                    autoStart();
                }).catch(()=>autoStart());
            } else {
                extAPI.storage.local.get('qc_target', (data)=>{
                    if (data && data.qc_target) { targetInput.value = data.qc_target; infoTarget.textContent='"'+getTarget()+'"'; }
                    autoStart();
                });
            }
        } else {
            autoStart();
        }
    } catch(e) { autoStart(); }

    console.log('⚡ Queue plugin LOADED (toolbar-triggered, auto-start)');
})();
