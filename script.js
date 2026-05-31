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

let currentSlideIndex = 0;
let currentSlidesArray = [];

// --- ПЕРЕМЕННЫЕ ДЛЯ УМНОГО АУДИО ---
let currentAudio = null; 
let currentSlidesAudioArray = []; 

// База данных комнат и упражнений
const roomsData = {
    'words': [
        { id: 'lisa', text: 'Лиса', image: 'img/3d_lisa.png', sound: 'audio/w_lisa.wav', syllables: ['ли', 'са'], audioSyllables: ['audio/sl_li.wav', 'audio/sl_sa.wav'] },
        { id: 'ryba', text: 'Рыба', image: 'img/3d_ryba.png', sound: 'audio/w_ryba.wav', syllables: ['ры', 'ба'], audioSyllables: ['audio/sl_ry.wav', 'audio/sl_ba.wav'] },
        { id: 'kasha', text: 'Каша', image: 'img/3d_kasha.png', sound: 'audio/w_kasha.wav', syllables: ['ка', 'ша'], audioSyllables: ['audio/sl_ka.wav', 'audio/sl_sha.wav'] },
        { id: 'raketa', text: 'Ракета', image: 'img/3d_raketa.png', sound: 'audio/w_raketa.wav', syllables: ['ра', 'ке', 'та'], audioSyllables: ['audio/sl_ra.wav', 'audio/sl_ke.wav', 'audio/sl_ta.wav'] },
        { id: 'mashina', text: 'Машина', image: 'img/3d_mashina.png', sound: 'audio/w_mashina.wav', syllables: ['ма', 'ши', 'на'], audioSyllables: ['audio/sl_ma.wav', 'audio/sl_shi.wav', 'audio/sl_na.wav'] },
        { id: 'sobaka', text: 'Собака', image: 'img/3d_sobaka.png', sound: 'audio/w_sobaka.wav', syllables: ['со', 'ба', 'ка'], audioSyllables: ['audio/sl_so.wav', 'audio/sl_ba.wav', 'audio/sl_ka.wav'] }
    ],

    'learn_units': [
        { taskText: "Знакомься, красные бусинки — это единички. Сдвинь одну бусинку вверх.", target: 1, hint: "img/card_1.png", taskAudio: "audio/learn_units_1.wav" },
        { taskText: "Отлично! Подними вторую бусинку вверх, получим два.", target: 2, hint: "img/card_2.png", taskAudio: "audio/learn_units_2.wav" },
        { taskText: "Поднимаем третью бусинку, получаем... правильно... три.", target: 3, hint: "img/card_3.png", taskAudio: "audio/learn_units_3.wav" },
        { taskText: "Супер! А теперь подними все четыре нижние бусинки. Это цифра четыре.", target: 4, hint: "img/card_4.png", taskAudio: "audio/learn_units_4.wav" },
        { taskText: "Сбрось малышей вниз. Видишь бусинку наверху? Это Королева Пять! Опусти бусинку вниз.", target: 5, hint: "img/card_5.png", taskAudio: "audio/learn_units_5.wav" },
        { taskText: "Королева Пять любит гулять с малышами. Опусти Королеву вниз и подними одного малыша вверх. Получится шесть!", target: 6, hint: "img/card_6.png", taskAudio: "audio/learn_units_6.wav" },
        { taskText: "А если Королева Пять и два малыша? Сделай цифру семь.", target: 7, hint: "img/card_7.png", taskAudio: "audio/learn_units_7.wav" },
        { taskText: "Почти все в сборе! Королева Пять сверху и три малыша снизу — это восемь.", target: 8, hint: "img/card_8.png", taskAudio: "audio/learn_units_8.wav" },
        { taskText: "Собери все красные бусинки у планки! Королева Пять и четыре малыша дадут самую большую цифру — девять.", target: 9, hint: "img/card_9.png", taskAudio: "audio/learn_units_9.wav" }
    ],
    
    'learn_tens': [
        { taskText: "Знакомься, синие бусинки — это ученики-десятки. Сдвинь одну бусинку вверх. Это 10.", target: 10, taskAudio: "audio/learn_tens_1.wav" },
        { taskText: "Отлично! Подними вторую синюю бусинку вверх, получим 20.", target: 20, taskAudio: "audio/learn_tens_2.wav" },
        { taskText: "Поднимаем третью бусинку, получаем... 30.", target: 30, taskAudio: "audio/learn_tens_3.wav" },
        { taskText: "А теперь подними все четыре нижние бусинки. Это 40.", target: 40, taskAudio: "audio/learn_tens_4.wav" },
        { taskText: "Сбрось бусинки вниз. Видишь синюю бусинку наверху? Это Учитель Пятьдесят! Опусти его вниз.", target: 50, taskAudio: "audio/learn_tens_5.wav" },
        { taskText: "Учитель Пятьдесят любит гулять с учениками. Опусти Учителя вниз и подними одного ученика вверх. Получится 60!", target: 60, taskAudio: "audio/learn_tens_6.wav" },
        { taskText: "А если Учитель Пятьдесят и два ученика? Сделай число 70.", target: 70, taskAudio: "audio/learn_tens_7.wav" },
        { taskText: "Учитель Пятьдесят сверху и три ученика снизу — это 80.", target: 80, taskAudio: "audio/learn_tens_8.wav" },
        { taskText: "Учитель Пятьдесят и четыре ученика дадут число 90.", target: 90, taskAudio: "audio/learn_tens_9.wav" }
    ],
    
    'learn_hundreds': [
        { taskText: "Переходим к сотням! Зеленые бусинки — это сотни, здесь живут смелые ниндзя. Подними одну нижнюю бусинку вверх. Это 100.", target: 100, taskAudio: "audio/learn_hun_1.wav" },
        { taskText: "Подними вторую бусинку, получим 200.", target: 200, taskAudio: "audio/learn_hun_2.wav" },
        { taskText: "А теперь подними все четыре нижние бусинки. Это 400.", target: 400, taskAudio: "audio/learn_hun_4.wav" },
        { taskText: "Сбрось бусинки вниз. Видишь бусинку наверху? Это Сэнсэй Пятьсот! Опусти его вниз.", target: 500, taskAudio: "audio/learn_hun_5.wav" },
        { taskText: "Сэнсэй Пятьсот выходит на тренировку с одним ниндзя. Это 600!", target: 600, taskAudio: "audio/learn_hun_6.wav" },
        { taskText: "А если Сэнсэй Пятьсот и два ниндзя? Сделай число 700.", target: 700, taskAudio: "audio/learn_hun_7.wav" },
        { taskText: "Сэнсэй Пятьсот сверху и три ниндзя снизу — это 800.", target: 800, taskAudio: "audio/learn_hun_8.wav" },
        { taskText: "Сэнсэй Пятьсот и четыре ниндзя дадут самое большое число на этой спице — 900.", target: 900, taskAudio: "audio/learn_hun_9.wav" }
    ],

    // ИСПРАВЛЕННЫЕ "Друзья 10" с поддержкой комиксов, стартовых значений и ОЗВУЧКИ
    'learn_friends': [
        { 
            taskText: "Прибавляем 9: тут нужен учитель Десять (+10) и попрощайся с другом девятки — один (-1).", 
            initialValue: 2, 
            target: 11, 
            taskAudio: "audio/friend9_task.wav",
            slides: [
                "img/friend_cover_academy.jpg", 
                "img/friend_cover_friends.jpg", 
                "img/friend9_step1.jpg",        
                "img/friend9_step2.jpg",        
                "img/friend9_step3.jpg"         
            ],
            audioSlides: [
                "audio/anime_intro_academy.wav", 
                "audio/anime_friends_9_1.wav",   
                "audio/anime_friend9_step1.wav", 
                "audio/anime_friend9_step2.wav", 
                "audio/anime_friend9_step3.wav"  
            ]
        },
        { 
            taskText: "Прибавляем 8: тут нужен учитель Десять (+10) и попрощайся с другом восьми — два (-2).", 
            initialValue: 3, 
            target: 11, 
            taskAudio: "audio/friend8_task.wav",
            slides: ["img/friend_cover_8_2.jpg"],
            audioSlides: ["audio/anime_friends_8_2.wav"]
        },
        { 
            taskText: "Прибавляем 7: тут нужен учитель Десять (+10) и попрощайся с другом семи — три (-3).", 
            initialValue: 4, 
            target: 11, 
            taskAudio: "audio/friend7_task.wav",
            slides: ["img/friend_cover_7_3.jpg"],
            audioSlides: ["audio/anime_friends_7_3.wav"]
        },
        { 
            taskText: "Прибавляем 6: тут нужен учитель Десять (+10) и попрощайся с другом шести — четыре (-4).", 
            initialValue: 4, 
            target: 10, 
            taskAudio: "audio/friend6_task.wav",
            slides: ["img/friend_cover_6_4.jpg"],
            audioSlides: ["audio/anime_friends_6_4.wav"]
        },
        { 
            taskText: "Прибавляем 5: тут нужен учитель Десять (+10) и попрощайся с другом пяти — пять (-5).", 
            initialValue: 6, 
            target: 11, 
            taskAudio: "audio/friend5_task.wav",
            slides: ["img/friend_cover_5_5.jpg"],
            audioSlides: ["audio/anime_friends_5_5.wav"]
        }
    ],

    // --- ТАЙНЫЙ ОРДЕН КОРОЛЕВЫ ПЯТЬ (Друзья 5 / Помощь брата) ---
    'learn_friends_5': [
        { 
            taskText: "Прибавляем четыре: опусти Королеву Пять (+5) и попрощайся с братом четверки — один (-1).", 
            initialValue: 2, 
            target: 6,       
            taskAudio: "audio/brother4_task.wav",
            slides: [
                "img/brother_cover_academy.jpg", 
                "img/brother_cover_4_1.jpg",     
                "img/brother4_step1.jpg",        
                "img/brother4_step2.jpg",        
                "img/brother4_step3.jpg"         
            ],
            audioSlides: [
                "audio/anime_intro_five.wav",
                "audio/anime_brothers_4_1.wav",
                "audio/anime_brother4_step1.wav",
                "audio/anime_brother4_step2.wav",
                "audio/anime_brother4_step3.wav"
            ]
        },
        { 
            taskText: "Прибавляем три: опусти Королеву Пять (+5) и попрощайся с братом тройки — два (-2).", 
            initialValue: 3, 
            target: 6, 
            taskAudio: "audio/brother3_task.wav",
            slides: ["img/brother_cover_3_2.jpg"],
            audioSlides: ["audio/anime_brothers_3_2.wav"]
        }
    ],

    'learn_add': [],
    'learn_sub': [],
    'learn_mult': [],
    'learn_div': [],

// --- ТРЕНАЖЕР: НАБЕРИ ЧИСЛО (26 заданий вразброс) ---
    'play_numbers': [
        // Разминка (однозначные и двузначные)
        { taskText: "Набери цифру 5", target: 5, taskAudio: "audio/play_num_5.wav" },
        { taskText: "Набери цифру 9", target: 9, taskAudio: "audio/play_num_9.wav" },
        { taskText: "Сделай число 12", target: 12, taskAudio: "audio/play_num_12.wav" },
        { taskText: "Сделай число 20", target: 20, taskAudio: "audio/play_num_20.wav" },
        { taskText: "Набери число 37", target: 37, taskAudio: "audio/play_num_37.wav" },
        { taskText: "Набери число 46", target: 46, taskAudio: "audio/play_num_46.wav" },
        { taskText: "Сделай число 50", target: 50, taskAudio: "audio/play_num_50.wav" },
        { taskText: "Набери число 64", target: 64, taskAudio: "audio/play_num_64.wav" },
        { taskText: "Набери число 71", target: 71, taskAudio: "audio/play_num_71.wav" },
        { taskText: "Сделай число 85", target: 85, taskAudio: "audio/play_num_85.wav" },
        { taskText: "Набери число 93", target: 93, taskAudio: "audio/play_num_93.wav" },
        
        // Подключаем зеленую спицу (трехзначные числа)
        { taskText: "Сделай число 100", target: 100, taskAudio: "audio/play_num_100.wav" },
        { taskText: "Набери число 105", target: 105, taskAudio: "audio/play_num_105.wav" },
        { taskText: "Сделай число 115", target: 115, taskAudio: "audio/play_num_115.wav" },
        { taskText: "Набери число 123", target: 123, taskAudio: "audio/play_num_123.wav" },
        { taskText: "Сделай число 240", target: 240, taskAudio: "audio/play_num_240.wav" },
        { taskText: "Набери число 302", target: 302, taskAudio: "audio/play_num_302.wav" },
        { taskText: "Набери число 456", target: 456, taskAudio: "audio/play_num_456.wav" },
        { taskText: "Сделай число 500", target: 500, taskAudio: "audio/play_num_500.wav" },
        { taskText: "Набери число 518", target: 518, taskAudio: "audio/play_num_518.wav" },
        { taskText: "Набери число 607", target: 607, taskAudio: "audio/play_num_607.wav" },
        { taskText: "Сделай число 731", target: 731, taskAudio: "audio/play_num_731.wav" },
        { taskText: "Набери число 842", target: 842, taskAudio: "audio/play_num_842.wav" },
        { taskText: "Сделай число 900", target: 900, taskAudio: "audio/play_num_900.wav" },
        { taskText: "Набери число 950", target: 950, taskAudio: "audio/play_num_950.wav" },
        { taskText: "А теперь самое большое: 999!", target: 999, taskAudio: "audio/play_num_999.wav" }
    ],
    
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
}; // <--- ВОТ ТЕПЕРЬ БАЗА ЗАКРЫТА ПРАВИЛЬНО, В САМОМ КОНЦЕ

// Лайтбокс
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

// Навигационная система
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

// Открытие экранов меню
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

// UX/UI functions
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
    
    // ВЫКЛЮЧАЕМ ЗВУК ПРИ ВЫХОДЕ ИЗ КОМНАТЫ
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }

    const oldAbacus = document.getElementById('abacus-body-container');
    if (oldAbacus) {
        oldAbacus.remove();
        globalLowerBeadsRefs = [];
        globalUpperBeadsRefs = [];
    }
    
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

    if (roomsData[category]) {
        roomsData[category].forEach(t => t._comicShown = false);
    }

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

// Игра "Слоги"
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

// --- БРОНЕБОЙНЫЙ DRAG & DROP ---
function handlePointerStart(e) {
    if (activeItem) return; 
    
    if (e.target.classList.contains('matched')) return;
    
    activeItem = e.target;
    activeItem.setPointerCapture(e.pointerId);

    const rect = activeItem.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    activeItem._dragOffsetX = offsetX;
    activeItem._dragOffsetY = offsetY;

    activeItem.style.width = rect.width + 'px';
    activeItem.style.height = rect.height + 'px';
    activeItem.style.transform = 'none';

    playSound(activeItem.getAttribute('data-audio'));

    activeItem.classList.add('dragging');
    activeItem.style.position = 'fixed';
    activeItem.style.margin = '0';
    activeItem.style.left = (e.clientX - offsetX) + 'px';
    activeItem.style.top = (e.clientY - offsetY) + 'px';

    activeItem.addEventListener('pointermove', handlePointerMove);
    activeItem.addEventListener('pointerup', handlePointerEnd);
    activeItem.addEventListener('pointercancel', handlePointerEnd); 
}

function handlePointerMove(e) {
    if (!activeItem) return;
    const offsetX = activeItem._dragOffsetX;
    const offsetY = activeItem._dragOffsetY;
    activeItem.style.left = (e.clientX - offsetX) + 'px';
    activeItem.style.top = (e.clientY - offsetY) + 'px';
}

function handlePointerEnd(e) {
    if (!activeItem) return;
    
    activeItem.releasePointerCapture(e.pointerId);
    activeItem.classList.remove('dragging');
    activeItem.removeEventListener('pointermove', handlePointerMove);
    activeItem.removeEventListener('pointerup', handlePointerEnd);
    activeItem.removeEventListener('pointercancel', handlePointerEnd); 

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
        try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "medium"}); } catch(err) {}
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
                    setTimeout(goBackFromGame, 3000); 
                }
            }, 1200);
        }
    } else {
        try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "light"}); } catch(err) {}
        playSound('audio/wrong.wav');
        activeItem.style.transition = 'all 0.3s ease';
        activeItem.style.position = 'relative';
        activeItem.style.left = '0px';
        activeItem.style.top = '0px';
        activeItem.style.width = '';
        activeItem.style.height = '';
        activeItem.style.transform = ''; 
        setTimeout(() => { 
            if(activeItem) activeItem.style.transition = 'none'; 
        }, 300);
    }
    
    delete activeItem._dragOffsetX;
    delete activeItem._dragOffsetY;
    activeItem = null;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// --- УМНЫЙ АУДИОПЛЕЕР ---
function playSound(soundFile) {
    if (soundFile) {
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
        }
        currentAudio = new Audio(soundFile);
        currentAudio.play().catch(err => console.log("Ошибка аудио:", err));
    }
}

// --- ДВИЖОК СОРОБАНА ---
let sorobanState = [
    { upper: false, lower: 0 },
    { upper: false, lower: 0 },
    { upper: false, lower: 0 }
];

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

    const beam = document.createElement('div');
    beam.className = "soroban-beam";
    abacusBody.appendChild(beam);

    const rodLabels = ["Сотни", "Десятки", "Единицы"];
    const rodColors = ["bead-green", "bead-blue", "bead-red"];

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

        const upperBead = document.createElement('div');
        upperBead.className = `bead-3d ${rodColors[s]}`;
        upperBead.style.top = "5px";
        globalUpperBeadsRefs.push({ img: upperBead, rodIndex: s });
        
        upperBead.onclick = () => {
            if (isTaskLock && sorobanMode !== 'free') return;
            try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "light"}); } catch(e){}
            sorobanState[s].upper = !sorobanState[s].upper;
            upperBead.style.top = (sorobanState[s].upper ? "52px" : "5px");
            updateSorobanScore();
        };
        rod.appendChild(upperBead);

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

function resetAbacusBeads() {
    let startVal = 0;
    if (sorobanMode !== 'free') {
        const tasks = roomsData[sorobanCategory];
        if (tasks && tasks[currentLessonIndex] && tasks[currentLessonIndex].initialValue !== undefined) {
            startVal = tasks[currentLessonIndex].initialValue;
        }
    }

    let hundreds = Math.floor(startVal / 100) % 10;
    let tens = Math.floor(startVal / 10) % 10;
    let units = startVal % 10;

    sorobanState = [
        { upper: hundreds >= 5, lower: hundreds % 5 },
        { upper: tens >= 5, lower: tens % 5 },
        { upper: units >= 5, lower: units % 5 }
    ];

    document.getElementById('soroban-score').innerText = startVal;

    if (globalUpperBeadsRefs.length === 0) {
        setupSorobanGame();
    }

    for (let s = 0; s < 3; s++) {
        globalUpperBeadsRefs[s].img.style.top = (sorobanState[s].upper ? "52px" : "5px");
        
        const lowerBeads = globalLowerBeadsRefs[s].beads;
        lowerBeads.forEach((bead, idx) => {
            if (idx < sorobanState[s].lower) {
                bead.style.top = (112 + idx * 34) + "px"; 
            } else {
                bead.style.top = (360 - (3 - idx) * 34) + "px"; 
            }
        });
    }
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
    
    // Интеграция слайдера-комикса И АУДИО
    if (currentTask.slides && currentTask.slides.length > 0 && !currentTask._comicShown) {
        openComicSlider(currentTask.slides, currentTask.audioSlides);
        currentTask._comicShown = true;
    } else {
        // Читаем задание, если комикс уже просмотрен
        if (currentTask.taskAudio) {
            playSound(currentTask.taskAudio);
        }
    }

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
    // Временно глушим клики косточек, чтобы не прерывать голос задания
    try { new Audio('audio/click.wav').play(); } catch(e) {}
    
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
            
            if (currentLessonIndex < tasks.length - 1) {
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

// --- КОМИКС КАРУСЕЛЬ-СЛАЙДЕР С ОЗВУЧКОЙ ---
function openComicSlider(slides, audioSlides) {
    currentSlidesArray = slides;
    currentSlidesAudioArray = audioSlides || [];
    currentSlideIndex = 0;
    document.getElementById('comic-slider-modal').style.display = 'flex';
    updateSliderContent();
}

function updateSliderContent() {
    document.getElementById('comic-slider-img').src = currentSlidesArray[currentSlideIndex];
    document.getElementById('btn-comic-prev').classList.toggle('disabled', currentSlideIndex === 0);
    
    const isLast = currentSlideIndex === currentSlidesArray.length - 1;
    document.getElementById('btn-comic-next').style.visibility = isLast ? 'hidden' : 'visible';
    document.getElementById('btn-comic-start').style.display = isLast ? 'block' : 'none';

    const dotsContainer = document.getElementById('comic-slider-dots');
    dotsContainer.innerHTML = '';
    currentSlidesArray.forEach((_, idx) => {
        const dot = document.createElement('div');
        dot.className = `comic-dot ${idx === currentSlideIndex ? 'active' : ''}`;
        dotsContainer.appendChild(dot);
    });

    // Озвучка текущего слайда!
    if (currentSlidesAudioArray && currentSlidesAudioArray[currentSlideIndex]) {
        playSound(currentSlidesAudioArray[currentSlideIndex]);
    }
}

function moveSlide(direction) {
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "light"}); } catch(e){}
    currentSlideIndex += direction;
    if (currentSlideIndex < 0) currentSlideIndex = 0;
    if (currentSlideIndex >= currentSlidesArray.length) currentSlideIndex = currentSlidesArray.length - 1;
    updateSliderContent();
}

function closeComicSlider() {
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "medium"}); } catch(e){}
    document.getElementById('comic-slider-modal').style.display = 'none';

    // Озвучка самого задания на абакусе после закрытия комикса
    const tasks = roomsData[sorobanCategory];
    if (tasks && tasks[currentLessonIndex] && tasks[currentLessonIndex].taskAudio) {
        playSound(tasks[currentLessonIndex].taskAudio);
    }
}
