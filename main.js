const sidebarItems = [
    { type: "juz", number: 1 },
    { type: "surah", number: 1, name: "Аль-Фатиха" },
    { type: "ruku", id: 1, title: "Наилучшая молитва", tags: ["Молитвы"], chapter: 1, from: 1, to: 7, juz: 1 },
    
    { type: "surah", number: 1, name: "Аль-Бакара" },
    
    {
        type: "ruku",
        id: 2,
        title: "1. Уверовавшие и Неверующие",
        description: [
            {
                text: "Это руководство для богобоязненных",
                ref: "2:[1–5]"
            },
            {
                text: "Предупреждение бесполезно для тех, кто отвергает веру",
                ref: "2:[6–7]"
            }
        ],
        tags: ["Неверующие", "Коран"],
        chapter: 2,
        from: 1,
        to: 7,
        juz: 1,
        boldSeparators: [5]
    },
    
    {
        type: "ruku",
        id: 3,
        title: "2. Лицемеры",
        description: [
            {
                text: "Лицемеры и последствия лицемерия",
                ref: "2:[8–16]"
            },
            {
                text: "Притчи о них",
                ref: "2:[17–20]"
            }
        ],
        tags: [],
        chapter: 2,
        from: 8,
        to: 20,
        juz: 1,
        boldSeparators: [16]
    },
    
    {
        type: "ruku",
        id: 4,
        title: "3. Обращение ﷲ к человечеству",
        description: [
            {
                text: "Требование ﷲ поклоняться исключительно Ему",
                ref: "2:[21–22]"
            },
            {
                text: "Утверждение, что Коран — Писание ﷲ",
                ref: "2:[23–24]"
            },
            {
                text: "Награда для верующих",
                ref: "2:[25]"
            },
            {
                text: "Притча о комаре: одних сбивает, других просвещает",
                ref: "2:[26–27]"
            },
            {
                text: "Как вы можете отвергать ﷲ?",
                ref: "2:[28–29]"
            }
        ],
        tags: [],
        chapter: 2,
        from: 21,
        to: 29,
        juz: 1,
        boldSeparators: [22, 24, 25, 27, 29]
    },
    
    {
        type: "ruku",
        id: 5,
        title: "4. Адам ﵇ — первый человек",
        description: [
            { text: "История создания Адама ﵇", ref: "2:[30]" },
            { text: "Победа знания", ref: "2:[31–33]" },
            { text: "Ангелы выражают уважение Адаму ﵇", ref: "2:[34–35]" },
            { text: "Шайтан стал причиной лишения Рая", ref: "2:[36]" },
            { text: "Покаяние Адама ﵇ и его прощение", ref: "2:[37]" }
        ],
        tags: [],
        chapter: 2,
        from: 30,
        to: 37,
        juz: 1,
        boldSeparators: [30, 33, 35, 36, 37]
    },

    
    { type: "ruku", id: 6, title: "5 [3:]", tags: [], chapter: 2, from: 1, to: 7, juz: 1, boldSeparators: []  },
    { type: "ruku", id: 7, title: "6 [:]", tags: [], chapter: 2, from: 1, to: 7, juz: 1, boldSeparators: []  },
    { type: "ruku", id: 8, title: "7 [:]", tags: [], chapter: 2, from: 1, to: 7, juz: 1, boldSeparators: []  },
    { type: "ruku", id: 9, title: "8 [:]", tags: [], chapter: 2, from: 1, to: 7, juz: 1, boldSeparators: []  },
    { type: "ruku", id: 10, title: "9 [:]", tags: [], chapter: 2, from: 1, to: 7, juz: 1, boldSeparators: []  },
    { type: "ruku", id: 11, title: "10 [:]", tags: [], chapter: 2, from: 1, to: 7, juz: 1, boldSeparators: []  },
    { type: "ruku", id: 12, title: "11 [:]", tags: [], chapter: 2, from: 1, to: 7, juz: 1, boldSeparators: []  },
    { type: "ruku", id: 13, title: "12 [:]", tags: [], chapter: 2, from: 1, to: 7, juz: 1, boldSeparators: []  },
    { type: "ruku", id: 14, title: "13 [:]", tags: [], chapter: 2, from: 1, to: 7, juz: 1, boldSeparators: []  },
    { type: "ruku", id: 15, title: "14 [:]", tags: [], chapter: 2, from: 1, to: 7, juz: 1, boldSeparators: []  },
    { type: "ruku", id: 16, title: "15 [:]", tags: [], chapter: 2, from: 1, to: 7, juz: 1, boldSeparators: []  },
    { type: "ruku", id: 17, title: "16 [:]", tags: [], chapter: 2, from: 1, to: 7, juz: 1, boldSeparators: []  },
    { type: "ruku", id: 18, title: "17 [:]", tags: [], chapter: 2, from: 1, to: 7, juz: 1, boldSeparators: []  },
    { type: "ruku", id: 19, title: "18 [:]", tags: [], chapter: 2, from: 1, to: 7, juz: 1, boldSeparators: []  },
    { type: "ruku", id: 20, title: "19 [:]", tags: [], chapter: 2, from: 1, to: 7, juz: 1, boldSeparators: []  },
    { type: "ruku", id: 21, title: "20 [:]", tags: [], chapter: 2, from: 1, to: 7, juz: 1, boldSeparators: []  },
    { type: "ruku", id: 22, title: "21 [:]", tags: [], chapter: 2, from: 1, to: 7, juz: 1, boldSeparators: []  },
    { type: "ruku", id: 23, title: "22 [:]", tags: [], chapter: 2, from: 1, to: 7, juz: 1, boldSeparators: []  },
    { type: "ruku", id: 24, title: "23 [:]", tags: [], chapter: 2, from: 1, to: 7, juz: 1, boldSeparators: []  },
    { type: "ruku", id: 25, title: "24 [:]", tags: [], chapter: 2, from: 1, to: 7, juz: 1, boldSeparators: []  },
    { type: "ruku", id: 26, title: "25 [:]", tags: [], chapter: 2, from: 1, to: 7, juz: 1, boldSeparators: []  },
    { type: "ruku", id: 27, title: "26 [:]", tags: [], chapter: 2, from: 1, to: 7, juz: 1, boldSeparators: []  },
    { type: "ruku", id: 28, title: "27 [:]", tags: [], chapter: 2, from: 1, to: 7, juz: 1, boldSeparators: []  },
    { type: "ruku", id: 29, title: "28 [:]", tags: [], chapter: 2, from: 1, to: 7, juz: 1, boldSeparators: []  },
    { type: "ruku", id: 30, title: "29 [:]", tags: [], chapter: 2, from: 1, to: 7, juz: 1, boldSeparators: []  },
    { type: "ruku", id: 31, title: "30 [:]", tags: [], chapter: 2, from: 1, to: 7, juz: 1, boldSeparators: []  },
    { type: "ruku", id: 32, title: "31 [:]", tags: [], chapter: 2, from: 1, to: 7, juz: 1, boldSeparators: []  },
    { type: "ruku", id: 33, title: "32 [:]", tags: [], chapter: 2, from: 1, to: 7, juz: 1, boldSeparators: []  },
    { type: "ruku", id: 34, title: "33 [:]", tags: [], chapter: 2, from: 1, to: 7, juz: 1, boldSeparators: []  },
    { type: "ruku", id: 35, title: "34 [:]", tags: [], chapter: 2, from: 1, to: 7, juz: 1, boldSeparators: []  },
    { type: "ruku", id: 36, title: "35 [:]", tags: [], chapter: 2, from: 1, to: 7, juz: 1, boldSeparators: []  },
    { type: "ruku", id: 37, title: "36 [:]", tags: [], chapter: 2, from: 1, to: 7, juz: 1, boldSeparators: []  },
    { type: "ruku", id: 38, title: "37 [:]", tags: [], chapter: 2, from: 1, to: 7, juz: 1, boldSeparators: []  },
    { type: "ruku", id: 39, title: "38 [:]", tags: [], chapter: 2, from: 1, to: 7, juz: 1, boldSeparators: []  },
    { type: "ruku", id: 40, title: "39 [:]", tags: [], chapter: 2, from: 1, to: 7, juz: 1, boldSeparators: []  },
    { type: "ruku", id: 41, title: "40 [:]", tags: [], chapter: 2, from: 1, to: 7, juz: 1, boldSeparators: []  },
];

/* ================== СОСТОЯНИЕ ================== */

const rukuList = document.getElementById("rukuList");
const tagFilter = document.getElementById("tagFilter");
const jumpSelect = document.getElementById("jumpSelect");
const content = document.getElementById("content");

let activeRukuId = null;
let activeJuz = null;
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
            div.textContent = `Сура ${item.number}. ${item.name}`;
            div.dataset.anchor = `surah-${item.number}`;
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

async function loadRuku(ruku) {
    activeRukuId = ruku.id;
    activeJuz = ruku.juz;
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

    const url = `https://api.quran.com/api/v4/verses/by_chapter/${ruku.chapter}?from=${ruku.from}&to=${ruku.to}&translations=45&fields=text_uthmani&per_page=50`

    const response = await fetch(url);
    const data = await response.json();

    data.verses.forEach(v => {
        const div = document.createElement("div");
        div.className = "ayah"; // если после этого аята нужен жирный разделитель
        if (ruku.boldSeparators && ruku.boldSeparators.includes(v.verse_number)) { 
            div.classList.add("bold-border");
        }
        div.innerHTML = `
            <div class="translation">${v.verse_number}. ${v.translations[0].text}</div>
            <div class="arabic">${v.text_uthmani}</div>` ;
        content.appendChild(div); 
    });
}

renderRukuList();
