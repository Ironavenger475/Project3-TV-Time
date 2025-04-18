class Table {
    constructor(container, data) {
        this.container = container;
        this.data = data;
        this.tableData = [];

        this.processData();
        this.init();
    }

    processData(data) {
        const phraseCount = {};

        this.data.forEach(row => {
            const phrase = row.text?.trim();
            if (phrase) {
                phraseCount[phrase] = (phraseCount[phrase] || 0) + 1;
            }
        });

        this.tableData = Object.entries(phraseCount)
            .map(([phrase, count]) => ({ phrase, count }))
            .filter(d => d.count > 1) // Only show common phrases
            .sort((a, b) => b.count - a.count); // Descending by count
    }

    init() {
        // Add title
        const heading = document.createElement('h3');
        heading.textContent = 'Common Phrases in Demon Slayer';
        this.container.appendChild(heading);

        // Create scrollable container for the table
        const tableContainer = document.createElement('div');
        tableContainer.classList.add('phrase-table-container');
        this.container.appendChild(tableContainer);

        // Create table
        this.table = document.createElement('table');
        this.table.classList.add('phrase-table');
        tableContainer.appendChild(this.table);

        // Create thead
        const thead = document.createElement('thead');
        thead.innerHTML = '<tr><th>Common Phrase</th><th>Number of Times Said</th></tr>';
        this.table.appendChild(thead);

        // Create tbody
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
