class CharacterStats {
    constructor(data) {
        this.data = data;
    }

    // Detect the default character (first character found)
    detectDefaultCharacter() {
        const first = this.data.find(row => row.character);
        return first ? first.character.trim() : "N/A";
    }

    // Get stats for a single character
    getCharacterStats(characterName) {
        const seasonSet = new Set();
        const episodeSet = new Set();
        let dialogueCount = 0;

        this.data.forEach(row => {
            if (row.character?.trim().toLowerCase() === characterName.toLowerCase()) {
                const season = parseInt(row.season, 10);
                const episode = parseInt(row.episode, 10);
                const uniqueEpisode = `${season}${episode}`;

                if (!isNaN(season)) seasonSet.add(season);
                if (!isNaN(episode)) episodeSet.add(uniqueEpisode);
                if (row.text) dialogueCount++;
            }
        });

        return {
            character: characterName,
            totalSeasons: seasonSet.size,
            totalEpisodes: episodeSet.size,
            totalDialogue: dialogueCount
        };
    }

    // Display stats for a single character
    displayCharacterStats(container, stats) {
        const statsBox = document.createElement('div');
        statsBox.style.marginTop = '10px';
        statsBox.style.fontSize = '14px';
        statsBox.style.lineHeight = '1.6';
        statsBox.style.border = '1px solid #ccc';
        statsBox.style.padding = '10px';
        statsBox.style.marginBottom = '10px';
        statsBox.style.borderRadius = '8px';

        const charTitle = document.createElement('strong');
        charTitle.textContent = `Stats for: ${stats.character}`;
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

        // Optional link
        const linkInfo = document.createElement('div');
        const anchor = document.createElement('a');
        anchor.href = `https://kimetsu-no-yaiba.fandom.com/wiki/Special:Search?query=${encodeURIComponent(stats.character)}&scope=internal`;
        anchor.textContent = `More Info on ${stats.character}`;
        anchor.target = "_blank";
        linkInfo.appendChild(anchor);
        statsBox.appendChild(linkInfo);

        container.appendChild(statsBox);
    }

    // Process multiple characters and display stats for each
    processCharacterData(container, characterNames) {
        container.innerHTML = ''; // Clear previous content
        characterNames.forEach(name => {
            const stats = this.getCharacterStats(name);
            this.displayCharacterStats(container, stats);
        });
    }
}

export default CharacterStats;