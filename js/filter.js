  document.addEventListener("DOMContentLoaded", function () {
    const charname = document.getElementById("charname");
    const searchBar = document.getElementById("searchBar");
    const sectionFilter = document.getElementById("sectionFilter");
    const sortBy = document.getElementById("sortBy");

    let characters = [];

    d3.csv("data/charcount.csv", d => ({
      speaker: d.speaker,
      count: +d.count
    })).then(data => {
      characters = data.filter(d => d.count > 20);
      filterAndRender();
    });

    function filterAndRender() {
      const searchTerm = searchBar.value.toLowerCase();
      const section = sectionFilter.value;
      const sortValue = sortBy.value;

      let filtered = characters.filter(char => {
        const name = char.speaker.toLowerCase();
        const startsWith = char.speaker.charAt(0).toUpperCase();

        const matchesSearch = name.includes(searchTerm);
        const matchesSection =
          section === "all" ||
          (section === "A-M" && startsWith >= "A" && startsWith <= "M") ||
          (section === "N-Z" && startsWith >= "N" && startsWith <= "Z");

        return matchesSearch && matchesSection;
      });

      // Sort logic
      switch (sortValue) {
        case "name-asc":
          filtered.sort((a, b) => a.speaker.localeCompare(b.speaker));
          break;
        case "name-desc":
          filtered.sort((a, b) => b.speaker.localeCompare(a.speaker));
          break;
        case "count-asc":
          filtered.sort((a, b) => a.count - b.count);
          break;
        case "count-desc":
          filtered.sort((a, b) => b.count - a.count);
          break;
      }

      renderButtons(filtered);
    }

    function renderButtons(characters) {
      charname.innerHTML = "";
      characters.forEach(char => {
        const button = document.createElement("button");
        button.textContent = `${char.speaker}`;
        button.className = "char-button";
        charname.appendChild(button);
      });
    }

    // Event listeners
    searchBar.addEventListener("input", filterAndRender);
    sectionFilter.addEventListener("change", filterAndRender);
    sortBy.addEventListener("change", filterAndRender);
  });

