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