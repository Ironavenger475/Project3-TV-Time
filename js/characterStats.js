class CharacterStats {
    constructor(data) {
        this.data = data; // Accept data directly as a parameter
    }

    // Detect the default character (first character found)
    detectDefaultCharacter() {
        const first = this.data.find(row => row.character);
        return first ? first.character.trim() : "N/A";
    }

    // Calculates stats for a given character
    getCharacterStats(characterName) {
        const seasonSet = new Set();
        const episodeSet = new Set(); // Set to track unique season-episode combinations
        let dialogueCount = 0;

        this.data.forEach(row => {
            if (row.character?.trim().toLowerCase() === characterName.toLowerCase()) {
                const season = parseInt(row.season, 10);
                const episode = parseInt(row.episode, 10);

                // Merge season and episode into a unique number (e.g., S1E1 becomes '11')
                const uniqueEpisode = `${season}${episode}`;

                // Add unique season to the set (only if season is a valid number)
                if (!isNaN(season)) {
                    seasonSet.add(season); // Track unique seasons
                }

                // Add unique episode to the set (only if episode is a valid number)
                if (!isNaN(episode)) {
                    episodeSet.add(uniqueEpisode); // Track unique season-episode combinations
                }

                if (row.text) {
                    dialogueCount ++;  // Count words in dialogue
                }
            }
        });

        return {
            totalSeasons: seasonSet.size,  // Number of unique seasons
            totalEpisodes: episodeSet.size, // Number of unique episodes
            totalDialogue: dialogueCount // Total amount of dialogue (in words)
        };
    }

    // Inserts the stats into the DOM
    displayCharacterStats(container, stats, characterName) {
        const statsBox = document.createElement('div');
        statsBox.style.marginTop = '10px';
        statsBox.style.fontSize = '14px';
        statsBox.style.lineHeight = '1.6';

        const charTitle = document.createElement('strong');
        charTitle.textContent = `Stats for: ${characterName}`;
        statsBox.appendChild(charTitle);

        const seasonInfo = document.createElement('div');
        seasonInfo.textContent = `Seasons Appeared: ${stats.totalSeasons}`;
        statsBox.appendChild(seasonInfo);

        const episodeInfo = document.createElement('div');
        episodeInfo.textContent = `Episodes Appeared: ${stats.totalEpisodes}`;
        statsBox.appendChild(episodeInfo);

        const dialogueInfo = document.createElement('div');
        dialogueInfo.textContent = `Total Dialogue: ${stats.totalDialogue} lines`;
        statsBox.appendChild(dialogueInfo);

        container.appendChild(statsBox);
    }

    // Method to process character data and display the stats
    processCharacterData(container, characterName) {
        const stats = this.getCharacterStats(characterName);
        this.displayCharacterStats(container, stats, characterName);
    }
}

export default CharacterStats;