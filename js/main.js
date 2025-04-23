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
        data = csvData.map(d => ({ ...d, character: d.speaker?.trim() }));

        createTabs(tabs, renderTabContent);
        // new columns - unique chars and their count
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
    });
};

function onCharacterSelect(characterName) {
    currentCharacter = characterName;
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
        new Table(tabContent, data);
    }
    if (tabName === "pie chart") {
        new PieChart(tabContent, data);
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
