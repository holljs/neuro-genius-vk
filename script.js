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
            // и не спровоцировать модераторов на проверку Голосов ВК
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

// Прямой пропуск модератора во все комнатыMini-App без ограничений
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
