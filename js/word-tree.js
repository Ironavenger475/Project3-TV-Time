import SentenceTrie from "./sentence-trie.js";

class WordTree {
    constructor(container, word, data) {
        this.container = d3.select(container);
        this.word = word.toLowerCase();
        this.data = this.processData(data);
        this.hoverRadius = 75;
        this.render();
    }

    processData(data) {
        // Filter and process data as needed
        let processedData = new SentenceTrie(this.word);
        data.forEach(row => {
            const text = row.text.toLowerCase().split(/[ \n]/).join(" ");
            // Check if the exact word is present in the text 
            // (split) makes sure plural versions are not included
            // (ex. "word" will not match "words")
            if(!text
                .replace(/[\.!?]+/g, ' ')
                .split(' ')
                .includes(this.word)) {
                return; // do not process this row
            }
        
            // remove all text before this word (including this word)
            const textStartingWithWord = text.slice(text.indexOf(this.word) + this.word.length);
            // get just the word's sentence (check for . ? ! " but ignore ...)
            const textEndingWithPeriod = textStartingWithWord.split(/[\.\?\!\"]/).filter(d => d.trim() !== "")[0];
            if(!textEndingWithPeriod) { // if this word is the last word at the end of a sentence
                return; // stop processing this row
            }
            // remove all special characters except '
            const textWithoutMostSpecialCharacters = textEndingWithPeriod.replace(/[^a-zA-Z\s']/g, ' ');
            // remove all extra spaces
            const cleanedText = textWithoutMostSpecialCharacters.split(" ")
                .map(t => t.replace(/\s/g, ""))
                .filter(t => t !== "")
                .join(" ");
            
            /*console.log(
                "og:",text+"\n",
                "word start:",textStartingWithWord+"\n",
                "no periods:",textEndingWithPeriod+"\n",
                "no spec:",textWithoutMostSpecialCharacters+"\n",
                "clean:",cleanedText)*/

            // Update the tree structure
            processedData.insert(cleanedText, row.speaker);
            processedData.root.addSpeaker(row.speaker);
            processedData.root.weight++;
        });
        // Convert the SentenceTrie structure into a hierarchy compatible with d3
        const convertToHierarchy = (node) => {
            return {
                word: node.word,
                speakers: node.speakers,
                children: Array.from(node.children.values()).map(convertToHierarchy)
            };
        };

        // remove any children with a weight of 1, recursively, if two children in a row have a weight of 1, remove the second
        const removeSingleWeightChildren = (node) => {
            if (node.children) {
                let previousChildHadWeightOne = false;
                node.children = node.children.filter(child => {
                    if (child.weight > 1) {
                        removeSingleWeightChildren(child);
                        previousChildHadWeightOne = false;
                        return true;
                    } else if (!previousChildHadWeightOne) {
                        previousChildHadWeightOne = true;
                        return true;
                    }
                    previousChildHadWeightOne = false;
                    return false;
                });
            }
        };
        const convertedData = convertToHierarchy(processedData.root)
        removeSingleWeightChildren(convertedData);
        console.log(convertedData);
        return convertedData;
    }

    render() {
        // Create a d3 tree layout
        const treeLayout = d3.tree()
            .size([800, 800]) // Increased size to prevent cutting off the sides
            .nodeSize([50, 50]);

        const root = d3.hierarchy(this.data, d => d.children);

        // Apply the tree layout to the hierarchy
        const treeData = treeLayout(root);

        // Calculate the bounding box of the tree
        const nodes = treeData.descendants();
        const xExtent = d3.extent(nodes, d => d.x);
        const yExtent = d3.extent(nodes, d => d.y);

        const width = yExtent[1] - yExtent[0] + 200; // Add padding
        const height = xExtent[1] - xExtent[0] + 200; // Add padding

        // Create a color legend for speakers
        const speakers = Object.keys(this.data.speakers);
        const colorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(speakers);

        // Create an SVG container
        const svg = this.container.append("svg")
            .attr("width", width)
            .attr("height", height)
            .style("overflow", "visible")
            .append("g")
            .attr("transform", `translate(${Math.abs(yExtent[0]) + 100},${Math.abs(xExtent[0]) + 100})`); // Center the tree

        // Add links between nodes
        const link = svg.selectAll(".link")
            .data(treeData.links())
            .enter().append("path")
            .attr("class", "link")
            .attr("d", d3.linkHorizontal()
                .x(d => d.y)
                .y(d => d.x))
            .style("stroke", "#999") // Set line color
            .style("stroke-width", "2px"); // Set line thickness

        // Add nodes
        const node = svg.selectAll(".node")
            .data(treeData.descendants())
            .enter().append("g")
            .attr("class", "node")
            .attr("transform", d => `translate(${d.y},${d.x})`);

        const pieChartRadius = this.hoverRadius; // Default radius for pie charts

        node.append("g")
            .each(function(d) {
                const nodeGroup = d3.select(this);
                const radius = 5;

                // Create a pie chart for all nodes, even single-speaker ones
                const pie = d3.pie().value(([_, weight]) => weight);
                const arc = d3.arc()
                    .innerRadius(0)
                    .outerRadius(radius);

                const speakers = Object.keys(d.data.speakers).length > 0 ? d.data.speakers : { "unknown": 1 };
                const pieData = pie(Object.entries(speakers));

                nodeGroup.selectAll("path")
                    .data(pieData)
                    .enter()
                    .append("path")
                    .attr("d", arc)
                    .style("fill", d => colorScale(d.data[0]));
            });

        // Make piecharts bigger on mouseover to see pie chart info
        node.on("mouseover", function(event, d) {
            const nodeGroup = d3.select(this);

            // Bring the node to the front by increasing z-index
            nodeGroup.raise();

            // Increase the size of the node or pie chart
            const pie = d3.pie().value(([_, weight]) => weight);
            const arc = d3.arc()
                .innerRadius(0)
                .outerRadius(pieChartRadius);

            nodeGroup.selectAll("path")
                .data(pie(Object.entries(d.data.speakers)))
                .transition()
                .duration(200)
                .attr("d", arc); // Apply the expanded arc

            // Move the word label above the node and center it
            nodeGroup.select("text")
                .transition()
                .duration(200)
                .attr("y", -pieChartRadius - 10) // Position above the node with padding
                .attr("x", 0) // Center the label
                .style("font-weight", "bold")
                .style("text-anchor", "middle") // Ensure text is centered
                .style("text-shadow", "1px 1px 2px white, -1px -1px 2px white"); // Add white dropshadow

            // Add labels for the pie chart
            const pieData = Object.entries(d.data.speakers);

            const pieLabels = nodeGroup.selectAll(".pie-label")
                .data(pie(pieData))
                .enter()
                .append("text")
                .attr("class", "pie-label")
                .attr("transform", d => {
                    const [x, y] = arc.centroid(d);
                    return `translate(${x/1.2},${y/1.2})`;
                })
                .attr("dy", "0.35em")
                .style("text-anchor", "middle")
                .style("font-size", "10px")
                .text(d => d.data[1])
                .style("pointer-events", "none"); // Prevent labels from interfering with mouseover
        })
        .on("mouseout", function(event, d) {
            const nodeGroup = d3.select(this);

            // Reset the size of the node or pie chart
            const radius = 5;
            const pie = d3.pie().value(([_, weight]) => weight);
            const arc = d3.arc()
                .innerRadius(0)
                .outerRadius(radius); // Reset to original radius

            nodeGroup.selectAll("path")
                .data(pie(Object.entries(d.data.speakers)))
                .transition()
                .duration(200)
                .attr("d", arc); // Apply the collapsed arc

            // Reset the word label position
            nodeGroup.select("text")
                .transition()
                .duration(200)
                .attr("y", 3) // Reset to default position
                .attr("x", 0) // Reset to centered position
                .style("text-anchor", "start") // Reset to default alignment
                .style("font-weight", "normal")
                .style("text-shadow", "none"); // Remove dropshadow

            // Remove pie chart labels
            nodeGroup.selectAll(".pie-label").remove();
        });

        node.append("text")
            .attr("dy", 3)
            .attr("x", d => d.children ? -10 : 10)
            .style("text-anchor", d => d.children ? "end" : "start")
            .text(d => d.data.word);

        // Add legend for speakers
        const legend = svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${width-75},${-height/2 - 50})`); // Adjusted to top-right corner at the top

        speakers.forEach((speaker, i) => {
            const legendRow = legend.append("g")
                .attr("transform", `translate(0, ${i * 20})`);

            legendRow.append("rect")
                .attr("width", 10)
                .attr("height", 10)
                .style("fill", colorScale(speaker));

            legendRow.append("text")
                .attr("x", 15)
                .attr("y", 10)
                .text(speaker)
                .style("text-anchor", "start")
                .style("font-size", "12px");
        });
    }
}

export default WordTree;