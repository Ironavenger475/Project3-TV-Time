const cloud = d3Cloud;

class WordCloud {
    constructor(parentDiv, data) {
        this.maxWordCount = 100; // Maximum number of words to display
        this.parentDiv = d3.select(parentDiv);
        this.data = this.processData(data); // Process data to calculate word counts

        // Create a new div for the word cloud
        this.wordCloudDiv = this.parentDiv.append('div')
            .attr('id', 'word-cloud')
            .style('width', '100%')
            .style('height', '100%');
        
        this.tooltip = d3.select('body').append('div');
        this.tooltip.attr("class", 'tooltip');

        // Initialize the word cloud
        this.init();
    }

    processData(data) {
        const wordCounts = {};

        // Iterate through the data and count words in the 'text' field
        data.forEach(row => {
            if (row.text) {
                const words = row.text.split(/\s+/); // Split text into words
                words.forEach(word => {
                    const cleanedWord = word.toLowerCase().replace(/[^a-z0-9]/gi, ''); // Clean word
                    if (cleanedWord) {
                        wordCounts[cleanedWord] = (wordCounts[cleanedWord] || 0) + 1;
                    }
                });
            }
        });
        
        // only keep the top 25 words
        const sortedWordCounts = Object.entries(wordCounts).sort((a, b) => b[1] - a[1]);
        const topWordCounts = sortedWordCounts.slice(0, this.maxWordCount);

        // Convert wordCounts object into an array of { text, count } objects
        return topWordCounts.map(([text, count]) => ({ text, count }));
    }

    init() {
        // Get the dimensions of the new word cloud div
        const { width, height } = this.wordCloudDiv.node().getBoundingClientRect();

        // Create an SVG element inside the new div
        this.svg = this.wordCloudDiv.append('svg')
            .attr('width', width)
            .attr('height', height);

        // Create a group element for the word cloud
        this.wordGroup = this.svg.append('g')
            .attr('transform', `translate(${width / 2}, ${height / 2})`);

        // Render the word cloud
        this.render();
    }

    render() {
        const { width, height } = this.wordCloudDiv.node().getBoundingClientRect();

        // Create a scale for font sizes
        const fontSizeScale = d3.scaleLinear()
            .domain(d3.extent(this.data, d => d.count))
            .range([10, 50]); // Adjust font size range as needed

        // Create a D3 cloud layout
        const layout = cloud()
            .size([width, height])
            .words(this.data.map(d => ({ text: d.text, size: fontSizeScale(d.count), count: d.count })))
            .padding(5)
            .rotate(() => (Math.random() > 0.5 ? 0 : 90)) // Randomly rotate words
            .fontSize(d => d.size)
            .on('end', words => this.draw(words));

        layout.start();
    }

    draw(words) {
        this.wordGroup.selectAll('text')
            .data(words)
            .enter()
            .append('text')
            .style('font-size', d => `${d.size}px`)
            .style('fill', () => d3.schemeCategory10[Math.floor(Math.random() * 10)]) // Random colors
            .attr('text-anchor', 'middle')
            .attr('transform', d => `translate(${d.x}, ${d.y}) rotate(${d.rotate})`)
            .text(d => d.text)
            .on('mouseout', () => {
                this.tooltip.style('display', "none");
            })
            .on('mouseover', (event, d) => {
                this.tooltip.transition()
                    .duration(200)
                    .style('opacity', 0.9);
                this.tooltip.html(`Word: ${d.text}<br>Count: ${d.count}<br>Click to see more`)
                    .style('left', `${event.pageX}px`)
                    .style('top', `${event.pageY - 28}px`)
                    .style('display', "block");
            })
    }
}

export default WordCloud;