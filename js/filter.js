function initializeFilter(characters, onCharacterSelect) {
  const charname = document.getElementById("charname");
  const searchBar = document.getElementById("searchBar");
  searchBar.style.borderRadius='10px';
  searchBar.style.borderStyle='initial';
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

  function checkImageExists(url, callback) {
    const img = new Image();
    img.onload = () => callback(true);
    img.onerror = () => callback(false);
    img.src = url;
  }

  function preloadImage(src, callback) {
    const img = new Image();
    img.onload = () => callback(src); // valid
    img.onerror = () => callback('image/default1.png'); // fallback
    img.src = src;
  }

  function renderButtons(characters) {
    charname.innerHTML = "";
    characters.forEach(char => {
      const button = document.createElement("button");
      button.className = "char-button";

      const img = document.createElement("img");
      preloadImage(`charimages/${char.character}.png`, finalSrc => {
  img.src = finalSrc;
});
      img.alt = `${char.character} image`;
      img.className = "char-img";
      img.onerror = function() {
      this.onerror = null; 
      this.src = 'image/default1.png'; 
    };

      const span = document.createElement("span");
      span.textContent = char.character;
      span.className = "char-name";

      button.appendChild(img);
      button.appendChild(span);
      button.addEventListener("click", () => {
        onCharacterSelect(char.character);
        console.log(char.character)
      });

      charname.appendChild(button);
    });
  }

  searchBar.addEventListener("input", filterAndRender);
  sectionFilter.addEventListener("change", filterAndRender);
  sortBy.addEventListener("change", filterAndRender);

  filterAndRender();
}
