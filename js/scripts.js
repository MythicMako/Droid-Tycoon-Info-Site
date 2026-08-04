let rarityData = {};
let cyclesData = {};
let currentCycle = 1;

async function loadData() {
    try {
        const [rarityResponse, cyclesResponse] = await Promise.all([
            fetch('data/rarities.json'),
            fetch('data/cycles.json')
        ]);
        rarityData = await rarityResponse.json();
        cyclesData = await cyclesResponse.json();
        init();
    } catch (error) {
        console.error('Failed to load data:', error);
        document.getElementById('rebirth-container').innerHTML = '<p style="color: #f87171; text-align: center;">Failed to load rebirth data. Please try again later.</p>';
    }
}

function getRarityClass(droidName) {
    const upperName = droidName.toUpperCase().trim();
    if (rarityData.common?.includes(upperName)) return "rarity-common";
    if (rarityData.rare?.includes(upperName)) return "rarity-rare";
    if (rarityData.epic?.includes(upperName)) return "rarity-epic";
    if (rarityData.legendary?.includes(upperName)) return "rarity-legendary";
    if (rarityData.mythic?.includes(upperName)) return "rarity-mythic";
    return "";
}

function getVarietyClass(variety) {
    switch(variety) {
        case 'G': return 'color-gold';
        case 'D': return 'color-diamond';
        case 'R': return 'color-rainbow';
        case 'B': return 'color-beskar';
        case 'Ga': return 'color-galactic';
        default: return 'color-normal';
    }
}

function buildColoredDroids(droidsStr, varieties) {
    if (!droidsStr || droidsStr === "Unknown") {
        return '<span class="unknown-text">Unknown</span>';
    }
    const droidNames = droidsStr.split('|').map(s => s.trim());
    const coloredSpans = [];
    for (let i = 0; i < droidNames.length; i++) {
        let variety = (varieties && varieties[i]) ? varieties[i] : 'N';
        let displayName = droidNames[i];
        if (variety === '?') {
            displayName = droidNames[i] + '?';
            variety = 'N';
        }
        const varClass = getVarietyClass(variety);
        const rarityClass = getRarityClass(displayName);
        coloredSpans.push(`<span class="droid-name ${varClass} ${rarityClass}">${displayName}</span>`);
    }
    return coloredSpans.join(' <span class="separator">|</span> ');
}

function generateColumnHtml(rows) {
    let rowsHtml = '';
    for (let row of rows) {
        const coloredDroids = buildColoredDroids(row.droids, row.vars);
        rowsHtml += `
            <div class="rebirth-row">
                <div class="rb-label">${row.rb}</div>
                <div class="droids-container">${coloredDroids}</div>
                <div class="credits">${row.credits}</div>
            </div>
        `;
    }
    return `
        <div class="rebirth-column">
            <div class="column-header">
                <div class="header-rebirth">Rebirth</div>
                <div class="header-droids">Droids</div>
                <div class="header-credits">Credits</div>
            </div>
            <div class="rebirth-list">
                ${rowsHtml}
            </div>
        </div>
    `;
}

function renderCycle(cycleNum) {
    const data = cyclesData[cycleNum];
    if (!data) return;
    
    const totalRebirths = data.length;
    const leftCount = Math.ceil(totalRebirths / 2);
    const rightCount = Math.floor(totalRebirths / 2);
    
    const leftData = data.slice(0, leftCount);
    const rightData = data.slice(leftCount);
    
    const leftHtml = generateColumnHtml(leftData);
    const rightHtml = generateColumnHtml(rightData);
    const container = document.getElementById('rebirth-container');
    if (container) {
        container.innerHTML = leftHtml + rightHtml;
    }
    document.querySelectorAll('.cycle-btn').forEach(btn => {
        if (btn.getAttribute('data-cycle') == cycleNum) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

function init() {
    renderCycle(1);
    const btns = document.querySelectorAll('.cycle-btn');
    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            const cycle = parseInt(btn.getAttribute('data-cycle'), 10);
            if (!isNaN(cycle) && cyclesData[cycle]) {
                currentCycle = cycle;
                renderCycle(currentCycle);
            }
        });
    });
}

loadData();