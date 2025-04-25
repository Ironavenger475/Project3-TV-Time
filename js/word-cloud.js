import WordTree from './word-tree.js';
import stopWords from './stop-words.js';

const cloud = d3Cloud;

// add capitalize function to string objects for my sanity
Object.defineProperty(String.prototype, 'capitalize', {
    value: function() {
        return this.charAt(0).toUpperCase() + this.slice(1);
    },
    enumerable: false
});

class WordCloud {
    constructor(parentDiv, data) {
        this.maxWordCount = 1000; // Maximum number of words to display
        this.parentDiv = d3.select(parentDiv);
        this.fullData = data; // Store the full data for later use
        this.data = this.processData(data); // Process data to calculate word counts

        // Create a new div for the word cloud
        this.wordCloudDiv = this.parentDiv.append('div')
            .attr('id', 'word-cloud')
            .style('width', '100%')
            .style('height', '100%');
        
        this.tooltip = d3.select('body').append('div');
        this.tooltip.attr("class", 'tooltip');
        this.popupCount = 0;
        this.maxPopupCount = 3; // Maximum number of popups allowed

        // Initialize the word cloud
        this.init();
    }

    processData(data) {
        const wordCounts = {};

        // Iterate through the data and count words in the 'text' field
        data.forEach(row => {
            if (row.text) {
                const words = row.text.toLowerCase().split(/\s+/); // Split text into words
                words.forEach(word => {
                    const cleanedWord = String(word).replace(/[^a-z’]/g, ''); // Clean word
                    if (cleanedWord && !stopWords.includes(cleanedWord)) {
                        wordCounts[cleanedWord] = (wordCounts[cleanedWord] || 0) + 1;
                    }
                });
            }
        });
        
        // only keep the top 25 words
        const sortedWordCounts = Object.entries(wordCounts).sort((a, b) => b[1] - a[1]);
        const topWordCounts = sortedWordCounts.slice(0, this.maxWordCount);

        // Convert wordCounts object into an array of { text, count } objects
        return topWordCounts.map(([text, count]) => ({
            text: text.capitalize(),
            count
        }));
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
            .on('mouseover', (event, d) => {
                this.tooltip.html(`Word: ${d.text}<br>Count: ${d.count}<br>Click to see more`)
                    .style('left', `${event.pageX}px`)
                    .style('top', `${event.pageY - 28}px`)
                    .style('display', "block");
            })
            .on('mousemove', (event, d) => {
                this.tooltip.transition()
                    .duration(200)
                    .style('opacity', 0.9);
                this.tooltip.html(`Word: ${d.text}<br>Count: ${d.count}<br>Click to see more`)
                    .style('left', `${event.pageX + 10}px`)
                    .style('top', `${event.pageY + 10}px`)
                    .style('display', "block");
            })
            .on('mouseout', () => {
                this.tooltip.style('display', "none");
            })
            .on('click', (event, d) => {
                this.createPopup(d.text);
            });
    }

    createPopup(word) {
        if (this.popupCount >= this.maxPopupCount) {
            alert("Maximum number of word tree popups reached. Please close some to open new ones.");
            return;
        }
        this.popupCount++;
        // Create a popup div
        const popup = d3.select('body').append('div')
        .attr('class', 'popup')
        .style('position', 'absolute')
        .style('left', `${this.popupCount * 50}px`)
        .style('top', `${this.popupCount * 50}px`)
        .style('width', '500px')
        .style('height', '80vh')
        .style('margin','0')
        .style('padding', '0')
        .style('background', '#fff')
        .style('border', '1px solid #ccc')
        .style('box-shadow', '0 4px 8px rgba(0, 0, 0, 0.2)')
        .style('z-index', 2);

        // Add header container for fixed elements
        const header = popup.append('div')
        .style('position', 'relative')
        .style('height', '50px')
        .style('border-bottom', '1px solid #ccc');

        // Add close button inside header
        header.append('button')
        .html('<i class="bi bi-x-lg"></i>')
        .style('position', 'absolute')
        .style('background', 'none')
        .style('border', 'none')
        .style('font-size', '25px')
        .style('top', '15px')
        .style('right', '15px')
        .on('click', () => {
            this.popupCount--;
            popup.remove();
        });

        // Add title inside header// Add title inside header
        const title = header.append("div")
        .style("margin", "0")
        .style("display","flex")
        .style("justify-content","center")
        .style("align-items","center");

        title.append('p').text("word trie for ").style("margin-right","5px");
        title.append('h3').text(` ${word.capitalize()}`);

        // Add info icon with tooltip using Bootstrap Icons
        const info = title.append('i')
            .attr('class', 'bi bi-info-circle-fill')
            .style('color', '#666')
            .style('margin-left', '5px')
            .style('cursor', 'help');

        const trieInfo = "A trie is a special type of weighted tree that represents several sentences at once.<br> It is commonly used in autocomplete to guess the next most used word.<br> Here it shows how common words are in the transcript."
        const tooltip = this.tooltip
        info.on('mouseover', function(event) {
            tooltip.html(trieInfo)
                .style('left', `${event.pageX}px`)
                .style('top', `${event.pageY - 28}px`)
                .style('display', "block");
        })
        .on('mousemove', function(event) {
            tooltip.html(trieInfo)
                .style('left', `${event.pageX}px`)
                .style('top', `${event.pageY - 28}px`)
                .style('display', "block");
        })
        .on('mouseout', function() {
            tooltip.style('display', "none");
        });

        const treeContainer = popup.append('div')
        .attr('class', 'tree-container')
        .style('overflow-y', 'auto')
        .style('height', 'calc(100% - 60px)')
        .style('padding', '10px');

        // Render the tree using the WordTree class
        new WordTree(treeContainer.node(), word, this.fullData);

        // Make the popup draggable
        this.makeDraggable(popup.node());
    }

    makeDraggable(element) {
        let offsetX, offsetY;
        element.addEventListener('mousedown', (event) => {
            offsetX = event.clientX - element.offsetLeft;
            offsetY = event.clientY - element.offsetTop;
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });

        function onMouseMove(event) {
            element.style.left = `${event.clientX - offsetX}px`;
            element.style.top = `${event.clientY - offsetY}px`;
        }

        function onMouseUp() {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        }
    }
}

export default WordCloud;