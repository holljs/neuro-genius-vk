// ==========================================
//        СИСТЕМА ДОСТУПА И ОПЛАТ: НЕЙРО-ГЕНИЙ
// ==========================================
let userVkId = 0;
let vkSignParams = "";
let vkPlatform = "";
let hasPremiumAccess = false;

// 🔥🔥🔥 ВАЖНО: ВПИШИ СВОИ ДАННЫЕ СЮДА 🔥🔥🔥
const BACKEND_URL = "https://neuro-master.online"; 
const VK_GROUP_ID = 78549529; // Твой ID группы без минуса

try {
    vkBridge.send('VKWebAppInit').then(() => {
        const urlParams = new URLSearchParams(window.location.search);
        userVkId = urlParams.get('vk_user_id');
        vkPlatform = urlParams.get('vk_platform'); // Получаем платформу
        vkSignParams = window.location.search.replace('?', '');
        
        hidePaymentsOnMobile(); // Проверяем и прячем оплату, если нужно
        
        fetch(`${BACKEND_URL}/api/user_geniy/${userVkId}`, {
            method: "GET",
            headers: { "x-vk-sign": vkSignParams }
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                hasPremiumAccess = data.has_premium;
                if (hasPremiumAccess) {
                    document.querySelectorAll('.locked-card').forEach(el => el.classList.remove('locked-card'));
                }
            }
        }).catch(err => console.log("Ошибка доступа:", err));
    });
} catch(e) { console.log("VK Bridge Error", e); }

// Прячем ЮKassa для модераторов и пользователей в мобильных приложениях
function hidePaymentsOnMobile() {
    const ua = navigator.userAgent.toLowerCase();
    
    // Если это обычный браузер (с ПК или мобильного), ничего не делаем
    if (vkPlatform === 'desktop_web' || vkPlatform === 'mobile_web') {
        return; 
    }

    // Вычисляем именно НАТИВНЫЕ мобильные приложения
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
        // Открываем диалог с группой напрямую (ID 78549529)
        vkBridge.send("VKWebAppOpenURL", {"url": "https://vk.com/im?sel=-78549529"});
    } catch(e) {
        window.open("https://vk.com/im?sel=-78549529", "_blank");
    }
}

function checkAccessAndOpen(roomType) {
    if (hasPremiumAccess) {
        if (roomType === 'soroban') openSorobanMenu();
        if (roomType === 'memorika') openMemorikaMenu();
        if (roomType === 'brain') openBrainFitnessMenu();
    } else {
        try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "heavy"}); } catch(e){}
        document.getElementById('vip-modal').style.display = 'flex';
    }
}

function getFreeVip() {
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "light"}); } catch(e){}
    vkBridge.send("VKWebAppAllowMessagesFromGroup", {"group_id": VK_GROUP_ID})
    .then(data => {
        if (data.result) {
            document.getElementById('vip-modal').style.display = 'none';
            fetch(`${BACKEND_URL}/api/geniy/grant_bonus`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "x-vk-sign": vkSignParams },
                body: JSON.stringify({ user_id: parseInt(userVkId) })
            }).then(() => {
                alert("Ура! Бот отправил вам сообщение. Перезапустите игру!");
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
    {
        title: "🧩 Язык-Конструктор",
        text: "В китайском языке нет букв! Вместо них — маленькие детальки-кубики (они называются ключи). Их всего 214, и из них, как из конструктора, собираются все-все слова в мире!",
        img: "img/hack_lego.png"
    },
    {
        title: "🗣️ Поющие слова",
        text: "Китайцы не просто говорят, они... поют! Одно и то же слово 'МА', сказанное разным голосом, полностью меняет смысл. Можно нежно сказать 'Мама', а можно случайно назвать её 'Лошадкой' 🐴!",
        img: "img/hack_tones.png"
    },
    {
        title: "🌳 Иероглифы-рисунки",
        text: "Древние китайцы просто рисовали то, что видели! Знак Человек (人) — это шагающие ножки. Знак Дерево (木) — ствол и ветки. Поставишь два дерева рядом (林) — получится роща, а три (森) — дремучий лес!",
        img: "img/hack_draw.png"
    },
    {
        title: "🤫 Секретный счёт",
        text: "Китайцы умеют считать от 1 до 10 на одной руке! Пока мы загибаем пальцы на двух руках, они показывают тайные жесты. Например, 'круто' 👍 — это 5, 'коза' 🤘 — это 6, а 'пистолетик' 👈 — это 8!",
        img: "img/hack_numbers.png"
    },
    {
        title: "📜 Сто тысяч знаков",
        text: "Всего в китайском языке больше 85 000 иероглифов! Но даже сами китайцы их все не знают. Для жизни хватает 3000, а чтобы играть в наши игры — достаточно выучить всего несколько десятков!",
        img: "img/hack_wisdom.png"
    }
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
        { id: 'myachik', text: 'Мячик', image: 'img/p_opt_myachik.png', sound: 'audio/w_myachik.wav', syllables: ['мя', 'чик'], audioSyllables: ['audio/sl_mya.wav', 'audio/sl_chik.wav'] },
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
    'learn_friends': [
        { taskText: "Прибавляем 9: тут нужен учитель Десять (+10) и попрощайся с другом девятки — один (-1).", initialValue: 2, target: 11, taskAudio: "audio/friend9_task.wav", slides: ["img/friend_cover_academy.jpg", "img/friend_cover_friends.jpg", "img/friend9_step1.jpg", "img/friend9_step2.jpg", "img/friend9_step3.jpg"], audioSlides: ["audio/anime_intro_academy.wav", "audio/anime_friends_9_1.wav", "audio/anime_friend9_step1.wav", "audio/anime_friend9_step2.wav", "audio/anime_friend9_step3.wav"] },
        { taskText: "Прибавляем 8: тут нужен учитель Десять (+10) и попрощайся с другом восьми — два (-2).", initialValue: 3, target: 11, taskAudio: "audio/friend8_task.wav", slides: ["img/friend_cover_8_2.jpg"], audioSlides: ["audio/anime_friends_8_2.wav"] },
        { taskText: "Прибавляем 7: тут нужен учитель Десять (+10) and попрощайся с другом семи — три (-3).", initialValue: 4, target: 11, taskAudio: "audio/friend7_task.wav", slides: ["img/friend_cover_7_3.jpg"], audioSlides: ["audio/anime_friends_7_3.wav"] },
        { taskText: "Прибавляем 6: тут нужен учитель Десять (+10) и попрощайся с другом шести — четыре (-4).", initialValue: 4, target: 10, taskAudio: "audio/friend6_task.wav", slides: ["img/friend_cover_6_4.jpg"], audioSlides: ["audio/anime_friends_6_4.wav"] },
        { taskText: "Прибавляем 5: тут нужен учитель Десять (+10) и попрощайся с другом пяти — пять (-5).", initialValue: 6, target: 11, taskAudio: "audio/friend5_task.wav", slides: ["img/friend_cover_5_5.jpg"], audioSlides: ["audio/anime_friends_5_5.wav"] }
    ],
    'learn_friends_5': [
        { taskText: "Прибавляем четыре: опусти Королеву Пять (+5) и попрощайся с братом четверки — один (-1).", initialValue: 2, target: 6, taskAudio: "audio/brother4_task.wav", slides: ["img/brother_cover_academy.jpg", "img/brother_cover_4_1.jpg", "img/brother4_step1.jpg", "img/brother4_step2.jpg", "img/brother4_step3.jpg"], audioSlides: ["audio/anime_intro_five.wav", "audio/anime_brothers_4_1.wav", "audio/anime_brother4_step1.wav", "audio/anime_brother4_step2.wav", "audio/anime_brother4_step3.wav"] },
        { taskText: "Прибавляем три: опусти Королеву Пять (+5) и попрощайся с братом тройки — два (-2).", initialValue: 3, target: 6, taskAudio: "audio/brother3_task.wav", slides: ["img/brother_cover_3_2.jpg"], audioSlides: ["audio/anime_brothers_3_2.wav"] }
    ],
    'learn_add': [
        { taskText: "На спице уже есть два малыша. Прибавь к ним ещё двух. Стало 4!", initialValue: 2, target: 4, taskAudio: "audio/learn_add_1.wav" },
        { taskText: "На спице три малыша. Прибавь к ним Королеву Пять, опусти её вниз. Получится 8.", initialValue: 3, target: 8, taskAudio: "audio/learn_add_2.wav" },
        { taskText: "На синей спице один ученик. Прибавь к нему ещё две синие бусинки. Стало 30.", initialValue: 10, target: 30, taskAudio: "audio/learn_add_3.wav" },
        { taskText: "Попробуем сразу две спицы! У нас число 12. Прибавь Коровелу Пять. Стало 17.", initialValue: 12, target: 17, taskAudio: "audio/learn_add_4.wav" },
        { taskText: "А теперь сотни! Сэнсэй Пятьсот уже здесь. Прибавь к нему четыре бусинки снизу. Получится 900!", initialValue: 500, target: 900, taskAudio: "audio/learn_add_5.wav" }
    ],
    'learn_sub': [
        { taskText: "На спице четыре малыша. Опусти двух вниз. Останется 2.", initialValue: 4, target: 2, taskAudio: "audio/learn_sub_1.wav" },
        { taskText: "На спице число 8. Королева Пять уходит наверх. Останется 3.", initialValue: 8, target: 3, taskAudio: "audio/learn_sub_2.wav" },
        { taskText: "У нас 40. Опусти вниз три синие бусинки. Останется 10.", initialValue: 40, target: 10, taskAudio: "audio/learn_sub_3.wav" },
        { taskText: "Число 27. Королева Пять уходит наверх. Останется 22.", initialValue: 27, target: 22, taskAudio: "audio/learn_sub_4.wav" },
        { taskText: "Было 900, опусти четыре бусины вниз, и останется только Сэнсэй Пятьсот.", initialValue: 900, target: 500, taskAudio: "audio/learn_sub_5.wav" }
    ],
    'learn_mult': [
        { taskText: "Секретная техника! Пример мы держим в уме, а на счётах собираем только ответ. 2 умножить на 3 будет 6. Сделай цифру 6!", initialValue: 0, target: 6, taskAudio: "audio/learn_mult_1.wav", slides: ["img/mult_cover_1.jpg", "img/mult_cover_2.jpg"], audioSlides: ["audio/anime_mult_slide1.wav", "audio/anime_mult_slide2.wav"] },
        { taskText: "Умножим 12 на 3. Сначала умножаем десятки: 10 на 3 будет 30. Подними 30.", initialValue: 0, target: 30, taskAudio: "audio/learn_mult_2.wav" },
        { taskText: "Теперь единицы: 2 умножить на 3 будет 6. Прибавь 6 к нашим десяткам. Получилось 36!", initialValue: 30, target: 36, taskAudio: "audio/learn_mult_3.wav" }
    ],
    'learn_div': [
        { taskText: "Деление — это раздача поровну! Разделим 6 яблок на двоих ниндзя. Каждому достанется 3. Покажи ответ 3!", initialValue: 0, target: 3, taskAudio: "audio/learn_div_1.wav", slides: ["img/div_cover_1.jpg"], audioSlides: ["audio/anime_div_slide1.wav"] },
        { taskText: "Разделим 42 на 2. Сначала раздадим десятки: 40 пополам будет 20. Подними 20.", initialValue: 0, target: 20, taskAudio: "audio/learn_div_2.wav" },
        { taskText: "Теперь раздадим единицы: 2 пополам будет 1. Прибавь 1 к десяткам. Наш ответ: 21!", initialValue: 20, target: 21, taskAudio: "audio/learn_div_3.wav" }
    ],
    'play_numbers': [
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
    'play_add': [], 'play_sub': [], 'play_mult': [], 'play_div': []
}; 

// ==========================================
//        ГЕНЕРАТОР ПРИМЕРОВ СОРОБАН
// ==========================================
function generateEndlessTask(category) {
    let a, b, sign, target;

    if (category === 'play_simple') {
        const pairs = [[1,'+',2], [2,'+',2], [5,'+',3], [3,'+',1], [1,'+',1], [6,'+',2], [7,'+',1], [4,'-',2], [8,'-',5], [9,'-',4], [7,'-',2], [3,'-',1], [6,'-',5], [9,'-',5]];
        let pick = pairs[Math.floor(Math.random() * pairs.length)];
        let mult = Math.random() > 0.5 ? 10 : 1;
        a = pick[0] * mult; b = pick[2] * mult; sign = pick[1];
        target = sign === '+' ? a + b : a - b;
    } 
    else if (category === 'play_friends_5') {
        const pairs = [[4,'+',1], [3,'+',2], [2,'+',3], [1,'+',4], [4,'+',2], [4,'+',3], [3,'+',4]];
        let pick = pairs[Math.floor(Math.random() * pairs.length)];
        let mult = Math.random() > 0.5 ? 10 : 1;
        a = pick[0] * mult; b = pick[2] * mult; sign = pick[1];
        target = sign === '+' ? a + b : a - b;
    } 
    else if (category === 'play_friends_10') {
        const pairs = [[9,'+',1], [8,'+',2], [7,'+',3], [6,'+',4], [5,'+',5], [4,'+',6], [3,'+',7], [2,'+',8], [1,'+',9], [8,'+',3], [7,'+',4], [6,'+',5], [9,'+',9], [8,'+',8]];
        let pick = pairs[Math.floor(Math.random() * pairs.length)];
        let mult = Math.random() > 0.5 ? 10 : 1;
        a = pick[0] * mult; b = pick[2] * mult; sign = pick[1];
        target = sign === '+' ? a + b : a - b;
    }
    else if (category === 'play_mult') {
        a = Math.floor(Math.random() * 8) + 2; 
        b = Math.floor(Math.random() * 8) + 2; 
        sign = '×'; target = a * b;
    }
    else if (category === 'play_div') {
        b = Math.floor(Math.random() * 8) + 2; 
        target = Math.floor(Math.random() * 8) + 2; 
        a = b * target; sign = ':';
    }
    return {
        taskText: `Реши пример: <br><span style="font-size:32px;">${a} ${sign} ${b} = ?</span>`,
        initialValue: 0, target: target
    };
}

function fillEndlessTasks(category) {
    let tasks = [];
    for(let i = 0; i < 10; i++) { tasks.push(generateEndlessTask(category)); }
    roomsData[category] = tasks;
}

// ==========================================
//        ЛАЙТБОКС И НАВИГАЦИЯ
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

    const oldAbacus = document.getElementById('abacus-body-container');
    if (oldAbacus) { oldAbacus.remove(); globalLowerBeadsRefs = []; globalUpperBeadsRefs = []; }
    
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

function startSoroban(mode, category, title) {
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "light"}); } catch(e){}
    currentRoom = 'soroban';
    sorobanMode = mode;
    sorobanCategory = category;
    currentLessonIndex = 0;
    isTaskLock = false;

    if (mode === 'play' && category.startsWith('play_')) { fillEndlessTasks(category); }
    if (roomsData[category]) { roomsData[category].forEach(t => t._comicShown = false); }

    document.getElementById('game-room-title').innerText = title
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
            document.getElementById('soroban-task-text').innerHTML = "Задания скоро появятся!";
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

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function playSound(soundFile) {
    if (soundFile) {
        if (currentAudio) { currentAudio.pause(); currentAudio.currentTime = 0; }
        currentAudio = new Audio(soundFile);
        currentAudio.play().catch(err => console.log("Ошибка аудио:", err));
    }
}

// ==========================================
//        СОРОБАН
// ==========================================
let sorobanState = [
    { upper: false, lower: 0 }, { upper: false, lower: 0 }, { upper: false, lower: 0 }
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
        label.style.position = "absolute"; label.style.bottom = "-35px";
        label.style.left = "50%"; label.style.transform = "translateX(-50%)";
        label.style.fontSize = "15px"; label.style.fontWeight = "bold"; label.style.color = "#7A90A4";
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
                    if (idx < sorobanState[s].lower) bead.style.top = (112 + idx * 34) + "px";
                    else bead.style.top = (360 - (3 - idx) * 34) + "px";
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
    if (sorobanMode === 'learn') {
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

    if (globalUpperBeadsRefs.length === 0) setupSorobanGame();

    for (let s = 0; s < 3; s++) {
        globalUpperBeadsRefs[s].img.style.top = (sorobanState[s].upper ? "52px" : "5px");
        const lowerBeads = globalLowerBeadsRefs[s].beads;
        lowerBeads.forEach((bead, idx) => {
            if (idx < sorobanState[s].lower) bead.style.top = (112 + idx * 34) + "px"; 
            else bead.style.top = (360 - (3 - idx) * 34) + "px"; 
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
    if (sorobanMode === 'play') document.getElementById('soroban-task-text').innerHTML = currentTask.taskText;
    else document.getElementById('soroban-task-text').innerHTML = `${currentTask.taskText} <span class="target-highlight">(${currentTask.target})</span>`;
    
    if (currentTask.slides && currentTask.slides.length > 0 && !currentTask._comicShown) {
        openComicSlider(currentTask.slides, currentTask.audioSlides);
        currentTask._comicShown = true;
    } else {
        if (currentTask.taskAudio) playSound(currentTask.taskAudio);
    }

    const hintCard = document.getElementById('soroban-hint-card');
    if (currentTask.hint && sorobanMode === 'learn') {
        hintCard.onerror = function() { hintContainer.style.display = 'none'; };
        hintCard.src = currentTask.hint;
        hintContainer.style.display = 'flex';
    } else { hintContainer.style.display = 'none'; }
    
    isTaskLock = false;
    const scrollBtn = document.getElementById('scroll-btn');
    if (scrollBtn) scrollBtn.style.display = (sorobanMode === 'play' && (sorobanCategory === 'play_mult' || sorobanCategory === 'play_div')) ? 'block' : 'none';
}

function updateSorobanScore() {
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

    if (currentSlidesAudioArray && currentSlidesAudioArray[currentSlideIndex]) playSound(currentSlidesAudioArray[currentSlideIndex]);
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
    const tasks = roomsData[sorobanCategory];
    if (tasks && tasks[currentLessonIndex] && tasks[currentLessonIndex].taskAudio) playSound(tasks[currentLessonIndex].taskAudio);
}

// ==========================================
//        МЕМОРИКА: ЛАЙФХАКИ (МАГИЯ НА 9)
// ==========================================
let currentMagicFinger = 0; 

function openMultiplicationMenu() {
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "light"}); } catch(e){}
    document.getElementById('screen-memorika-menu').classList.remove('active');
    document.getElementById('screen-multiplication-menu').classList.add('active');
}

function goBackToMemorikaFromMult() {
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "light"}); } catch(e){}
    document.getElementById('screen-multiplication-menu').classList.remove('active');
    document.getElementById('screen-memorika-menu').classList.add('active');
}

function openMagic9() {
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "light"}); } catch(e){}
    document.getElementById('screen-multiplication-menu').classList.remove('active');
    document.getElementById('screen-magic-9').classList.add('active');
    
    currentMagicFinger = 0;
    document.getElementById('hands-image').src = 'img/hands_0.jpg';
    document.getElementById('magic-9-result').innerHTML = "Нажми стрелочку вправо ☝️";
    document.getElementById('btn-prev-magic').classList.add('disabled');
    document.getElementById('btn-next-magic').classList.remove('disabled');
}

function goBackToMultFromMagic9() {
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "light"}); } catch(e){}
    document.getElementById('screen-magic-9').classList.remove('active');
    document.getElementById('screen-multiplication-menu').classList.add('active');
    if (currentAudio) { currentAudio.pause(); currentAudio.currentTime = 0; }
}

function changeMagicFinger(direction) {
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "light"}); } catch(e){}
    currentMagicFinger += direction;
    if (currentMagicFinger < 1) currentMagicFinger = 1;
    if (currentMagicFinger > 10) currentMagicFinger = 10;

    document.getElementById('btn-prev-magic').classList.toggle('disabled', currentMagicFinger === 1);
    document.getElementById('btn-next-magic').classList.toggle('disabled', currentMagicFinger === 10);
    document.getElementById('hands-image').src = `img/hands_${currentMagicFinger}.jpg`;
    
    let tens = currentMagicFinger - 1;
    let units = 10 - currentMagicFinger;
    let result = tens * 10 + units;
    
    document.getElementById('magic-9-result').innerHTML = 
        `9 × ${currentMagicFinger} = <span style="font-size:42px; color:#E91E63;">${result}</span><br>
         <span style="font-size:16px; color:#777; font-weight: normal;">(Слева десятков: <b>${tens}</b>, Справа единиц: <b>${units}</b>)</span>`;
         
    playSound(`audio/magic9_${currentMagicFinger}.wav`);
}

// ==========================================
//        МЕМОРИКА: СТИХИ-АССОЦИАЦИИ
// ==========================================
const poemsData = [
    { math: "2 × 2 = <span style='color:#E91E63'>4</span>", image: "img/poem_4.jpg", text: "Два атлета взяли гири.<br>Это: дважды два — четыре!", audio: "audio/poem_4.wav" },
    { math: "2 × 4 = <span style='color:#E91E63'>8</span>", image: "img/poem_8.jpg", text: "В пирог вонзилась пара вилок:<br>Два на четыре — восемь дырок!", audio: "audio/poem_8.wav" },
    { math: "5 × 5 = <span style='color:#E91E63'>25</span>", image: "img/poem_25.jpg", text: "Вышли зайцы погулять:<br>Пятью пять — двадцать пять!", audio: "audio/poem_25.wav" },
    { math: "5 × 6 = <span style='color:#E91E63'>30</span>", image: "img/poem_30.jpg", text: "Забежала в лес лисица:<br>Пятью шесть — выходит тридцать!", audio: "audio/poem_30.wav" },
    { math: "6 × 7 = <span style='color:#E91E63'>42</span>", image: "img/poem_42.jpg", text: "Шесть на семь — сорок два,<br>На дворе растёт трава!", audio: "audio/poem_42.wav" },
    { math: "6 × 8 = <span style='color:#E91E63'>48</span>", image: "img/poem_48.jpg", text: "Шесть на восемь — сорок восемь,<br>Мы бегемота кушать просим!", audio: "audio/poem_48.wav" },
    { math: "7 × 8 = <span style='color:#E91E63'>56</span>", image: "img/poem_56.jpg", text: "Семь на восемь — пятьдесят шесть,<br>У лося рога-то есть!", audio: "audio/poem_56.wav" }
];

let currentPoemIndex = 0;

function openPoems() {
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "light"}); } catch(e){}
    document.getElementById('screen-multiplication-menu').classList.remove('active');
    document.getElementById('screen-poems').classList.add('active');
    currentPoemIndex = 0;
    updatePoemCard();
}

function goBackToMultFromPoems() {
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "light"}); } catch(e){}
    document.getElementById('screen-poems').classList.remove('active');
    document.getElementById('screen-multiplication-menu').classList.add('active');
    if (currentAudio) { currentAudio.pause(); currentAudio.currentTime = 0; }
}

function updatePoemCard() {
    const poem = poemsData[currentPoemIndex];
    document.getElementById('poem-math').innerHTML = poem.math;
    document.getElementById('poem-img').src = poem.image;
    document.getElementById('poem-text').innerHTML = poem.text;
    document.getElementById('btn-prev-poem').classList.toggle('disabled', currentPoemIndex === 0);
    document.getElementById('btn-next-poem').classList.toggle('disabled', currentPoemIndex === poemsData.length - 1);
    playSound(poem.audio);
}

function changePoem(direction) {
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "light"}); } catch(e){}
    currentPoemIndex += direction;
    if (currentPoemIndex < 0) currentPoemIndex = 0;
    if (currentPoemIndex >= poemsData.length) currentPoemIndex = poemsData.length - 1;
    updatePoemCard();
}

// ==========================================
//        МЕМОРИКА: МАГИЯ НА 5
// ==========================================
const magic5Data = [
    { math: "2 × 5 = <span style='color:#E91E63'>10</span>", image: "img/magic5_2.jpg", text: "Добавляем нолик: <b>20</b>.<br>Делим пополам — будет <b>10</b>!", audio: "audio/magic5_2.wav" },
    { math: "3 × 5 = <span style='color:#E91E63'>15</span>", image: "img/magic5_3.jpg", text: "Добавляем нолик: <b>30</b>.<br>Делим пополам — будет <b>15</b>!", audio: "audio/magic5_3.wav" },
    { math: "4 × 5 = <span style='color:#E91E63'>20</span>", image: "img/magic5_4.jpg", text: "Добавляем нолик: <b>40</b>.<br>Делим пополам — будет <b>20</b>!", audio: "audio/magic5_4.wav" },
    { math: "5 × 5 = <span style='color:#E91E63'>25</span>", image: "img/magic5_5.jpg", text: "Добавляем нолик: <b>50</b>.<br>Делим пополам — будет <b>25</b>!", audio: "audio/magic5_5.wav" },
    { math: "6 × 5 = <span style='color:#E91E63'>30</span>", image: "img/magic5_6.jpg", text: "Добавляем нолик: <b>60</b>.<br>Делим пополам — будет <b>30</b>!", audio: "audio/magic5_6.wav" },
    { math: "7 × 5 = <span style='color:#E91E63'>35</span>", image: "img/magic5_7.jpg", text: "Добавляем нолик: <b>70</b>.<br>Делим пополам — будет <b>35</b>!", audio: "audio/magic5_7.wav" },
    { math: "8 × 5 = <span style='color:#E91E63'>40</span>", image: "img/magic5_8.jpg", text: "Добавляем нолик: <b>80</b>.<br>Делим пополам — будет <b>40</b>!", audio: "audio/magic5_8.wav" },
    { math: "9 × 5 = <span style='color:#E91E63'>45</span>", image: "img/magic5_9.jpg", text: "Добавляем нолик: <b>90</b>.<br>Делим пополам — будет <b>45</b>!", audio: "audio/magic5_9.wav" },
    { math: "10 × 5 = <span style='color:#E91E63'>50</span>", image: "img/magic5_10.jpg", text: "Добавляем нолик: <b>100</b>.<br>Делим пополам — будет <b>50</b>!", audio: "audio/magic5_10.wav" }
];

let currentMagic5Index = 0;

function openMagic5() {
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "light"}); } catch(e){}
    document.getElementById('screen-multiplication-menu').classList.remove('active');
    document.getElementById('screen-magic-5').classList.add('active');
    currentMagic5Index = 0;
    updateMagic5Card();
}

function goBackToMultFromMagic5() {
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "light"}); } catch(e){}
    document.getElementById('screen-magic-5').classList.remove('active');
    document.getElementById('screen-multiplication-menu').classList.add('active');
    if (currentAudio) { currentAudio.pause(); currentAudio.currentTime = 0; }
}

function updateMagic5Card() {
    const card = magic5Data[currentMagic5Index];
    document.getElementById('magic5-math').innerHTML = card.math;
    document.getElementById('magic5-img').src = card.image;
    document.getElementById('magic5-text').innerHTML = card.text;
    document.getElementById('btn-prev-magic5').classList.toggle('disabled', currentMagic5Index === 0);
    document.getElementById('btn-next-magic5').classList.toggle('disabled', currentMagic5Index === magic5Data.length - 1);
    playSound(card.audio);
}

function changeMagic5(direction) {
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "light"}); } catch(e){}
    currentMagic5Index += direction;
    if (currentMagic5Index < 0) currentMagic5Index = 0;
    if (currentMagic5Index >= magic5Data.length) currentMagic5Index = magic5Data.length - 1;
    updateMagic5Card();
}

// ==========================================
//        МЕМОРИКА: ЦЕПОЧКА ПО РАССКАЗУ
// ==========================================
const chainItemsPool = [
    { id: 'dog', name: 'Собака', image: 'img/bs_dog.png' }, { id: 'bear', name: 'Медведь', image: 'img/bs_bear.png' },
    { id: 'bunny', name: 'Зайчик', image: 'img/bs_bunny.png' }, { id: 'elephant', name: 'Слон', image: 'img/bs_elephant.png' },
    { id: 'mouse', name: 'Мышка', image: 'img/bs_mouse.png' }, { id: 'banana', name: 'Банан', image: 'img/p_opt_banan.png' },
    { id: 'tea', name: 'Чай', image: 'img/p_opt_chay.png' }, { id: 'house', name: 'Домик', image: 'img/p_opt_domik.png' },
    { id: 'door', name: 'Дверь', image: 'img/p_opt_dver.png' }, { id: 'mushroom', name: 'Гриб', image: 'img/p_opt_grib.png' },
    { id: 'cabbage', name: 'Капуста', image: 'img/p_opt_kapusta.png' }, { id: 'roof', name: 'Крыша', image: 'img/p_opt_krisha.png' },
    { id: 'lemon', name: 'Лимон', image: 'img/p_opt_limon.png' }, { id: 'boat2', name: 'Лодка', image: 'img/p_opt_lodka.png' },
    { id: 'car2', name: 'Машина', image: 'img/p_opt_mashina.png' }, { id: 'honey2', name: 'Мёд', image: 'img/p_opt_med.png' },
    { id: 'milk', name: 'Молоко', image: 'img/p_opt_moloko.png' }, { id: 'carrot', name: 'Морковка', image: 'img/p_opt_morkovka.png' },
    { id: 'ball2', name: 'Мячик', image: 'img/p_opt_myachik.png' }, { id: 'cucumber', name: 'Огурец', image: 'img/p_opt_ogurec.png' },
    { id: 'window', name: 'Окно', image: 'img/p_opt_okno.png' }, { id: 'train', name: 'Поезд', image: 'img/p_opt_poezd.png' },
    { id: 'cheese', name: 'Сыр', image: 'img/p_opt_sir.png' }, { id: 'juice', name: 'Сок', image: 'img/p_opt_sok.png' },
    { id: 'cake', name: 'Торт', image: 'img/p_opt_tort.png' }, { id: 'apple', name: 'Яблоко', image: 'img/p_opt_yabloko.png' },
    { id: 'berry', name: 'Ягода', image: 'img/p_opt_yagoda.png' }, { id: 'box', name: 'Коробка', image: 'img/box.png' },
    { id: 'acorn', name: 'Жёлудь', image: 'img/food_acorn.png' }, { id: 'bone', name: 'Косточка', image: 'img/food_bone.png' },
    { id: 'fox', name: 'Лиса', image: 'img/3d_lisa.png' }, { id: 'carrot2', name: 'Морковка', image: 'img/garden_item_1.png' },
    { id: 'watermelon', name: 'Арбуз', image: 'img/garden_item_2.png' }, { id: 'cabbage2', name: 'Капуста', image: 'img/garden_item_3.png' },
    { id: 'mushroom2', name: 'Гриб', image: 'img/garden_item_4.png' }, { id: 'nut', name: 'Орех', image: 'img/garden_item_5.png' },
    { id: 'pumpkin', name: 'Тыква', image: 'img/garden_item_6.png' }, { id: 'radish', name: 'Редиска', image: 'img/garden_item_7.png' },
    { id: 'corn', name: 'Кукуруза', image: 'img/garden_item_8.png' }, { id: 'strawberry', name: 'Клубника', image: 'img/garden_item_9.png' }
];

let currentChainStage = 'observe'; 
let learningSequence = [];
let currentChainTargetCount = 0; 
let currentChainSequence = [];   

function openChainMenu() {
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "light"}); } catch(e){}
    document.getElementById('screen-memorika-menu').classList.remove('active');
    document.getElementById('screen-chain-menu').classList.add('active');
}

function goBackToMemorikaFromChain() {
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "light"}); } catch(e){}
    document.getElementById('screen-chain-menu').classList.remove('active');
    document.getElementById('screen-memorika-menu').classList.add('active');
}

function startChainTraining(count) {
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "light"}); } catch(e){}
    if (count > chainItemsPool.length) {
        alert(`В копилке пока только ${chainItemsPool.length} предметов! Добавь больше картинок для уровня "${count}".`);
        return;
    }
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
        item.style.width = '70px'; item.style.height = '70px'; item.style.backgroundSize = '100% 100%';
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

// ==========================================
//        МЕМОРИКА: СТИХИ И РИСОВАНИЕ
// ==========================================
let drawingPoem = []; 
let currentDrawIndex = 0;
let userDrawings = [];
let canvas, ctx;
let isDrawing = false;

function openPoemInput() {
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "light"}); } catch(e){}
    document.getElementById('screen-memorika-menu').classList.remove('active');
    document.getElementById('screen-poem-input').classList.add('active');
}

function goBackToMemorikaFromPoemInput() {
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "light"}); } catch(e){}
    document.getElementById('screen-poem-input').classList.remove('active');
    document.getElementById('screen-memorika-menu').classList.add('active');
}

function loadPredefinedPoem(poemId) {
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "light"}); } catch(e){}
    const textarea = document.getElementById('custom-poem-text');
    if (poemId === 'barto') textarea.value = "Идёт бычок, качается,\nВздыхает на ходу:\n— Ох, доска кончается,\nСейчас я упаду!";
    else if (poemId === 'pushkin') textarea.value = "У лукоморья дуб зелёный;\nЗлатая цепь на дубе том:\nИ днём и ночью кот учёный\nВсё ходит по цепи кругом;";
    else if (poemId === 'tanya') textarea.value = "Наша Таня громко плачет:\nУронила в речку мячик.\n— Тише, Танечка, не плачь:\nНе утонет в речке мяч.";
}

function startCustomPoemDrawing() {
    const text = document.getElementById('custom-poem-text').value;
    if (!text.trim()) { alert('Пожалуйста, напиши или вставь хотя бы пару строчек!'); return; }

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
//        БРЕЙН-ФИТНЕС: ЗЕРКАЛКИ
// ==========================================
let mirrorCurrentLevel = 0;
let mirrorLeftCanvas, mirrorRightCanvas, mirrorLeftCtx, mirrorRightCtx;
let mirrorIsDrawingLeft = false, mirrorIsDrawingRight = false;

const genVLine = () => [[{x:0.5, y:0.1}, {x:0.5, y:0.9}]];
const genHLine = () => [[{x:0.2, y:0.5}, {x:0.8, y:0.5}]];
const genSlash = () => [[{x:0.2, y:0.8}, {x:0.8, y:0.2}]];
const genBackslash = () => [[{x:0.2, y:0.2}, {x:0.8, y:0.8}]];
const genSquare = () => [[{x:0.2,y:0.2}, {x:0.8,y:0.2}, {x:0.8,y:0.8}, {x:0.2,y:0.8}, {x:0.2,y:0.2}]];
const genTriangle = () => [[{x:0.5,y:0.2}, {x:0.8,y:0.8}, {x:0.2,y:0.8}, {x:0.5,y:0.2}]];
const genRhombus = () => [[{x:0.5,y:0.1}, {x:0.9,y:0.5}, {x:0.5,y:0.9}, {x:0.1,y:0.5}, {x:0.5,y:0.1}]];
const genZ = () => [[{x:0.2,y:0.2}, {x:0.8,y:0.2}, {x:0.2,y:0.8}, {x:0.8,y:0.8}]];
const genM = () => [[{x:0.2,y:0.8}, {x:0.2,y:0.2}, {x:0.5,y:0.5}, {x:0.8,y:0.2}, {x:0.8,y:0.8}]];
const genZigzag = () => [[{x:0.2,y:0.1}, {x:0.8,y:0.3}, {x:0.2,y:0.5}, {x:0.8,y:0.7}, {x:0.2,y:0.9}]];
const genCircle = () => { let p=[]; for(let i=0; i<=20; i++) p.push({x: 0.5+0.35*Math.cos(i*Math.PI*2/20), y: 0.5+0.35*Math.sin(i*Math.PI*2/20)}); return [p]; };
const genVWave = () => { let p=[]; for(let i=0; i<=30; i++) p.push({x: 0.5 + 0.3*Math.sin(i*Math.PI*2/10), y: 0.1 + 0.8*(i/30)}); return [p]; };
const genStar = () => { let p=[]; for(let i=0; i<=5; i++){ let a = i * 4 * Math.PI / 5 - Math.PI/2; p.push({x: 0.5 + 0.4*Math.cos(a), y: 0.5 + 0.4*Math.sin(a)}); } return [p]; };
const genInfinity = () => { let p=[]; for(let i=0; i<=40; i++){ let t = i * 2 * Math.PI / 40; let scale = 2 / (3 - Math.cos(2*t)); p.push({x: 0.5 + 0.3 * scale * Math.sin(2*t), y: 0.5 + 0.4 * scale * Math.cos(t)}); } return [p]; };
const genSpiral = () => { let p=[]; for(let i=0; i<=40; i++){ let t = i * 4 * Math.PI / 40; let r = 0.05 + 0.35 * (i/40); p.push({x: 0.5 + r*Math.cos(t), y: 0.5 + r*Math.sin(t)}); } return [p]; };

const mirrorTemplates = [
    { title: "Ур. 1: Линии ➖ |", leftPaths: genVLine(), rightPaths: genHLine() }, { title: "Ур. 2: Косые / \\", leftPaths: genSlash(), rightPaths: genBackslash() },
    { title: "Ур. 3: Углы Z и M", leftPaths: genZ(), rightPaths: genM() }, { title: "Ур. 4: Квадрат и Треугольник", leftPaths: genSquare(), rightPaths: genTriangle() },
    { title: "Ур. 5: Круг и Ромб", leftPaths: genCircle(), rightPaths: genRhombus() }, { title: "Ур. 6: Зигзаг и Волна", leftPaths: genZigzag(), rightPaths: genVWave() },
    { title: "Ур. 7: Спираль и Восьмёрка", leftPaths: genSpiral(), rightPaths: genInfinity() }, { title: "Ур. 8: Звезда и Круг", leftPaths: genStar(), rightPaths: genCircle() },
    { title: "Ур. 9: Квадрат и Зигзаг", leftPaths: genSquare(), rightPaths: genZigzag() }, { title: "Ур. 10: Треугольник и Волна", leftPaths: genTriangle(), rightPaths: genVWave() },
    { title: "Ур. 11: Ромб и Спираль", leftPaths: genRhombus(), rightPaths: genSpiral() }, { title: "Ур. 12: Восьмёрка и Звезда", leftPaths: genInfinity(), rightPaths: genStar() },
    { title: "Ур. 13: Круг и Квадрат", leftPaths: genCircle(), rightPaths: genSquare() }, { title: "Ур. 14: Волна и Зигзаг", leftPaths: genVWave(), rightPaths: genZigzag() },
    { title: "Ур. 15: Спираль и Треугольник", leftPaths: genSpiral(), rightPaths: genTriangle() }, { title: "Ур. 16: Звезда и Ромб", leftPaths: genStar(), rightPaths: genRhombus() },
    { title: "Ур. 17: Зигзаг и Восьмёрка", leftPaths: genZigzag(), rightPaths: genInfinity() }, { title: "Ур. 18: Волна и Круг", leftPaths: genVWave(), rightPaths: genCircle() },
    { title: "Ур. 19: Квадрат и Спираль", leftPaths: genSquare(), rightPaths: genSpiral() }, { title: "Ур. 20: Босс! Звезда и Восьмёрка", leftPaths: genStar(), rightPaths: genInfinity() }
];

function openBrainMirrorDraw() {
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "light"}); } catch(e){}
    document.getElementById('screen-brain-fitness-menu').classList.remove('active');
    document.getElementById('screen-brain-mirror-draw').classList.add('active');
    if (!mirrorLeftCanvas) {
        mirrorLeftCanvas = document.getElementById('mirror-canvas-left'); mirrorRightCanvas = document.getElementById('mirror-canvas-right');
        mirrorLeftCtx = mirrorLeftCanvas.getContext('2d'); mirrorRightCtx = mirrorRightCanvas.getContext('2d');
        setupMirrorTouchEvents();
    }
    mirrorCurrentLevel = 0; initMirrorLevel();
}

// Возврат в меню Брэйн-Фитнеса
function goBackToBrainFitnessFromMirror() {
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "light"}); } catch(e){}
    document.getElementById('screen-brain-mirror-draw').classList.remove('active');
    document.getElementById('screen-brain-fitness-menu').classList.add('active');
}

function initMirrorLevel() {
    const template = mirrorTemplates[mirrorCurrentLevel];
    document.getElementById('mirror-level-title').innerText = template.title;
    mirrorLeftCtx.clearRect(0, 0, mirrorLeftCanvas.width, mirrorLeftCanvas.height);
    mirrorRightCtx.clearRect(0, 0, mirrorRightCanvas.width, mirrorRightCanvas.height);
    drawTemplateGuide(mirrorLeftCtx, template.leftPaths, mirrorLeftCanvas.width, mirrorLeftCanvas.height);
    drawTemplateGuide(mirrorRightCtx, template.rightPaths, mirrorRightCanvas.width, mirrorRightCanvas.height);
}

function drawTemplateGuide(ctx, paths, w, h) {
    ctx.save(); ctx.strokeStyle = 'rgba(160, 170, 180, 0.4)'; ctx.lineWidth = 6; ctx.setLineDash([6, 6]); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    paths.forEach(path => {
        ctx.beginPath();
        path.forEach((pt, idx) => {
            let realX = pt.x * w; let realY = pt.y * h;
            if (idx === 0) ctx.moveTo(realX, realY); else ctx.lineTo(realX, realY);
        });
        ctx.stroke();
    });
    ctx.restore();
}

function setupMirrorTouchEvents() {
    mirrorLeftCanvas.addEventListener('pointerdown', (e) => {
        e.preventDefault(); mirrorLeftCanvas.setPointerCapture(e.pointerId); mirrorIsDrawingLeft = true;
        const rect = mirrorLeftCanvas.getBoundingClientRect(); mirrorLeftCtx.beginPath(); mirrorLeftCtx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    });
    mirrorLeftCanvas.addEventListener('pointermove', (e) => {
        if (!mirrorIsDrawingLeft) return; const rect = mirrorLeftCanvas.getBoundingClientRect();
        mirrorLeftCtx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        mirrorLeftCtx.strokeStyle = '#2196F3'; mirrorLeftCtx.lineWidth = 5; mirrorLeftCtx.lineCap = 'round'; mirrorLeftCtx.lineJoin = 'round'; mirrorLeftCtx.stroke();
    });
    mirrorLeftCanvas.addEventListener('pointerup', (e) => { mirrorIsDrawingLeft = false; mirrorLeftCanvas.releasePointerCapture(e.pointerId); });

    mirrorRightCanvas.addEventListener('pointerdown', (e) => {
        e.preventDefault(); mirrorRightCanvas.setPointerCapture(e.pointerId); mirrorIsDrawingRight = true;
        const rect = mirrorRightCanvas.getBoundingClientRect(); mirrorRightCtx.beginPath(); mirrorRightCtx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    });
    mirrorRightCanvas.addEventListener('pointermove', (e) => {
        if (!mirrorIsDrawingRight) return; const rect = mirrorRightCanvas.getBoundingClientRect();
        mirrorRightCtx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        mirrorRightCtx.strokeStyle = '#E91E63'; mirrorRightCtx.lineWidth = 5; mirrorRightCtx.lineCap = 'round'; mirrorRightCtx.lineJoin = 'round'; mirrorRightCtx.stroke();
    });
    mirrorRightCanvas.addEventListener('pointerup', (e) => { mirrorIsDrawingRight = false; mirrorRightCanvas.releasePointerCapture(e.pointerId); });
}

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
//        БРЕЙН-ФИТНЕС: ПИНГВИН-СЛЕДОПЫТ
// ==========================================
let pathfinderTargetIndex = 12; let pathfinderCurrentSteps = 3; let pathfinderGridCoords = []; 
const pathfinderArrowRotations = { '-5': '0deg', '5': '180deg', '-1': '-90deg', '1': '90deg' };

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
//        БРЕЙН-ФИТНЕС: НЕЙРО-ЖЕСТЫ
// ==========================================
let gesturesTimerInterval = null;
let gesturesTimeLeft = 100;
let isGesturesActive = false;

const gesturesList = [
    { id: 'fist', name: 'Кулак', img: 'img/g_fist.png' },
    { id: 'palm', name: 'Ладонь', img: 'img/g_palm.png' },
    { id: 'victory', name: 'Заяц ✌️', img: 'img/g_victory.png' },
    { id: 'thumb', name: 'Класс 👍', img: 'img/g_thumb.png' },
    { id: 'ok', name: 'Окей 👌', img: 'img/g_ok.png' },
    { id: 'horns', name: 'Рожки 🤘', img: 'img/g_horns.png' }
];

const gesturesSpeeds = [3000, 2300, 1600, 1000];
const gesturesSpeedTitles = ["Новичок 🐢", "Обычная ⏰", "Быстро 🚀", "Турбо 🔥"];
let currentGesturesSpeedIndex = 1; 

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

// ==========================================
//        УЧИМ КИТАЙСКИЙ (КАТЕГОРИИ) 🐼
// ==========================================

// Наша База Данных (По 5 карточек в каждой категории!)
const chineseDatabase = {
    'food': [
        { id: 'apple', img: 'img/ch_apple.jpg', ru: 'Яблоко', char: '苹果', pinyin: 'píngguǒ', ru_trans: 'пин-гуо', audio: 'audio/ch_apple.mp3', ru_audio: 'audio/ru_apple.mp3' },
        { id: 'water', img: 'img/ch_water.jpg', ru: 'Вода', char: '水', pinyin: 'shuǐ', ru_trans: 'шуэй', audio: 'audio/ch_water.mp3', ru_audio: 'audio/ru_water.mp3' },
        { id: 'bread', img: 'img/ch_bread.jpg', ru: 'Хлеб', char: '面包', pinyin: 'miànbāo', ru_trans: 'мьен-бао', audio: 'audio/ch_bread.mp3', ru_audio: 'audio/ru_bread.mp3' },
        { id: 'milk', img: 'img/ch_milk.jpg', ru: 'Молоко', char: '牛奶', pinyin: 'niúnǎi', ru_trans: 'ню-най', audio: 'audio/ch_milk.mp3', ru_audio: 'audio/ru_milk.mp3' },
        { id: 'banana', img: 'img/ch_banana.jpg', ru: 'Банан', char: '香蕉', pinyin: 'xiāngjiāo', ru_trans: 'сян-дзяо', audio: 'audio/ch_banana.mp3', ru_audio: 'audio/ru_banana.mp3' }
    ],
    'animals': [
        { id: 'dog', img: 'img/ch_dog.jpg', ru: 'Собака', char: '狗', pinyin: 'gǒu', ru_trans: 'гоу', audio: 'audio/ch_dog.mp3', ru_audio: 'audio/ru_dog.mp3' },
        { id: 'cat', img: 'img/ch_cat.jpg', ru: 'Кошка', char: '猫', pinyin: 'māo', ru_trans: 'мао', audio: 'audio/ch_cat.mp3', ru_audio: 'audio/ru_cat.mp3' },
        { id: 'elephant', img: 'img/ch_elephant.jpg', ru: 'Слон', char: '大象', pinyin: 'dàxiàng', ru_trans: 'да-сян', audio: 'audio/ch_elephant.mp3', ru_audio: 'audio/ru_elephant.mp3' },
        { id: 'tiger', img: 'img/ch_tiger.jpg', ru: 'Тигр', char: '老虎', pinyin: 'lǎohǔ', ru_trans: 'лао-ху', audio: 'audio/ch_tiger.mp3', ru_audio: 'audio/ru_tiger.mp3' },
        { id: 'bird', img: 'img/ch_bird.jpg', ru: 'Птичка', char: '小鸟', pinyin: 'xiǎoniǎo', ru_trans: 'сяо-няо', audio: 'audio/ch_bird.mp3', ru_audio: 'audio/ru_bird.mp3' }
    ],
    'family': [
        { id: 'mama', img: 'img/ch_mama.jpg', ru: 'Мама', char: '妈妈', pinyin: 'māma', ru_trans: 'ма-ма', audio: 'audio/ch_mama.mp3', ru_audio: 'audio/ru_mama.mp3' },
        { id: 'papa', img: 'img/ch_papa.jpg', ru: 'Папа', char: '爸爸', pinyin: 'bàba', ru_trans: 'ба-ба', audio: 'audio/ch_papa.mp3', ru_audio: 'audio/ru_papa.mp3' },
        { id: 'grandpa', img: 'img/ch_grandpa.jpg', ru: 'Дедушка', char: '爷爷', pinyin: 'yéye', ru_trans: 'е-е', audio: 'audio/ch_grandpa.mp3', ru_audio: 'audio/ru_grandpa.mp3' },
        { id: 'grandma', img: 'img/ch_grandma.jpg', ru: 'Бабушка', char: '奶奶', pinyin: 'nǎinai', ru_trans: 'най-най', audio: 'audio/ch_grandma.mp3', ru_audio: 'audio/ru_grandma.mp3' },
        { id: 'baby', img: 'img/ch_baby.jpg', ru: 'Малыш', char: '宝宝', pinyin: 'bǎobao', ru_trans: 'бао-бао', audio: 'audio/ch_baby.mp3', ru_audio: 'audio/ru_baby.mp3' }
    ],
    'transport': [
        { id: 'car', img: 'img/ch_car.jpg', ru: 'Машина', char: '汽车', pinyin: 'qìchē', ru_trans: 'ци-чхы', audio: 'audio/ch_car.mp3', ru_audio: 'audio/ru_car.mp3' },
        { id: 'train', img: 'img/ch_train.jpg', ru: 'Поезд', char: '火车', pinyin: 'huǒchē', ru_trans: 'хуо-чхы', audio: 'audio/ch_train.mp3', ru_audio: 'audio/ru_train.mp3' },
        { id: 'plane', img: 'img/ch_plane.jpg', ru: 'Самолёт', char: '飞机', pinyin: 'fēijī', ru_trans: 'фэй-дзи', audio: 'audio/ch_plane.mp3', ru_audio: 'audio/ru_plane.mp3' },
        { id: 'boat', img: 'img/ch_boat.jpg', ru: 'Лодка', char: '船', pinyin: 'chuán', ru_trans: 'чуань', audio: 'audio/ch_boat.mp3', ru_audio: 'audio/ru_boat.mp3' },
        { id: 'bus', img: 'img/ch_bus.jpg', ru: 'Автобус', char: '巴士', pinyin: 'bāshì', ru_trans: 'ба-шы', audio: 'audio/ch_bus.mp3', ru_audio: 'audio/ru_bus.mp3' }
    ],
    'body': [
        { id: 'eye', img: 'img/ch_eye.jpg', ru: 'Глаз', char: '眼睛', pinyin: 'yǎnjing', ru_trans: 'йен-дзин', audio: 'audio/ch_eye.mp3', ru_audio: 'audio/ru_eye.mp3' },
        { id: 'nose', img: 'img/ch_nose.jpg', ru: 'Нос', char: '鼻子', pinyin: 'bízi', ru_trans: 'би-дзы', audio: 'audio/ch_nose.mp3', ru_audio: 'audio/ru_nose.mp3' },
        { id: 'ear', img: 'img/ch_ear.jpg', ru: 'Ухо', char: '耳朵', pinyin: 'ěrduo', ru_trans: 'эр-дуо', audio: 'audio/ch_ear.mp3', ru_audio: 'audio/ru_ear.mp3' },
        { id: 'mouth', img: 'img/ch_mouth.jpg', ru: 'Рот', char: '嘴巴', pinyin: 'zuǐba', ru_trans: 'цзуй-ба', audio: 'audio/ch_mouth.mp3', ru_audio: 'audio/ru_mouth.mp3' },
        { id: 'hand', img: 'img/ch_hand.jpg', ru: 'Рука', char: '手', pinyin: 'shǒu', ru_trans: 'шоу', audio: 'audio/ch_hand.mp3', ru_audio: 'audio/ru_hand.mp3' }
    ],
    // === РАЗДЕЛ ФРАЗ ===
    'ph_manners': [
        { id: 'hello', img: 'img/ph_hello.jpg', ru: 'Привет!', char: '你好', pinyin: 'Nǐ hǎo', ru_trans: 'Ни хао', audio: 'audio/ch_ph_hello.mp3', ru_audio: 'audio/ru_ph_hello.mp3' },
        { id: 'thanks', img: 'img/ph_thanks.jpg', ru: 'Спасибо!', char: '谢谢', pinyin: 'Xièxiè', ru_trans: 'Сье-сье', audio: 'audio/ch_ph_thanks.mp3', ru_audio: 'audio/ru_ph_thanks.mp3' },
        { id: 'morning', img: 'img/ph_morning.jpg', ru: 'Доброе утро!', char: '早上好', pinyin: 'Zǎoshang hǎo', ru_trans: 'Цзао-шан хао', audio: 'audio/ch_ph_morning.mp3', ru_audio: 'audio/ru_ph_morning.mp3' },
        { id: 'how', img: 'img/ph_how.jpg', ru: 'Как дела?', char: '你好吗?', pinyin: 'Nǐ hǎo ma?', ru_trans: 'Ни хао ма?', audio: 'audio/ch_ph_how.mp3', ru_audio: 'audio/ru_ph_how.mp3' },
        { id: 'bye', img: 'img/ph_bye.jpg', ru: 'До свидания!', char: '再见', pinyin: 'Zàijiàn', ru_trans: 'Цзай-цзьень', audio: 'audio/ch_ph_bye.mp3', ru_audio: 'audio/ru_ph_bye.mp3' }
    ],
    'ph_needs': [
        { id: 'hungry', img: 'img/ph_hungry.jpg', ru: 'Я хочу есть', char: '我饿了', pinyin: 'Wǒ è le', ru_trans: 'Во э ле', audio: 'audio/ch_ph_hungry.mp3', ru_audio: 'audio/ru_ph_hungry.mp3' },
        { id: 'water', img: 'img/ph_thirsty.jpg', ru: 'Я хочу пить', char: '我想喝水', pinyin: 'Wǒ xiǎng hē shuǐ', ru_trans: 'Во сян хэ шуэй', audio: 'audio/ch_ph_thirsty.mp3', ru_audio: 'audio/ru_ph_thirsty.mp3' },
        { id: 'tired', img: 'img/ph_tired.jpg', ru: 'Я устал', char: '我累了', pinyin: 'Wǒ lèi le', ru_trans: 'Во лэй ле', audio: 'audio/ch_ph_tired.mp3', ru_audio: 'audio/ru_ph_tired.mp3' },
        { id: 'love', img: 'img/ph_love.jpg', ru: 'Я тебя люблю', char: '我爱你', pinyin: 'Wǒ ài nǐ', ru_trans: 'Во ай ни', audio: 'audio/ch_ph_love.mp3', ru_audio: 'audio/ru_ph_love.mp3' },
        { id: 'happy', img: 'img/ph_happy.jpg', ru: 'Я очень рад!', char: '我很高兴', pinyin: 'Wǒ hěn gāoxìng', ru_trans: 'Во хэнь гао-син', audio: 'audio/ch_ph_happy.mp3', ru_audio: 'audio/ru_ph_happy.mp3' }
    ],
    'ph_play': [
        { id: 'play', img: 'img/ph_play.jpg', ru: 'Давай играть!', char: '我们玩儿吧', pinyin: 'Wǒmen wánr ba', ru_trans: 'Во-мэнь вань-эр ба', audio: 'audio/ch_ph_play.mp3', ru_audio: 'audio/ru_ph_play.mp3' },
        { id: 'turn', img: 'img/ph_turn.jpg', ru: 'Моя очередь', char: '该我了', pinyin: 'Gāi wǒ le', ru_trans: 'Гай во ле', audio: 'audio/ch_ph_turn.mp3', ru_audio: 'audio/ru_ph_turn.mp3' },
        { id: 'win', img: 'img/ph_win.jpg', ru: 'Я выиграл!', char: '我赢了', pinyin: 'Wǒ yíng le', ru_trans: 'Во ин ле', audio: 'audio/ch_ph_win.mp3', ru_audio: 'audio/ru_ph_win.mp3' },
        { id: 'catch', img: 'img/ph_catch.jpg', ru: 'Догони меня!', char: '快来追我吧', pinyin: 'Kuài lái zhuī wǒ ba', ru_trans: 'Куай лай чжуй во ба', audio: 'audio/ch_ph_catch.mp3', ru_audio: 'audio/ru_ph_catch.mp3' },
        { id: 'fun', img: 'img/ph_fun.jpg', ru: 'Это весело!', char: '这很有趣', pinyin: 'Zhè hěn yǒuqù', ru_trans: 'Чжэ хэнь ю-цюй', audio: 'audio/ch_ph_fun.mp3', ru_audio: 'audio/ru_ph_fun.mp3' }
    ],
    'ph_shop': [
        { id: 'cost', img: 'img/ph_cost.jpg', ru: 'Сколько это стоит?', char: '这个多少钱?', pinyin: 'Zhège duōshǎo qián?', ru_trans: 'Чжэ-гэ до-шао цень?', audio: 'audio/ch_ph_cost.mp3', ru_audio: 'audio/ru_ph_cost.mp3' },
        { id: 'expensive', img: 'img/ph_expensive.jpg', ru: 'Слишком дорого!', char: '太贵了', pinyin: 'Tài guì le', ru_trans: 'Тай гуэй ле', audio: 'audio/ch_ph_expensive.mp3', ru_audio: 'audio/ru_ph_expensive.mp3' },
        { id: 'want', img: 'img/ph_want.jpg', ru: 'Я хочу это', char: '我要这个', pinyin: 'Wǒ yào zhège', ru_trans: 'Во яо чжэ-гэ', audio: 'audio/ch_ph_want.mp3', ru_audio: 'audio/ru_ph_want.mp3' },
        { id: 'discount', img: 'img/ph_discount.jpg', ru: 'Сделайте скидку', char: '便宜一点儿吧', pinyin: 'Piányí yīdiǎnr ba', ru_trans: 'Пень-и и-дьер ба', audio: 'audio/ch_ph_discount.mp3', ru_audio: 'audio/ru_ph_discount.mp3' },
        { id: 'cheap', img: 'img/ph_cheap.jpg', ru: 'Это дешево', char: '很便宜', pinyin: 'Hěn piányí', ru_trans: 'Хэнь пень-и', audio: 'audio/ch_ph_cheap.mp3', ru_audio: 'audio/ru_ph_cheap.mp3' }
    ],
    'ph_way': [
        { id: 'where', img: 'img/ph_where.jpg', ru: 'Где находится...?', char: '... 在哪儿?', pinyin: '... zài nǎr?', ru_trans: '... цзай на-эр?', audio: 'audio/ch_ph_where.mp3', ru_audio: 'audio/ru_ph_where.mp3' },
        { id: 'help', img: 'img/ph_help.jpg', ru: 'Помогите мне', char: '请帮帮我', pinyin: 'Qǐng bāng bāng wǒ', ru_trans: 'Цин бан-бан во', audio: 'audio/ch_ph_help.mp3', ru_audio: 'audio/ru_ph_help.mp3' },
        { id: 'lost', img: 'img/ph_lost.jpg', ru: 'Я потерялся', char: '我迷路了', pinyin: 'Wǒ mílù le', ru_trans: 'Во ми-лу ле', audio: 'audio/ch_ph_lost.mp3', ru_audio: 'audio/ru_ph_lost.mp3' },
        { id: 'straight', img: 'img/ph_straight.jpg', ru: 'Иди прямо', char: '向前走', pinyin: 'Xiàng qián zǒu', ru_trans: 'Сян цень цзоу', audio: 'audio/ch_ph_straight.mp3', ru_audio: 'audio/ru_ph_straight.mp3' },
        { id: 'right', img: 'img/ph_right.jpg', ru: 'Поверни направо', char: '向右转', pinyin: 'Xiàng yòu zhuǎn', ru_trans: 'Сян ю чжуань', audio: 'audio/ch_ph_right.mp3', ru_audio: 'audio/ru_ph_right.mp3' }
    ]
};

// ==========================================
//        ЛОГИКА КИТАЙСКОГО МЕНЮ И КАРТОЧЕК
// ==========================================

// Переменные состояния (один раз!)
let currentChineseCategory = 'food'; 
let currentChineseIndex = 0;
let isCardFlipped = false;

// 1. Вход в главное меню Китайского
function openChineseMenu() {
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "light"}); } catch(e){}
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen-chinese-main-menu').classList.add('active');
}

// 2. Выход из Китайского в главное меню приложения
function goMainFromChinese() {
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "light"}); } catch(e){}
    document.getElementById('screen-chinese-main-menu').classList.remove('active');
    document.getElementById('screen-menu').classList.add('active');
}

// 3. Открываем подменю "Слова"
function openChineseWordsMenu() {
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "light"}); } catch(e){}
    document.getElementById('screen-chinese-main-menu').classList.remove('active');
    document.getElementById('screen-chinese-words-menu').classList.add('active');
}

// 4. Открываем подменю "Фразы"
function openChinesePhrasesMenu() {
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "light"}); } catch(e){}
    document.getElementById('screen-chinese-main-menu').classList.remove('active');
    document.getElementById('screen-chinese-phrases-menu').classList.add('active');
}

// 5. Возврат из Слова/Фразы обратно в Главное меню Китайского
function goBackToChineseMain(fromScreenId) {
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "light"}); } catch(e){}
    document.getElementById(fromScreenId).classList.remove('active');
    document.getElementById('screen-chinese-main-menu').classList.add('active');
}

// 6. Запускаем выбранную категорию карточек!
function openChineseCategory(categoryName) {
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "light"}); } catch(e){}
    
    currentChineseCategory = categoryName; 
    currentChineseIndex = 0;               
    isCardFlipped = false;
    
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen-chinese-cards').classList.add('active');
    
    updateChineseCard();
}

// 7. Возврат с экрана карточек в нужное подменю!
function goBackToChineseMenuFromCards() {
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "light"}); } catch(e){}
    document.getElementById('screen-chinese-cards').classList.remove('active');
    
    if (currentAudio) { currentAudio.pause(); currentAudio.currentTime = 0; }
    
    // Если категория начиналась на "ph_" (фразы), возвращаемся в меню фраз
    if (currentChineseCategory.startsWith('ph_')) {
        document.getElementById('screen-chinese-phrases-menu').classList.add('active');
    } else {
        // Иначе возвращаемся в меню слов
        document.getElementById('screen-chinese-words-menu').classList.add('active');
    }
}

// 8. Обновление (отрисовка) карточки на экране
function updateChineseCard() {
    const currentArray = chineseDatabase[currentChineseCategory];
    const cardData = currentArray[currentChineseIndex];
    const cardEl = document.getElementById('chinese-card');
    
    isCardFlipped = false;
    cardEl.classList.remove('flipped');

    // 🔥 Просто меняем источник картинки! 🔥
    document.getElementById('ch-card-img').src = cardData.img;

    document.getElementById('ch-card-char').innerText = cardData.char;
    document.getElementById('ch-card-pinyin').innerHTML = `${cardData.pinyin} <br><span style="color: #9e9e9e; font-size: 14px;">[ ${cardData.ru_trans} ]</span>`;
    document.getElementById('ch-card-ru').innerText = cardData.ru;

    document.getElementById('btn-ch-prev').style.opacity = currentChineseIndex === 0 ? '0.3' : '1';
    document.getElementById('btn-ch-next').style.opacity = currentChineseIndex === currentArray.length - 1 ? '0.3' : '1';

    if (cardData.ru_audio) {
        playSound(cardData.ru_audio);
    }
}

// 9. Переворот карточки
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

// 10. Переключение на следующую/предыдущую карточку
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

// ==========================================
//        ЛОГИКА КИТАЙСКИХ ЛАЙФХАКОВ 💡
// ==========================================
function openChineseHacks() {
    currentHackIndex = 0;
    updateHackCard();
    document.getElementById('hacks-modal').style.display = 'flex';
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "light"}); } catch(e){}
}

function closeChineseHacks() {
    document.getElementById('hacks-modal').style.display = 'none';
    try { vkBridge.send("VKWebAppTapticImpactOccurred", {"style": "light"}); } catch(e){}
}

function updateHackCard() {
    const hack = chineseHacksData[currentHackIndex];
    document.getElementById('hack-title').innerText = hack.title;
    document.getElementById('hack-text').innerText = hack.text;
    document.getElementById('hack-img').src = hack.img;
    
    // Активность стрелок переключения
    document.getElementById('hack-prev-btn').classList.toggle('disabled', currentHackIndex === 0);
    document.getElementById('hack-next-btn').classList.toggle('disabled', currentHackIndex === chineseHacksData.length - 1);
    
    // Генерируем круглые точки (dots)
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
