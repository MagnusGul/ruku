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
    audioMode: "stop", // stop, repeat, next
    currentPlayingVerse: null,
    ayahTimings: []
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

    state.sidebarItems.forEach(item => {
        if (item.type === "juz") {
            appendDivider(item, "juz", `Джуз ${item.number}`, state.activeJuz);
        } else if (item.type === "surah") {
            appendDivider(item, "surah", `Сура ${item.number}. ${item.name}`, state.activeSurah, () => loadSurah(item));
        } else if (item.type === "ruku") {
            if (filterTag && !item.tags.includes(filterTag)) return;
            appendRukuItem(item);
        }
    });
}

function appendDivider(item, type, text, activeVal, onClick = null) {
    const div = document.createElement("div");
    div.className = `divider ${type}`;
    if (item.number === activeVal) div.classList.add("active");
    div.textContent = text;
    div.dataset.anchor = `${type}-${item.number}`;
    if (onClick) div.onclick = onClick;
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
            const nextRuku = state.sidebarItems.find(i => i.type === "ruku" && i.id === state.activeRukuId + 1);
            if (nextRuku) loadRuku(nextRuku);
        } else {
            const btn = document.getElementById("playPauseBtn");
            if (btn) btn.textContent = "▶";
        }
    });
}

async function initRukuAudio(rukuId) {
    const audio = document.getElementById("rukuAudio");
    const playPauseBtn = document.getElementById("playPauseBtn");
    const playModeBtn = document.getElementById("playModeBtn");
    const progress = document.getElementById("audioProgress");

    try {
        const response = await fetch(`./data/${rukuId}/timings.json`);
        const data = await response.json();
        state.ayahTimings = data.ayahs;

        audio.src = `./data/${rukuId}/audio.mp3`;
        audio.load();

        // Восстановление иконки режима
        const modeIcons = { stop: "▣", repeat: "↺", next: "⇒" };
        playModeBtn.textContent = modeIcons[state.audioMode];

        if (state.audioMode === "next") {
            audio.play();
            playPauseBtn.textContent = "⏸";
        }

        playPauseBtn.onclick = () => {
            if (audio.paused) {
                audio.play();
                playPauseBtn.textContent = "⏸";
            } else {
                audio.pause();
                playPauseBtn.textContent = "▶";
            }
        };

        playModeBtn.onclick = () => {
            const modes = ["stop", "repeat", "next"];
            let idx = (modes.indexOf(state.audioMode) + 1) % modes.length;
            state.audioMode = modes[idx];
            playModeBtn.textContent = modeIcons[state.audioMode];
        };

        progress.oninput = () => { audio.currentTime = progress.value; };

    } catch (err) {
        console.warn("Аудио не найдено для этого руку");
    }
}

/* ================== ЛОГИКА КОНТЕНТА ================== */

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

    const isBookmarked = state.bookmarks.includes(ruku.id);

    els.content.innerHTML = `
        <div class="ruku-header">
            <h2>${ruku.title} <button id="bookmarkBtn">${isBookmarked ? "★" : "☆"}</button></h2>
            <div id="audio-player">
                <button id="playPauseBtn">▶</button>
                <button id="playModeBtn">▣</button>
                <input type="range" id="audioProgress" value="0" min="0" step="0.1">
            </div>
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
    state.activeSurah = surah.number;
    state.activeRukuId = null;
    state.activeJuz = null;
    renderRukuList(els.tagFilter.value);

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
        if (ruku) loadRuku(ruku);
    }
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