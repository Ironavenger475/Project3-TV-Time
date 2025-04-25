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
    constructor(word, data) {
        this.root = new TrieNode(word);

        // convert raw data to a trie!
        data.forEach(row => {
            const text = row.text.toLowerCase().split(/[ \n]/).join(" ");
            // Check if the exact word is present in the text 
            // (split) makes sure plural versions are not included
            // (ex. "word" will not match "words")
            if(!text
                .replace(/[\.!?]+/g, ' ')
                .split(' ')
                .includes(word)) {
                return; // do not process this row
            }
        
            // remove all text before this word (including this word)
            const textStartingWithWord = text.slice(text.indexOf(word) + word.length);
            // get just the word's sentence (check for . ? ! " but ignore ...)
            const textEndingWithPeriod = textStartingWithWord.split(/[\.\?\!\"]/).filter(d => d.trim() !== "")[0];
            if(!textEndingWithPeriod) { // if this word is the last word at the end of a sentence
                return; // stop processing this row
            }
            // remove all special characters except '
            const textWithoutMostSpecialCharacters = textEndingWithPeriod.replace(/[^a-zA-Z’\s']/g, ' ');
            // remove all extra spaces
            const cleanedText = textWithoutMostSpecialCharacters.split(" ")
                .map(t => t.replace(/\s/g, ""))
                .filter(t => t !== "")
                .join(" ");

            // Update the tree structure
            this.insert(cleanedText, row.speaker);
            this.root.addSpeaker(row.speaker);
            this.root.weight++;
        });
    }

    concatSentenceChains(){
        // if a node has <1 child, concat all it's younger kin 
        // if they are the same weight
        const processChildren = (node) => {
            if(node.children.size <= 1){
                // weight 1 means only 1 child for each node
                const childrenToConcat = [node.word];
                let child = node.children.entries().next().value;
                while(child){
                    // make sure added child is same weight as parent
                    if(node.weight == child[1].weight){
                        childrenToConcat.push(child[1].word)
                        node.children.delete(child[0]); // remove child
                    }
                    child = child[1].children.entries().next()?.value;
                }

                // concatttt
                node.word = childrenToConcat.join(" ");
            }

            // Recursively process remaining children
            for (const child of node.children.values()) {
                processChildren(child);
            }
        };

        for (const child of this.root.children.values()) {
            processChildren(child);
        }
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