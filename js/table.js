import garbageWords from './stop-phrases.js';
class Table {
    constructor(container, data) {
        this.container = container;
        this.data = data;
        this.tableData = [];

        this.processData();
        this.init();
    }

    processData() {
        const phraseCount = {};
        const minWords = 3;
       

        this.data.forEach(row => {
            const text = row.text?.toLowerCase().replace(/[.,!?"]/g, '').trim();
            if (!text) return;

            const words = text.split(/\s+/);
            for (let n = minWords; n <= words.length; n++) {
                for (let i = 0; i <= words.length - n; i++) {
                    const phrase = words.slice(i, i + n).join(' ');

                    // Count the occurrences of each phrase
                    phraseCount[phrase] = (phraseCount[phrase] || 0) + 1;
                }
            }
        });

        // Step 2: Convert to array of phrases with count
        let phrases = Object.entries(phraseCount)
            .filter(([_, count]) => count > 4)
            .map(([phrase, count]) => ({ phrase, count }))
            .sort((a, b) => b.count - a.count || b.phrase.length - a.phrase.length);

        // Step 3: Filter out garbage phrases AFTER they have been formed
        phrases = phrases.filter(phraseObj => !this.isGarbagePhrase(phraseObj.phrase, garbageWords));

        // Step 4: Remove subphrases that are contained in longer phrases with the same count
        const filtered = [];
        for (let i = 0; i < phrases.length; i++) {
            const { phrase, count } = phrases[i];
            const isSubphrase = filtered.some(entry =>
                entry.count === count && entry.phrase.includes(phrase)
            );
            if (!isSubphrase) {
                filtered.push(phrases[i]);
            }
        }

        this.tableData = filtered;
    }

    // Helper function to check if a phrase is considered "garbage"
    isGarbagePhrase(phrase, garbageWords) {
        // Normalize the phrase for comparison
        const normalizedPhrase = phrase.toLowerCase().trim();
        
        // Check if the exact phrase matches any garbage phrases
        return garbageWords.some(garbagePhrase => normalizedPhrase === garbagePhrase);
    }

    init() {
        const heading = document.createElement('h3');
        heading.textContent = 'Common Phrases in Demon Slayer';
        heading.style.color = 'black';
        this.container.appendChild(heading);

        const tableContainer = document.createElement('div');
        tableContainer.classList.add('phrase-table-container');
        this.container.appendChild(tableContainer);

        this.table = document.createElement('table');
        this.table.classList.add('phrase-table');
        tableContainer.appendChild(this.table);

        const thead = document.createElement('thead');
        thead.innerHTML = '<tr><th>Common Phrase</th><th>Occurrences</th></tr>';
        this.table.appendChild(thead);

        this.tbody = document.createElement('tbody');
        this.table.appendChild(this.tbody);

        this.render();
    }

    render() {
        const rows = d3.select(this.tbody)
            .selectAll('tr')
            .data(this.tableData, d => d.phrase);

        const newRows = rows.enter()
            .append('tr');

        newRows.append('td').text(d => d.phrase);
        newRows.append('td').text(d => d.count);

        rows.exit().remove();
    }
}

export default Table;
