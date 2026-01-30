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

        if ((item.type === "juz" || item.type === "surah") && filterTag) return;

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
async function loadTafsir(rukuId) {
    const tafsirContainer = document.createElement("section");
    tafsirContainer.id = "tafsir";
    tafsirContainer.innerHTML = `
        <h3>В Тафсир Ибн Касира сказано</h3>
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

        if (ruku.boldSeparators && ruku.boldSeparators.includes(v.verse_number)) {
            div.classList.add("bold-border");
        }

        div.innerHTML = `
            <div class="translation">${v.verse_number}. ${v.translations[0].text}</div>
            <div class="arabic">${v.text_uthmani}</div>
        `;

        content.appendChild(div);
    });

    // ===== ТАФСИР В КОНЦЕ =====
    await loadTafsir(ruku.id);
}


renderRukuList();
