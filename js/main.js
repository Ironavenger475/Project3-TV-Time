import WordCloud from './word-cloud.js';
import { tabs, createTabs } from './tabs.js';
import Table from './table.js';
import PieChart from './pieChart.js';

// Load data from CSV file
let data = [];

window.onload = () => {
    showPopup();
    d3.csv('./data/demon-slayer-transcript.csv').then(csvData => {
        data = csvData;
        console.log(data)
        createTabs(tabs, renderTabContent);
    });
};

function renderTabContent(tabName) {
    if (tabName === "Word Cloud") {
        const tabContent = document.getElementById('tab-0'); // Assuming Word Cloud is the first tab
        tabContent.innerHTML = ''; // Clear existing content

        // Create a container div for the word cloud
        const wordCloudContainer = document.createElement('div');
        wordCloudContainer.style.width = '100%';
        wordCloudContainer.style.height = '400px'; // Adjust height as needed
        tabContent.appendChild(wordCloudContainer);

        // Initialize the WordCloud object
        new WordCloud(wordCloudContainer, data);
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
