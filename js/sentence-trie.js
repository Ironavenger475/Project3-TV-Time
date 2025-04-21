class TrieNode {
    constructor(word, speaker = null) {
        this.word = word;
        this.weight = 0;
        this.children = new Map();
        this.speakers = {}; // Use an object to track speaker weights
        if (speaker) {
            this.addSpeaker(speaker);
        }
    }

    addSpeaker(speaker) {
        if (this.speakers[speaker]) {
            this.speakers[speaker]++;
        } else {
            this.speakers[speaker] = 1;
        }
    }
}

class SentenceTrie {
    constructor(word) {
        this.root = new TrieNode(word);
    }

    removeLowWeightChildren() {
        const childrenToRemove = [];
        
        // First pass: identify nodes to remove
        for (const [key, child] of this.root.children) {
            if (child.weight <= 1) {
                childrenToRemove.push(key);
            }
        }
        
        // Second pass: safely remove identified nodes
        for (const key of childrenToRemove) {
            this.root.children.delete(key);
        }

        // if a node has a weight <1, remove all it's weight <1 children
        const processChildren = (node) => {
            if(node.weight <= 1){
                // First pass: identify nodes to remove
                const childrenToRemove = [];
                for (const [key, child] of node.children) {
                    if (child.weight <= 1) {
                        childrenToRemove.push(key);
                    }
                }
            
                // Second pass: safely remove identified nodes
                for (const key of childrenToRemove) {
                    node.children.delete(key);
                }
                
                // Recursively process remaining children
                for (const child of node.children.values()) {
                    processChildren(child);
                }
            }
        };

        // skip the already cleaned direct descendants of root
        for (const child of this.root.children.values()) {
            processChildren(child);
        }
    }

    insert(sentence, speaker) {
        let node = this.root;
        const words = sentence.split(" ");

        for (const word of words) {
            if (!node.children.has(word)) {
                node.children.set(word, new TrieNode(word));
            }
            node = node.children.get(word);
            node.weight++;
            node.addSpeaker(speaker); // Use addSpeaker to track speaker weights
        }
        node.isEndOfSentence = true;
    }

    search(sentence) {
        let node = this.root;
        const words = sentence.split(" ");

        for (const word of words) {
            if (!node.children.has(word)) {
                return false;
            }
            node = node.children.get(word);
        }
        return node.isEndOfSentence;
    }
}

export default SentenceTrie;