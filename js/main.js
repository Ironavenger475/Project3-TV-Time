import { loadData, hideLoading, showLoading, updateLoadingMessage } from './loading.js';
import WordCloud from './word-cloud.js';
import { tabs, createTabs } from './tabs.js';
import Table from './table.js';
import PieChart from './pieChart.js';
import CharMap from './map.js';

let data = [];
let filteredData = [];
let currentCharacter = null;
let charMapInstance = null;
window.onload = () => {
    showLoading("Loading Demon Slayer transcript...");
    showPopup();

    
    loadData('./data/demon-slayer-transcript.csv')
        .then(csvData => {
            data = csvData.map(d => ({ ...d, character: d.speaker?.trim() }));

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

function onCharacterSelect(characterName) {
    currentCharacter = characterName;
    const lowerName = characterName.toLowerCase();
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

        updateWordCloud();
    }
    if (tabName === "Phrases") {
        const tabContent = document.getElementById('tab-2');
        tabContent.innerHTML = '';
        const tableContainer = document.createElement('div');
        tableContainer.id = 'table-container';
        tabContent.appendChild(tableContainer);
        updateTable()
        
    }
    if (tabName === "Pie Chart") {
        const tabContent = document.getElementById('tab-3');
        tabContent.innerHTML = '';
        const pieContainer = document.createElement('div');
        pieContainer.id = 'pie-container';
        tabContent.appendChild(pieContainer);
        updatePie()
        
    }

    if (tabName === "Map") {
        const mapContent = document.getElementById('tab-4');
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
    const pieData = currentCharacter ? filteredData : data;
    new PieChart(container, pieData);
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
