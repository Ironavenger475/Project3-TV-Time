function initializeFilter(characters, onToggleSelect) {
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

    renderCheckboxes(filtered);
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

  function renderCheckboxes(characters) {
    charname.innerHTML = "";
    characters.forEach(char => {
      const container = document.createElement("div");
      container.className = "char-button";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.dataset.character = char.character;
      checkbox.addEventListener("change", (e) => {
        onToggleSelect(char.character, e.target.checked);
      });

      const img = document.createElement("img");
      preloadImage(`./image/pfp/${char.character.toLowerCase()}.png`, finalSrc => {
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

      container.appendChild(checkbox);
      container.appendChild(img);
      container.appendChild(span);

      charname.appendChild(container);
    });
  }

  searchBar.addEventListener("input", filterAndRender);
  sectionFilter.addEventListener("change", filterAndRender);
  sortBy.addEventListener("change", filterAndRender);

  filterAndRender();
}