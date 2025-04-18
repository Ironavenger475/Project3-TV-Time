class WeightedNode {
    constructor(word, root = this) {
        this.root = root;
        this.word = word;
        this.children = [];
    }

    addChild(node) {
        // Check if the child node already exists in entire tree recursively
        const findChildren = (node, word) => {
            for (let child of node.children) {
                if (child.node.word === word) {
                    return child.node;
                }
                const foundChild = findChildren(child.node);
                if (foundChild) {
                    return foundChild;
                }
            }
            return null;
        };

        const existingChild = findChildren(this, this.word);

        if (existingChild) {
            // If it exists, increment the weight
            existingChild.weight++;
        }
        // If it doesn't exist, add it to the children array
        else {
            const weight = 1; // Initialize weight to 1 for new child
            this.children.push({ node, weight });
        }
    }
}

class WordTree {
    constructor(container, word, data) {
        this.container = d3.select(container);
        this.word = word.toLowerCase();
        this.data = this.processData(data);
        this.render();
    }

    processData(data) {
        // Filter and process data as needed
        let processedData = new WeightedNode(this.word);
        data.forEach(row => {
            const cleanedText = row.text.toLowerCase().toLowerCase().split(/[ \n]/).map(d => d.replace(/[^a-z']/g, ''));
            // Check if the word is present in the text
            if(!cleanedText.includes(this.word)) {
                return; // do not process this row
            }
            
            // remove all text before this word (including this word)
            const textStartingWithWord = cleanedText.slice(cleanedText.indexOf(this.word) + 1);

            // Update the tree structure
            let previousObject = processedData;
            // Iterate through the words after the target word
            textStartingWithWord.forEach(word => {
                if (word && word !== this.word) {
                    const childNode = new WeightedNode(word);
                    previousObject.addChild(childNode);
                    previousObject = childNode; // Move to the new child node
                }
            });
            
        });
        // remove any children with a weight of 1, recursively
        const removeSingleWeightChildren = (node) => {
            node.children = node.children.filter(child => child.weight > 1);
            node.children.forEach(child => removeSingleWeightChildren(child.node));
        };
        //removeSingleWeightChildren(processedData);
        console.log(processedData);
        return processedData;
    }

    render() {
        // Create a d3 tree layout
        const treeLayout = d3.tree()
            .size([800, 800]) // Increased size to prevent cutting off the sides
            .nodeSize([50, 50]);

        // Convert the WeightedNode structure into a hierarchy compatible with d3
        const root = d3.hierarchy(this.data, d => d.children.map(child => child.node));

        // Apply the tree layout to the hierarchy
        const treeData = treeLayout(root);

        // Create an SVG container
        const svg = this.container.append("svg")
            .attr("width", 1000) // Increased width
            .attr("height", 1000) // Increased height
            .style("overflow", "visible") // Remove clipping by setting overflow to visible
            .append("g")
            .attr("transform", "translate(100,100)"); // Adjusted translation for better centering

        // Add links between nodes
        const link = svg.selectAll(".link")
            .data(treeData.links())
            .enter().append("path")
            .attr("class", "link")
            .attr("d", d3.linkHorizontal()
                .x(d => d.y)
                .y(d => d.x));

        // Add nodes
        const node = svg.selectAll(".node")
            .data(treeData.descendants())
            .enter().append("g")
            .attr("class", "node")
            .attr("transform", d => `translate(${d.y},${d.x})`);

        node.append("circle")
            .attr("r", 5);

        node.append("text")
            .attr("dy", 3)
            .attr("x", d => d.children ? -10 : 10)
            .style("text-anchor", d => d.children ? "end" : "start")
            .text(d => d.data.word);
    }
}

export default WordTree;