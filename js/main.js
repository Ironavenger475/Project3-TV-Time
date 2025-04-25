import { loadData, hideLoading, showLoading, updateLoadingMessage } from './loading.js';
import WordCloud from './word-cloud.js';
import { tabs, createTabs } from './tabs.js';
import Table from './table.js';
import PieChart from './pieChart.js';
import CharMap from './map.js';
import { Timeline } from './timeline.js';
import CharacterStats from './characterStats.js';
import DialoguePieChart from './dialoguepiechart.js';

let data = [];
let filteredData = [];
let currentCharacter = null;
let charMapInstance = null;
let characterStats = null;
window.onload = () => {
    showLoading("Loading Demon Slayer transcript...");
    showPopup();

    
    loadData('./data/demon-slayer-transcript.csv')
        .then(csvData => {
            data = csvData.map(d => ({ ...d, character: d.speaker?.trim() }));
            const timeline = new Timeline("timeline", 64, 16);
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
            initializeFilter(charData, onCharacterSelect);

            hideLoading();
        })
        .catch(error => {
            console.error(error);
            updateLoadingMessage("Failed to load data.");
            setTimeout(() => hideLoading(), 1500);
        });
};

function onEpisodeRangeSelect(selectedEpisodes) {
    window.selectedEpisodeSet = new Set(selectedEpisodes.map(ep => `S${ep.season}E${ep.episode}`));

    const base = data.filter(d => window.selectedEpisodeSet.has(`S${+d.season}E${+d.episode}`));

    if (selectedEpisodes.length === 0) {
        window.selectedEpisodeSet = null;
        filteredData = currentCharacter ? data.filter(d => d.character === currentCharacter) : data;
    } else {
        window.selectedEpisodeSet = new Set(selectedEpisodes.map(ep => `S${ep.season}E${ep.episode}`));
        const base = data.filter(d => window.selectedEpisodeSet.has(`S${+d.season}E${+d.episode}`));
        filteredData = currentCharacter ? base.filter(d => d.character === currentCharacter) : base;
    }

    updateWordCloud();
    updateTable();
    updatePie();
}

function onCharacterSelect(characterName) {
    currentCharacter = characterName;
    const lowerName = characterName.toLowerCase();

    const base = window.selectedEpisodeSet 
        ? data.filter(d => window.selectedEpisodeSet.has(`S${+d.season}E${+d.episode}`)) 
        : data;

    filteredData = data.filter(d => d.speaker === characterName);

    updateWordCloud(); 
    updateTable();
    updatePie();
    if (charMapInstance) {
        charMapInstance.moveCharacter(lowerName); 
    }
    filteredData = data.filter(d => d.character === characterName);
    updateWordCloud();
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
        new WordCloud(wordCloudContainer, data);
        updateWordCloud();
    }
    if (tabName === "Phrases") {
        const tabContent = document.getElementById('tab-1');
        tabContent.innerHTML = '';
        const tableContainer = document.createElement('div');
        tableContainer.id = 'table-container';
        tabContent.appendChild(tableContainer);
        updateTable()
        
    }
    if (tabName === "More Info") {
        const tabContent = document.getElementById('tab-3');
        tabContent.innerHTML = '';
        const pieContainer = document.createElement('div');
        pieContainer.id = 'pie-container';
        tabContent.appendChild(pieContainer);
        updatePie()
        
    }

    if (tabName === "Map") {
        const mapContent = document.getElementById('tab-2');
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
    const cloudData = currentCharacter ? filteredData : data;
    new WordCloud(container, cloudData);
}
function updateTable() {
    const container = document.getElementById('table-container');
    if (!container) return;
    container.innerHTML = '';
    const tableData = currentCharacter ? filteredData : data;
    new Table(container, tableData);
}
function updatePie() {
    const container = document.getElementById('pie-container');
    if (!container) return;
    container.innerHTML = '';

    // Create a wrapper to hold the pie charts side by side
    const pieWrapper = document.createElement('div');
    pieWrapper.style.display = 'flex'; // Use Flexbox to align the charts horizontally
    pieWrapper.style.justifyContent = 'space-between'; // Optional: Space between the charts
    pieWrapper.style.width = '100%'; // Ensure the wrapper takes full width
    container.appendChild(pieWrapper);

    // Create containers for both pie charts
    const pieChartContainer1 = document.createElement('div');
    pieChartContainer1.style.width = '45%'; // Each pie chart takes 45% of the width
    pieWrapper.appendChild(pieChartContainer1);

    const pieChartContainer2 = document.createElement('div');
    pieChartContainer2.style.width = '55%'; // Same width as the other pie chart
    pieWrapper.appendChild(pieChartContainer2);
    const pieData = currentCharacter ? filteredData : data;
    new PieChart(pieChartContainer1, pieData);
    new DialoguePieChart(pieChartContainer2, pieData);
    if (currentCharacter) {
        const characterStats = new CharacterStats(filteredData);  // Use filtered data

        // Get character stats using the selected character
        const stats = characterStats.getCharacterStats(currentCharacter);

        // Create the stats box container
        const statsBox = document.createElement('div');
        statsBox.style.marginTop = '10px';
        statsBox.style.fontSize = '14px';
        statsBox.style.lineHeight = '1.6';

        // Title with the character name
        const charTitle = document.createElement('strong');
        charTitle.textContent = `Stats for ${currentCharacter}`;
        statsBox.appendChild(charTitle);

        // Season count
        const seasonInfo = document.createElement('div');
        seasonInfo.textContent = `Seasons Appeared: ${stats.totalSeasons}`;
        statsBox.appendChild(seasonInfo);

        // Episode count
        const episodeInfo = document.createElement('div');
        episodeInfo.textContent = `Episodes Appeared: ${stats.totalEpisodes}`;
        statsBox.appendChild(episodeInfo);

        const dialogueInfo = document.createElement('div');
        dialogueInfo.textContent = `Total Dialogue: ${stats.totalDialogue} lines`;
        statsBox.appendChild(dialogueInfo);

        let link = `https://kimetsu-no-yaiba.fandom.com/wiki/Special:Search?query=${currentCharacter}&scope=internal&contentType=&ns%5B0%5D=0&ns%5B1%5D=2900`;        const linkInfo = document.createElement('div');
        const anchor = document.createElement('a');
        anchor.href = link; // Set the href to the link
        anchor.textContent = `More Info on ${currentCharacter}`; // Text to display for the link
        anchor.target = "_blank"; // Optional: Open in a new tab
        linkInfo.appendChild(anchor);

        // Add the linkInfo div to the statsBox
        statsBox.appendChild(linkInfo);
        // Append the stats box to the container
        container.appendChild(statsBox);
    }
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

