
/* ==========================================
   CAMBODIA ARMWRESTLING COMMUNITY
   ATHLETE RANKING SYSTEM
========================================== */

const genderSelect = document.getElementById("gender");
const weightSelect = document.getElementById("weightClass");
const armSelect = document.getElementById("arm");

const rankingList = document.getElementById("rankingList");
const rankingHeading = document.getElementById("rankingHeading");
const athleteCount = document.getElementById("athleteCount");

let athletes = [];

const weightClassNames = {
    "upper-80kg": "Upper 80kg",
    "under-80kg": "Under 80kg",
    "under-70kg": "Under 70kg",
    "under-60kg": "Under 60kg"
};

/* ESCAPE HTML */
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

/* LOAD ATHLETE DATABASE */
async function loadAthletes() {
    try {
        const response = await fetch("data/athletes.json");

        if (!response.ok) {
            throw new Error("Unable to load athletes.json");
        }

        const data = await response.json();

        if (!data || !Array.isArray(data.athletes)) {
            throw new Error("Invalid athlete database format.");
        }

        athletes = data.athletes;

        renderRankings();

    } catch (error) {
        console.error("Ranking error:", error);

        rankingList.innerHTML = `
            <tr>
                <td colspan="5" class="empty-message">
                    Unable to load athlete rankings.
                    Please check your JSON file.
                </td>
            </tr>
        `;

        athleteCount.textContent = "0 ATHLETES";
    }
}

/* FILTER AND SORT ATHLETES */
function getRankings() {
    return athletes
        .filter(athlete =>
            athlete.active === true &&
            athlete.gender === genderSelect.value &&
            athlete.weightClass === weightSelect.value &&
            athlete.arm === armSelect.value
        )
        .sort((a, b) =>
            Number(a.level) - Number(b.level) ||
            Number(a.id) - Number(b.id)
        );
}

/* DISPLAY ATHLETE RANKINGS */
function renderRankings() {
    const gender = genderSelect.value;
    const weightClass = weightSelect.value;
    const arm = armSelect.value;

    const results = getRankings();

    const genderName = gender === "male" ? "Men" : "Women";
    const armName = arm === "right" ? "Right Arm" : "Left Arm";

    rankingHeading.textContent =
        `${genderName} - ${weightClassNames[weightClass]} - ${armName}`;

    athleteCount.textContent = `${results.length} ATHLETES`;

    if (results.length === 0) {
        rankingList.innerHTML = `
            <tr>
                <td colspan="5" class="empty-message">
                    No athletes found in this category.
                </td>
            </tr>
        `;
        return;
    }

    rankingList.innerHTML = results.map((athlete, index) => {

        const name = escapeHTML(athlete.name || "Unknown Athlete");
        const country = escapeHTML(athlete.country || "-");
        const photo = escapeHTML(
            athlete.photo || "assets/images/default-athlete.png"
        );

        const weight = escapeHTML(
            athlete.weight ?? "-"
        );

        const level = escapeHTML(
            athlete.level ?? "-"
        );

        return `
            <tr>
                <td>
                    <span class="rank-number">
                        #${index + 1}
                    </span>
                </td>

                <td>
                    <div class="athlete">
                        <img
                            src="${photo}"
                            alt="${name}"
                            onerror="this.onerror=null;this.src='assets/images/default-athlete.png';"
                        >
                        ${name}
                    </div>
                </td>

                <td>${country}</td>

                <td>${weight} kg</td>

                <td>
                    <span class="level">
                        ${level}
                    </span>
                </td>
            </tr>
        `;

    }).join("");
}

/* FILTER EVENT LISTENERS */
genderSelect.addEventListener("change", renderRankings);
weightSelect.addEventListener("change", renderRankings);
armSelect.addEventListener("change", renderRankings);

/* FOOTER YEAR */
document.getElementById("year").textContent =
    new Date().getFullYear();

/* START RANKING SYSTEM */
loadAthletes();

