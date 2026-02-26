const FEED_URL = "https://www.computerbase.de/autor/andreas-frischholz/index.atom";
const MAX_ARTICLES = 10;

async function loadFeed() {
    const container = document.getElementById("feed");

    try {
        const response = await fetch(FEED_URL);
        if (!response.ok) throw new Error("Feed konnte nicht geladen werden.");
        const text = await response.text();
        const xml = new DOMParser().parseFromString(text, "application/xml");
        const entries = xml.querySelectorAll("entry");

        if (entries.length === 0) {
            container.innerHTML = '<p class="error-msg">Keine Artikel gefunden.</p>';
            return;
        }

        let html = "";
        const count = Math.min(entries.length, MAX_ARTICLES);

        for (let i = 0; i < count; i++) {
            const entry = entries[i];
            const title = entry.querySelector("title")?.textContent ?? "";
            const link = entry.querySelector("link")?.getAttribute("href") ?? "#";
            const published = entry.querySelector("published")?.textContent ?? "";
            const rawSummary = entry.querySelector("summary")?.textContent ?? "";
            const summary = stripHtml(rawSummary);

            const date = published
                ? new Date(published).toLocaleDateString("de-DE", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                  })
                : "";

            html += `
                <article class="feed-card">
                    <p class="date">${date}</p>
                    <h3><a href="${escapeHtml(link)}" target="_blank" rel="noopener">${escapeHtml(title)}</a></h3>
                    ${summary ? `<p class="summary">${escapeHtml(truncate(summary, 180))}</p>` : ""}
                </article>`;
        }

        container.innerHTML = html;
    } catch (err) {
        container.innerHTML = `<p class="error-msg">Artikel konnten nicht geladen werden. <a href="${FEED_URL}" target="_blank" rel="noopener">Direkt zum Feed</a></p>`;
    }
}

function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}

function stripHtml(str) {
    const div = document.createElement("div");
    div.innerHTML = str;
    return div.textContent.trim();
}

function truncate(str, max) {
    if (str.length <= max) return str;
    return str.slice(0, max).replace(/\s+\S*$/, "") + "\u2026";
}

loadFeed();
