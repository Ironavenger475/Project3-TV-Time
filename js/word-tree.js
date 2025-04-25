import SentenceTrie from "./sentence-trie.js";

class WordTree {
    constructor(popup, container, word, data) {
        this.popup = popup
        this.container = container;
        this.word = word.toLowerCase();
        this.data = this.processData(data);
        this.hoverRadius = 75;
        this.render();
    }

    processData(data) {
        // Filter and process data as needed
        let processedData = new SentenceTrie(this.word, data);

        // remove all weight 1 children of root if there's a lot of branches
        if(processedData.root.children > 10){
            processedData.removeLowWeightChildren();
        }
        processedData.concatSentenceChains();

        // Convert the SentenceTrie structure into a hierarchy compatible with d3
        const convertToHierarchy = (node) => {
            return {
                word: node.word,
                depth: node.depth,
                weight: node.weight,
                speakers: node.speakers,
                children: Array.from(node.children.values()).map(convertToHierarchy)
            };
        };
        const convertedData = convertToHierarchy(processedData.root)
        //console.log(convertedData);
        return convertedData;
    }

    render() {// Create a d3 tree layout
        // Calculate max text width per depth level
        const calculateMaxWidthPerDepth = (node, depth = 0, maxWidths = {}) => {
            const nodeWidth = this.measureTextWidth(node.word);
            maxWidths[depth] = Math.max(maxWidths[depth] || 0, nodeWidth);
            
            if (node.children) {
                node.children.forEach(child => 
                    calculateMaxWidthPerDepth(child, depth + 1, maxWidths));
            }
            return maxWidths;
        };
    
        const maxWidths = calculateMaxWidthPerDepth(this.data);
        const maxTotalWidth = Object.values(maxWidths).reduce((a, b) => a + b, 0);
    
        // Create tree layout with adjusted spacing
        const treeLayout = d3.tree()
            .size([ 800 + maxTotalWidth, 800])
            .nodeSize([28, 5]);
    
        const root = d3.hierarchy(this.data, d => d.children);
        const treeData = treeLayout(root);

        // Calculate the bounding box of the tree
        const nodes = treeData.descendants();
        nodes.forEach(function(d) {
            // Control vertical spacing between parent and children
            if (d.depth > 0) {
                const verticalSpacing = maxWidths[d.depth - 1];
                d.y += verticalSpacing;
            }
        });
        const xExtent = d3.extent(nodes, d => d.x);
        const yExtent = d3.extent(nodes, d => d.y);

        const width = maxTotalWidth + 200; // Add padding
        const height = xExtent[1] - xExtent[0] + 200; // Add padding

        // Create a color legend for speakers
        const speakers = Object.keys(this.data.speakers);
        const colorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(speakers);

        // Create an SVG container
        const svg = this.container.append("svg")
            .attr("width", width)
            .attr("height", height)
            .style("overflow", "visible")
            .style("position", "absolute")
            .style("left", maxWidths[0] - 10 + "px")
            .append("g")
            .attr("transform", `translate(${Math.abs(yExtent[0]) + 50},${Math.abs(xExtent[0]) + 100})`); // Center the tree

        // Add links between nodes
        const link = svg.selectAll(".link")
            .data(treeData.links())
            .enter().append("path")
            .attr("class", "link")
            .attr("fill", "none")
            .attr("d", d3.linkHorizontal()
                .x(d => d.y)
                .y(d => d.x))
            .style("stroke", "dimgrey") // Set line color
            .style("opacity", ".2") // Set line color
            .style("stroke-width", "2px"); // Set line thickness

        // Add nodes
        const node = svg.selectAll(".node")
            .data(treeData.descendants())
            .enter().append("g")
            .attr("class", "node")
            .attr("transform", d => `translate(${d.y},${d.x})`);

        const pieChartRadius = this.hoverRadius; // Default radius for pie charts

        const pieDots = node.append("g")
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
        pieDots.on("mouseover", function(event, d) {
            const nodeGroup = d3.select(this.parentNode);

            // Bring the node to the front by increasing z-index
            nodeGroup.raise();
            d3.select(this).raise();

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
                .style("text-shadow", "0 0 5px 2px white"); // Add white dropshadow

            // Add labels for the pie chart
            const pieData = Object.entries(d.data.speakers);

            const pieLabels = nodeGroup.selectAll(".pie-label")
                .data(pie(pieData))
                .enter()
                .append("text")
                .attr("transform", d=>{
                    if(!d.expanded){
                        d.expanded = true
                        return `translate(0,0)`
                    }
                    let [x, y] = arc.centroid(d);
                    if(x < .00001 & x > -.0001){ // only 1
                        y = -20;
                    }
                    return `translate(${x*1.75},${y*1.75})`;
                })
                .transition()
                .duration(200)
                .attr("class", "pie-label")
                .attr("transform", d => {
                    let [x, y] = arc.centroid(d);
                    if(x < .00001 & x > -.0001){ // only 1
                        y = -20;
                    }
                    return `translate(${x*1.75},${y*1.75})`;
                })
                .attr("dy", "0.35em")
                .style("text-anchor", "middle")
                .style("font-size", "10px")
                .text(d => d.data[1])
                .style("pointer-events", "none"); // Prevent labels from interfering with mouseover
        })
        .on("mouseout", function(event, d) {
            const nodeGroup = d3.select(this.parentNode);

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
                .attr("x", d => d.children ? -10 : 10)
                .style("text-anchor", "start") // Reset to default alignment
                .style("font-weight", "normal")
                .style("text-shadow", "none") // Remove dropshadow
                .attr("transform", "unset")

            // Remove pie chart labels
            nodeGroup.selectAll(".pie-label").remove();
        });

        node.append("text")
            .attr("dy", 3)
            .attr("x", d => d.children ? -10 : 10)
            .style("text-anchor", d => d.children ? "end" : "start")
            .text(d => d.data.word);

        // Add legend for speakers
        const legendContainer = this.popup.append("svg")
            .attr("class", "legend")
            .style("position", "absolute")
            .style("top", "65px")
            .style("right", "-225px");
        const legend = legendContainer.append("g")
            .attr("class", "legend");

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

        //scroll to center
        this.scrollToNode();
    }

    // add a dummy svg with the text ele to the dom to calculate
    // width
    measureTextWidth(text) {
        const svg = d3.create("svg")
        document.body.appendChild(svg.node());

        const ele = svg.append("text")
            .text(text);
        const length = ele.node().getComputedTextLength();

        document.body.removeChild(svg.node());
        return length + 25; //add padding
    }
    
    
    scrollToNode() {
        const container = this.container;
        const svg = d3.select('svg');
        
        // Find the node matching this.word
        const targetNode = svg.selectAll('.node')
            .filter(d => d.data.word.toLowerCase() === this.word.toLowerCase());
            
        if (targetNode.empty()) {
            console.warn(`No node found matching word: ${this.word}`);
            return;
        }
        
        // Get the dimensions of the container and SVG
        const containerRect = container.node().getBoundingClientRect();
        const containerCenterX = containerRect.width / 2;
        const containerCenterY = containerRect.height / 2;
        
        // Get the text element position
        const textElement = targetNode.select('text');
        const nodeRect = textElement.node().getBoundingClientRect();
        
        // Calculate the target position for the node
        const targetX = nodeRect.left + nodeRect.width / 2;
        const targetY = nodeRect.top + nodeRect.height / 2;
        
        // Get the current transformation matrix
        const currentTransform = d3.transform(svg.attr('transform'));
        const currentX = currentTransform.translate[0];
        const currentY = currentTransform.translate[1];
        
        // Calculate the new translation needed to center the node
        const newX = -(targetX - containerCenterX);
        const newY = -(targetY - containerCenterY);
        
        // Animate the transition smoothly
        svg.transition()
            .duration(750)
            .attr('transform', `translate(${newX},${newY})`);
    }
}

export default WordTree;
