import WordCloud from './word-cloud.js';
import { tabs, createTabs } from './tabs.js';
import Table from './table.js';
import PieChart from './pieChart.js';

let data = [];
let filteredData = [];
let currentCharacter = null;

window.onload = () => {
    showPopup();
    d3.csv('./data/demon-slayer-transcript.csv').then(csvData => {
        data = csvData;
        createTabs(tabs, renderTabContent);
        loadCharacterData();
    });
};

function loadCharacterData() {
    d3.csv("data/charcount.csv", d => ({
        character: d.character,
        count: +d.count
    })).then(charData => {
        const filteredCharData = charData.filter(d => d.count > 20 && d.character);
        window.characterData = filteredCharData;
        initializeFilter(filteredCharData, onCharacterSelect);
    });
}

function onCharacterSelect(characterName) {
    currentCharacter = characterName;
    filteredData = data.filter(d => d.speaker === characterName);
    updateWordCloud(); // Re-render if active
}

function renderTabContent(tabName) {
    if (tabName === "Word Cloud") {
        const tabContent = document.getElementById('tab-0');
        tabContent.innerHTML = '';

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

        new Table(tabContent, data); // 👈 Use the class from table.js
        
    }
    if (tabName === "pie chart") {
        const tabContent = document.getElementById('tab-3');
        tabContent.innerHTML = '';

        new PieChart(tabContent, data); // 👈 Use the class from table.js
        
    }
}

function updateWordCloud() {
    const container = document.getElementById('word-cloud-container');
    if (!container) return;
    container.innerHTML = '';
    const cloudData = currentCharacter ? filteredData : data;
    new WordCloud(container, cloudData);
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
