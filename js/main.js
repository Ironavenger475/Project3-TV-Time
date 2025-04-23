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
    showPopup();
    d3.csv('./data/demon-slayer-transcript.csv').then(csvData => {
        data = csvData;
        createTabs(tabs, renderTabContent);
        loadCharacterData();
    });
};

function loadCharacterData() {
    d3.csv("data/demon-slayer-transcript.csv", d => ({
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
    const lowerName = characterName.toLowerCase();
    filteredData = data.filter(d => d.speaker === characterName);
    updateWordCloud(); 
    if (charMapInstance) {
        charMapInstance.moveCharacter(lowerName); 
    }
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

        new Table(tabContent, data); 
        
    }
    if (tabName === "Pie Chart") {
        const tabContent = document.getElementById('tab-3');
        tabContent.innerHTML = '';

        new PieChart(tabContent, data); 
        
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
