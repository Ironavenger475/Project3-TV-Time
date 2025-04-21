function initializeFilter(characters) {
  const charname = document.getElementById("charname");
  const searchBar = document.getElementById("searchBar");
  const sectionFilter = document.getElementById("sectionFilter");
  const sortBy = document.getElementById("sortBy");

  function filterAndRender() {
    const searchTerm = searchBar.value.toLowerCase();
    const section = sectionFilter.value;
    const sortValue = sortBy.value;

    let filtered = characters.filter(char => {
      const name = char.character.toLowerCase();
      const startsWith = char.character.charAt(0).toUpperCase();

      const matchesSearch = name.includes(searchTerm);
      const matchesSection =
        section === "all" ||
        (section === "A-M" && startsWith >= "A" && startsWith <= "M") ||
        (section === "N-Z" && startsWith >= "N" && startsWith <= "Z");

      return matchesSearch && matchesSection;
    });

    switch (sortValue) {
      case "name-asc":
        filtered.sort((a, b) => a.character.localeCompare(b.character));
        break;
      case "name-desc":
        filtered.sort((a, b) => b.character.localeCompare(a.character));
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
      button.className = "char-button";

      const img = document.createElement("img");
      img.src = `${char.character}.png`;
      img.alt = `${char.character} image`;
      img.className = "char-img";

      const span = document.createElement("span");
      span.textContent = char.character;
      span.className = "char-name";

      button.appendChild(img);
      button.appendChild(span);
      charname.appendChild(button);
    });
  }

  // Setup listeners
  searchBar.addEventListener("input", filterAndRender);
  sectionFilter.addEventListener("change", filterAndRender);
  sortBy.addEventListener("change", filterAndRender);

  // Initial render
  filterAndRender();
}
