
/* ==========================================
   ATHLETE PROFILE SYSTEM
   CAMBODIA ARMWRESTLING COMMUNITY
========================================== */

const profileContent = document.getElementById("profileContent");

const weightClassNames = {
    "upper-80kg": "Upper 80kg",
    "under-80kg": "Under 80kg",
    "under-70kg": "Under 70kg",
    "under-60kg": "Under 60kg"
};

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

function getImagePath(photo) {
    if (!photo) {
        return "../assets/images/default-athlete.png";
    }

    // Keep external image URLs unchanged.
    if (/^https?:\/\//i.test(photo) || photo.startsWith("data:")) {
        return photo;
    }

    // Local athlete images are stored relative to the project root.
    return "../" + photo.replace(/^\/+/, "");
}

async function loadAthleteProfile() {
    try {
        const params = new URLSearchParams(window.location.search);
        const athleteId = params.get("id");

        if (!athleteId) {
            throw new Error("No athlete ID was provided.");
        }

        const response = await fetch("../data/athletes.json");

        if (!response.ok) {
            throw new Error("Could not load athlete database.");
        }

        const data = await response.json();
        const athletes = Array.isArray(data.athletes)
            ? data.athletes
            : [];

        const athlete = athletes.find(item =>
            String(item.id) === athleteId
        );

        if (!athlete) {
            throw new Error("Athlete not found.");
        }

        displayAthlete(athlete, athletes);

    } catch (error) {
        console.error(error);

        profileContent.innerHTML = `
            <div class="profile-card">
                <div class="profile-message profile-error">
                    ${escapeHTML(error.message)}
                    <p>Please return to the rankings page.</p>
                </div>
            </div>
        `;
    }
}

function displayAthlete(athlete, athletes) {
    const name = escapeHTML(athlete.name || "Unknown Athlete");
    const country = escapeHTML(athlete.country || "-");
    const weight = escapeHTML(athlete.weight ?? "-");
    const gender = athlete.gender === "male" ? "Men" : "Women";
    const arm = athlete.arm === "right" ? "Right Arm" : "Left Arm";

    const weightClass = weightClassNames[athlete.weightClass] || "-";

    const level = Number(athlete.level);

    // Calculate rank among active athletes in the same category.
    const categoryAthletes = athletes
        .filter(item =>
            item.active === true &&
            item.gender === athlete.gender &&
            item.weightClass === athlete.weightClass &&
            item.arm === athlete.arm
        )
        .sort((a, b) =>
            Number(a.level) - Number(b.level) ||
            Number(a.id) - Number(b.id)
        );

    const rank = categoryAthletes.findIndex(item =>
        String(item.id) === String(athlete.id)
    ) + 1;

    const photo = escapeHTML(getImagePath(athlete.photo));

    const history = Array.isArray(athlete.competitionHistory)
        ? athlete.competitionHistory
        : [];

    const historyHTML = history.length
        ? history.map(event => `
            <li>
                <strong>${escapeHTML(event.event || "Competition")}</strong>
                <br>
                ${escapeHTML(event.date || "")}
                ${event.result
                    ? " — " + escapeHTML(event.result)
                    : ""}
            </li>
        `).join("")
        : "<li>No competition history available yet.</li>";

    document.title = `${name} | Cambodia Armwrestling Community`;

    profileContent.innerHTML = `
        <div class="profile-card">

            <div class="profile-banner">

                <img
                    src="${photo}"
                    alt="${name}"
                    class="profile-photo"
                    onerror="this.onerror=null;this.src='../assets/images/default-athlete.png';"
                >

                <div>
                    <h1 class="profile-name">${name}</h1>
                    <div class="profile-country">${country}</div>
                    <p>${gender} Armwrestler</p>
                </div>

            </div>

            <div class="profile-details">

                <div class="detail-item">
                    <span class="detail-label">Weight</span>
                    <span class="detail-value">${weight} kg</span>
                </div>

                <div class="detail-item">
                    <span class="detail-label">Weight Class</span>
                    <span class="detail-value">${weightClass}</span>
                </div>

                <div class="detail-item">
                    <span class="detail-label">Gender</span>
                    <span class="detail-value">${gender}</span>
                </div>

                <div class="detail-item">
                    <span class="detail-label">Arm Category</span>
                    <span class="detail-value">${arm}</span>
                </div>

                <div class="detail-item">
                    <span class="detail-label">Ranking</span>
                    <span class="detail-value">#${rank || "-"}</span>
                </div>

                <div class="detail-item">
                    <span class="detail-label">Level</span>
                    <span class="detail-value">${escapeHTML(
                        athlete.level ?? "-"
                    )}</span>
                </div>

            </div>

            <div class="profile-section">
                <h2>Current Ranking</h2>
                <p>
                    <span class="rank-highlight">
                        ${rank ? "#" + rank : "Unranked"}
                    </span>
                    <br>
                    ${gender} / ${weightClass} / ${arm}
                </p>
            </div>

            <div class="profile-section">
                <h2>Competition History</h2>
                <ul class="history-list">
                    ${historyHTML}
                </ul>
            </div>

        </div>
    `;
}

document.getElementById("year").textContent =
    new Date().getFullYear();

loadAthleteProfile();
