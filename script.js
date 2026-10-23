const AMOUNTS = [
    1000, 2500, 5000, 7500, 10000, 15000, 20000, 25000, 50000, 75000, 100000, 250000, 500000,
    1000000, 1250000, 1500000, 2000000, 3000000, 4000000, 5000000, 10000000, 15000000, 20000000, 25000000, 50000000, 100000000
];

const ROUND_QUOTAS = [6, 5, 4, 3, 2, 1, 1, 1, 1, 1];

let gameState = {
    playerName: "Thí Sinh",
    cases: {},
    openedCases: [],
    openedCasesHistoryLog: [],
    bankerOffersHistoryLog: [],
    userPersonalCase: null,
    phase: 'WELCOME',
    currentRound: 0,
    casesOpenedThisRound: 0,
    currentBankerOffer: 0,
    acceptedDealAmount: null,
    hasAcceptedDealBefore: false,
    audioEnabled: true,
    isLocked: false
};

let highlightedPrizeVal = null;
let audioCtx = null;

function initAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playSound(type, amount = 0) {
    if (!gameState.audioEnabled) return;
    try {
        initAudioContext();
        if (!audioCtx) return;
        const now = audioCtx.currentTime;

        if (type === 'click') {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(350, now);
            osc.frequency.exponentialRampToValueAtTime(700, now + 0.05);
            gain.gain.setValueAtTime(0.05, now);
            gain.gain.linearRampToValueAtTime(0.005, now + 0.05);
            osc.start(now);
            osc.stop(now + 0.05);
        } else if (type === 'open') {
            if (amount < 1000000) {
                const notes = [523.25, 659.25, 783.99];
                notes.forEach((freq, idx) => {
                    const o = audioCtx.createOscillator();
                    const g = audioCtx.createGain();
                    o.connect(g);
                    g.connect(audioCtx.destination);
                    o.type = 'sine';
                    o.frequency.setValueAtTime(freq, now + idx * 0.1);
                    g.gain.setValueAtTime(0.08, now + idx * 0.1);
                    g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.3);
                    o.start(now + idx * 0.1);
                    o.stop(now + idx * 0.1 + 0.3);
                });
            } else if (amount >= 1000000 && amount < 10000000) {
                const notes = [329.63, 392.00];
                notes.forEach((freq, idx) => {
                    const o = audioCtx.createOscillator();
                    const g = audioCtx.createGain();
                    o.connect(g);
                    g.connect(audioCtx.destination);
                    o.type = 'sine';
                    o.frequency.setValueAtTime(freq, now + idx * 0.15);
                    g.gain.setValueAtTime(0.09, now + idx * 0.15);
                    g.gain.linearRampToValueAtTime(0.005, now + idx * 0.15 + 0.35);
                    o.start(now + idx * 0.15);
                    o.stop(now + idx * 0.15 + 0.35);
                });
            } else if (amount >= 10000000 && amount < 50000000) {
                const notes = [220.00, 261.63, 329.63];
                notes.forEach((freq, idx) => {
                    const o = audioCtx.createOscillator();
                    const g = audioCtx.createGain();
                    o.connect(g);
                    g.connect(audioCtx.destination);
                    o.type = 'triangle';
                    o.frequency.setValueAtTime(freq, now + idx * 0.12);
                    g.gain.setValueAtTime(0.08, now + idx * 0.12);
                    g.gain.exponentialRampToValueAtTime(0.002, now + idx * 0.12 + 0.4);
                    o.start(now + idx * 0.12);
                    o.stop(now + idx * 0.12 + 0.4);
                });
            } else {
                const notes = [174.61, 220.00, 261.63];
                notes.forEach((freq, idx) => {
                    const o = audioCtx.createOscillator();
                    const g = audioCtx.createGain();
                    o.connect(g);
                    g.connect(audioCtx.destination);
                    o.type = 'sine';
                    o.frequency.setValueAtTime(freq, now + idx * 0.15);
                    g.gain.setValueAtTime(0.1, now + idx * 0.15);
                    g.gain.linearRampToValueAtTime(0.001, now + idx * 0.15 + 0.5);
                    o.start(now + idx * 0.15);
                    o.stop(now + idx * 0.15 + 0.5);
                });
            }
        } else if (type === 'banker') {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(440, now);
            osc.frequency.setValueAtTime(554.37, now + 0.15);
            gain.gain.setValueAtTime(0.08, now);
            gain.gain.linearRampToValueAtTime(0.005, now + 0.35);
            osc.start(now);
            osc.stop(now + 0.35);
        } else if (type === 'win') {
            const notes = [523.25, 659.25, 783.99, 1046.50];
            notes.forEach((freq, idx) => {
                const o = audioCtx.createOscillator();
                const g = audioCtx.createGain();
                o.connect(g);
                g.connect(audioCtx.destination);
                o.type = 'sine';
                o.frequency.setValueAtTime(freq, now + idx * 0.15);
                g.gain.setValueAtTime(0.1, now + idx * 0.15);
                g.gain.linearRampToValueAtTime(0.005, now + idx * 0.15 + 0.4);
                o.start(now + idx * 0.15);
                o.stop(now + idx * 0.15 + 0.4);
            });
        }
    } catch (e) {
        console.log("Audio error:", e);
    }
}

function toggleAudio() {
    gameState.audioEnabled = !gameState.audioEnabled;
    const btn = document.getElementById('audio-toggle-btn');
    btn.innerText = gameState.audioEnabled ? '🔊' : '🔇';
    btn.title = gameState.audioEnabled ? 'Tắt âm thanh' : 'Bật âm thanh';
}

function formatMoney(amount) {
    return amount.toLocaleString('vi-VN');
}

function toggleDropdown(contentId, arrowId) {
    playSound('click');
    const content = document.getElementById(contentId);
    const arrow = document.getElementById(arrowId);
    
    content.classList.toggle('open');
    arrow.classList.toggle('rotated');
}

function startGameSession() {
    const inputVal = document.getElementById('player-name-input').value.trim();
    if (inputVal) gameState.playerName = inputVal;

    playSound('click');
    const welcomeScreen = document.getElementById('welcome-screen');
    const card = welcomeScreen.querySelector('.modal-card');
    
    card.classList.remove('scale-100', 'opacity-100');
    card.classList.add('scale-90', 'opacity-0');
    welcomeScreen.classList.add('opacity-0');

    setTimeout(() => {
        welcomeScreen.classList.add('hidden');
    }, 450);
    
    resetGameData();
}

function resetGameData() {
    let shuffled = [...AMOUNTS];
    for (let round = 0; round < 3; round++) {
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
    }
    for (let k = 0; k < 10; k++) {
        const idx1 = Math.floor(Math.random() * shuffled.length);
        const idx2 = Math.floor(Math.random() * shuffled.length);
        [shuffled[idx1], shuffled[idx2]] = [shuffled[idx2], shuffled[idx1]];
    }

    gameState.cases = {};
    for (let i = 1; i <= 26; i++) {
        gameState.cases[i] = shuffled[i - 1];
    }
    gameState.openedCases = [];
    gameState.openedCasesHistoryLog = [];
    gameState.bankerOffersHistoryLog = [];
    gameState.userPersonalCase = null;
    gameState.phase = 'SELECT_PERSONAL_CASE';
    gameState.currentRound = 0;
    gameState.casesOpenedThisRound = 0;
    gameState.currentBankerOffer = 0;
    gameState.acceptedDealAmount = null;
    gameState.hasAcceptedDealBefore = false;
    gameState.isLocked = false;
    highlightedPrizeVal = null;

    closeModalSmoothly('banker-modal', 'banker-modal-content');
    closeModalSmoothly('gameover-modal', 'gameover-modal-content');

    renderAll();
}

function confirmReset() {
    if (confirm("Bạn có chắc chắn muốn bắt đầu lại ván chơi không?")) {
        resetGameData();
    }
}

function resetGame() {
    closeModalSmoothly('gameover-modal', 'gameover-modal-content', () => {
        resetGameData();
    });
}

function renderAll() {
    renderPrizesBoards();
    renderCasesGrid();
    renderInstructionBanner();
    renderUserPersonalCasePreview();
    renderHistoryLogs();
}

function renderPrizesBoards() {
    const blueContainer = document.getElementById('blue-prizes');
    const redContainer = document.getElementById('red-prizes');
    blueContainer.innerHTML = '';
    redContainer.innerHTML = '';

    const blueAmounts = AMOUNTS.slice(0, 13);
    const redAmounts = AMOUNTS.slice(13, 26);

    blueAmounts.forEach((val, idx) => {
        const opened = isAmountOpenedOrPersonal(val);
        const isHighlighted = (val === highlightedPrizeVal);
        const div = document.createElement('div');
        div.id = `prize-item-${val}`;

        const isLastItem = (idx === blueAmounts.length - 1);
        let cssClasses = "py-1.5 px-1 rounded-md text-[10px] sm:text-xs font-black text-center transition-all duration-300 ease-out flex items-center justify-center ";
        if (isLastItem) {
            cssClasses += "col-span-2 lg:col-span-1 ";
        }

        if (isHighlighted) {
            cssClasses += "highlight-prize";
        } else if (opened) {
            cssClasses += "bg-slate-900/40 text-slate-600 line-through border border-slate-800/80 scale-95 opacity-40";
        } else {
            cssClasses += "bg-cyan-950/70 text-cyan-300 border border-cyan-800/40 shadow-sm";
        }

        div.className = cssClasses;
        div.innerText = formatMoney(val);
        blueContainer.appendChild(div);
    });

    redAmounts.forEach((val, idx) => {
        const opened = isAmountOpenedOrPersonal(val);
        const isHighlighted = (val === highlightedPrizeVal);
        const div = document.createElement('div');
        div.id = `prize-item-${val}`;

        const isLastItem = (idx === redAmounts.length - 1);
        let cssClasses = "py-1.5 px-1 rounded-md text-[10px] sm:text-xs font-black text-center transition-all duration-300 ease-out flex items-center justify-center ";
        if (isLastItem) {
            cssClasses += "col-span-2 lg:col-span-1 ";
        }

        if (isHighlighted) {
            cssClasses += "highlight-prize";
        } else if (opened) {
            cssClasses += "bg-slate-900/40 text-slate-600 line-through border border-slate-800/80 scale-95 opacity-40";
        } else {
            cssClasses += "bg-rose-950/70 text-rose-400 border border-rose-800/40 shadow-sm";
        }

        div.className = cssClasses;
        div.innerText = formatMoney(val);
        redContainer.appendChild(div);
    });
}

function isAmountOpenedOrPersonal(val) {
    for (let cNum of gameState.openedCases) {
        if (gameState.cases[cNum] === val) return true;
    }
    return false;
}

function renderCasesGrid() {
    const grid = document.getElementById('cases-grid');
    grid.innerHTML = '';

    const rowLayout = [5, 5, 6, 5, 5];
    let caseNumber = 1;

    rowLayout.forEach((count) => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'flex justify-center gap-1.5 sm:gap-2.5 w-full';

        for (let j = 0; j < count; j++) {
            if (caseNumber > 26) break;
            const i = caseNumber;
            const isOpened = gameState.openedCases.includes(i);
            const isUserCase = gameState.userPersonalCase === i;

            const wrapper = document.createElement('div');
            wrapper.className = `briefcase rounded-xl relative ${isOpened ? 'opened' : ''} ${isUserCase ? 'user-personal' : ''}`;
            
           let innerHtml = `
    <div class="briefcase-inner">
        <div class="briefcase-front flex items-center justify-center relative p-0.5">
            <!-- TĂNG KÍCH THƯỚC Ở ĐÂY: đổi text-xs sm:text-lg thành text-2xl sm:text-4xl hoặc to hơn nữa tùy thích -->
            <span class="text-2xl sm:text-4xl font-black ${isUserCase ? 'text-amber-200' : 'text-amber-400'}">${i}</span>
            ${isUserCase ? '<span class="absolute top-1 right-1 text-[7px] sm:text-[9px] bg-amber-500 text-slate-950 font-black px-1 rounded shadow">CHỌN</span>' : ''}
        </div>
        <div class="briefcase-back flex flex-col items-center justify-center p-0.5">
            <span class="text-[6px] sm:text-[8px] text-slate-500 font-bold">${i}</span>
            <span class="text-[7px] sm:text-[10px] font-black text-slate-200 px-0.5 truncate w-full text-center">${formatMoney(gameState.cases[i])}</span>
        </div>
    </div>

            `;
            wrapper.innerHTML = innerHtml;

            if (!isOpened) {
                wrapper.onclick = () => handleCaseClick(i);
            }
            rowDiv.appendChild(wrapper);
            caseNumber++;
        }
        grid.appendChild(rowDiv);
    });
}

function renderUserPersonalCasePreview() {
    const label = document.getElementById('user-case-label');
    const previewBox = document.getElementById('user-case-box-preview');

    if (gameState.userPersonalCase === null) {
        label.innerText = "Chưa chọn (Giữ kín)";
        previewBox.innerText = "?";
        previewBox.className = "w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-black text-slate-400 text-xs sm:text-sm shadow-inner transition-all duration-500";
    } else {
        label.innerText = `Cặp số ${gameState.userPersonalCase} đã niêm phong`;
        previewBox.innerText = gameState.userPersonalCase;
        previewBox.className = "w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-yellow-500 border border-amber-300 flex items-center justify-center font-black text-slate-950 text-xs sm:text-sm shadow-lg pulse-glow scale-105 transition-all duration-500";
    }
}

function renderInstructionBanner() {
    const textEl = document.getElementById('instruction-text');
    const subEl = document.getElementById('sub-instruction');
    const statusBadge = document.getElementById('status-badge');

    if (gameState.phase === 'SELECT_PERSONAL_CASE') {
        statusBadge.innerText = "Bước 1: Chọn Cặp Cá Nhân";
        textEl.innerText = `${gameState.playerName}, hãy chọn 1 cặp giữ riêng cho bạn!`;
        subEl.innerText = "Nhấn vào 1 cặp bất kỳ trên sân khấu.";
    } else if (gameState.phase === 'OPENING_CASES') {
        const quota = ROUND_QUOTAS[gameState.currentRound];
        const leftToOpen = quota - gameState.casesOpenedThisRound;
        statusBadge.innerText = `Vòng ${gameState.currentRound + 1}`;
        textEl.innerText = gameState.hasAcceptedDealBefore ? "Đã DEAL thành công. Tiếp tục mở các cặp trên sân khấu." : "Mở các cặp trên sân khấu theo quy định vòng chơi.";
        subEl.innerText = `Cần mở thêm: ${leftToOpen} cặp nữa.`;
    } else if (gameState.phase === 'BANKER_OFFER') {
        statusBadge.innerText = "Ngân Hàng Gọi Điện";
        textEl.innerText = "Cuộc gọi từ Ngân hàng! Hãy xem xét lời đề nghị.";
        subEl.innerText = "Đưa ra quyết định DEAL (Bán) hoặc NO DEAL (Tiếp tục).";
    } else if (gameState.phase === 'FINAL_SWAP') {
        statusBadge.innerText = "Vòng Áp Chót";
        textEl.innerText = "Chỉ còn 2 cặp! Mở cặp áp chót trước khi chốt chung cuộc.";
        subEl.innerText = "Click chọn cặp cuối cùng trên sân khấu.";
    } else if (gameState.phase === 'GAME_OVER') {
        statusBadge.innerText = "Trò Chơi Kết Thúc";
        textEl.innerText = "Chương trình khép lại với phần thưởng cuối cùng.";
        subEl.innerText = "Nhấn 'Chơi Lại' để bắt đầu ván mới.";
    }
}

function renderHistoryLogs() {
    const openedListEl = document.getElementById('opened-cases-history-list');
    const openedCountEl = document.getElementById('opened-history-count');
    openedCountEl.innerText = `${gameState.openedCasesHistoryLog.length} / 25`;

    if (gameState.openedCasesHistoryLog.length === 0) {
        openedListEl.innerHTML = `<div class="text-center text-slate-500 py-3 text-[11px] italic">Chưa mở cặp nào...</div>`;
    } else {
        let html = '';
        [...gameState.openedCasesHistoryLog].reverse().forEach((item, idx) => {
            const isHighVal = item.val >= 1000000;
            const valColor = isHighVal ? 'text-rose-400 font-black' : 'text-cyan-300 font-bold';
            html += `
                <div class="flex items-center justify-between p-1.5 rounded-lg bg-slate-900/90 border border-slate-800">
                    <div class="flex items-center space-x-1.5">
                        <span class="text-[8px] font-bold text-slate-500 bg-slate-800 px-1 py-0.5 rounded">Lượt ${gameState.openedCasesHistoryLog.length - idx}</span>
                        <span class="font-black text-amber-400">Cặp #${item.caseNum}</span>
                        <span class="text-[9px] text-slate-400">(Vòng ${item.round + 1})</span>
                    </div>
                    <span class="${valColor}">${formatMoney(item.val)}</span>
                </div>
            `;
        });
        openedListEl.innerHTML = html;
    }

    const bankerListEl = document.getElementById('banker-offers-history-list');
    const bankerCountEl = document.getElementById('banker-history-count');
    bankerCountEl.innerText = `${gameState.bankerOffersHistoryLog.length} Cuộc gọi`;

    if (gameState.bankerOffersHistoryLog.length === 0) {
        bankerListEl.innerHTML = `<div class="text-center text-slate-500 py-3 text-[11px] italic">Chưa có cuộc gọi nào từ Ngân hàng...</div>`;
    } else {
        let html = '';
        [...gameState.bankerOffersHistoryLog].reverse().forEach((item, idx) => {
            const statusTag = item.accepted 
                ? `<span class="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-1.5 py-0.5 rounded font-bold">DEAL</span>`
                : `<span class="text-[9px] bg-rose-500/20 text-rose-400 border border-rose-500/40 px-1.5 py-0.5 rounded font-bold">NO</span>`;

            html += `
                <div class="flex items-center justify-between p-1.5 rounded-lg bg-slate-900/90 border border-slate-800">
                    <div class="flex items-center space-x-1.5">
                        <span class="text-[8px] font-bold text-slate-500 bg-slate-800 px-1 py-0.5 rounded">Lần ${gameState.bankerOffersHistoryLog.length - idx}</span>
                        <span class="text-[9px] text-slate-400">Vòng ${item.round + 1}</span>
                    </div>
                    <div class="flex items-center space-x-1.5">
                        <span class="font-black text-emerald-400">${formatMoney(item.offer)}</span>
                        ${statusTag}
                    </div>
                </div>
            `;
        });
        bankerListEl.innerHTML = html;
    }
}

function handleCaseClick(caseNum) {
    if (gameState.isLocked) return;
    playSound('click');

    if (gameState.phase === 'SELECT_PERSONAL_CASE') {
        gameState.userPersonalCase = caseNum;
        gameState.phase = 'OPENING_CASES';
        gameState.currentRound = 0;
        gameState.casesOpenedThisRound = 0;
        renderAll();
    } else if (gameState.phase === 'OPENING_CASES' || gameState.phase === 'FINAL_SWAP') {
        if (caseNum === gameState.userPersonalCase) {
            alert("Đây là cặp cá nhân bạn đang giữ kín, không thể mở lúc này!");
            return;
        }

        gameState.isLocked = true;
        const val = gameState.cases[caseNum];

        playSound('open', val);
        
        gameState.openedCases.push(caseNum);
        gameState.openedCasesHistoryLog.push({
            caseNum: caseNum,
            val: val,
            round: gameState.currentRound
        });
        gameState.casesOpenedThisRound++;

        renderCasesGrid();
        renderHistoryLogs();
        
        showSequentialEffects(caseNum, val, () => {
            gameState.isLocked = false;

            let unOpened = [];
            for (let i = 1; i <= 26; i++) {
                if (i !== gameState.userPersonalCase && !gameState.openedCases.includes(i)) {
                    unOpened.push(i);
                }
            }

            if (unOpened.length === 0 && gameState.phase === 'FINAL_SWAP') {
                setTimeout(() => {
                    triggerFinalPersonalCaseReveal();
                }, 400);
                return;
            }

            if (unOpened.length === 1 && gameState.phase !== 'FINAL_SWAP') {
                setTimeout(() => {
                    triggerBankerOfferModal();
                }, 400);
                return;
            }

            const quota = ROUND_QUOTAS[gameState.currentRound] || 1;
            if (gameState.casesOpenedThisRound >= quota && gameState.phase !== 'FINAL_SWAP') {
                setTimeout(() => {
                    triggerBankerOfferModal();
                }, 400);
            } else {
                renderAll();
            }
        });
    }
}

function showSequentialEffects(caseNum, val, callback) {
    const titleEl = document.getElementById('reveal-popup-title');
    const amountEl = document.getElementById('reveal-popup-amount');

    titleEl.innerText = `Cặp Số ${caseNum} Vừa Mở Chứa Giá Trị:`;
    amountEl.innerText = formatMoney(val);

    openModalSmoothly('reveal-popup-modal', 'reveal-modal-box');

    setTimeout(() => {
        closeModalSmoothly('reveal-popup-modal', 'reveal-modal-box', () => {
            const textEl = document.getElementById('instruction-text');
            const subEl = document.getElementById('sub-instruction');
            textEl.innerHTML = `Cặp số <span class="text-amber-400 font-black">[${caseNum}]</span> chứa: <span class="text-rose-400 font-black">${formatMoney(val)}</span>`;
            subEl.innerText = "Đang hiển thị giá trị...";

            highlightedPrizeVal = val;
            renderPrizesBoards();

            setTimeout(() => {
                highlightedPrizeVal = null;
                renderPrizesBoards();
                renderInstructionBanner();
                if (callback) callback();
            }, 2400);
        });
    }, 2000);
}

function openModalSmoothly(modalId, contentId) {
    const modal = document.getElementById(modalId);
    const content = document.getElementById(contentId);

    modal.classList.remove('hidden');
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            modal.classList.remove('opacity-0');
            modal.classList.add('opacity-100');
            content.classList.remove('scale-90', 'opacity-0');
            content.classList.add('scale-100', 'opacity-100');
        });
    });
}

function closeModalSmoothly(modalId, contentId, callback) {
    const modal = document.getElementById(modalId);
    const content = document.getElementById(contentId);

    if (!modal || modal.classList.contains('hidden')) {
        if (callback) callback();
        return;
    }

    modal.classList.remove('opacity-100');
    modal.classList.add('opacity-0');
    content.classList.remove('scale-100', 'opacity-100');
    content.classList.add('scale-90', 'opacity-0');

    setTimeout(() => {
        modal.classList.add('hidden');
        if (callback) callback();
    }, 400);
}

function triggerFinalPersonalCaseReveal() {
    playSound('win');
    gameState.phase = 'GAME_OVER';

    const personalVal = gameState.cases[gameState.userPersonalCase];
    const finalDisplayBox = document.getElementById('final-prize-display');
    
    if (gameState.hasAcceptedDealBefore) {
        document.getElementById('gameover-title').innerText = "KẾT QUẢ CHUNG CUỘC";
        document.getElementById('gameover-desc').innerText = `${gameState.playerName} đã chốt giá chào mua thành công với Ngân hàng!`;
        
        finalDisplayBox.style.display = 'block';
        finalDisplayBox.className = 'text-2xl sm:text-3xl font-black text-emerald-400 mt-2 led-glow';
        finalDisplayBox.innerText = formatMoney(gameState.acceptedDealAmount);

        document.getElementById('user-original-reveal-desc').innerHTML = `
            <div class="pt-2 border-t border-slate-800">Giá trị thực tế trong cặp <span class="text-amber-400 font-bold">[${gameState.userPersonalCase}]</span>: <span class="text-amber-400 font-bold">${formatMoney(personalVal)}</span></div>
        `;
    } else {
        document.getElementById('gameover-title').innerText = `MỞ CẶP CÁ NHÂN [${gameState.userPersonalCase}]`;
        document.getElementById('gameover-desc').innerText = `Tất cả các cặp trên sân khấu đã được mở. Đây là giá trị trong cặp của bạn!`;
        
        finalDisplayBox.style.display = 'block';
        finalDisplayBox.className = 'text-2xl sm:text-3xl font-black text-amber-400 mt-2 led-glow';
        finalDisplayBox.innerText = formatMoney(personalVal);

        document.getElementById('user-original-reveal-desc').innerHTML = `Cặp cá nhân số <span class="text-amber-400 font-bold">[${gameState.userPersonalCase}]</span> thuộc về bạn!`;
    }

    openModalSmoothly('gameover-modal', 'gameover-modal-content');
    renderAll();
}

function triggerBankerOfferModal() {
    playSound('banker');
    gameState.phase = 'BANKER_OFFER';
    renderInstructionBanner();

    let remainingVals = [];
    for (let i = 1; i <= 26; i++) {
        if (i !== gameState.userPersonalCase && !gameState.openedCases.includes(i)) {
            remainingVals.push(gameState.cases[i]);
        }
    }
    remainingVals.push(gameState.cases[gameState.userPersonalCase]);

    const n = remainingVals.length;

    const sum = remainingVals.reduce((a, b) => a + b, 0);
    const ev = sum / n;

    const sortedVals = [...remainingVals].sort((a, b) => a - b);
    let median;
    if (n % 2 === 0) {
        median = (sortedVals[n / 2 - 1] + sortedVals[n / 2]) / 2;
    } else {
        median = sortedVals[Math.floor(n / 2)];
    }

    const roundWeights = [0.15, 0.28, 0.42, 0.58, 0.72, 0.82, 0.88, 0.92, 0.95, 0.98];
    const roundWeight = roundWeights[Math.min(gameState.currentRound, roundWeights.length - 1)];

    const variance = remainingVals.reduce((acc, val) => acc + Math.pow(val - ev, 2), 0) / n;
    const stdDev = Math.sqrt(variance);

    const cv = stdDev / (ev || 1);
    const riskAdjustment = Math.max(0.75, 1 - (cv * 0.08));

    const baseExpected = (0.7 * ev) + (0.3 * median);
    let rawOffer = baseExpected * roundWeight * riskAdjustment;

    let offer = 0;
    if (rawOffer >= 20000000) {
        offer = Math.round(rawOffer / 1000000) * 1000000;
    } else if (rawOffer >= 5000000) {
        offer = Math.round(rawOffer / 500000) * 500000;
    } else if (rawOffer >= 1000000) {
        offer = Math.round(rawOffer / 100000) * 100000;
    } else if (rawOffer >= 100000) {
        offer = Math.round(rawOffer / 10000) * 10000;
    } else {
        offer = Math.round(rawOffer / 1000) * 1000;
    }

    if (offer < 1000) offer = 1000;

    gameState.currentBankerOffer = offer;
    document.getElementById('banker-offer-display').innerText = formatMoney(offer);
    document.getElementById('banker-case-num').innerText = `SỐ [${gameState.userPersonalCase}]`;

    const buttonsGroup = document.getElementById('banker-buttons-group');

    if (gameState.hasAcceptedDealBefore) {
        renderAcceptedDealButtons(buttonsGroup);
    } else {
        buttonsGroup.innerHTML = `
            <button onclick="acceptBankerDeal()" class="w-full py-3 bg-emerald-600 active:bg-emerald-500 text-white font-black rounded-xl shadow-lg active:scale-95 text-xs uppercase tracking-wider transition-all">
                CHẤP NHẬN
            </button>
            <button onclick="rejectBankerDeal()" class="w-full py-3 bg-rose-600 active:bg-rose-500 text-white font-black rounded-xl shadow-lg active:scale-95 text-xs uppercase tracking-wider transition-all">
                KHÔNG CHẤP NHẬN
            </button>
        `;
    }

    openModalSmoothly('banker-modal', 'banker-modal-content');
}

function renderAcceptedDealButtons(container) {
    container.innerHTML = `
        <div class="col-span-2 grid grid-cols-2 gap-2">
            <button onclick="continueOpeningAfterDeal()" class="w-full py-2.5 bg-cyan-600 active:bg-cyan-500 text-white font-black rounded-xl shadow-lg active:scale-95 text-[10px] uppercase tracking-wider transition-all">
                Tiếp Tục Mở Cặp
            </button>
            <button onclick="revealPersonalCaseNow()" class="w-full py-2.5 bg-amber-500 active:bg-amber-400 text-slate-950 font-black rounded-xl shadow-lg active:scale-95 text-[10px] uppercase tracking-wider transition-all">
                Mở Cặp Đã Chọn
            </button>
        </div>
    `;
}

function acceptBankerDeal() {
    playSound('win');
    gameState.hasAcceptedDealBefore = true;
    gameState.acceptedDealAmount = gameState.currentBankerOffer;

    gameState.bankerOffersHistoryLog.push({
        round: gameState.currentRound,
        offer: gameState.currentBankerOffer,
        accepted: true
    });

    const buttonsGroup = document.getElementById('banker-buttons-group');
    renderAcceptedDealButtons(buttonsGroup);
    renderHistoryLogs();
}

function continueOpeningAfterDeal() {
    closeModalSmoothly('banker-modal', 'banker-modal-content', () => {
        let unOpened = [];
        for (let i = 1; i <= 26; i++) {
            if (i !== gameState.userPersonalCase && !gameState.openedCases.includes(i)) {
                unOpened.push(i);
            }
        }

        if (unOpened.length === 1) {
            gameState.phase = 'FINAL_SWAP';
            renderInstructionBanner();
        } else {
            gameState.currentRound++;
            gameState.casesOpenedThisRound = 0;
            gameState.phase = 'OPENING_CASES';
            renderAll();
        }
    });
}

function revealPersonalCaseNow() {
    closeModalSmoothly('banker-modal', 'banker-modal-content', () => {
        triggerFinalPersonalCaseReveal();
    });
}

function rejectBankerDeal() {
    playSound('click');

    gameState.bankerOffersHistoryLog.push({
        round: gameState.currentRound,
        offer: gameState.currentBankerOffer,
        accepted: false
    });

    closeModalSmoothly('banker-modal', 'banker-modal-content', () => {
        let unOpened = [];
        for (let i = 1; i <= 26; i++) {
            if (i !== gameState.userPersonalCase && !gameState.openedCases.includes(i)) {
                unOpened.push(i);
            }
        }

        if (unOpened.length === 1) {
            gameState.phase = 'FINAL_SWAP';
            renderInstructionBanner();
        } else {
            gameState.currentRound++;
            gameState.casesOpenedThisRound = 0;
            gameState.phase = 'OPENING_CASES';
            renderAll();
        }
    });
}

window.onload = function() {
    renderPrizesBoards();
    renderCasesGrid();
    renderHistoryLogs();
    openModalSmoothly('welcome-screen', 'welcome-screen');
};

window.onresize = function() {
    renderCasesGrid();
};
