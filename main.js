import { sidebarItems } from "./sidebarItems.js";

/* ================== СОСТОЯНИЕ ================== */

const rukuList = document.getElementById("rukuList");
const tagFilter = document.getElementById("tagFilter");
const jumpSelect = document.getElementById("jumpSelect");
const content = document.getElementById("content");

let activeRukuId = null;
let activeJuz = null;
let activeSurah = null;
let bookmarks = JSON.parse(localStorage.getItem("bookmarks")) || [];
let currentPlayingVerse = null

/* ================== ТЕГИ ================== */

const tags = [...new Set(
    sidebarItems
        .filter(i => i.type === "ruku")
        .flatMap(r => r.tags)
)];

tags.forEach(tag => {
    const opt = document.createElement("option");
    opt.value = tag;
    opt.textContent = tag;
    tagFilter.appendChild(opt);
});

/* ================== ПЕРЕХОД ================== */

sidebarItems.forEach(item => {
    if (item.type === "juz") {
        const opt = document.createElement("option");
        opt.value = `juz-${item.number}`;
        opt.textContent = `Джуз ${item.number}`;
        jumpSelect.appendChild(opt);
    }
    if (item.type === "surah") {
        const opt = document.createElement("option");
        opt.value = `surah-${item.number}`;
        opt.textContent = `Сура ${item.number}. ${item.name}`;
        jumpSelect.appendChild(opt);
    }
});

jumpSelect.onchange = () => {
    const target = document.querySelector(
        `[data-anchor="${jumpSelect.value}"]`
    );
    if (target) {
        target.scrollIntoView({ behavior: "smooth" });
    }
};

/* ================== РЕНДЕР ================== */

function renderRukuList(filterTag = "") {
    rukuList.innerHTML = "";

    sidebarItems.forEach(item => {

//        if ((item.type === "juz" || item.type === "surah") && filterTag) return;

        if (item.type === "juz") {
            const div = document.createElement("div");
            div.className = "divider juz";
            if (item.number === activeJuz) div.classList.add("active");
            div.textContent = `Джуз ${item.number}`;
            div.dataset.anchor = `juz-${item.number}`;
            rukuList.appendChild(div);
            return;
        }

        if (item.type === "surah") {
            const div = document.createElement("div");
            div.className = "divider surah";
            if (item.number === activeSurah) div.classList.add("active");
            div.textContent = `Сура ${item.number}. ${item.name}`;
            div.dataset.anchor = `surah-${item.number}`;
            div.onclick = () => loadSurah(item);
            rukuList.appendChild(div);
            return;
        }

        if (item.type === "ruku") {
            if (filterTag && !item.tags.includes(filterTag)) return;

            const div = document.createElement("div");
            div.className = "ruku";
            if (item.id === activeRukuId) div.classList.add("active");
            const descriptionHtml = Array.isArray(item.description)
              ? `<div class="outline">
                    ${item.description.map(d => `
                        <div class="outline-row">
                            <span class="outline-text">${d.text}</span>
                            <span class="outline-ref">${d.ref}</span>
                        </div>
                    `).join("")}
                 </div>`
              : `<div class="descriptions">${item.description}</div>`;

            const star = bookmarks.includes(item.id) ? "★ " : "";

            div.innerHTML = `
                <strong>${star}${item.title}</strong>
                ${descriptionHtml}
                <div class="tags">#${item.tags.join(" #")}</div>
            `;

            div.onclick = () => loadRuku(item);
            rukuList.appendChild(div);
        }
    });
}

tagFilter.onchange = () => renderRukuList(tagFilter.value);

/* ================== ЗАГРУЗКА РУКУ‘ ================== */
// пример: аудио всего руку

function highlightAyah(verseNumber) {
    if (currentPlayingVerse === verseNumber) return;

    currentPlayingVerse = verseNumber;

    document.querySelectorAll(".ayah.playing")
        .forEach(el => el.classList.remove("playing"));

    const ayah = document.querySelector(
        `#ayah-${verseNumber}`
    );

    if ((ayah) && (verseNumber != 0)){
        ayah.classList.add("playing");

//        // мягко довести в зону видимости (по желанию)
//        ayah.scrollIntoView({
//            behavior: "smooth",
//            block: "center"
//        });
    }
}


async function loadRukuAudio(rukuId) {
    const audio = document.getElementById("rukuAudio");
    const playPauseBtn = document.getElementById("playPauseBtn");
    const progress = document.getElementById("audioProgress");
    const path = `./audio/${rukuId}.json`;

    const response = await fetch(path);
    const data = await response.json();

    console.log(data)

    let ayahTimings = data.ayahs;
    console.log(ayahTimings)

    audio.src = `./audio/${rukuId}.mp3`;
    audio.load();
    progress.value = 0;
    playPauseBtn.textContent = "▶";

    playPauseBtn.onclick = () => {
        if (audio.paused) {
            audio.play();
            playPauseBtn.textContent = "⏸";
        } else {
            audio.pause();
            playPauseBtn.textContent = "▶";
        }
    };

    // обновление прогресса
    audio.addEventListener("timeupdate", () => {
        if (!audio.duration) return;
        progress.max = audio.duration;
        progress.value = audio.currentTime;
    });

    // перемотка
    progress.addEventListener("change", () => {
        audio.currentTime = progress.value;
    });

    // конец воспроизведения
    audio.addEventListener("ended", () => {
        playPauseBtn.textContent = "▶";
    });
    let currentPlayingVerse = null;

    audio.addEventListener("ended", () => {
    highlightAyah(0);
    });

    audio.addEventListener("timeupdate", () => {
        const time = audio.currentTime;

        for (let i = ayahTimings.length - 1; i >= 0; i--) {

            if (time >= ayahTimings[i].start) {
                highlightAyah(ayahTimings[i].verse);
                break;
            }
        }
    });
}

async function loadTafsir(rukuId) {
    const tafsirContainer = document.createElement("section");
    tafsirContainer.id = "tafsir";
    tafsirContainer.innerHTML = `
        <h3>В Комментариях к великому Курану Ибн Касир сказал</h3>
        <div class="tafsir-content">Загрузка...</div>
    `;
    content.appendChild(tafsirContainer);

    try {
        const res = await fetch(`./tafsir/${rukuId}.html`);
        if (!res.ok) throw new Error("no tafsir");

        const html = await res.text();
        tafsirContainer.querySelector(".tafsir-content").innerHTML = html;
    } catch {
        tafsirContainer.remove(); // если тафсира нет — просто не показываем
    }
};

function scrollToTafsir(chapter, verse) {
    const tafsirId = `tafsir-${chapter}-${verse}`;
    const target = document.getElementById(tafsirId);

    if (!target) return;

    target.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

    target.classList.add("tafsir-highlight");

    setTimeout(() => {
        target.classList.remove("tafsir-highlight");
    }, 1500);
}

async function loadSurah(surah) {
    activeSurah = surah.number;
    activeRukuId = null;
    activeJuz = null;
    renderRukuList(tagFilter.value);

    content.innerHTML = `
        <h2>
            ${surah.name}
        </h2>
    `;
    await loadTafsir(surah.name);
};

async function loadRuku(ruku) {

    if (activeRukuId === ruku.id) {
    let target = document.querySelector("h2")
    target.scrollIntoView({
        behavior: "smooth",
        block: "start"
        });
        return
    }
    activeRukuId = ruku.id;
    activeJuz = ruku.juz;
    activeSurah = ruku.chapter;
    renderRukuList(tagFilter.value);

    const isBookmarked = bookmarks.includes(ruku.id);

    content.innerHTML = `
        <h2>
            ${ruku.title}
            <button id="bookmarkBtn">${isBookmarked ? "★" : "☆"}</button>
        </h2>
        <div id="audio-player">
            <button id="playPauseBtn">▶</button>
            <div class="audio-info">
                <input type="range" id="audioProgress" value="0" min="0" step="0.1">
            </div>
        </div>

        <audio id="rukuAudio"></audio>
    `;

    document.getElementById("bookmarkBtn").onclick = () => {
        if (isBookmarked) {
            bookmarks = bookmarks.filter(id => id !== ruku.id);
        } else {
            bookmarks.push(ruku.id);
        }
        localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
        loadRuku(ruku);
    };

    // ===== ЗАГРУЗКА АЯТОВ =====
    const url = `https://api.quran.com/api/v4/verses/by_chapter/${ruku.chapter}?from=${ruku.from}&to=${ruku.to}&translations=45&fields=text_uthmani&per_page=50`;
    const response = await fetch(url);
    const data = await response.json();

    data.verses.forEach(v => {
        const div = document.createElement("div");
        div.className = "ayah";
        div.id = `ayah-${v.verse_number}`

        if (ruku.boldSeparators && ruku.boldSeparators.includes(v.verse_number)) {
            div.classList.add("bold-border");
        }

        div.innerHTML = `
            <div class="translation">${v.verse_number}. ${v.translations[0].text}</div>
            <div class="arabic">${v.text_uthmani}</div>
        `;

        div.onclick = () => scrollToTafsir(ruku.chapter, v.verse_number);
        content.appendChild(div);
    });
    // ===== ТАФСИР В КОНЦЕ =====
    await loadTafsir(ruku.id);
    await loadRukuAudio(ruku.id)
}


renderRukuList();


