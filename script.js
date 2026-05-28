try { vkBridge.send('VKWebAppInit'); } catch(e) { console.log(e); }

let currentRoom = '';
let currentWordIndex = 0;
let matchedCount = 0;
let activeItem = null;
let startX = 0, startY = 0;

let sorobanMode = 'free'; 
let sorobanCategory = ''; 
let currentLessonIndex = 0;
let isTaskLock = false; 

// База данных
const roomsData = {
    'words': [
        { id: 'lisa', text: 'Лиса', image: 'img/3d_lisa.png', sound: 'audio/w_lisa.wav', syllables: ['ли', 'са'], audioSyllables: ['audio/sl_li.wav', 'audio/sl_sa.wav'] },
        { id: 'ryba', text: 'Рыба', image: 'img/3d_ryba.png', sound: 'audio/w_ryba.wav', syllables: ['ры', 'ба'], audioSyllables: ['audio/sl_ry.wav', 'audio/sl_ba.wav'] },
        { id: 'kasha', text: 'Каша', image: 'img/3d_kasha.png', sound: 'audio/w_kasha.wav', syllables: ['ка', 'ша'], audioSyllables: ['audio/sl_ka.wav', 'audio/sl_sha.wav'] },
        { id: 'raketa', text: 'Ракета', image: 'img/3d_raketa.png', sound: 'audio/w_raketa.wav', syllables: ['ра', 'ке', 'та'], audioSyllables: ['audio/sl_ra.wav', 'audio/sl_ke.wav', 'audio/sl_ta.wav'] },
        { id: 'mashina', text: 'Машина', image: 'img/3d_mashina.png', sound: 'audio/w_mashina.wav', syllables: ['ма', 'ши', 'на'], audioSyllables: ['audio/sl_ma.wav', 'audio/sl_shi.wav', 'audio/sl_na.wav'] },
        { id: 'sobaka', text: 'Собака', image: 'img/3d_sobaka.png', sound: 'audio/w_sobaka.wav', syllables: ['со', 'ба', 'ка'], audioSyllables: ['audio/sl_so.wav', 'audio/sl_ba.wav', 'audio/sl_ka.wav'] }
    ],
    
    // --- ОБУЧЕНИЕ ---
    'learn_units': [
        { taskText: "В разряде единиц сдвиньте одну нижнюю косточку вверх.", target: 1, hint: "img/card_1.png" },
        { taskText: "В разряде единиц сдвиньте две нижние косточки вверх.", target: 2, hint: "img/card_2.png" },
        { taskText: "В разряде единиц сдвиньте три нижние косточки вверх.", target: 3, hint: "img/card_3.png" },
        { taskText: "В разряде единиц сдвиньте четыре нижние косточки вверх.", target: 4, hint: "img/card_4.png" },
        { taskText: "Опустите верхнюю косточку (пятерку) вниз к перекладине.", target: 5, hint: "img/card_5.png" },
        { taskText: "В разряде единиц опустите верхнюю косточку и поднимите одну нижнюю.", target: 6, hint: "img/card_6.png" },
        { taskText: "В разряде единиц опустите верхнюю косточку и поднимите две нижние.", target: 7, hint: "img/card_7.png" },
        { taskText: "В разряде единиц опустите верхнюю косточку и поднимите три нижние.", target: 8, hint: "img/card_8.png" },
        { taskText: "В разряде единиц сдвиньте все косточки к перекладине.", target: 9, hint: "img/card_9.png" }
    ],
    'learn_tens': [], 
    'learn_hundreds': [],
    'learn_add': [],
    'learn_sub': [],
    'learn_mult': [],
    'learn_div': [],

    // --- ТРЕНИРОВКА ---
    'play_add': [
        { taskText: "Решите пример: 1 + 2", target: 3 },
        { taskText: "Решите пример: 5 + 1", target: 6 },
        { taskText: "Вычислите: 3 + 5", target: 8 }
    ],
    'play_sub': [
        { taskText: "Вычислите: 4 - 2", target: 2 },
        { taskText: "Решите пример: 9 - 4", target: 5 },
        { taskText: "Вычислите: 2 + 2 - 3", target: 1 }
    ],
    'play_mult': [],
    'play_div': []
};

// --- УПРАВЛЕНИЕ ЛАЙТБОКСОМ ---
function openLightbox(src) {
    const lb = document.getElementById('image-lightbox');
    document.getElementById('lightbox-img').src = src;
    lb.style.display = 'flex';
    setTimeout(() => lb.style.opacity = '1', 10);
}
function closeLightbox() {
    const lb = document.getElementById('image-lightbox');
    lb.style.opacity = '0';
    setTimeout(() => lb.style.display = 'none', 200);
}

// --- НАВИГАЦИОННАЯ СИСТЕМА ---
function goMainFromSubmenu() {
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "light"}); } catch(e){}
    document.getElementById('screen-soroban-menu').classList.remove('active');
    document.getElementById('screen-menu').classList.add('active');
}

function goMainFromMemorika() {
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "light"}); } catch(e){}
    document.getElementById('screen-memorika-menu').classList.remove('active');
    document.getElementById('screen-menu').classList.add('active');
}

function openSorobanMenu() {
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "light"}); } catch(e){}
    document.getElementById('screen-menu').classList.remove('active');
    document.getElementById('screen-soroban-menu').classList.add('active');
}

function openMemorikaMenu() {
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "light"}); } catch(e){}
    document.getElementById('screen-menu').classList.remove('active');
    document.getElementById('screen-memorika-menu').classList.add('active');
}

function openSorobanLearnMenu() {
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "light"}); } catch(e){}
    document.getElementById('screen-soroban-menu').classList.remove('active');
    document.getElementById('screen-soroban-learn-menu').classList.add('active');
}

function openSorobanPlayMenu() {
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "light"}); } catch(e){}
    document.getElementById('screen-soroban-menu').classList.remove('active');
    document.getElementById('screen-soroban-play-menu').classList.add('active');
}

function goBackToSorobanMenuFromLearn() {
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "light"}); } catch(e){}
    document.getElementById('screen-soroban-learn-menu').classList.remove('active');
    document.getElementById('screen-soroban-menu').classList.add('active');
}

function goBackToSorobanMenuFromPlay() {
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "light"}); } catch(e){}
    document.getElementById('screen-soroban-play-menu').classList.remove('active');
    document.getElementById('screen-soroban-menu').classList.add('active');
}

function goBackFromGame() {
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "light"}); } catch(e){}
    const oldAbacus = document.getElementById('abacus-body-container');
    if (oldAbacus) oldAbacus.remove();
    
    document.getElementById('screen-room').classList.remove('active');
    document.getElementById('game-area').classList.remove('active');

    if (currentRoom === 'words') {
        document.getElementById('screen-menu').classList.add('active');
    } else if (currentRoom === 'soroban') {
        if (sorobanMode === 'free') {
            document.getElementById('screen-soroban-menu').classList.add('active');
        } else if (sorobanMode === 'learn') {
            document.getElementById('screen-soroban-learn-menu').classList.add('active');
        } else if (sorobanMode === 'play') {
            document.getElementById('screen-soroban-play-menu').classList.add('active');
        }
    }
}

function openRoom(roomId, title) {
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "light"}); } catch(e){}
    currentRoom = roomId;
    document.getElementById('game-room-title').innerText = title;
    document.getElementById('screen-menu').classList.remove('active');
    document.getElementById('screen-room').classList.add('active');
    document.getElementById('game-area').classList.add('active');

    document.getElementById('btn-back-to-menu').onclick = goBackFromGame;

    if (roomId === 'words') {
        currentWordIndex = 0;
        document.getElementById('word-image-container').style.display = 'flex';
        document.getElementById('soroban-controls').style.display = 'none';
        document.getElementById('soroban-score').style.display = 'none';
        document.getElementById('target-zone').style.display = 'flex';
        document.getElementById('drag-zone').style.display = 'flex';
        setupWordsGame();
    }
}

function startSoroban(mode, category, title) {
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "light"}); } catch(e){}
    currentRoom = 'soroban';
    sorobanMode = mode;
    sorobanCategory = category;
    currentLessonIndex = 0;
    isTaskLock = false;

    document.getElementById('game-room-title').innerText = title;
    
    document.getElementById('screen-soroban-menu').classList.remove('active');
    document.getElementById('screen-soroban-learn-menu').classList.remove('active');
    document.getElementById('screen-soroban-play-menu').classList.remove('active');
    
    document.getElementById('screen-room').classList.add('active');
    document.getElementById('game-area').classList.add('active');
    
    document.getElementById('btn-back-to-menu').onclick = goBackFromGame;

    document.getElementById('word-image-container').style.display = 'none';
    document.getElementById('target-zone').style.display = 'none'; 
    document.getElementById('drag-zone').style.display = 'none';

    document.getElementById('soroban-controls').style.display = 'flex';
    document.getElementById('soroban-score').style.display = 'block';
    
    const taskContainer = document.getElementById('soroban-task-container');
    if (mode === 'free') {
        taskContainer.style.display = 'none';
    } else {
        if (!roomsData[category] || roomsData[category].length === 0) {
            taskContainer.style.display = 'flex';
            document.getElementById('soroban-task-text').innerHTML = "Раздел в разработке. Задания скоро появятся!";
            document.getElementById('soroban-hint-container').style.display = 'none';
            document.getElementById('soroban-nav-arrows').style.display = 'none';
            isTaskLock = true; 
        } else {
            taskContainer.style.display = 'flex';
            document.getElementById('soroban-nav-arrows').style.display = 'flex';
            nextSorobanTask();
        }
    }

    resetAbacusBeads();
}

// --- ДВИЖОК СЛОВ ---
function setupWordsGame() {
    const dragZone = document.getElementById('drag-zone');
    const targetZone = document.getElementById('target-zone');
    dragZone.innerHTML = ''; targetZone.innerHTML = '';
    matchedCount = 0;

    const wordData = roomsData['words'][currentWordIndex];
    document.getElementById('word-3d-image').src = wordData.image;
    if (currentWordIndex === 0) { playSound('audio/words_intro.wav'); } else { playSound(wordData.sound); }

    document.getElementById('btn-prev-word').classList.toggle('disabled', currentWordIndex === 0);
    document.getElementById('btn-next-word').classList.toggle('disabled', currentWordIndex === roomsData['words'].length - 1);

    wordData.syllables.forEach((syl, index) => {
        const slot = document.createElement('div');
        slot.className = 'target-item';
        slot.style.backgroundImage = "url('img/slot_bg.png')";
        slot.innerText = syl;
        slot.setAttribute('data-syl', syl);
        slot.setAttribute('data-index', index);
        targetZone.appendChild(slot);
    });

    wordData.syllables.forEach((syl, i) => {
        const brick = document.createElement('div');
        brick.className = 'draggable-item';
        brick.style.backgroundImage = "url('img/brick_bg.png')";
        brick.innerText = syl;
        brick.setAttribute('data-syl', syl);
        brick.setAttribute('data-audio', wordData.audioSyllables[i]);
        brick.addEventListener('pointerdown', handlePointerStart);
        dragZone.appendChild(brick);
    });
    
    let bricks = Array.from(dragZone.children);
    shuffleArray(bricks);
    dragZone.innerHTML = '';
    bricks.forEach(b => dragZone.appendChild(b));
}

function changeWord(direction) {
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "light"}); } catch(e){}
    currentWordIndex += direction;
    if (currentWordIndex < 0) currentWordIndex = 0;
    if (currentWordIndex >= roomsData['words'].length) currentWordIndex = roomsData['words'].length - 1;
    setupWordsGame();
}

// --- ДВИЖОК СОРОБАНА ---
let sorobanState = [
    { upper: false, lower: 0 }, 
    { upper: false, lower: 0 }, 
    { upper: false, lower: 0 }  
];

const BEAM_T = 95; 
let globalLowerBeadsRefs = []; 
let globalUpperBeadsRefs = [];

function setupSorobanGame() {
    const gameArea = document.getElementById('game-area');
    const oldAbacus = document.getElementById('abacus-body-container');
    if (oldAbacus) oldAbacus.remove();
    
    globalLowerBeadsRefs = [];
    globalUpperBeadsRefs = [];

    const abacusContainer = document.createElement('div');
    abacusContainer.id = 'abacus-body-container';

    const abacusBody = document.createElement('div');
    abacusBody.style.position = "relative";
    abacusBody.style.width = "360px"; 
    abacusBody.style.height = "450px"; 
    abacusBody.style.background = "none";
    abacusBody.style.boxSizing = "border-box";

    // Наша новая деревянная перекладина
    const beam = document.createElement('div');
    beam.className = "soroban-beam";
    abacusBody.appendChild(beam);

    const rodLabels = ["Сотни", "Десятки", "Единицы"];
    const rodColors = ["bead-green", "bead-blue", "bead-red"]; // Соответствие цвета разряду

    for (let s = 0; s < 3; s++) {
        const rod = document.createElement('div');
        rod.className = "soroban-rod";
        rod.style.left = (85 + s * 95) + "px"; 
        
        const label = document.createElement('div');
        label.innerText = rodLabels[s];
        label.style.position = "absolute";
        label.style.bottom = "-35px"; 
        label.style.left = "50%"; 
        label.style.transform = "translateX(-50%)"; 
        label.style.fontSize = "15px";
        label.style.fontWeight = "bold";
        label.style.color = "#7A90A4";
        rod.appendChild(label);

        // Создаем верхнюю 3D бусину
        const upperBead = document.createElement('div');
        upperBead.className = `bead-3d ${rodColors[s]}`;
        upperBead.style.top = "5px"; 
        globalUpperBeadsRefs.push({ img: upperBead, rodIndex: s });
        
        upperBead.onclick = () => {
            if (isTaskLock && sorobanMode !== 'free') return;
            try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "light"}); } catch(e){}
            sorobanState[s].upper = !sorobanState[s].upper;
            // Идеальное касание планки сверху
            upperBead.style.top = (sorobanState[s].upper ? "52px" : "5px"); 
            updateSorobanScore();
        };
        rod.appendChild(upperBead);

        // Создаем нижние 3D бусины
        const lowerBeads = [];
        for (let b = 0; b < 4; b++) {
            const lowerBead = document.createElement('div');
            lowerBead.className = `bead-3d ${rodColors[s]}`;
            lowerBead.style.top = (360 - (3 - b) * 34) + "px"; 
            
            lowerBead.onclick = () => {
                if (isTaskLock && sorobanMode !== 'free') return;
                try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "light"}); } catch(e){}
                let clickedValue = b + 1;
                
                if (sorobanState[s].lower === clickedValue) {
                    sorobanState[s].lower = clickedValue - 1;
                } else {
                    sorobanState[s].lower = clickedValue;
                }

                lowerBeads.forEach((bead, idx) => {
                    if (idx < sorobanState[s].lower) {
                        // Идеальное касание планки снизу
                        bead.style.top = (112 + idx * 34) + "px"; 
                    } else {
                        bead.style.top = (360 - (3 - idx) * 34) + "px"; 
                    }
                });
                updateSorobanScore();
            };
            lowerBeads.push(lowerBead);
            rod.appendChild(lowerBead);
        }
        globalLowerBeadsRefs.push({ beads: lowerBeads, rodIndex: s });
        abacusBody.appendChild(rod);
    }
    abacusContainer.appendChild(abacusBody);
    gameArea.appendChild(abacusContainer);
}

// Функцию resetAbacusBeads тоже слегка обновим для правильного сброса верхних на 5px
function resetAbacusBeads() {
    sorobanState = [
        { upper: false, lower: 0 },
        { upper: false, lower: 0 },
        { upper: false, lower: 0 }
    ];
    document.getElementById('soroban-score').innerText = "0";
    globalUpperBeadsRefs.forEach(item => { item.img.style.top = "5px"; });
    globalLowerBeadsRefs.forEach(item => {
        item.beads.forEach((bead, idx) => { bead.style.top = (360 - (3 - idx) * 34) + "px"; });
    });
}

function changeSorobanTask(direction) {
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "light"}); } catch(e){}
    const tasks = roomsData[sorobanCategory];
    if (!tasks || tasks.length === 0) return;

    currentLessonIndex += direction;
    if (currentLessonIndex < 0) currentLessonIndex = 0;
    if (currentLessonIndex >= tasks.length) currentLessonIndex = tasks.length - 1;
    
    resetAbacusBeads();
    nextSorobanTask();
}

function nextSorobanTask() {
    if (sorobanMode === 'free') return; 
    const tasks = roomsData[sorobanCategory];
    if (!tasks || tasks.length === 0) return;

    const hintContainer = document.getElementById('soroban-hint-container');
    
    document.getElementById('btn-prev-soroban').classList.toggle('disabled', currentLessonIndex === 0);
    document.getElementById('btn-next-soroban').classList.toggle('disabled', currentLessonIndex === tasks.length - 1);

    const currentTask = tasks[currentLessonIndex];
    
    document.getElementById('soroban-task-text').innerHTML = 
        `${currentTask.taskText} <span class="target-highlight">(${currentTask.target})</span>`;
    
    const hintCard = document.getElementById('soroban-hint-card');
    if (currentTask.hint && sorobanMode === 'learn') {
        hintCard.onerror = function() { hintContainer.style.display = 'none'; };
        hintCard.src = currentTask.hint;
        hintContainer.style.display = 'flex';
    } else {
        hintContainer.style.display = 'none';
    }

    isTaskLock = false;
}

function updateSorobanScore() {
    playSound('audio/click.wav'); 
    
    let total = 0;
    total += (sorobanState[0].upper ? 5 : 0) * 100 + sorobanState[0].lower * 100;
    total += (sorobanState[1].upper ? 5 : 0) * 10 + sorobanState[1].lower * 10;
    total += (sorobanState[2].upper ? 5 : 0) * 1 + sorobanState[2].lower * 1;
    
    const scoreDisplay = document.getElementById('soroban-score');
    scoreDisplay.innerText = total;

    if (sorobanMode === 'free') return; 

    const tasks = roomsData[sorobanCategory];
    if (!tasks || tasks.length === 0) return;

    const currentTask = tasks[currentLessonIndex];

    if (currentTask && total === currentTask.target && !isTaskLock) {
        isTaskLock = true; 
        
        scoreDisplay.classList.add('correct-flash');
        document.getElementById('abacus-body-container').classList.add('success-lock');
        try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "heavy"}); } catch(e){}

        setTimeout(() => {
            scoreDisplay.classList.remove('correct-flash');
            document.getElementById('abacus-body-container').classList.remove('success-lock');
            
            if(currentLessonIndex < tasks.length - 1) {
                currentLessonIndex++;
                resetAbacusBeads();
                nextSorobanTask();
            } else {
                document.getElementById('soroban-task-text').innerText = "Отличная работа!";
                document.getElementById('soroban-hint-container').style.display = 'none';
                document.getElementById('soroban-nav-arrows').style.display = 'none';
                playSound('audio/soroban_win.wav');
                setTimeout(goBackFromGame, 2500);
            }
        }, 1500); 
    }
}

function resetAbacusBeads() {
    sorobanState = [
        { upper: false, lower: 0 },
        { upper: false, lower: 0 },
        { upper: false, lower: 0 }
    ];
    document.getElementById('soroban-score').innerText = "0";
    setupSorobanGame(); 
}

function createLargeBeadImg() {
    const img = document.createElement('img');
    img.src = "img/soroban_bead.png"; 
    img.style.position = "absolute";
    img.style.width = "85px";  
    img.style.height = "45px"; 
    img.style.left = "50%"; 
    img.style.transform = "translateX(-50%)"; 
    img.style.cursor = "pointer";
    img.style.transition = "top 0.15s cubic-bezier(0.25, 1, 0.5, 1)"; 
    return img;
}

// --- DRAG AND DROP ---
function handlePointerStart(e) {
    if (e.target.classList.contains('matched')) return;
    activeItem = e.target;
    activeItem.setPointerCapture(e.pointerId);
    const rect = activeItem.getBoundingClientRect();
    activeItem.style.width = rect.width + 'px';
    activeItem.style.height = rect.height + 'px';
    startX = rect.width / 2;
    startY = rect.height / 2;
    playSound(activeItem.getAttribute('data-audio'));
    activeItem.classList.add('dragging');
    activeItem.style.position = 'fixed';
    activeItem.style.margin = '0';
    activeItem.style.left = (e.clientX - startX) + 'px';
    activeItem.style.top = (e.clientY - startY) + 'px';
    activeItem.addEventListener('pointermove', handlePointerMove);
    activeItem.addEventListener('pointerup', handlePointerEnd);
}
function handlePointerMove(e) {
    if (!activeItem) return;
    activeItem.style.left = (e.clientX - startX) + 'px';
    activeItem.style.top = (e.clientY - startY) + 'px';
}
function handlePointerEnd(e) {
    if (!activeItem) return;
    activeItem.releasePointerCapture(e.pointerId);
    activeItem.classList.remove('dragging');
    activeItem.removeEventListener('pointermove', handlePointerMove);
    activeItem.removeEventListener('pointerup', handlePointerEnd);
    const itemSyl = activeItem.getAttribute('data-syl');
    const clientX = e.clientX;
    const clientY = e.clientY;
    activeItem.style.display = 'none';
    let targets = document.querySelectorAll('.target-item');
    let matchedTarget = null;
    targets.forEach(t => {
        const rect = t.getBoundingClientRect();
        if (clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom) {
            if (t.getAttribute('data-syl') === itemSyl && !t.classList.contains('matched')) {
                matchedTarget = t;
            }
        }
    });
    activeItem.style.display = 'flex';
    if (matchedTarget) {
        try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "medium"}); } catch(e){}
        activeItem.classList.add('matched');
        matchedTarget.classList.add('matched');
        activeItem.style.display = 'none';
        matchedTarget.style.backgroundImage = "url('img/brick_bg.png')";
        matchedCount++;
        if (matchedCount === roomsData['words'][currentWordIndex].syllables.length) {
            setTimeout(() => {
                currentWordIndex++;
                if (currentWordIndex < roomsData['words'].length) {
                    setupWordsGame();
                } else {
                    playSound('audio/words_win.wav');
                    setTimeout(goHome, 3000);
                }
            }, 1200);
        }
    } else {
        try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "light"}); } catch(e){}
        playSound('audio/wrong.wav');
        activeItem.style.transition = 'all 0.3s ease';
        activeItem.style.position = 'relative';
        activeItem.style.left = '0px';
        activeItem.style.top = '0px';
        activeItem.style.width = '';
        activeItem.style.height = '';
        setTimeout(() => { activeItem.style.transition = 'none'; }, 300);
    }
    activeItem = null;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
function playSound(soundFile) {
    if (soundFile) {
        const audio = new Audio(soundFile);
        audio.play().catch(err => console.log("Ошибка аудио:", err));
    }
}
