class DialoguePieChart {
    constructor(container, characterData) {
        this.container = container;
        this.characterData = characterData; // Character-specific data passed to the chart
        this.totalData = null; // To store the total data after loading the CSV
        this.processedData = null; // To store the processed data for pie chart
        this.loadData(); // Load the data (CSV) when the chart is created
    }

    // Method to load only 'text' from the CSV file
    loadData() {
        d3.csv('./data/demon-slayer-transcript.csv').then(csvData => {
            // Only extract 'text' from the CSV data
            this.totalData = csvData.map(row => row.text?.trim()).filter(text => text); // Filter out empty texts
            this.processedData = this.processData(); // Process the data after it's loaded
            this.init(); // Initialize the chart once the data is loaded
        });
    }

    // Method to process both the character data and total data for the pie chart
    processData() {
        const counts = {
            Total: 0,
            SpokenByCharacter: 0
        };
    
        // Process the character-specific data
        this.characterData.forEach(row => {
            const text = row.text?.trim(); // Use text column directly
            if (text) {
                counts.Total += 1; // Increment the total dialogue count
            
                    counts.SpokenByCharacter += 1; // Increment only spoken dialogue by the character
                
            }
        });
    
        // Process the total static data for comparison
        const totalCounts = {
            Total: 0,
            SpokenByOthers: 0
        };
    
        this.totalData.forEach(text => {
            if (text) {
                totalCounts.Total += 1; // Increment the total dialogue count
                // If it's not a "thought", it counts as spoken
                
                    // We'll add the spoken dialogue for others in the next calculation
                    if (!this.characterData.some(characterRow => characterRow.text === text)) {
                        totalCounts.SpokenByOthers += 1; }
                }
            
        });
    
        // Dialogue spoken by others is the difference between total and character's spoken dialogue
        const totalSpoken = counts.SpokenByCharacter + totalCounts.SpokenByOthers;

        // Calculate percentages (spoken dialogue by the character vs. others)
        const characterSpokenPercent = totalSpoken > 0 ? (counts.SpokenByCharacter / totalSpoken) * 100 : 0;
        const othersSpokenPercent = totalSpoken > 0 ? (totalCounts.SpokenByOthers / totalSpoken) * 100 : 0;
    
        return [
            { label: "Dialogue Spoken by Character", value: counts.SpokenByCharacter, percent: characterSpokenPercent },
            { label: "Dialogue Spoken by Others", value: totalCounts.SpokenByOthers, percent: othersSpokenPercent }
        ];
    }

    // Method to initialize and render the pie chart
    init() {
        const width = 300;
        const height = 300;
        const radius = Math.min(width, height) / 2;

        // Title
        const title = document.createElement('h3');
        title.textContent = 'Character Dialogue vs Total Dialogue';
        title.style.marginBottom = '10px';
        this.container.appendChild(title);

        // Wrapper
        const wrapper = document.createElement('div');
        wrapper.style.display = 'flex';
        wrapper.style.alignItems = 'center';
        wrapper.style.position = 'relative';
        this.container.appendChild(wrapper);

        // Tooltip
        const tooltip = document.createElement('div');
        tooltip.style.position = 'absolute';
        tooltip.style.background = 'rgba(0,0,0,0.7)';
        tooltip.style.color = '#fff';
        tooltip.style.padding = '5px 8px';
        tooltip.style.borderRadius = '4px';
        tooltip.style.pointerEvents = 'none';
        tooltip.style.fontSize = '13px';
        tooltip.style.display = 'none';
        document.body.appendChild(tooltip);

        // SVG
        const svg = d3.select(wrapper)
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", `translate(${width / 2}, ${height / 2})`);

        const color = d3.scaleOrdinal()
            .domain(this.processedData.map(d => d.label))
            .range(["#e74c3c", "#2ecc71"]);

        const pie = d3.pie().value(d => d.value);
        const arc = d3.arc().innerRadius(0).outerRadius(radius);

        const arcs = svg.selectAll("arc")
            .data(pie(this.processedData))
            .enter()
            .append("g");

        arcs.append("path")
            .attr("d", arc)
            .attr("fill", d => color(d.data.label))
            .on("mouseover", function (event, d) {
                tooltip.style.display = 'block';
                tooltip.innerHTML = `Lines: ${d.data.value}<br>Percent: ${d.data.percent.toFixed(1)}%`;
                d3.select(this)
                    .attr("stroke", "black")
                    .attr("stroke-width", 2);
            })
            .on("mousemove", (event) => {
                tooltip.style.left = event.pageX + 10 + "px";
                tooltip.style.top = event.pageY + 10 + "px";
            })
            .on("mouseout", function () {
                tooltip.style.display = 'none';
                d3.select(this)
                    .attr("stroke", null)
                    .attr("stroke-width", null);
            });

        arcs.append("text")
            .attr("transform", d => `translate(${arc.centroid(d)})`)
            .attr("text-anchor", "middle")
            .attr("font-size", "14px")
            .attr("fill", "#fff")
            .text(d => `${d.data.percent.toFixed(1)}%`)
            .style("z-index", 2000);

        // Legend
        const legendContainer = document.createElement('div');
        legendContainer.style.position = 'absolute';
legendContainer.style.top = '150px';  // Distance from the bottom
legendContainer.style.right = '-15px';   // Distance from the left
        wrapper.appendChild(legendContainer);

        this.processedData.forEach(d => {
            const item = document.createElement('div');
            item.style.display = 'flex';
            item.style.alignItems = 'center';
            item.style.marginBottom = '6px';

            const colorBox = document.createElement('div');
            colorBox.style.width = '16px';
            colorBox.style.height = '16px';
            colorBox.style.backgroundColor = color(d.label);
            colorBox.style.marginRight = '8px';

            const label = document.createElement('span');
            label.textContent = d.label;

            item.appendChild(colorBox);
            item.appendChild(label);
            legendContainer.appendChild(item);
        });
    }
}

export default DialoguePieChart;