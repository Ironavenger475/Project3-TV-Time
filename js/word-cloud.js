const cloud = d3Cloud;

class WordCloud {
    constructor(parentDiv, data) {
        this.parentDiv = d3.select(parentDiv);
        this.data = data;

        // Create a new div for the word cloud
        this.wordCloudDiv = this.parentDiv.append('div')
            .attr('id', 'word-cloud')
            .style('width', '100%')
            .style('height', '100%');

        // Initialize the word cloud
        this.init();
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
            .domain(d3.extent(this.data, d => d.value))
            .range([10, 50]); // Adjust font size range as needed

        // Create a D3 cloud layout
        const layout = cloud()
            .size([width, height])
            .words(this.data.map(d => ({ text: d.text, size: fontSizeScale(d.value) })))
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
            .text(d => d.text);
    }
}

export default WordCloud;