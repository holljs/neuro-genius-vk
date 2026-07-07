// ==========================================
//        СИСТЕМА ДОСТУПА И ОПЛАТ: НЕЙРО-ГЕНИЙ
// ==========================================
let userVkId = 0;
let vkSignParams = "";
let vkPlatform = "";
let hasPremiumAccess = true; // РЕЖИМ ПРОВЕРКИ: Открываем всё бесплатно для модераторов!

// 🔥🔥🔥 ВАЖНО: ВПИШИ СВОИ ДАННЫЕ СЮДА 🔥🔥🔥
const BACKEND_URL = "https://neuro-master.online"; 
const VK_GROUP_ID = 78549529; // Твой ID группы без минуса

try {
    vkBridge.send('VKWebAppInit').then(() => {
        const urlParams = new URLSearchParams(window.location.search);
        userVkId = urlParams.get('vk_user_id');
        vkPlatform = urlParams.get('vk_platform'); 
        vkSignParams = window.location.search.replace('?', '');
        
        hidePaymentsOnMobile(); 
        
        // Автоматически и мгновенно убираем верстку замочков
        document.querySelectorAll('.locked-card').forEach(el => el.classList.remove('locked-card'));
        
        fetch(`${BACKEND_URL}/api/user_geniy/${userVkId}`, {
            method: "GET",
            headers: { "x-vk-sign": vkSignParams }
        })
        .then(res => res.json())
        .then(data => {
            // Для модерации игнорируем ответ сервера, чтобы случайно не закрыть комнаты
        }).catch(err => console.log("Ошибка доступа:", err));
    });
} catch(e) { console.log("VK Bridge Error", e); }

function hidePaymentsOnMobile() {
    const ua = navigator.userAgent.toLowerCase();
    if (vkPlatform === 'desktop_web' || vkPlatform === 'mobile_web') return; 

    const isVkNative = vkPlatform === 'mobile_android' || vkPlatform === 'mobile_iphone' || vkPlatform === 'mobile_ipad' || ua.includes('vkandroidapp') || ua.includes('vkclient');

    if (isVkNative) {
        const buyBtn = document.getElementById('btn-buy-premium');
        const mobileMsg = document.getElementById('mobile-payment-msg');
        if (buyBtn) buyBtn.style.display = 'none';
        if (mobileMsg) mobileMsg.style.display = 'block';
    }
}

// ==========================================
//        ОКНО "О ПРИЛОЖЕНИИ" И ПОДДЕРЖКА
// ==========================================
function openAboutModal() {
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "light"}); } catch(e){}
    document.getElementById('about-modal').style.display = 'flex';
}

function closeAboutModal() {
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "light"}); } catch(e){}
    document.getElementById('about-modal').style.display = 'none';
}

function openSupport() {
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "medium"}); } catch(e){}
    try {
        vkBridge.send("VKWebAppOpenURL", {"url": "https://vk.com/im?sel=-78549529"});
    } catch(e) {
        window.open("https://vk.com/im?sel=-78549529", "_blank");
    }
}

// Прямой пропуск модератора во все комнаты без ограничений
function checkAccessAndOpen(roomType) {
    if (roomType === 'soroban') openSorobanMenu();
    if (roomType === 'memorika') openMemorikaMenu();
    if (roomType === 'brain') openBrainFitnessMenu();
}

function getFreeVip() {
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "light"}); } catch(e){}
    vkBridge.send("VKWebAppAllowMessagesFromGroup", {"group_id": VK_GROUP_ID})
    .then(data => {
        if (data.result) {
            fetch(`${BACKEND_URL}/api/geniy/grant_bonus`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "x-vk-sign": vkSignParams },
                body: JSON.stringify({ user_id: parseInt(userVkId) })
            }).then(() => {
                const modalText = document.getElementById('vip-modal').querySelector('p');
                if (modalText) {
                    modalText.innerHTML = "<b style='color:#4CAF50; font-size:16px;'>Ура! Бот отправил вам сообщение. <br>Пожалуйста, перезапустите игру! 🚀</b>";
                }
            });
        }
    }).catch(err => console.log(err));
}

function buyPremium() {
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "medium"}); } catch(e){}
    const requestData = {
        user_id: parseInt(userVkId),
        amount: 150,
        description: "Подписка Нейро-Гений (1 мес)",
        platform: "vk",
        currency_type: "geniy_sub" 
    };

    fetch(`${BACKEND_URL}/api/yookassa/create-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-vk-sign": vkSignParams },
        body: JSON.stringify(requestData)
    })
    .then(res => res.json())
    .then(data => {
        if (data.success && data.payment_url) window.location.href = data.payment_url;
    });
}

// ==========================================
//        ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
// ==========================================
let currentRoom = '';
let currentWordIndex = 0;
let matchedCount = 0;
let activeItem = null;

let sorobanMode = 'free';
let sorobanCategory = '';
let currentLessonIndex = 0;
let isTaskLock = false;

let currentSlideIndex = 0;
let currentSlidesArray = [];
let currentAudio = null; 
let currentSlidesAudioArray = []; 

// Данные и состояние для Китайских Лайфхаков
const chineseHacksData = [
    { title: "🧩 Язык-Конструктор", text: "В китайском языке нет букв! Вместо них — маленькие детальки-кубики (они называются ключи). Их всего 214, и из них, как из конструктора, собираются все-все слова в мире!", img: "img/hack_lego.png", audio: "audio/hack_lego.wav" },
    { title: "🗣️ Поющие слова", text: "Китайцы не просто говорят, они... поют! Одно и то же слово 'МА', сказанное разным голосом, полностью меняет смысл. Можно нежно сказать 'Мама', а можно случайно назвать её 'Лошадкой' 🐴!", img: "img/hack_tones.png", audio: "audio/hack_tones.wav" },
    { title: "🌳 Иероглифы-рисунки", text: "Древние китайцы просто рисовали то, что видели! Знак Человек (人) — это шагающие ножки. Знак Дерево (木) — ствол и ветки. Поставишь два дерева рядом (林) — получится роща, а три (森) — дремучий лес!", img: "img/hack_draw.png", audio: "audio/hack_draw.wav" },
    { title: "🤫 Секретный счёт", text: "Китайцы умеют считать от 1 до 10 на одной руке! Пока мы загибаем пальцы на двух руках, они показывают тайные жесты. Например, 'круто' 👍 — это 5, 'коза' 🤘 — это 6, а 'пистолетик' 👈 — это 8!", img: "img/hack_numbers.png", audio: "audio/hack_numbers.wav" },
    { title: "📜 Сто тысяч знаков", text: "Всего в китайском языке больше 85 000 иероглифов! Но даже сами китайцы их все не знают. Для жизни хватает 3000, а чтобы играть в наши игры — достаточно выучить всего несколько десятков!", img: "img/hack_wisdom.png", audio: "audio/hack_wisdom.wav" }
];
let currentHackIndex = 0;

// ==========================================
//        БАЗА ДАННЫХ (ROOMS DATA)
// ==========================================
const roomsData = {
    'words_2': [
        { id: 'lisa', text: 'Лиса', image: 'img/3d_lisa.png', sound: 'audio/w_lisa.wav', syllables: ['ли', 'са'], audioSyllables: ['audio/sl_li.wav', 'audio/sl_sa.wav'] },
        { id: 'ryba', text: 'Рыба', image: 'img/3d_ryba.png', sound: 'audio/w_ryba.wav', syllables: ['ры', 'ба'], audioSyllables: ['audio/sl_ry.wav', 'audio/sl_ba.wav'] },
        { id: 'kasha', text: 'Каша', image: 'img/3d_kasha.png', sound: 'audio/w_kasha.wav', syllables: ['ка', 'ша'], audioSyllables: ['audio/sl_ka.wav', 'audio/sl_sha.wav'] },
        { id: 'medved', text: 'Медведь', image: 'img/bs_bear.png', sound: 'audio/w_medved.wav', syllables: ['мед', 'ведь'], audioSyllables: ['audio/sl_med.wav', 'audio/sl_ved.wav'] },
        { id: 'zaychik', text: 'Зайчик', image: 'img/bs_bunny.png', sound: 'audio/w_zaychik.wav', syllables: ['зай', 'чик'], audioSyllables: ['audio/sl_zay.wav', 'audio/sl_chik.wav'] },
        { id: 'myshka', text: 'Мышка', image: 'img/bs_mouse.png', sound: 'audio/w_myshka.wav', syllables: ['мыш', 'ка'], audioSyllables: ['audio/sl_mysh.wav', 'audio/sl_ka.wav'] },
        { id: 'banan', text: 'Банан', image: 'img/p_opt_banan.png', sound: 'audio/w_banan.wav', syllables: ['ба', 'нан'], audioSyllables: ['audio/sl_ba.wav', 'audio/sl_nan.wav'] },
        { id: 'domik', text: 'Домик', image: 'img/p_opt_domik.png', sound: 'audio/w_domik.wav', syllables: ['до', 'мик'], audioSyllables: ['audio/sl_do.wav', 'audio/sl_mik.wav'] },
        { id: 'krysha', text: 'Крыша', image: 'img/p_opt_krisha.png', sound: 'audio/w_krysha.wav', syllables: ['кры', 'ша'], audioSyllables: ['audio/sl_kry.wav', 'audio/sl_sha.wav'] },
        { id: 'limon', text: 'Лимон', image: 'img/p_opt_limon.png', sound: 'audio/w_limon.wav', syllables: ['ли', 'мон'], audioSyllables: ['audio/sl_li.wav', 'audio/sl_mon.wav'] },
        { id: 'lodka', text: 'Лодка', image: 'img/p_opt_lodka.png', sound: 'audio/w_lodka.wav', syllables: ['лод', 'ка'], audioSyllables: ['audio/sl_lod.wav', 'audio/sl_ka.wav'] },
        { id: 'myachik', src: 'img/p_opt_myachik.png', text: 'Мячик', image: 'img/p_opt_myachik.png', sound: 'audio/w_myachik.wav', syllables: ['мя', 'чик'], audioSyllables: ['audio/sl_mya.wav', 'audio/sl_chik.wav'] },
        { id: 'okno', text: 'Окно', image: 'img/p_opt_okno.png', sound: 'audio/w_okno.wav', syllables: ['ок', 'но'], audioSyllables: ['audio/sl_ok.wav', 'audio/sl_no.wav'] },
        { id: 'poezd', text: 'Поезд', image: 'img/p_opt_poezd.png', sound: 'audio/w_poezd.wav', syllables: ['по', 'езд'], audioSyllables: ['audio/sl_po.wav', 'audio/sl_ezd.wav'] },
        { id: 'zholud', text: 'Жёлудь', image: 'img/food_acorn.png', sound: 'audio/w_zholud.wav', syllables: ['жё', 'лудь'], audioSyllables: ['audio/sl_zho.wav', 'audio/sl_lud.wav'] },
        { id: 'arbuz', text: 'Арбуз', image: 'img/garden_item_2.png', sound: 'audio/w_arbuz.wav', syllables: ['ар', 'буз'], audioSyllables: ['audio/sl_ar.wav', 'audio/sl_buz.wav'] },
        { id: 'oreh', text: 'Орех', image: 'img/garden_item_5.png', sound: 'audio/w_oreh.wav', syllables: ['о', 'рех'], audioSyllables: ['audio/sl_o.wav', 'audio/sl_reh.wav'] },
        { id: 'tykva', text: 'Тыква', image: 'img/garden_item_6.png', sound: 'audio/w_tykva.wav', syllables: ['тык', 'ва'], audioSyllables: ['audio/sl_tyk.wav', 'audio/sl_va.wav'] },
        { id: 'chashka', text: 'Чашка', image: 'img/p_opt_chay.png', sound: 'audio/w_chashka.wav', syllables: ['чаш', 'ка'], audioSyllables: ['audio/sl_chash.wav', 'audio/sl_ka.wav'] },
        { id: 'gribok', text: 'Грибок', image: 'img/p_opt_grib.png', sound: 'audio/w_gribok.wav', syllables: ['гри', 'бок'], audioSyllables: ['audio/sl_gri.wav', 'audio/sl_bok.wav'] }
    ],
    'words_3': [
        { id: 'sobaka', text: 'Собака', image: 'img/bs_dog.png', sound: 'audio/w_sobaka.wav', syllables: ['со', 'ба', 'ка'], audioSyllables: ['audio/sl_so.wav', 'audio/sl_ba.wav', 'audio/sl_ka.wav'] },
        { id: 'raketa', text: 'Ракета', image: 'img/3d_raketa.png', sound: 'audio/w_raketa.wav', syllables: ['ра', 'ке', 'та'], audioSyllables: ['audio/sl_ra.wav', 'audio/sl_ke.wav', 'audio/sl_ta.wav'] },
        { id: 'mashina', text: 'Машина', image: 'img/p_opt_mashina.png', sound: 'audio/w_mashina.wav', syllables: ['ма', 'ши', 'на'], audioSyllables: ['audio/sl_ma.wav', 'audio/sl_shi.wav', 'audio/sl_na.wav'] },
        { id: 'kapusta', text: 'Капуста', image: 'img/p_opt_kapusta.png', sound: 'audio/w_kapusta.wav', syllables: ['ка', 'пус', 'та'], audioSyllables: ['audio/sl_ka.wav', 'audio/sl_pus.wav', 'audio/sl_ta.wav'] },
        { id: 'moloko', text: 'Молоко', image: 'img/p_opt_moloko.png', sound: 'audio/w_moloko.wav', syllables: ['мо', 'ло', 'ко'], audioSyllables: ['audio/sl_mo.wav', 'audio/sl_lo.wav', 'audio/sl_ko.wav'] },
        { id: 'morkovka', text: 'Морковка', image: 'img/p_opt_morkovka.png', sound: 'audio/w_morkovka.wav', syllables: ['мор', 'ков', 'ка'], audioSyllables: ['audio/sl_mor.wav', 'audio/sl_kov.wav', 'audio/sl_ka.wav'] },
        { id: 'ogurets', text: 'Огурец', image: 'img/p_opt_ogurec.png', sound: 'audio/w_ogurets.wav', syllables: ['о', 'гу', 'рец'], audioSyllables: ['audio/sl_o.wav', 'audio/sl_gu.wav', 'audio/sl_rets.wav'] },
        { id: 'yabloko', text: 'Яблоко', image: 'img/p_opt_yabloko.png', sound: 'audio/w_yabloko.wav', syllables: ['яб', 'ло', 'ко'], audioSyllables: ['audio/sl_yab.wav', 'audio/sl_lo.wav', 'audio/sl_ko.wav'] },
        { id: 'malina', text: 'Малина', image: 'img/p_opt_yagoda.png', sound: 'audio/w_malina.wav', syllables: ['ма', 'ли', 'на'], audioSyllables: ['audio/sl_ma.wav', 'audio/sl_li.wav', 'audio/sl_na.wav'] },
        { id: 'korobka', text: 'Коробка', image: 'img/box.png', sound: 'audio/w_korobka.wav', syllables: ['ко', 'роб', 'ка'], audioSyllables: ['audio/sl_ko.wav', 'audio/sl_rob.wav', 'audio/sl_ka.wav'] },
        { id: 'kostochka', text: 'Косточка', image: 'img/food_bone.png', sound: 'audio/w_kostochka.wav', syllables: ['кос', 'точ', 'ка'], audioSyllables: ['audio/sl_kos.wav', 'audio/sl_toch.wav', 'audio/sl_ka.wav'] },
        { id: 'rediska', text: 'Редиска', image: 'img/garden_item_7.png', sound: 'audio/w_rediska.wav', syllables: ['ре', 'дис', 'ка'], audioSyllables: ['audio/sl_re.wav', 'audio/sl_dis.wav', 'audio/sl_ka.wav'] },
        { id: 'klubnika', text: 'Клубника', image: 'img/garden_item_9.png', sound: 'audio/w_klubnika.wav', syllables: ['клуб', 'ни', 'ка'], audioSyllables: ['audio/sl_klub.wav', 'audio/sl_ni.wav', 'audio/sl_ka.wav'] },
        { id: 'slonenok', text: 'Слонёнок', image: 'img/bs_elephant.png', sound: 'audio/w_slonenok.wav', syllables: ['сло', 'нё', 'нок'], audioSyllables: ['audio/sl_slo.wav', 'audio/sl_nyo.wav', 'audio/sl_nok.wav'] }
    ],
    'words_4': [
        { id: 'kukuruza', text: 'Кукуруза', image: 'img/garden_item_8.png', sound: 'audio/w_kukuruza.wav', syllables: ['ку', 'ку', 'ру', 'за'], audioSyllables: ['audio/sl_ku.wav', 'audio/sl_ku.wav', 'audio/sl_ru.wav', 'audio/sl_za.wav'] },
        { id: 'avtomobil', text: 'Автомобиль', image: 'img/bs_car_big.png', sound: 'audio/w_avtomobil.wav', syllables: ['ав', 'то', 'мо', 'биль'], audioSyllables: ['audio/sl_av.wav', 'audio/sl_to.wav', 'audio/sl_mo.wav', 'audio/sl_bil.wav'] },
        { id: 'lokomotiv', text: 'Локомотив', image: 'img/p_opt_poezd.png', sound: 'audio/w_lokomotiv.wav', syllables: ['ло', 'ко', 'мо', 'тив'], audioSyllables: ['audio/sl_lo.wav', 'audio/sl_ko.wav', 'audio/sl_mo.wav', 'audio/sl_tiv.wav'] },
        { id: 'medvezhonok', text: 'Медвежонок', image: 'img/bs_bear.png', sound: 'audio/w_medvezhonok.wav', syllables: ['мед', 'ве', 'жо', 'нок'], audioSyllables: ['audio/sl_med.wav', 'audio/sl_ve.wav', 'audio/sl_zho.wav', 'audio/sl_nok.wav'] },
        { id: 'zemlyanika', text: 'Земляника', image: 'img/zemlyanika.png', sound: 'audio/w_zemlyanika.wav', syllables: ['зем', 'ля', 'ни', 'ка'], audioSyllables: ['audio/sl_zem.wav', 'audio/sl_lya.wav', 'audio/sl_ni.wav', 'audio/sl_ka.wav'] }
    ]
};

// ==========================================
//        ЛАЙТБОКС И НАВИГАЦИЯ (НАВИГАЦИЯ ВОССТАНОВЛЕНА)
// ==========================================
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

function goMainFromSubmenu() { document.getElementById('screen-soroban-menu').classList.remove('active'); document.getElementById('screen-menu').classList.add('active'); }
function goMainFromColoring() { document.getElementById('screen-coloring-menu').classList.remove('active'); document.getElementById('screen-menu').classList.add('active'); }
function goMainFromMemorika() { document.getElementById('screen-memorika-menu').classList.remove('active'); document.getElementById('screen-menu').classList.add('active'); }
function goMainFromWordsMenu() { document.getElementById('screen-words-menu').classList.remove('active'); document.getElementById('screen-menu').classList.add('active'); }
function openWordsMenu() { document.getElementById('screen-menu').classList.remove('active'); document.getElementById('screen-words-menu').classList.add('active'); }
function openSorobanMenu() { document.getElementById('screen-menu').classList.remove('active'); document.getElementById('screen-soroban-menu').classList.add('active'); }
function openMemorikaMenu() { document.getElementById('screen-menu').classList.remove('active'); document.getElementById('screen-memorika-menu').classList.add('active'); }
function openSorobanLearnMenu() { document.getElementById('screen-soroban-menu').classList.remove('active'); document.getElementById('screen-soroban-learn-menu').classList.add('active'); }
function openSorobanPlayMenu() { document.getElementById('screen-soroban-menu').classList.remove('active'); document.getElementById('screen-soroban-play-menu').classList.add('active'); }
function goBackToSorobanMenuFromLearn() { document.getElementById('screen-soroban-learn-menu').classList.remove('active'); document.getElementById('screen-soroban-menu').classList.add('active'); }
function goBackToSorobanMenuFromPlay() { document.getElementById('screen-soroban-play-menu').classList.remove('active'); document.getElementById('screen-soroban-menu').classList.add('active'); }

function goBackFromGame() {
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "light"}); } catch(e){}
    if (currentAudio) { currentAudio.pause(); currentAudio.currentTime = 0; }
    document.getElementById('screen-room').classList.remove('active');
    document.getElementById('game-area').classList.remove('active');

    if (currentRoom.startsWith('words')) {
        document.getElementById('screen-words-menu').classList.add('active');
    } else if (currentRoom === 'soroban') {
        if (sorobanMode === 'free') document.getElementById('screen-soroban-menu').classList.add('active');
        else if (sorobanMode === 'learn') document.getElementById('screen-soroban-learn-menu').classList.add('active');
        else if (sorobanMode === 'play') document.getElementById('screen-soroban-play-menu').classList.add('active');
    }
}

function openRoom(roomId, title) {
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "light"}); } catch(e){}
    currentRoom = roomId;
    document.getElementById('game-room-title').innerText = title;
    document.getElementById('screen-menu').classList.remove('active');
    document.getElementById('screen-words-menu').classList.remove('active');
    document.getElementById('screen-room').classList.add('active');
    document.getElementById('game-area').classList.add('active');
    document.getElementById('btn-back-to-menu').onclick = goBackFromGame;

    if (roomId.startsWith('words')) {
        currentWordIndex = 0;
        document.getElementById('word-image-container').style.display = 'flex';
        document.getElementById('soroban-controls').style.display = 'none';
        document.getElementById('soroban-score').style.display = 'none';
        document.getElementById('target-zone').style.display = 'flex';
        document.getElementById('drag-zone').style.display = 'flex';
        setupWordsGame();
    }
}

// ==========================================
//        ИГРА СЛОГИ
// ==========================================
function setupWordsGame() {
    const dragZone = document.getElementById('drag-zone');
    const targetZone = document.getElementById('target-zone');
    dragZone.innerHTML = ''; targetZone.innerHTML = '';
    matchedCount = 0;

    const wordData = roomsData[currentRoom][currentWordIndex];
    document.getElementById('word-3d-image').src = wordData.image;
    if (currentWordIndex === 0) { playSound('audio/words_intro.wav'); } else { playSound(wordData.sound); }

    document.getElementById('btn-prev-word').classList.toggle('disabled', currentWordIndex === 0);
    document.getElementById('btn-next-word').classList.toggle('disabled', currentWordIndex === roomsData[currentRoom].length - 1);

    wordData.syllables.forEach((syl, index) => {
        const slot = document.createElement('div');
        slot.className = 'target-item';
        slot.style.backgroundImage = "url('img/slot_bg.png?v=2')";
        slot.innerText = syl;
        slot.setAttribute('data-syl', syl);
        slot.setAttribute('data-index', index);
        targetZone.appendChild(slot);
    });

    wordData.syllables.forEach((syl, i) => {
        const brick = document.createElement('div');
        brick.className = 'draggable-item';
        brick.style.backgroundImage = "url('img/brick_bg.png')";
        brick.style.touchAction = 'none'; 
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
    if (currentWordIndex >= roomsData[currentRoom].length) currentWordIndex = roomsData[currentRoom].length - 1;
    setupWordsGame();
}

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
    activeItem.style.zIndex = '1000';
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
        const tolerance = 30;
        if (clientX >= (rect.left - tolerance) && clientX <= (rect.right + tolerance) && 
            clientY >= (rect.top - tolerance) && clientY <= (rect.bottom + tolerance)) {
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
        if (matchedCount === roomsData[currentRoom][currentWordIndex].syllables.length) {
            setTimeout(() => {
                currentWordIndex++;
                if (currentWordIndex < roomsData[currentRoom].length) {
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
        activeItem.style.zIndex = '';
        activeItem.style.transform = ''; 
        setTimeout(() => { if(activeItem) activeItem.style.transition = 'none'; }, 300);
    }
    
    delete activeItem._dragOffsetX;
    delete activeItem._dragOffsetY;
    activeItem = null;
}

function playSound(soundFile) {
    if (soundFile) {
        if (currentAudio) { currentAudio.pause(); currentAudio.currentTime = 0; }
        currentAudio = new Audio(soundFile);
        currentAudio.play().catch(err => console.log("Ошибка аудио:", err));
    }
}

function startChainTraining(count) {
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "light"}); } catch(e){}
    if (count > chainItemsPool.length) { return; }
    
    document.getElementById('screen-chain-menu').classList.remove('active');
    document.getElementById('screen-chain-game').classList.add('active');

    currentChainTargetCount = count;
    let shuffledPool = [...chainItemsPool];
    for (let i = shuffledPool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledPool[i], shuffledPool[j]] = [shuffledPool[j], shuffledPool[i]];
    }
    let randomItems = shuffledPool.slice(0, count);
    learningSequence = randomItems.map(item => ({ id: item.id, img: item.image }));
    currentChainStage = 'training-observe';
    showTrainingObserveStage(count);
}

function showTrainingObserveStage(count) {
    const area = document.getElementById('chain-visual-area');
    const msg = document.getElementById('chain-message');
    msg.innerHTML = `Свяжи эти <b style="color:#FF9800">${count} предметов</b> в одну смешную сказку!`;
    playSound('audio/chain_train.wav');
    
    area.innerHTML = ''; area.style.flexDirection = 'row';
    area.style.alignItems = "center"; area.style.flexWrap = 'wrap'; 
    
    learningSequence.forEach(item => {
        const img = document.createElement('img');
        img.src = item.img; img.style.width = "65px"; img.style.height = "65px";
        img.style.objectFit = "contain"; img.style.margin = "5px";
        area.appendChild(img);
    });

    const btn = document.getElementById('btn-chain-next');
    btn.style.display = 'block'; btn.innerText = "Я придумал! ✨"; btn.className = ''; 
    btn.style.cssText = "display: block; margin: 20px auto 0 auto; width: 250px; height: 50px; font-size: 20px; font-weight: bold; background: #FF9800; color: white; border: none; border-radius: 25px; cursor: pointer; box-shadow: 0 4px 15px rgba(255, 152, 0, 0.4); transition: transform 0.2s;";
    btn.onclick = () => { setupChainGame(); };
}

function startChainLearning() {
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "heavy"}); } catch(e){}
    document.getElementById('screen-chain-menu').classList.remove('active');
    document.getElementById('screen-chain-game').classList.add('active');
    openComicSlider(['img/chain_intro_1.jpg', 'img/chain_intro_2.jpg'], ['audio/chain_intro_1.wav', 'audio/chain_intro_2.wav']);
    document.getElementById('btn-comic-start').onclick = () => {
        closeComicSlider();
        learningSequence = [
            { id: 'fox', img: 'img/3d_lisa.png', storyImg: 'img/story_fox_box.jpg', text: 'Однажды хитрая ЛИСА нашла под деревом красивую КОРОБКУ.', audio: 'audio/chain_story_1.wav' },
            { id: 'box', img: 'img/box.png', storyImg: 'img/story_box_berry.jpg', text: 'Она обрадовалась и подумала, что внутри лежит сладкая ЯГОДА.', audio: 'audio/chain_story_2.wav' },
            { id: 'berry', img: 'img/p_opt_yagoda.png', storyImg: 'img/story_berry_bone.jpg', text: 'Но когда она открыла коробку, там оказалась только белая КОСТЬ.', audio: 'audio/chain_story_3.wav' },
            { id: 'bone', img: 'img/food_bone.png', storyImg: 'img/story_bone_dog.jpg', text: 'В этот момент из кустов выбежала голодная СОБАКА.', audio: 'audio/chain_story_4.wav' },
            { id: 'dog', img: 'img/bs_dog.png', storyImg: 'img/story_dog_acorn.jpg', text: 'Лиса отдала кость, а Собака подарила ей большой ЖЁЛУДЬ.', audio: 'audio/chain_story_5.wav' },
            { id: 'acorn', img: 'img/food_acorn.png', storyImg: 'img/story_acorn_honey.jpg', text: 'Лиса расколола жёлудь, а внутри оказался густой сладкий МЁД!', audio: 'audio/chain_story_6.wav' },
            { id: 'honey', img: 'img/p_opt_med.png', text: '' }
        ];
        currentChainStage = 'observe';
        showObserveStage();
    };
}

function showObserveStage() {
    const area = document.getElementById('chain-visual-area');
    const msg = document.getElementById('chain-message');
    msg.innerText = "Попробуй запомнить эти предметы за 5 секунд!";
    playSound('audio/chain_remember.wav');
    area.innerHTML = ''; area.style.flexDirection = 'row'; area.style.alignItems = "center"; 
    document.getElementById('btn-chain-next').style.display = 'none';
    
    learningSequence.forEach(item => {
        const img = document.createElement('img');
        img.src = item.img; img.style.width = "80px"; img.style.height = "80px";
        img.style.objectFit = "contain"; img.style.margin = "5px"; area.appendChild(img);
    });

    setTimeout(() => {
        area.innerHTML = '<img src="img/mascot_hide.jpg" style="width: 150px; border-radius: 20px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">';
        msg.innerText = "Ой! Всё исчезло! Трудно запомнить?";
        playSound('audio/chain_hide.wav');
        const btn = document.getElementById('btn-chain-next');
        btn.style.display = 'block'; btn.innerText = "Показать магию ✨"; btn.className = ''; 
        btn.style.cssText = "display: block; margin: 0 auto; width: 250px; height: 50px; font-size: 20px; font-weight: bold; background: #FF9800; color: white; border: none; border-radius: 25px; cursor: pointer; box-shadow: 0 4px 15px rgba(255, 152, 0, 0.4); transition: transform 0.2s;";
        btn.onclick = () => { nextChainStage(); };
        currentChainStage = 'story-start';
    }, 5000);
}

let storyIndex = 0;
function nextChainStage() {
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "light"}); } catch(e){}
    const area = document.getElementById('chain-visual-area');
    const msg = document.getElementById('chain-message');
    const btn = document.getElementById('btn-chain-next');

    if (currentChainStage === 'story-start') { currentChainStage = 'story-telling'; storyIndex = 0; }
    if (currentChainStage === 'story-telling') {
        if (storyIndex < learningSequence.length - 1) {
            const step = learningSequence[storyIndex];
            area.innerHTML = `<img src="${step.storyImg}" style="width:100%; border-radius:15px; box-shadow: 0 5px 15px rgba(0,0,0,0.2);">`;
            msg.innerHTML = `<span style="color:#e67e22; font-size:24px;">${step.text}</span>`;
            btn.innerText = "Дальше ➔";
            if (step.audio) playSound(step.audio);
            storyIndex++;
        } else { setupChainGame(); }
    }
}

let currentChainStep = 0;
let chainGameTargets = []; 

function setupChainGame() {
    const area = document.getElementById('chain-visual-area');
    const msg = document.getElementById('chain-message');
    const btn = document.getElementById('btn-chain-next');
    btn.style.display = 'none';
    msg.innerText = "Вспомни сказку! Нажимай на предметы по порядку.";
    area.innerHTML = ''; area.style.flexDirection = 'column'; area.style.alignItems = 'center';

    currentChainStep = 0;
    chainGameTargets = learningSequence.map(s => s.id);

    let distractors = chainItemsPool.filter(poolItem => !learningSequence.some(seqItem => seqItem.img === poolItem.image));
    distractors = shuffleArray(distractors).slice(0, 7);

    let gameCards = [];
    learningSequence.forEach(s => gameCards.push({ id: s.id, img: s.img }));
    distractors.forEach(d => gameCards.push({ id: d.id, img: d.image }));
    gameCards = shuffleArray(gameCards);

    const targetContainer = document.createElement('div');
    targetContainer.style.display = 'flex'; targetContainer.style.flexWrap = 'wrap';
    targetContainer.style.justifyContent = 'center'; targetContainer.style.gap = '8px';
    targetContainer.style.marginBottom = '25px';

    chainGameTargets.forEach((id, index) => {
        const slot = document.createElement('div');
        slot.style.backgroundImage = "url('img/slot_bg.png?v=2')";
        slot.style.width = '70px'; slot.style.height = '70px'; slot.style.backgroundSize = '100% 100%';
        slot.style.display = 'flex'; slot.style.alignItems = 'center'; slot.style.justifyContent = 'center';
        slot.style.borderRadius = '10px'; slot.id = 'chain-target-' + index;
        targetContainer.appendChild(slot);
    });

    const clickContainer = document.createElement('div');
    clickContainer.style.display = 'flex'; clickContainer.style.flexWrap = 'wrap';
    clickContainer.style.justifyContent = 'center'; clickContainer.style.gap = '10px';
    clickContainer.id = 'chain-drag-zone';

    gameCards.forEach(card => {
        const item = document.createElement('div');
        item.style.backgroundImage = "url('img/brick_bg.png')";
        item.style.width = '70px'; item.style.height = '70px';
        item.style.backgroundSize = '100% 100%';
        item.style.display = 'flex'; item.style.alignItems = 'center'; item.style.justifyContent = 'center';
        item.style.borderRadius = '10px'; item.style.cursor = 'pointer'; item.style.transition = 'transform 0.1s ease'; 
        item.setAttribute('data-id', card.id);
        
        const img = document.createElement('img');
        img.src = card.img; img.style.width = '55px'; img.style.height = '55px';
        img.style.objectFit = 'contain'; img.style.pointerEvents = 'none'; 
        item.appendChild(img);
        item.addEventListener('pointerdown', handleChainItemClick);
        clickContainer.appendChild(item);
    });
    area.appendChild(targetContainer);
    area.appendChild(clickContainer);
}

function handleChainItemClick(e) {
    const item = e.currentTarget;
    if (item.classList.contains('matched')) return; 

    const itemId = item.getAttribute('data-id');
    const currentTargetSlot = document.getElementById('chain-target-' + currentChainStep);

    if (itemId === chainGameTargets[currentChainStep]) {
        try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "medium"}); } catch(err) {}
        item.classList.add('matched'); item.style.visibility = 'hidden'; 
        currentTargetSlot.innerHTML = '';
        const img = document.createElement('img');
        img.src = item.querySelector('img').src; img.style.width = '55px'; img.style.height = '55px';
        img.style.objectFit = 'contain'; img.style.transform = 'scale(0.5)';
        img.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        currentTargetSlot.appendChild(img);
        
        setTimeout(() => { img.style.transform = 'scale(1)'; }, 10);
        currentChainStep++;
        
        if (currentChainStep === chainGameTargets.length) {
            setTimeout(() => {
                document.getElementById('chain-message').innerText = "Супер! Ты настоящий Гений! 🎉";
                playSound('audio/words_win.wav');
                setTimeout(goBackToChainMenu, 3500);
            }, 500);
        }
    } else {
        try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "light"}); } catch(err) {}
        playSound('audio/wrong.wav');
        item.style.transform = 'translateX(-6px)';
        setTimeout(() => { item.style.transform = 'translateX(6px)'; }, 50);
        setTimeout(() => { item.style.transform = 'translateX(-6px)'; }, 100);
        setTimeout(() => { item.style.transform = 'translateX(6px)'; }, 150);
        setTimeout(() => { item.style.transform = 'translateX(0px)'; }, 200);
    }
}

function goBackToChainMenu() {
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "light"}); } catch(e){}
    document.getElementById('screen-chain-game').classList.remove('active');
    document.getElementById('screen-chain-menu').classList.add('active');
}

function startCustomPoemDrawing() {
    const text = document.getElementById('custom-poem-text').value;
    if (!text.trim()) { 
        document.getElementById('custom-poem-text').placeholder = 'Пожалуйста, напиши или вставь стих сюда! ✍️'; 
        return; 
    }

    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    if (lines.length === 0) return;
    drawingPoem = lines.map(line => ({ text: line }));

    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "heavy"}); } catch(e){}
    document.getElementById('screen-poem-input').classList.remove('active');
    document.getElementById('screen-poem-draw').classList.add('active');

    currentDrawIndex = 0; userDrawings = [];
    initCanvas(); updateDrawScreen();
}

function initCanvas() {
    canvas = document.getElementById('drawing-canvas'); ctx = canvas.getContext('2d');
    ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#2c3e50'; 
    clearCanvas();
    canvas.onpointerdown = null; canvas.onpointermove = null; canvas.onpointerup = null; canvas.onpointercancel = null;
    canvas.addEventListener('pointerdown', startDrawing); canvas.addEventListener('pointermove', draw);
    canvas.addEventListener('pointerup', stopDrawing); canvas.addEventListener('pointercancel', stopDrawing);
}

function clearCanvas() {
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "light"}); } catch(e){}
    ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function startDrawing(e) {
    isDrawing = true; ctx.beginPath();
    const rect = canvas.getBoundingClientRect();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
}
function draw(e) {
    if (!isDrawing) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top); ctx.stroke();
}
function stopDrawing() { isDrawing = false; ctx.closePath(); }

function updateDrawScreen() {
    const step = drawingPoem[currentDrawIndex];
    document.getElementById('draw-poem-text').innerHTML = step.text;
    clearCanvas();
    try { new Audio('audio/click.wav').play(); } catch(e) {}
}

function nextDrawLine() {
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "medium"}); } catch(e){}
    userDrawings.push(canvas.toDataURL("image/png"));
    currentDrawIndex++;
    if (currentDrawIndex < drawingPoem.length) updateDrawScreen();
    else showDrawResult();
}

let isPoemTextVisible = false;
function showDrawResult() {
    document.getElementById('screen-poem-draw').classList.remove('active');
    document.getElementById('screen-poem-result').classList.add('active');
    playSound('audio/words_win.wav'); 

    const list = document.getElementById('draw-result-list'); list.innerHTML = '';
    isPoemTextVisible = false;
    const btnToggle = document.getElementById('btn-toggle-poem');
    if (btnToggle) { btnToggle.innerHTML = "👀 Подсмотреть текст"; btnToggle.style.background = "#fff"; }

    drawingPoem.forEach((step, index) => {
        const row = document.createElement('div');
        row.style.display = 'flex'; row.style.alignItems = 'center'; row.style.width = '100%';
        row.style.maxWidth = '350px'; row.style.background = '#fff'; row.style.borderRadius = '15px';
        row.style.padding = '10px'; row.style.marginBottom = '15px'; row.style.boxShadow = '0 4px 10px rgba(0,0,0,0.05)';

        const img = document.createElement('img');
        img.src = userDrawings[index];
        img.style.width = '100px'; img.style.height = '100px'; img.style.border = '2px solid #eee';
        img.style.borderRadius = '10px'; img.style.marginRight = '15px'; img.style.cursor = 'pointer'; 
        img.onclick = function() { openLightbox(this.src); };

        const text = document.createElement('div');
        text.className = 'poem-result-line'; text.innerHTML = step.text;
        text.style.fontSize = '18px'; text.style.fontWeight = 'bold'; text.style.color = '#333'; text.style.display = 'none'; 

        row.appendChild(img); row.appendChild(text); list.appendChild(row);
    });
}

function togglePoemText() {
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "light"}); } catch(e){}
    isPoemTextVisible = !isPoemTextVisible;
    document.querySelectorAll('.poem-result-line').forEach(line => { line.style.display = isPoemTextVisible ? 'block' : 'none'; });
    const btn = document.getElementById('btn-toggle-poem');
    if (isPoemTextVisible) { btn.innerHTML = "🙈 Спрятать текст"; btn.style.background = "#f3e5f5"; } 
    else { btn.innerHTML = "👀 Подсмотреть текст"; btn.style.background = "#fff"; }
}

function goBackToMemorikaFromDraw() {
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "light"}); } catch(e){}
    document.getElementById('screen-poem-draw').classList.remove('active');
    document.getElementById('screen-poem-input').classList.add('active');
}
function goBackToMemorikaFromDrawResult() {
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "light"}); } catch(e){}
    document.getElementById('screen-poem-result').classList.remove('active');
    document.getElementById('screen-memorika-menu').classList.add('active');
}

// ==========================================
//        МЕМОРИКА: ДВОРЕЦ ПАМЯТИ
// ==========================================
let wardrobePhase = 1; 
let activeWardrobeItem = null;
let currentWardrobeSequence = []; 
let wardrobePlacedCount = 0;
let wardrobeRecallStep = 0; 

function openWardrobeMenu() {
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "light"}); } catch(e){}
    document.getElementById('screen-memorika-menu').classList.remove('active');
    document.getElementById('screen-wardrobe-menu').classList.add('active');
}
function goBackToMemorikaFromWardrobeMenu() {
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "light"}); } catch(e){}
    document.getElementById('screen-wardrobe-menu').classList.remove('active');
    document.getElementById('screen-memorika-menu').classList.add('active');
}
function goBackToWardrobeMenuFromGame() {
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "light"}); } catch(e){}
    document.getElementById('screen-wardrobe-game').classList.remove('active');
    document.getElementById('screen-wardrobe-menu').classList.add('active');
    if (currentAudio) currentAudio.pause();
}

function startWardrobeGame(count) {
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "heavy"}); } catch(e){}
    document.getElementById('screen-wardrobe-menu').classList.remove('active');
    document.getElementById('screen-wardrobe-game').classList.add('active');

    wardrobePhase = 1; activeWardrobeItem = null; wardrobePlacedCount = 0;
    document.getElementById('wardrobe-instruction').innerHTML = "<b>📸 Сфотографируй свою комнату!</b><br><span style='font-size:14px; font-weight:normal; color:#444;'>Потом выбирай вещи внизу и «лепи» их на фото слева направо.</span>";
    document.getElementById('wardrobe-instruction').style.background = "#e3f2fd";
    document.getElementById('wardrobe-instruction').style.borderColor = "#64b5f6";
    document.getElementById('wardrobe-instruction').style.color = "#1565c0";
    
    document.getElementById('btn-camera').style.display = 'inline-block';
    document.getElementById('room-photo-container').style.display = 'flex';
    document.getElementById('wardrobe-items-pool').style.display = 'flex';
    document.getElementById('wardrobe-recall-area').style.display = 'none';
    document.getElementById('btn-wardrobe-memorized').style.display = 'none';

    document.querySelectorAll('.room-sticker').forEach(s => s.remove());
    playSound('audio/wardrobe_start.wav');

    currentWardrobeSequence = shuffleArray([...chainItemsPool]).slice(0, count);
    renderWardrobePool(currentWardrobeSequence);
}

function loadRoomPhoto(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imgEl = document.getElementById('room-photo-img');
            imgEl.src = e.target.result; imgEl.style.display = 'block';
            document.getElementById('room-photo-placeholder').style.display = 'none';
            document.getElementById('room-photo-container').style.border = 'none';
        };
        reader.readAsDataURL(file);
    }
}

function renderWardrobePool(items) {
    const pool = document.getElementById('wardrobe-items-pool'); pool.innerHTML = '';
    items.forEach(card => {
        const item = document.createElement('div');
        item.style.backgroundImage = "url('img/brick_bg.png')";
        item.style.width = '70px'; item.style.height = '70px'; item.style.backgroundSize = '100% 100%';
        item.style.display = 'flex'; item.style.alignItems = 'center'; item.style.justifyContent = 'center';
        item.style.borderRadius = '10px'; item.style.cursor = 'pointer'; item.setAttribute('data-id', card.id);
        
        const img = document.createElement('img');
        img.src = card.image || card.img; img.style.width = '55px'; img.style.height = '55px';
        img.style.objectFit = 'contain'; img.style.pointerEvents = 'none'; 
        item.appendChild(img);
        
        item.onclick = (e) => {
            try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "light"}); } catch(err) {}
            if (activeWardrobeItem) activeWardrobeItem.classList.remove('selected-wardrobe-item');
            activeWardrobeItem = e.currentTarget; activeWardrobeItem.classList.add('selected-wardrobe-item');
            try { new Audio('audio/click.wav').play(); } catch(err) {}
        };
        pool.appendChild(item);
    });
}

function handleRoomPhotoClick(e) {
    if (!activeWardrobeItem) return;
    const container = e.currentTarget; const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left; const y = e.clientY - rect.top;

    const sticker = document.createElement('img');
    sticker.src = activeWardrobeItem.querySelector('img').src;
    sticker.className = 'room-sticker'; sticker.style.position = 'absolute';
    sticker.style.left = (x - 30) + 'px'; sticker.style.top = (y - 30) + 'px';
    sticker.style.width = '60px'; sticker.style.height = '60px'; sticker.style.objectFit = 'contain';
    sticker.style.filter = 'drop-shadow(0px 4px 4px rgba(0,0,0,0.5))';
    sticker.style.transform = 'scale(0.5)'; sticker.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    sticker.style.pointerEvents = 'none'; container.appendChild(sticker);
    setTimeout(() => { sticker.style.transform = 'scale(1)'; }, 10);

    activeWardrobeItem.style.display = 'none'; activeWardrobeItem.classList.remove('selected-wardrobe-item');
    activeWardrobeItem = null; wardrobePlacedCount++;

    if (wardrobePlacedCount === currentWardrobeSequence.length) {
        document.getElementById('btn-wardrobe-memorized').style.display = 'block';
        playSound('audio/wardrobe_placed.wav');
    }
}

function startWardrobeRecall() {
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "heavy"}); } catch(e){}
    wardrobePhase = 2; wardrobeRecallStep = 0;

    document.getElementById('room-photo-container').style.display = 'none';
    document.getElementById('wardrobe-items-pool').style.display = 'none';
    document.getElementById('btn-camera').style.display = 'none';
    document.getElementById('btn-wardrobe-memorized').style.display = 'none';
    
    const instr = document.getElementById('wardrobe-instruction');
    instr.innerHTML = "<b>Магия! Комната исчезла! 🙈</b><br><span style='font-size:14px; font-weight:normal; color:#444;'>Вспомни, как ты расставлял предметы, и выбери их по порядку!</span>";
    instr.style.background = "#fff9c4"; instr.style.borderColor = "#fbc02d"; instr.style.color = "#f57f17";
    playSound('audio/wardrobe_hide.wav');

    document.getElementById('wardrobe-recall-area').style.display = 'block';
    const targetsContainer = document.getElementById('wardrobe-targets'); targetsContainer.innerHTML = '';
    
    currentWardrobeSequence.forEach((item, index) => {
        const slot = document.createElement('div');
        slot.style.backgroundImage = "url('img/slot_bg.png?v=2')";
        slot.style.width = '60px'; slot.style.height = '60px'; slot.style.backgroundSize = '100% 100%';
        slot.style.display = 'flex'; slot.style.alignItems = 'center'; slot.style.justifyContent = 'center';
        slot.style.borderRadius = '10px'; slot.id = 'wardrobe-target-' + index;
        targetsContainer.appendChild(slot);
    });

    let distractors = chainItemsPool.filter(poolItem => !currentWardrobeSequence.some(seqItem => seqItem.id === poolItem.id));
    distractors = shuffleArray(distractors).slice(0, currentWardrobeSequence.length);
    let gameCards = shuffleArray([...currentWardrobeSequence, ...distractors]);

    const distractorsContainer = document.getElementById('wardrobe-distractors'); distractorsContainer.innerHTML = '';
    gameCards.forEach(card => {
        const item = document.createElement('div');
        item.style.backgroundImage = "url('img/brick_bg.png')";
        item.style.width = '60px'; item.style.height = '60px'; item.style.backgroundSize = '100% 100%';
        item.style.display = 'flex'; item.style.alignItems = 'center'; item.style.justifyContent = 'center';
        item.style.borderRadius = '10px'; item.style.cursor = 'pointer'; item.style.transition = 'transform 0.1s ease'; 
        item.setAttribute('data-id', card.id);
        
        const img = document.createElement('img');
        img.src = card.image || card.img; img.style.width = '45px'; img.style.height = '45px';
        img.style.objectFit = 'contain'; img.style.pointerEvents = 'none'; 
        item.appendChild(img);
        item.addEventListener('pointerdown', handleWardrobeRecallClick);
        distractorsContainer.appendChild(item);
    });
}

function handleWardrobeRecallClick(e) {
    const item = e.currentTarget;
    if (item.classList.contains('matched')) return;

    const itemId = item.getAttribute('data-id');
    const currentTargetId = currentWardrobeSequence[wardrobeRecallStep].id;
    const currentTargetSlot = document.getElementById('wardrobe-target-' + wardrobeRecallStep);

    if (itemId === currentTargetId) {
        try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "medium"}); } catch(err) {}
        item.classList.add('matched'); item.style.visibility = 'hidden'; 
        currentTargetSlot.innerHTML = '';
        const img = document.createElement('img');
        img.src = item.querySelector('img').src; img.style.width = '45px'; img.style.height = '45px';
        img.style.objectFit = 'contain'; img.style.transform = 'scale(0.5)';
        img.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        currentTargetSlot.appendChild(img);
        setTimeout(() => { img.style.transform = 'scale(1)'; }, 10);
        
        wardrobeRecallStep++;
        if (wardrobeRecallStep === currentWardrobeSequence.length) {
            setTimeout(() => {
                document.getElementById('wardrobe-instruction').innerHTML = "<b>Фантастика! Ты настоящий Гений Памяти! 🎉</b>";
                playSound('audio/words_win.wav');
                setTimeout(goBackToWardrobeMenuFromGame, 3500);
            }, 500);
        }
    } else {
        try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "light"}); } catch(err) {}
        playSound('audio/wrong.wav');
        item.style.transform = 'translateX(-6px)';
        setTimeout(() => { item.style.transform = 'translateX(6px)'; }, 50);
        setTimeout(() => { item.style.transform = 'translateX(-6px)'; }, 100);
        setTimeout(() => { item.style.transform = 'translateX(6px)'; }, 150);
        setTimeout(() => { item.style.transform = 'translateX(0px)'; }, 200);
    }
}

// ==========================================
//        БРЕЙН-ФИТНЕС: НАВИГАЦИЯ
// ==========================================
function openBrainFitnessMenu() {
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "light"}); } catch(e){}
    document.getElementById('screen-menu').classList.remove('active');
    document.getElementById('screen-brain-fitness-menu').classList.add('active');
}
function goMainFromBrainFitness() {
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "light"}); } catch(e){}
    document.getElementById('screen-brain-fitness-menu').classList.remove('active');
    document.getElementById('screen-menu').classList.add('active');
}

// ==========================================
//        БРЕЙН-ФИТНЕС: ПУТАНИЦА
// ==========================================
const animalsData = [];
for (let i = 1; i <= 24; i++) animalsData.push({ id: i, img: `img/a${i}.jpg`, sound: `audio/a${i}.wav`, question: `audio/qa${i}.wav` });

let confusionTargetId = null; let confusionQuestionAudio = null;
let confusionTimerInterval = null; let confusionTimeLeft = 100; 
let isConfusionAnswering = false;

function goBackToBrainFitnessFromConfusion() {
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "light"}); } catch(e){}
    document.getElementById('screen-brain-confusion').classList.remove('active');
    document.getElementById('screen-brain-fitness-menu').classList.add('active');
    if (currentAudio) currentAudio.pause();
    if (confusionQuestionAudio) confusionQuestionAudio.pause();
    clearInterval(confusionTimerInterval); 
}

function startBrainConfusion() {
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "heavy"}); } catch(e){}
    document.getElementById('screen-brain-fitness-menu').classList.remove('active');
    document.getElementById('screen-brain-confusion').classList.add('active');
    nextBrainConfusionTask();
}

function nextBrainConfusionTask() {
    isConfusionAnswering = false; clearInterval(confusionTimerInterval); 
    const bar = document.getElementById('confusion-timer-bar');
    if (bar) { bar.style.width = '100%'; bar.style.background = '#4CAF50'; }

    let shuffled = shuffleArray([...animalsData]);
    const visualAnimal = shuffled[0]; const audioAnimal = shuffled[1]; const targetAnimal = shuffled[2]; 
    confusionTargetId = targetAnimal.id;

    document.getElementById('confusion-main-img').src = visualAnimal.img;
    document.getElementById('confusion-question-text').innerText = "Слушай внимательно...";
    document.getElementById('confusion-question-text').style.color = "#e91e63";
    
    const optionsContainer = document.getElementById('confusion-options'); optionsContainer.innerHTML = '';
    let options = shuffleArray([visualAnimal, audioAnimal, targetAnimal]);

    options.forEach(animal => {
        const btn = document.createElement('div');
        btn.style.width = '80px'; btn.style.height = '80px'; btn.style.background = '#fff';
        btn.style.borderRadius = '15px'; btn.style.boxShadow = '0 4px 10px rgba(0,0,0,0.1)';
        btn.style.display = 'flex'; btn.style.alignItems = 'center'; btn.style.justifyContent = 'center';
        btn.style.cursor = 'pointer'; btn.style.transition = 'transform 0.1s ease';
        const img = document.createElement('img');
        img.src = animal.img; img.style.width = '60px'; img.style.height = '60px';
        img.style.objectFit = 'contain'; img.style.pointerEvents = 'none';
        btn.appendChild(img);
        btn.onclick = () => checkBrainConfusionAnswer(btn, animal.id);
        optionsContainer.appendChild(btn);
    });

    playSound(audioAnimal.sound);
    if (confusionQuestionAudio) confusionQuestionAudio.pause();
    confusionQuestionAudio = new Audio(targetAnimal.question);
    
    setTimeout(() => {
        if (document.getElementById('screen-brain-confusion').classList.contains('active')) {
            confusionQuestionAudio.play();
            document.getElementById('confusion-question-text').innerText = "Кого нужно найти? Время пошло!";
            startConfusionTimer();
        }
    }, 1500);
}

function startConfusionTimer() {
    confusionTimeLeft = 100; const bar = document.getElementById('confusion-timer-bar');
    if (!bar) return;
    confusionTimerInterval = setInterval(() => {
        if (isConfusionAnswering) return; 
        confusionTimeLeft -= 0.8; bar.style.width = confusionTimeLeft + '%';
        if (confusionTimeLeft < 50 && confusionTimeLeft >= 20) bar.style.background = '#FFC107'; 
        else if (confusionTimeLeft < 20) bar.style.background = '#F44336'; 
        if (confusionTimeLeft <= 0) { clearInterval(confusionTimerInterval); handleConfusionTimeout(); }
    }, 50);
}

function handleConfusionTimeout() {
    isConfusionAnswering = true;
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "heavy"}); } catch(e){}
    playSound('audio/wrong.wav'); 
    document.getElementById('confusion-question-text').innerText = "Время вышло! ⏱️";
    document.getElementById('confusion-question-text').style.color = "#F44336";
    const img = document.getElementById('confusion-main-img');
    img.style.transform = 'translateX(-10px)'; setTimeout(() => { img.style.transform = 'translateX(10px)'; }, 50);
    setTimeout(() => { img.style.transform = 'translateX(-10px)'; }, 100); setTimeout(() => { img.style.transform = 'translateX(10px)'; }, 150);
    setTimeout(() => { img.style.transform = 'translateX(0px)'; }, 200);
    setTimeout(() => { nextBrainConfusionTask(); }, 1500);
}

function checkBrainConfusionAnswer(btnElement, clickedId) {
    if (isConfusionAnswering) return; 
    isConfusionAnswering = true; clearInterval(confusionTimerInterval); 
    if (clickedId === confusionTargetId) {
        try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "medium"}); } catch(e){}
        playSound('audio/correct.wav');
        btnElement.style.border = '4px solid #4CAF50'; btnElement.style.background = '#e8f5e9';
        document.getElementById('confusion-question-text').innerText = "Верно! ⚡";
        document.getElementById('confusion-question-text').style.color = "#4CAF50";
        setTimeout(() => { nextBrainConfusionTask(); }, 1500);
    } else {
        try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "light"}); } catch(e){}
        playSound('audio/wrong.wav');
        btnElement.style.transform = 'translateX(-6px)'; setTimeout(() => { btnElement.style.transform = 'translateX(6px)'; }, 50);
        setTimeout(() => { btnElement.style.transform = 'translateX(-6px)'; }, 100); setTimeout(() => { btnElement.style.transform = 'translateX(6px)'; }, 150);
        setTimeout(() => { btnElement.style.transform = 'translateX(0px)'; }, 200);
        setTimeout(() => { isConfusionAnswering = false; startConfusionTimer(); }, 500);
    }
}

// ==========================================
//        БРЕЙН-ФИТНЕС: НЕЙРО-ГОНКИ
// ==========================================
let racingLoopInterval = null; let racingSpawnInterval = null;
let racingScore = 0; let racingSpeed = 5; 
let obstaclesArray = []; let isRacingActive = false; let engineAudio = null; 
const racingLanes = [12.5, 37.5, 62.5, 87.5]; let carLanes = { left: 0, right: 2 }; 

function openBrainRacing() {
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "light"}); } catch(e){}
    document.getElementById('screen-brain-fitness-menu').classList.remove('active');
    document.getElementById('screen-brain-racing').classList.add('active');
    document.getElementById('racing-game-over').style.display = 'none';
    document.getElementById('racing-hint').style.display = 'block';
    carLanes = { left: 0, right: 2 };
    document.getElementById('car-left').style.left = racingLanes[carLanes.left] + '%';
    document.getElementById('car-right').style.left = racingLanes[carLanes.right] + '%';
    document.getElementById('racing-obstacles').innerHTML = '';
    document.getElementById('racing-score-display').innerText = '0 км';
    setTimeout(() => { if (document.getElementById('screen-brain-racing').classList.contains('active')) startRacingGame(); }, 1000);
}

function goBackToBrainFitnessFromRacing() {
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "light"}); } catch(e){}
    isRacingActive = false; clearInterval(racingLoopInterval); clearInterval(racingSpawnInterval);
    if (engineAudio) { engineAudio.pause(); engineAudio.currentTime = 0; }
    document.getElementById('screen-brain-racing').classList.remove('active');
    document.getElementById('screen-brain-fitness-menu').classList.add('active');
}

function startRacingGame() {
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "heavy"}); } catch(e){}
    isRacingActive = true; racingScore = 0; racingSpeed = 6; obstaclesArray = [];
    document.getElementById('racing-game-over').style.display = 'none';
    document.getElementById('racing-hint').style.display = 'none';
    document.getElementById('racing-obstacles').innerHTML = '';
    document.getElementById('racing-score-display').innerText = racingScore + ' км';
    clearInterval(racingLoopInterval); clearInterval(racingSpawnInterval);
    playSound('audio/ignition.wav');
    if (engineAudio) engineAudio.pause();
    engineAudio = new Audio('audio/engine.wav'); engineAudio.volume = 0.5; 
    engineAudio.addEventListener('timeupdate', function() { if (this.currentTime > this.duration - 0.2) { this.currentTime = 0; this.play(); } });
    setTimeout(() => { if (isRacingActive) engineAudio.play().catch(e => console.log("Ошибка аудио:", e)); }, 1000); 
    racingLoopInterval = setInterval(updateRacingFrame, 20);
    racingSpawnInterval = setInterval(spawnObstacles, 1200);
}

function toggleCarLane(side) {
    if (!isRacingActive) return;
    if (side === 'left') {
        carLanes.left = (carLanes.left === 0) ? 1 : 0;
        document.getElementById('car-left').style.left = racingLanes[carLanes.left] + '%';
    } else {
        carLanes.right = (carLanes.right === 2) ? 3 : 2;
        document.getElementById('car-right').style.left = racingLanes[carLanes.right] + '%';
    }
}

function spawnObstacles() {
    if (!isRacingActive) return;
    let spawnLeft = Math.random() > 0.5 ? 0 : 1; let spawnRight = Math.random() > 0.5 ? 2 : 3;
    let spawnType = Math.floor(Math.random() * 3); 
    if (spawnType === 0 || spawnType === 2) createObstacleDom(spawnLeft);
    if (spawnType === 1 || spawnType === 2) createObstacleDom(spawnRight);
}

function createObstacleDom(laneIndex) {
    const container = document.getElementById('racing-obstacles');
    const obs = document.createElement('img');
    const isRock = Math.random() > 0.5; const obstacleType = isRock ? 'rock' : 'puddle'; 
    obs.src = isRock ? 'img/rock.png' : 'img/puddle.png';
    obs.onerror = function() { this.src = 'img/garden_item_5.png'; }; 
    obs.style.position = 'absolute'; obs.style.width = '45px'; obs.style.height = '45px';
    obs.style.left = racingLanes[laneIndex] + '%'; obs.style.transform = 'translateX(-50%)'; obs.style.top = '-50px';
    container.appendChild(obs);
    obstaclesArray.push({ el: obs, lane: laneIndex, y: -50, type: obstacleType });
}

// ==========================================
//        БРЕЙН-ФИТНЕС: ПИНГВИН-СЛЕДОПЫТ (ВОССТАНОВЛЕНО)
// ==========================================
function openBrainPathfinder() {
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "light"}); } catch(e){}
    document.getElementById('screen-brain-fitness-menu').classList.remove('active');
    document.getElementById('screen-brain-pathfinder').classList.add('active');
    pathfinderCurrentSteps = 3; 
    document.getElementById('pathfinder-level-display').innerText = pathfinderCurrentSteps + ' шага';
    const instructionAudio = document.getElementById('pathfinder-instruction-audio');
    if(instructionAudio) { instructionAudio.currentTime = 0; instructionAudio.play().catch(e => console.log("Автоплей заблокирован:", e)); }
    initPathfinderGrid();
    document.getElementById('pathfinder-commands').innerHTML = '<span style="color:#aaa; font-size:18px;">Жми "Начать"</span>';
    document.getElementById('btn-pathfinder-start').style.display = 'block';
    movePenguinTo(12);
}

function goBackToBrainFitnessFromPathfinder() {
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "light"}); } catch(e){}
    const instructionAudio = document.getElementById('pathfinder-instruction-audio');
    if(instructionAudio) instructionAudio.pause();
    document.getElementById('screen-brain-pathfinder').classList.remove('active');
    document.getElementById('screen-brain-fitness-menu').classList.add('active');
}

function initPathfinderGrid() {
    const grid = document.getElementById('pathfinder-grid');
    grid.querySelectorAll('.ice-floe').forEach(f => f.remove());
    pathfinderGridCoords = [];

    for (let i = 0; i < 25; i++) {
        const floe = document.createElement('div');
        floe.className = 'ice-floe';
        floe.style.width = '60px'; floe.style.height = '60px'; floe.style.backgroundImage = "url('img/ice.png')";
        floe.style.backgroundSize = "contain"; floe.style.backgroundPosition = "center"; floe.style.backgroundRepeat = "no-repeat";
        floe.style.borderRadius = "10px"; floe.style.cursor = "pointer"; floe.style.backgroundColor = "#b2ebf2"; 
        floe.onclick = () => checkPathfinderAnswer(i, floe);
        grid.appendChild(floe);
    }
    for(let row=0; row<5; row++) { for(let col=0; col<5; col++) { pathfinderGridCoords.push({ x: col * 65 + 10, y: row * 65 + 10 }); } }
}

function movePenguinTo(index) {
    const penguin = document.getElementById('pathfinder-penguin');
    if(pathfinderGridCoords[index]) { penguin.style.left = pathfinderGridCoords[index].x + 'px'; penguin.style.top = pathfinderGridCoords[index].y + 'px'; }
}

function startPathfinderGame() {
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "light"}); } catch(e){}
    try { new Audio('audio/click.wav').play(); } catch(e) {}
    const instructionAudio = document.getElementById('pathfinder-instruction-audio');
    if(instructionAudio) instructionAudio.pause();
    document.getElementById('btn-pathfinder-start').style.display = 'none';
    document.getElementById('pathfinder-level-display').innerText = pathfinderCurrentSteps + ' ' + getWordForm(pathfinderCurrentSteps, 'шаг', 'шага', 'шагов');
    document.querySelectorAll('.ice-floe').forEach(f => { f.style.border = 'none'; f.style.opacity = '1'; });
    movePenguinTo(12); generatePathfinderRoute();
}

function generatePathfinderRoute() {
    let currentPos = 12; let pathVisuals = [];
    for (let i = 0; i < pathfinderCurrentSteps; i++) {
        let possibleMoves = [];
        let row = Math.floor(currentPos / 5); let col = currentPos % 5;
        if (row > 0) possibleMoves.push({ move: -5 });
        if (row < 4) possibleMoves.push({ move: 5 }); 
        if (col > 0) possibleMoves.push({ move: -1 });
        if (col < 4) possibleMoves.push({ move: 1 });  
        let nextStep = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        pathVisuals.push(nextStep.move); currentPos += nextStep.move;
    }
    pathfinderTargetIndex = currentPos;
    const cmdBox = document.getElementById('pathfinder-commands'); cmdBox.innerHTML = '';
    
    let delay = 0;
    pathVisuals.forEach(moveValue => {
        setTimeout(() => {
            const rotation = pathfinderArrowRotations[moveValue];
            const imgHtml = `<img src="img/arrow_game.png" alt="arrow" style="width:40px; height:40px; object-fit:contain; transform: rotate(${rotation});">`;
            cmdBox.innerHTML += imgHtml;
            try { new Audio('audio/click.wav').play(); } catch(e) {}
        }, delay);
        let speed = pathfinderCurrentSteps > 6 ? 400 : 600; delay += speed; 
    });
}

function checkPathfinderAnswer(clickedIndex, floeElement) {
    if (document.getElementById('btn-pathfinder-start').style.display === 'block') return;
    if (clickedIndex === pathfinderTargetIndex) {
        try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "medium"}); } catch(e){}
        playSound('audio/correct.wav'); movePenguinTo(clickedIndex); floeElement.style.border = '4px solid #4CAF50';
        if (pathfinderCurrentSteps < 15) pathfinderCurrentSteps++;
        setTimeout(() => { startPathfinderGame(); }, 2000);
    } else {
        try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "heavy"}); } catch(e){}
        playSound('audio/splash.wav'); floeElement.style.opacity = '0.3'; 
        const penguin = document.getElementById('pathfinder-penguin'); penguin.style.transform = 'scale(0) rotate(180deg)'; 
        document.querySelectorAll('.ice-floe')[pathfinderTargetIndex].style.border = '4px solid #4CAF50';
        if (pathfinderCurrentSteps > 3) pathfinderCurrentSteps--;
        setTimeout(() => {
            penguin.style.transform = 'scale(1) rotate(0deg)';
            document.getElementById('btn-pathfinder-start').style.display = 'block';
            document.getElementById('btn-pathfinder-start').innerText = 'Попробовать снова 🔄';
        }, 1500);
    }
}

function getWordForm(num, word1, word2, word5) {
    let n = Math.abs(num) % 100; let n1 = n % 10;
    if (n > 10 && n < 20) return word5;
    if (n1 > 1 && n1 < 5) return word2;
    if (n1 === 1) return word1;
    return word5;
}

// ==========================================
//        БРЕЙН-ФИТНЕС: НЕЙРО-ЖЕСТЫ (ВОССТАНОВЛЕНО)
// ==========================================
function openBrainGestures() {
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "light"}); } catch(e){}
    document.getElementById('screen-brain-fitness-menu').classList.remove('active');
    document.getElementById('screen-brain-gestures').classList.add('active');
    isGesturesActive = false; clearInterval(gesturesTimerInterval);
    document.getElementById('gestures-timer-bar').style.width = '100%';
    document.getElementById('gestures-timer-bar').style.background = '#4CAF50';
    document.getElementById('btn-gestures-start').style.display = 'inline-block';
    document.getElementById('btn-gestures-start').innerText = 'Старт! ▶️';
}

function goBackToBrainFitnessFromGestures() {
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "light"}); } catch(e){}
    isGesturesActive = false; clearInterval(gesturesTimerInterval);
    document.getElementById('screen-brain-gestures').classList.remove('active');
    document.getElementById('screen-brain-fitness-menu').classList.add('active');
}

function changeGesturesSpeed(direction) {
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "light"}); } catch(e){}
    try { new Audio('audio/click.wav').play(); } catch(e) {}
    currentGesturesSpeedIndex += direction;
    if (currentGesturesSpeedIndex < 0) currentGesturesSpeedIndex = 0;
    if (currentGesturesSpeedIndex >= gesturesSpeeds.length) currentGesturesSpeedIndex = gesturesSpeeds.length - 1;
    document.getElementById('gestures-speed-title').innerText = gesturesSpeedTitles[currentGesturesSpeedIndex];
    if (isGesturesActive) nextGesturesPair();
}

function startGesturesGame() {
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "heavy"}); } catch(e){}
    try { new Audio('audio/click.wav').play(); } catch(e) {}
    isGesturesActive = true;
    document.getElementById('btn-gestures-start').style.display = 'none';
    nextGesturesPair();
}

function nextGesturesPair() {
    if (!isGesturesActive) return;
    clearInterval(gesturesTimerInterval);
    const leftGesture = gesturesList[Math.floor(Math.random() * gesturesList.length)];
    let rightGesture;
    do { rightGesture = gesturesList[Math.floor(Math.random() * gesturesList.length)]; } while (rightGesture.id === leftGesture.id);

    document.getElementById('gesture-img-left').src = leftGesture.img;
    document.getElementById('gesture-name-left').innerText = leftGesture.name;
    document.getElementById('gesture-img-right').src = rightGesture.img;
    document.getElementById('gesture-name-right').innerText = rightGesture.name;

    const cLeft = document.getElementById('gesture-card-left'); const cRight = document.getElementById('gesture-card-right');
    cLeft.style.transform = 'scale(1.05)'; cRight.style.transform = 'scale(1.05)';
    try { new Audio('audio/click.wav').play(); } catch(e) {}
    setTimeout(() => { cLeft.style.transform = 'scale(1)'; cRight.style.transform = 'scale(1)'; }, 100);

    gesturesTimeLeft = 100; const bar = document.getElementById('gestures-timer-bar'); bar.style.background = '#4CAF50';
    const msInterval = gesturesSpeeds[currentGesturesSpeedIndex] / 50;
    
    gesturesTimerInterval = setInterval(() => {
        if (!isGesturesActive) return;
        gesturesTimeLeft -= 2; bar.style.width = gesturesTimeLeft + '%';
        if (gesturesTimeLeft < 40 && gesturesTimeLeft >= 16) bar.style.background = '#FFC107'; 
        else if (gesturesTimeLeft < 16) bar.style.background = '#F44336'; 
        if (gesturesTimeLeft <= 0) { clearInterval(gesturesTimerInterval); nextGesturesPair(); }
    }, msInterval);
}

function updateRacingFrame() {
    if (!isRacingActive) return;
    const screenHeight = window.innerHeight;
    const carBottomPx = screenHeight * 0.10; const carTopPx = carBottomPx + 90; 
    const hitZoneTop = screenHeight - carTopPx - 20; const hitZoneBottom = screenHeight - carBottomPx;
    for (let i = obstaclesArray.length - 1; i >= 0; i--) {
        let obs = obstaclesArray[i];
        obs.y += racingSpeed; obs.el.style.top = obs.y + 'px';
        if (obs.y + 40 > hitZoneTop && obs.y < hitZoneBottom) {
            if (obs.lane === carLanes.left || obs.lane === carLanes.right) { crashGame(obs.type); return; }
        }
        if (obs.y > screenHeight) {
            obs.el.remove(); obstaclesArray.splice(i, 1);
            racingScore += 5; document.getElementById('racing-score-display').innerText = racingScore + ' км';
            if (racingScore % 50 === 0 && racingSpeed < 18) racingSpeed += 1; 
        }
    }
}

function crashGame(hitType) {
    isRacingActive = false; clearInterval(racingLoopInterval); clearInterval(racingSpawnInterval);
    if (engineAudio) engineAudio.pause();
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "heavy"}); } catch(e){}
    const gameOverTitle = document.getElementById('racing-game-over').querySelector('h2');
    if (hitType === 'rock') {
        playSound('audio/crash_rock.wav'); 
        gameOverTitle.innerText = 'БАМ! 💥'; gameOverTitle.style.color = '#F44336';
    } else {
        playSound('audio/splash.wav'); 
        gameOverTitle.innerText = 'БУЛЬК! 💦'; gameOverTitle.style.color = '#2196F3'; 
    }
    document.getElementById('racing-final-score').innerText = racingScore + ' км';
    document.getElementById('racing-game-over').style.display = 'block';
    const area = document.getElementById('racing-game-area');
    area.style.transform = 'translateX(-10px)'; setTimeout(() => { area.style.transform = 'translateX(10px)'; }, 50);
    setTimeout(() => { area.style.transform = 'translateX(-10px)'; }, 100); setTimeout(() => { area.style.transform = 'translateX(0px)'; }, 150);
}

// ==========================================
//        БРЕЙН-ФИТНЕС: ЗЕРКАЛКИ (ВОССТАНОВЛЕНО)
// ==========================================
function changeMirrorLevel(direction) {
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "light"}); } catch(e){}
    try { new Audio('audio/click.wav').play(); } catch(e) {}
    mirrorCurrentLevel += direction;
    if (mirrorCurrentLevel < 0) mirrorCurrentLevel = mirrorTemplates.length - 1;
    if (mirrorCurrentLevel >= mirrorTemplates.length) mirrorCurrentLevel = 0;
    initMirrorLevel();
}

function clearMirrorCanvas() {
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "medium"}); } catch(e){}
    try { new Audio('audio/click.wav').play(); } catch(e) {}
    initMirrorLevel(); 
}

// ==========================================
//        ЛОГИКА КИТАЙСКОГО МЕНЮ И КАРТОЧЕК (ВОССТАНОВЛЕНО)
// ==========================================
function openChineseMenu() {
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "light"}); } catch(e){}
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen-chinese-main-menu').classList.add('active');
}

function goMainFromChinese() {
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "light"}); } catch(e){}
    document.getElementById('screen-chinese-main-menu').classList.remove('active');
    document.getElementById('screen-menu').classList.add('active');
}

function openChineseWordsMenu() {
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "light"}); } catch(e){}
    document.getElementById('screen-chinese-main-menu').classList.remove('active');
    document.getElementById('screen-chinese-words-menu').classList.add('active');
}

function openChinesePhrasesMenu() {
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "light"}); } catch(e){}
    document.getElementById('screen-chinese-main-menu').classList.remove('active');
    document.getElementById('screen-chinese-phrases-menu').classList.add('active');
}

function goBackToChineseMain(fromScreenId) {
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "light"}); } catch(e){}
    document.getElementById(fromScreenId).classList.remove('active');
    document.getElementById('screen-chinese-main-menu').classList.add('active');
}

function openChineseCategory(categoryName) {
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "light"}); } catch(e){}
    currentChineseCategory = categoryName; 
    currentChineseIndex = 0;               
    isCardFlipped = false;
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen-chinese-cards').classList.add('active');
    updateChineseCard();
}

function goBackToChineseMenuFromCards() {
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "light"}); } catch(e){}
    document.getElementById('screen-chinese-cards').classList.remove('active');
    if (currentAudio) { currentAudio.pause(); currentAudio.currentTime = 0; }
    if (currentChineseCategory.startsWith('ph_')) {
        document.getElementById('screen-chinese-phrases-menu').classList.add('active');
    } else {
        document.getElementById('screen-chinese-words-menu').classList.add('active');
    }
}

function updateChineseCard() {
    const currentArray = chineseDatabase[currentChineseCategory];
    const cardData = currentArray[currentChineseIndex];
    const cardEl = document.getElementById('chinese-card');
    isCardFlipped = false;
    cardEl.classList.remove('flipped');
    document.getElementById('ch-card-img').src = cardData.img;
    document.getElementById('ch-card-char').innerText = cardData.char;
    document.getElementById('ch-card-pinyin').innerHTML = `${cardData.pinyin} <br><span style="color: #9e9e9e; font-size: 14px;">[ ${cardData.ru_trans} ]</span>`;
    document.getElementById('ch-card-ru').innerText = cardData.ru;
    document.getElementById('btn-ch-prev').style.opacity = currentChineseIndex === 0 ? '0.3' : '1';
    document.getElementById('btn-ch-next').style.opacity = currentChineseIndex === currentArray.length - 1 ? '0.3' : '1';
    if (cardData.ru_audio) { playSound(cardData.ru_audio); }
}

function flipChineseCard() {
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "medium"}); } catch(e){}
    const cardEl = document.getElementById('chinese-card');
    const currentArray = chineseDatabase[currentChineseCategory];
    const cardData = currentArray[currentChineseIndex];
    isCardFlipped = !isCardFlipped;
    if (isCardFlipped) {
        cardEl.classList.add('flipped');
        if (cardData.audio) playSound(cardData.audio); 
    } else {
        cardEl.classList.remove('flipped');
        if (cardData.ru_audio) playSound(cardData.ru_audio);
    }
}

function changeChineseCard(direction) {
    const currentArray = chineseDatabase[currentChineseCategory];
    const newIndex = currentChineseIndex + direction;
    if (newIndex < 0 || newIndex >= currentArray.length) return;
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "light"}); } catch(e){}
    if (isCardFlipped) {
        document.getElementById('chinese-card').classList.remove('flipped');
        setTimeout(() => {
            currentChineseIndex = newIndex;
            updateChineseCard();
        }, 300);
    } else {
        currentChineseIndex = newIndex;
        updateChineseCard();
    }
}

function openChineseHacks() {
    currentHackIndex = 0;
    updateHackCard();
    document.getElementById('hacks-modal').style.display = 'flex';
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "light"}); } catch(e){}
}

function closeChineseHacks() {
    document.getElementById('hacks-modal').style.display = 'none';
    if (currentAudio) { currentAudio.pause(); currentAudio.currentTime = 0; }
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "light"}); } catch(e){}
}

function updateHackCard() {
    const hack = chineseHacksData[currentHackIndex];
    document.getElementById('hack-title').innerText = hack.title;
    document.getElementById('hack-text').innerText = hack.text;
    document.getElementById('hack-img').src = hack.img;
    if (hack.audio) { playSound(hack.audio); }
    document.getElementById('hack-prev-btn').classList.toggle('disabled', currentHackIndex === 0);
    document.getElementById('hack-next-btn').classList.toggle('disabled', currentHackIndex === chineseHacksData.length - 1);
    const dotsContainer = document.getElementById('hack-dots');
    dotsContainer.innerHTML = '';
    chineseHacksData.forEach((_, idx) => {
        const dot = document.createElement('div');
        dot.className = `comic-dot ${idx === currentHackIndex ? 'active' : ''}`;
        dotsContainer.appendChild(dot);
    });
}

function moveHack(direction) {
    const newIndex = currentHackIndex + direction;
    if (newIndex >= 0 && newIndex < chineseHacksData.length) {
        currentHackIndex = newIndex;
        updateHackCard();
        try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "light"}); } catch(e){}
    }
}
