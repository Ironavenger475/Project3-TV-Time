import WordCloud from './word-cloud.js';
import { tabs, createTabs } from './tabs.js';
import Table from './table.js';
import PieChart from './pieChart.js';
import CharMap from './map.js';
import { Timeline } from './timeline.js';

let data = [];
let filteredData = [];
let selectedCharacters = new Set();
let charMapInstance = null;

window.onload = () => {
    showPopup();

    d3.csv('./data/demon-slayer-transcript.csv').then(csvData => {
        data = csvData.map(d => ({ ...d, character: d.speaker?.trim() }));

        const timeline = new Timeline("timeline", 64, 16, onEpisodeRangeSelect);
        console.log(data)
        createTabs(tabs, renderTabContent);

        const characterCountMap = {};
        let uniqueCharacters = [];

        data.forEach(d => {
            const character = d.character;
            if (character) {
                if (!uniqueCharacters.includes(character)) {
                    uniqueCharacters.push(character);
                }
                characterCountMap[character] = (characterCountMap[character] || 0) + 1;
            }
        });

        const charData = uniqueCharacters
            .map(character => ({
                character,
                count: characterCountMap[character]
            }))
            .filter(d => d.count > 20);

        window.characterData = charData;
        initializeFilter(charData, handleCharacterToggle);
    });
};

function handleCharacterToggle(character, isChecked) {
    if (isChecked) {
        if (selectedCharacters.size >= 3) {
            alert("You can only select up to 3 characters.");
            document.querySelector(`input[data-character="${character}"]`).checked = false;
            return;
        }
        selectedCharacters.add(character);
    } else {
        selectedCharacters.delete(character);
    }
    applyFilters();
}

function onEpisodeRangeSelect(selectedEpisodes) {
    window.selectedEpisodeSet = selectedEpisodes.length > 0 
        ? new Set(selectedEpisodes.map(ep => `S${ep.season}E${ep.episode}`)) 
        : null;

    applyFilters();
}

function applyFilters() {
    const selectedCharArr = Array.from(selectedCharacters);
    if (selectedCharArr.length === 0) {
        filteredData = window.selectedEpisodeSet 
            ? data.filter(d => window.selectedEpisodeSet.has(`S${+d.season}E${+d.episode}`)) 
            : data;
    } else {
        let base = window.selectedEpisodeSet 
            ? data.filter(d => window.selectedEpisodeSet.has(`S${+d.season}E${+d.episode}`)) 
            : data;

        const grouped = d3.groups(base, d => `S${d.season}E${d.episode}`);
        const validEpisodes = grouped.filter(([, rows]) => {
            const episodeChars = new Set(rows.map(r => r.character));
            return selectedCharArr.every(c => episodeChars.has(c));
        });

        const validKeys = new Set(validEpisodes.map(([key]) => key));
        filteredData = base.filter(d => selectedCharArr.includes(d.character) && validKeys.has(`S${d.season}E${d.episode}`));
    }

    updateWordCloud();
    updateTable();
    updatePie();

    if (charMapInstance) {
        charMapInstance.moveCharacters(selectedCharArr);
    }
}

function renderTabContent(tabName) {
    const tabContent = document.getElementById(`tab-${tabs.indexOf(tabName)}`);
    tabContent.innerHTML = '';

    if (tabName === "Word Cloud") {
        const wordCloudContainer = document.createElement('div');
        wordCloudContainer.style.width = '100%';
        wordCloudContainer.style.height = '400px';
        wordCloudContainer.id = 'word-cloud-container';
        tabContent.appendChild(wordCloudContainer);
        updateWordCloud();
    }

    if (tabName === "Phrases") {
        const tableContainer = document.createElement('div');
        tableContainer.id = 'table-container';
        tabContent.appendChild(tableContainer);
        updateTable();
    }

    if (tabName === "Pie Chart") {
        const pieContainer = document.createElement('div');
        pieContainer.id = 'pie-container';
        tabContent.appendChild(pieContainer);
        updatePie();
    }

    if (tabName === "Map") {
        const mapContent = document.getElementById('tab-3');
        mapContent.innerHTML = '';
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", "0 0 736 531");
        svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
        svg.style.width = "100%";
        svg.style.height = "100%";
        mapContent.appendChild(svg);
        charMapInstance = new CharMap(svg);
    }
}

function updateWordCloud() {
    const container = document.getElementById('word-cloud-container');
    if (!container) return;
    container.innerHTML = '';
    new WordCloud(container, filteredData);
}
function updateTable() {
    const container = document.getElementById('table-container');
    if (!container) return;
    container.innerHTML = '';
    new Table(container, filteredData);
}
function updatePie() {
    const container = document.getElementById('pie-container');
    if (!container) return;
    container.innerHTML = '';
    new PieChart(container, filteredData);
}

const overlay = document.getElementById("overlay");
const continueBtn = document.getElementById("continueBtn");
const reopenPopupBtn = document.getElementById("reopenPopupBtn");

function showPopup() {
    overlay.classList.remove("hidden");
}
function hidePopup() {
    overlay.classList.add("hidden");
}

continueBtn.addEventListener("click", hidePopup);
reopenPopupBtn.addEventListener("click", showPopup);
