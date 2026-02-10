/**
 * ПРИЛОЖЕНИЕ: Quran Ruku Player
 * Состояние, навигация, аудио-тайминги и тафсир.
 */

const state = {
    sidebarItems: [],
    activeRukuId: null,
    activeJuz: null,
    activeSurah: null,
    bookmarks: JSON.parse(localStorage.getItem("bookmarks")) || [],
    audioMode: "stop",
    currentPlayingVerse: null,
    ayahTimings: [],
    expandedSurahs: new Set() // <-- ДОБАВЛЕНО: Хранит ID открытых сур
};

// Элементы DOM
const els = {
    rukuList: document.getElementById("rukuList"),
    tagFilter: document.getElementById("tagFilter"),
    jumpSelect: document.getElementById("jumpSelect"),
    content: document.getElementById("content"),
    themeToggle: document.getElementById("themeToggle")
};

/* ================== ИНИЦИАЛИЗАЦИЯ ================== */

async function initApp() {
    try {
        const response = await fetch("./sidebarItems.json");
        const data = await response.json();
        state.sidebarItems = data.sidebarItems;

        setupTheme();
        setupJumpSelect();
        setupTagFilter();
        setupAudioGlobalListeners();
        
        renderRukuList();
        restoreFromURL();

        window.addEventListener("popstate", handlePopState);
    } catch (err) {
        console.error("Ошибка инициализации приложения:", err);
    }
}

/* ================== ТЕМА И НАВИГАЦИЯ ================== */

function setupTheme() {
    const themeBtn = els.themeToggle;
    const themeText = themeBtn.querySelector('.text');
    const themeIcon = themeBtn.querySelector('.icon');

    const updateBtn = (isLight) => {
        themeText.textContent = isLight ? "Темная тема" : "Светлая тема";
        themeIcon.textContent = isLight ? "☀️" : "🌑";
    };

    if (localStorage.getItem('theme') === 'light') {
        document.body.classList.add('light-theme');
        updateBtn(true);
    }

    themeBtn.addEventListener('click', () => {
        const isLight = document.body.classList.toggle('light-theme');
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
        updateBtn(isLight);
    });
}

function setupTagFilter() {
    const tags = [...new Set(state.sidebarItems
        .filter(i => i.type === "ruku")
        .flatMap(r => r.tags)
    )];

    tags.forEach(tag => {
        const opt = document.createElement("option");
        opt.value = tag;
        opt.textContent = tag;
        els.tagFilter.appendChild(opt);
    });

    els.tagFilter.onchange = () => renderRukuList(els.tagFilter.value);
}

function setupJumpSelect() {
    state.sidebarItems.forEach(item => {
        if (item.type === "juz" || item.type === "surah") {
            const opt = document.createElement("option");
            opt.value = `${item.type}-${item.number}`;
            opt.textContent = item.type === "juz" ? `Джуз ${item.number}` : `Сура ${item.number}. ${item.name}`;
            els.jumpSelect.appendChild(opt);
        }
    });

    els.jumpSelect.onchange = () => {
        const target = document.querySelector(`[data-anchor="${els.jumpSelect.value}"]`);
        if (target) target.scrollIntoView({ behavior: "smooth" });
    };
}

/* ================== РЕНДЕР СПИСКА ================== */

function renderRukuList(filterTag = "") {
    els.rukuList.innerHTML = "";

    let currentSurahNum = null; // Номер текущей суры
    let currentGroup = null;    // Текущий DOM-контейнер для руку

    // Функция-помощник для создания новой группы
    const createNewGroup = (surahNum, isExpanded) => {
        const group = document.createElement("div");
        group.className = "ruku-group";
        // Важно: используем data-атрибут, так как групп у одной суры может быть несколько
        group.setAttribute("data-surah-group", surahNum);

        if (isExpanded) {
            group.classList.add("open");
            group.style.maxHeight = "none";
        }
        els.rukuList.appendChild(group);
        return group;
    };

    state.sidebarItems.forEach(item => {
        // --- 1. ДЖУЗ (Теперь всегда в корне) ---
        if (item.type === "juz") {
            const juzDiv = createDividerElement("juz", `Джуз ${item.number}`, item.number === state.activeJuz);
            els.rukuList.appendChild(juzDiv);

            // Если мы находимся "внутри" суры, нужно создать новый контейнер для продолжения суры после джуза
            if (currentSurahNum) {
                const isExpanded = filterTag ? true : state.expandedSurahs.has(currentSurahNum);
                currentGroup = createNewGroup(currentSurahNum, isExpanded);
            } else {
                currentGroup = null;
            }
        }
        // --- 2. СУРА ---
        else if (item.type === "surah") {
            currentSurahNum = item.number;
            const isExpanded = filterTag ? true : state.expandedSurahs.has(item.number);

            // Создаем заголовок
            const surahTitle = createSurahHeader(item, isExpanded);
            els.rukuList.appendChild(surahTitle);

            // Создаем первую группу для этой суры
            currentGroup = createNewGroup(item.number, isExpanded);
        }
        // --- 3. РУКУ ---
        else if (item.type === "ruku") {
            if (filterTag && !item.tags.includes(filterTag)) return;

            const rukuEl = createRukuElement(item);

            // Добавляем в текущую группу. Если группы нет (руку без суры?), добавляем в корень
            if (currentGroup) {
                currentGroup.appendChild(rukuEl);
            } else {
                els.rukuList.appendChild(rukuEl);
            }
        }
    });

    // Вычисляем высоту для анимации, если включен фильтр
    if (filterTag) {
        document.querySelectorAll('.ruku-group').forEach(g => g.style.maxHeight = g.scrollHeight + "px");
    }
}

function appendDivider(item, type, text, activeVal, onClick = null, isExpanded = false) {
    const div = document.createElement("div");
    div.className = `divider ${type}`;
    if (item.number === activeVal) div.classList.add("active");

    // Добавляем стрелочку для сур
    let arrow = "";
    if (type === "surah") {
        arrow = isExpanded ? "▼ " : "▶ ";
        div.style.cursor = "pointer"; // Указываем, что элемент кликабельный
    }

    div.textContent = arrow + text;
    div.dataset.anchor = `${type}-${item.number}`;

    if (onClick) {
        div.onclick = onClick;
    }

    els.rukuList.appendChild(div);
}

function appendRukuItem(item) {
    const div = document.createElement("div");
    div.className = "ruku";
    if (item.id === state.activeRukuId) div.classList.add("active");

    const descriptionHtml = Array.isArray(item.description)
        ? `<div class="outline">${item.description.map(d => `
            <div class="outline-row">
                <span class="outline-text">${d.text}</span>
                <span class="outline-ref">${d.ref}</span>
            </div>`).join("")}</div>`
        : `<div class="descriptions">${item.description}</div>`;

    const isStarred = state.bookmarks.includes(item.id);
    let tags = ``
    try {
        tags = `<div class="tags">#${item.tags.join(" #")}</div>`
    } catch (err) {
        console.warn("Теги не найдены для этого руку");
    }
    div.innerHTML = `
        <strong>${isStarred ? "★ " : ""}${item.title}</strong>
        ${descriptionHtml}
        ${tags}
    `;
    div.onclick = () => loadRuku(item);
    els.rukuList.appendChild(div);
}

/* ================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ РЕНДЕРА ================== */

// Создание заголовка суры с логикой клика
function createSurahHeader(item, isExpanded) {
    const div = document.createElement("div");
    div.className = "divider surah";
    div.style.cursor = "pointer";
    if (isExpanded) div.classList.add("active-parent");

    div.innerHTML = `<span class="arrow">▶</span> Сура ${item.number}. ${item.name}`;

    div.onclick = () => {
        // Находим ВСЕ группы, относящиеся к этой суре (до и после джузов)
        const groups = document.querySelectorAll(`[data-surah-group="${item.number}"]`);
        const arrow = div.querySelector(".arrow");

        if (state.expandedSurahs.has(item.number)) {
            // --- СВОРАЧИВАНИЕ ---
            state.expandedSurahs.delete(item.number);
            div.classList.remove("active-parent");

            groups.forEach(group => {
                // Фиксируем текущую высоту для анимации
                group.style.maxHeight = group.scrollHeight + "px";
                group.offsetHeight; // force reflow

                group.classList.remove("open");
                group.style.maxHeight = "0";
            });
        } else {
            loadSurah(item)
            // --- РАЗВОРАЧИВАНИЕ ---
            state.expandedSurahs.add(item.number);
            div.classList.add("active-parent");

            groups.forEach(group => {
                group.classList.add("open");
                group.style.maxHeight = group.scrollHeight + "px";

                // После анимации сбрасываем ограничение высоты
                setTimeout(() => {
                    if (group.classList.contains("open")) {
                        group.style.maxHeight = "none";
                    }
                }, 350);
            });
        }
    };
    return div;
}

// Создание обычного разделителя (для джуза)
function createDividerElement(type, text, isActive) {
    const div = document.createElement("div");
    div.className = `divider ${type}`;
    if (isActive) div.classList.add("active");
    div.textContent = text;
    return div;
}

// Создание элемента Руку (вынесено из старого кода)
function createRukuElement(item) {
    const div = document.createElement("div");
    div.className = "ruku";
    if (item.id === state.activeRukuId) div.classList.add("active");

    const isStarred = state.bookmarks.includes(item.id);
    let tagsHtml = "";
    if (item.tags && item.tags.length > 0) {
        tagsHtml = `<div class="tags">#${item.tags.join(" #")}</div>`;
    }

    // Обработка описания (массив или строка)
    let descriptionHtml = "";
    if (Array.isArray(item.description)) {
        descriptionHtml = `<div class="outline">${item.description.map(d => `
            <div class="outline-row">
                <span class="outline-text">${d.text}</span>
                <span class="outline-ref">${d.ref || ""}</span>
            </div>`).join("")}</div>`;
    } else {
        descriptionHtml = `<div class="descriptions">${item.description}</div>`;
    }

    div.innerHTML = `
        <strong>${isStarred ? "★ " : ""}${item.title}</strong>
        ${descriptionHtml}
        ${tagsHtml}
    `;
    div.onclick = (e) => {
        e.stopPropagation(); // Чтобы клик не свернул суру
        loadRuku(item);
    };
    return div;
}

/* ================== АУДИО ПЛЕЕР (ГЛОБАЛЬНЫЙ) ================== */

function setupAudioGlobalListeners() {
    // Создаем аудио элемент один раз, если его нет
    let audio = document.getElementById("rukuAudio");
    if (!audio) {
        audio = document.createElement("audio");
        audio.id = "rukuAudio";
        document.body.appendChild(audio);
    }

    audio.addEventListener("timeupdate", () => {
        const progress = document.getElementById("audioProgress");
        if (progress && audio.duration) {
            progress.max = audio.duration;
            progress.value = audio.currentTime;
        }

        // Синхронизация подсветки аятов
        for (let i = state.ayahTimings.length - 1; i >= 0; i--) {
            if (audio.currentTime >= state.ayahTimings[i].start) {
                highlightAyah(state.ayahTimings[i].verse);
                break;
            }
        }
    });

    audio.addEventListener("ended", () => {
        highlightAyah(null);
        if (state.audioMode === "repeat") {
            audio.currentTime = 0;
            audio.play();
        } else if (state.audioMode === "next") {
            // ... логика следующего ...
        } else {
            // Сброс иконки на Play
            const btn = document.getElementById("playPauseBtn");
            if (btn) btn.textContent = "▶";
        }
    });

    // Внутри setupAudioGlobalListeners или отдельно в initApp
    document.addEventListener('keydown', (e) => {
        // Если фокус в поле ввода - не перехватываем
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        // Проверяем, загружено ли аудио управление
        if (!state.audioControls) return;

        switch (e.code) {
            case 'Space':
                e.preventDefault(); // Предотвращаем скролл страницы
                state.audioControls.togglePlay();
                break;
            case 'ArrowRight':
                e.preventDefault();
                state.audioControls.seekToAyah('next');
                break;
            case 'ArrowLeft':
                e.preventDefault();
                state.audioControls.seekToAyah('prev');
                break;
        }
    });
}

async function initRukuAudio(rukuId) {
    const audio = document.getElementById("rukuAudio");

    // Элементы управления
    const playPauseBtn = document.getElementById("playPauseBtn");
    const prevBtn = document.getElementById("prevAyahBtn");
    const nextBtn = document.getElementById("nextAyahBtn");
    const playModeBtn = document.getElementById("playModeBtn");
    const progress = document.getElementById("audioProgress");
    const volumeSlider = document.getElementById("volumeSlider");

    try {
        // 1. Загрузка таймингов
        const response = await fetch(`./data/${rukuId}/timings.json`);
        const data = await response.json();

        // Сортируем тайминги на всякий случай
        state.ayahTimings = data.ayahs.sort((a, b) => a.start - b.start);

        // 2. Настройка аудио
        audio.src = `./data/${rukuId}/audio.mp3`;
        // Восстанавливаем громкость из прошлого сеанса или ставим 1
        const savedVolume = localStorage.getItem("audioVolume");
        audio.volume = savedVolume !== null ? parseFloat(savedVolume) : 1.0;
        volumeSlider.value = audio.volume;

        // 3. Обработчики кнопок

        // --- Play/Pause ---
        const togglePlay = () => {
            if (audio.paused) {
                audio.play();
                playPauseBtn.textContent = "⏸";
            } else {
                audio.pause();
                playPauseBtn.textContent = "▶";
            }
        };
        playPauseBtn.onclick = togglePlay;

        // --- Громкость ---
        volumeSlider.oninput = (e) => {
            audio.volume = e.target.value;
            localStorage.setItem("audioVolume", audio.volume);
        };

        // --- Навигация по аятам (Вперед/Назад) ---
        const seekToAyah = (direction) => {
            const currentTime = audio.currentTime;
            // Находим текущий индекс аята
            // (аят считается текущим, если его start <= currentTime)
            let currentIndex = state.ayahTimings.findIndex((t, i) => {
                const nextT = state.ayahTimings[i + 1];
                return t.start <= currentTime + 0.5 && (!nextT || nextT.start > currentTime + 0.5);
            });

            if (currentIndex === -1) currentIndex = 0;

            let targetIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;

            // Логика "Назад": если мы в середине аята (> 3 сек от начала),
            // кнопка назад сначала возвращает в начало текущего аята
            if (direction === 'prev') {
                const currentStart = state.ayahTimings[currentIndex].start;
                if (currentTime - currentStart > 3) {
                    targetIndex = currentIndex;
                }
            }

            // Проверки границ
            if (targetIndex < 0) targetIndex = 0;
            if (targetIndex >= state.ayahTimings.length) targetIndex = state.ayahTimings.length - 1;

            const targetTime = state.ayahTimings[targetIndex].start;
            audio.currentTime = targetTime;

            // Если было на паузе - запускаем
            if (audio.paused) {
                audio.play();
                playPauseBtn.textContent = "⏸";
            }
        };

        prevBtn.onclick = () => seekToAyah('prev');
        nextBtn.onclick = () => seekToAyah('next');

        // --- Режимы (без изменений) ---
        const modeIcons = { stop: "▣", repeat: "↺", next: "⇒" };
        playModeBtn.textContent = modeIcons[state.audioMode];

        if (state.audioMode === "next") {
            audio.play().catch(() => {}); // catch автоплей блок
            playPauseBtn.textContent = "⏸";
        }

        playModeBtn.onclick = () => {
            const modes = ["stop", "repeat", "next"];
            let idx = (modes.indexOf(state.audioMode) + 1) % modes.length;
            state.audioMode = modes[idx];
            playModeBtn.textContent = modeIcons[state.audioMode];
        };

        progress.oninput = () => { audio.currentTime = progress.value; };

        // Сохраняем функции в глобальный объект для вызова с клавиатуры
        state.audioControls = { togglePlay, seekToAyah };

    } catch (err) {
        console.warn("Аудио или тайминги не найдены", err);
        // Скрываем кнопки навигации если нет таймингов
        prevBtn.style.opacity = "0.5";
        nextBtn.style.opacity = "0.5";
    }
}

/* ================== ЛОГИКА КОНТЕНТА ================== */

function renderWelcomePage() {
    const lastReadId = localStorage.getItem("lastReadRuku");
    const lastReadItem = lastReadId ? state.sidebarItems.find(i => i.id == lastReadId) : null;

    // Получаем 3 последние закладки
    const recentBookmarks = state.bookmarks.slice(-3).reverse().map(id => {
        return state.sidebarItems.find(i => i.id === id);
    }).filter(Boolean);

    els.content.innerHTML = `
        <div class="welcome-container">
            <div class="welcome-header">
                <h1>Ас-саляму алейкум</h1>
                <p>!!! Этот сайт пока в разработке и я буду рад получить отзывы и предложения tg: @musaaljalili</p>
            </div>

            <div class="dashboard-grid">
                <!-- Карточка 1: Продолжить чтение -->
                <div class="dashboard-card" onclick="handleContinueRead(${lastReadId})">
                    <div class="card-icon">📖</div>
                    <div>
                        <div class="card-title">Продолжить чтение</div>
                        <div class="card-desc">
                            ${lastReadItem ? `Вы остановились на: <br><strong>${lastReadItem.title}</strong>` : "Начните с первой суры Аль-Фатиха"}
                        </div>
                    </div>
                    <div class="card-action">Открыть ➔</div>
                </div>

                <!-- Карточка 2: Случайный Руку -->
                <div class="dashboard-card" onclick="handleRandomRuku()">
                    <div class="card-icon">🎲</div>
                    <div>
                        <div class="card-title">Случайный отрывок</div>
                        <div class="card-desc">Откройте мудрость Корана в случайном месте</div>
                    </div>
                    <div class="card-action">Перейти ➔</div>
                </div>

                <!-- Карточка 3: Закладки -->
                <div class="dashboard-card" onclick="if(${recentBookmarks.length === 0}) return;">
                    <div class="card-icon">★</div>
                    <div>
                        <div class="card-title">Избранное</div>
                        ${recentBookmarks.length > 0 ? `
                            <ul class="mini-bookmarks">
                                ${recentBookmarks.map(item => `<li>• ${item.title}</li>`).join('')}
                            </ul>
                        ` : `<div class="card-desc">У вас пока нет закладок</div>`}
                    </div>
                    ${recentBookmarks.length > 0 ? '' : '<div class="card-action" style="opacity:0.5">Пусто</div>'}
                </div>
            </div>
        </div>
    `;
}

// Хендлеры для карточек (нужно добавить их в глобальную область или привязать через JS)
window.handleContinueRead = (id) => {
    if (id) {
        const item = state.sidebarItems.find(i => i.id == id);
        if (item) loadRuku(item);
    } else {
        // Если истории нет, открываем 1-й руку (Аль-Фатиха)
        const firstItem = state.sidebarItems.find(i => i.type === 'ruku');
        if (firstItem) loadRuku(firstItem);
    }
};

window.handleRandomRuku = () => {
    const rukus = state.sidebarItems.filter(i => i.type === 'ruku');
    const random = rukus[Math.floor(Math.random() * rukus.length)];
    if (random) loadRuku(random);
};

async function loadRuku(ruku) {
    if (state.activeRukuId === ruku.id) {
        document.querySelector("h2")?.scrollIntoView({ behavior: "smooth" });
        return;
    }

    state.activeRukuId = ruku.id;
    state.activeJuz = ruku.juz;
    state.activeSurah = ruku.chapter;
    
    renderRukuList(els.tagFilter.value);
    updateURL({ ruku: ruku.id });
    localStorage.setItem("lastReadRuku", ruku.id);

// Если сура закрыта, открываем её при загрузке руку
    if (!state.expandedSurahs.has(ruku.chapter)) {
        state.expandedSurahs.add(ruku.chapter);
        renderRukuList(els.tagFilter.value);

        // Находим заголовок суры и делаем его активным
        // (в реальном приложении можно добавить ID к заголовку для точности,
        // но здесь сработает перерисовка renderRukuList, которая сама проставит классы)

        // Принудительно открываем группы без анимации (для мгновенного отображения)
        const groups = document.querySelectorAll(`[data-surah-group="${ruku.chapter}"]`);
        groups.forEach(g => {
            g.classList.add("open");
            g.style.maxHeight = "none";
        });

        // Скроллим к активному руку
        setTimeout(() => {
            const activeItem = els.rukuList.querySelector('.ruku.active');
            if(activeItem) activeItem.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 100);
    }

    const isBookmarked = state.bookmarks.includes(ruku.id);

    els.content.innerHTML = `
        <div class="ruku-header">
            <h2>${ruku.title} <button id="bookmarkBtn">${isBookmarked ? "★" : "☆"}</button></h2>
        </div>
        <div id="audio-player">
                <!-- Кнопки управления -->
                <button id="prevAyahBtn" class="player-btn" title="Предыдущий аят (←)">⏮</button>
                <button id="playPauseBtn" class="player-btn" title="Воспроизвести (Пробел)">▶</button>
                <button id="nextAyahBtn" class="player-btn" title="Следующий аят (→)">⏭</button>

                <!-- Прогресс -->
                <input type="range" id="audioProgress" value="0" min="0" step="0.1">

                <!-- Громкость -->
                <div class="volume-control">
                    <span style="font-size:14px">🔊</span>
                    <input type="range" id="volumeSlider" min="0" max="1" step="0.05" value="1" title="Громкость">
                </div>

                <!-- Режим -->
                <button id="playModeBtn" class="player-btn" title="Режим воспроизведения">▣</button>
            </div>
        <div id="ayahsContainer">Загрузка аятов...</div>
    `;

    document.getElementById("bookmarkBtn").onclick = () => toggleBookmark(ruku);

    try {
        // Загрузка аятов из API
        const url = `https://api.quran.com/api/v4/verses/by_chapter/${ruku.chapter}?from=${ruku.from}&to=${ruku.to}&translations=45&fields=text_uthmani&per_page=50`;
        const res = await fetch(url);
        const data = await res.json();
        
        const container = document.getElementById("ayahsContainer");
        container.innerHTML = "";

        data.verses.forEach(v => {
            const div = document.createElement("div");
            div.className = "ayah";
            div.id = `ayah-${v.verse_number}`;
            if (ruku.boldSeparators?.includes(v.verse_number)) div.classList.add("bold-border");

            div.innerHTML = `
                <div class="translation">${v.verse_number}. ${v.translations[0].text}</div>
                <div class="arabic">${v.text_uthmani}</div>
            `;
            div.onclick = () => scrollToTafsir(ruku.chapter, v.verse_number);
            container.appendChild(div);
        });

        await loadTafsir(ruku.id);
        await initRukuAudio(ruku.id);

    } catch (err) {
        console.error("Ошибка загрузки руку:", err);
    }
}

async function loadSurah(surah) {
    els.content.innerHTML = `<h2>${surah.name}</h2>`;
    await loadTafsir(surah.name);
}

async function loadTafsir(id) {
    const tafsirContainer = document.createElement("section");
    tafsirContainer.id = "tafsir";
    tafsirContainer.innerHTML = `<h3>Комментарий Ибн Касира</h3><div class="tafsir-content">Загрузка...</div>`;
    els.content.appendChild(tafsirContainer);

    try {
        const res = await fetch(`./data/${id}/tafsir.html`);
        if (!res.ok) throw new Error();
        const html = await res.text();
        tafsirContainer.querySelector(".tafsir-content").innerHTML = html;
    } catch {
        tafsirContainer.remove();
    }
}

/* ================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ================== */

function highlightAyah(verseNumber) {
    if (state.currentPlayingVerse === verseNumber) return;
    state.currentPlayingVerse = verseNumber;

    document.querySelectorAll(".ayah.playing").forEach(el => el.classList.remove("playing"));
    
    if (verseNumber) {
        const ayah = document.getElementById(`ayah-${verseNumber}`);
        if (ayah) ayah.classList.add("playing");
    }
}

function toggleBookmark(ruku) {
    const idx = state.bookmarks.indexOf(ruku.id);
    if (idx > -1) state.bookmarks.splice(idx, 1);
    else state.bookmarks.push(ruku.id);
    
    localStorage.setItem("bookmarks", JSON.stringify(state.bookmarks));
    renderRukuList(els.tagFilter.value);
    
    const btn = document.getElementById("bookmarkBtn");
    if (btn) btn.textContent = state.bookmarks.includes(ruku.id) ? "★" : "☆";
}

function updateURL(params) {
    const url = new URL(window.location);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    history.pushState(params, "", url);
}

function restoreFromURL() {
    const params = new URLSearchParams(window.location.search);
    if (params.has("ruku")) {
        const id = parseInt(params.get("ruku"), 10);
        const ruku = state.sidebarItems.find(i => i.type === "ruku" && i.id === id);
        if (ruku) {
            loadRuku(ruku);
            return;
        }
    }

    // Если в URL пусто -> Показываем дашборд
    renderWelcomePage();
}

function handlePopState(event) {
    if (event.state?.ruku) {
        const ruku = state.sidebarItems.find(i => i.type === "ruku" && i.id === event.state.ruku);
        if (ruku) loadRuku(ruku);
    }
}

function scrollToTafsir(chapter, verse) {
    const target = document.getElementById(`tafsir-${chapter}-${verse}`);
    if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        target.classList.add("tafsir-highlight");
        setTimeout(() => target.classList.remove("tafsir-highlight"), 1500);
    }
}

// Запуск
document.addEventListener("DOMContentLoaded", initApp);