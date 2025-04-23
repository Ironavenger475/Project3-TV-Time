class CharMap {
  constructor(svgSelector) {
    this.svg = d3.select(svgSelector);
    this.tooltip1 = d3.select("body")
      .append("div")
      .attr("id", "tooltip1")
      .style("position", "absolute")
      .style("background", "#fff")
      .style("border", "1px solid #ccc")
      .style("padding", "5px 10px")
      .style("border-radius", "5px")
      .style("pointer-events", "none")
      .style("display", "none")
      .style("font-family", "sans-serif")
      .style("font-size", "12px")
      .style("box-shadow", "0 0 5px rgba(0,0,0,0.2)");

    this.imagePath = "image/DemonSlayerFanArt3.jpg";
    this.width = 736;
    this.height = 531;

    this.points = [
      { id: "p1", name: "Mount Kumotori", x: 30, y: 100, fp: "Episode 1" },
      { id: "p2", name: "Mount Sagiri", x: 240, y: 125, fp: "Episode" },
      { id: "p3", name: "Mount Fujikasane", x: 270, y: 240, fp: "Episode" },
      { id: "p4", name: "Northwest Town", x: 280, y: 135, fp: "Episode" },
      { id: "p5", name: "Asakusa", x: 415, y: 305, fp: "Episode" },
      { id: "p6", name: "Tsuzumi Mansion", x: 150, y: 160, fp: "Episode" },
      { id: "p7", name: "Mount Natagumo", x: 330, y: 220, fp: "Episode" },
      { id: "U", name: "Ubuyashiki Mansion", x: 410, y: 250, fp: "Episode" },
      { id: "B", name: "Butterfly Mansion", x: 480, y: 180, fp: "Episode" },
      { id: "p8", name: "Mugen Train (Wreckage)", x: 390, y: 195, fp: "Episode" },
      { id: "p9", name: "Yoshiwara District", x: 560, y: 230, fp: "Episode" },
      { id: "p10", name: "Swordsmith Village", x: 610, y: 300, fp: "Episode" },
      { id: "p11", name: "Hashira Training", x: 460, y: 232, fp: "Episode" },
      { id: "I", name: "Infinity Castle", x: 600, y: 470, fp: "Episode" }
    ];
    this.labelGroup = this.svg.append("g").attr("id", "label-group");
    this.initMap();
    this.drawPoints();
    this.labelGroup.raise();
    this.drawLabels();

    this.csvCache = null; // for caching CSV
  }

  initMap() {
    this.svg.append("image")
      .attr("xlink:href", this.imagePath)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .attr("viewBox", `0 0 ${this.width} ${this.height}`)
      .style("width", "100%")
      .style("height", "100%");
  
    }

  drawPoints() {
    this.svg.selectAll("circle")
      .data(this.points)
      .enter()
      .append("circle")
      .attr("class", "point-circle")
      .attr("cx", d => d.x)
      .attr("cy", d => d.y)
      .attr("r", 3)
      .attr("fill", "#DC143C")
      .attr("stroke", "black")
      .attr("stroke-width", 1.5)
      .on("mouseover", (event, d) => {
        this.tooltip1.style("display", "block")
          .html(`<strong>First Appearance: ${d.fp}</strong>`)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY) + "px");
      })
      .on("mouseout", () => {
        this.tooltip1.style("display", "none");
      });
  }

  drawLabels() {
    this.labelGroup.selectAll("text")
      .data(this.points)
      .enter()
      .append("text")
      .attr("class", "point-label")
      .attr("x", d => d.x + 5)
      .attr("y", d => d.y - 5)
      .text(d => d.name)
      .style('font-size', '10px')
      .style('font-weight', 'bold')
      .each(function () {
        d3.select(this).raise(); // move each label to top
      });
  }

  moveCharacter(characterName) {
    const nameLower = characterName.charAt(0).toUpperCase() + characterName.slice(1).toLowerCase();

    const processData = (csvData) => {
      const formatted = csvData.map(row => {
          const newRow = {};
          for (const key in row) {
              newRow[key.toLowerCase()] = row[key];
          }
          return newRow;
      });
  
      const characterData = formatted.find(d => d.speaker === nameLower);
      if (!characterData) 
      {
        console.log("Not Working");
        console.log(nameLower)
        return; }

      // Get visited point IDs
      const visitedPointIds = Object.keys(characterData)
        .filter(key => key !== "speaker" && characterData[key] === "1");

      const visitedPoints = visitedPointIds
        .map(id => this.points.find(p => p.id.toLowerCase() === id))
        .filter(Boolean);

      if (visitedPoints.length === 0) return;

      // Remove previous trail and image
      this.svg.select("#character-image").remove();
      this.svg.select("#movement-trail").remove();
      this.svg.select("#character-circle").remove();
      // Draw trail
      this.svg.selectAll(".trail-segment").remove();

// Define some distinct colors
const segmentColors = ["#e6194b", "#3cb44b", "#ffe119", "#4363d8", "#f58231", "#911eb4", "#46f0f0", "#f032e6", "#bcf60c", "#fabebe"];

// Draw individual segments
for (let i = 0; i < visitedPoints.length - 1; i++) {
  const start = visitedPoints[i];
  const end = visitedPoints[i + 1];
  const color = segmentColors[i % segmentColors.length];

  this.svg.append("line")
    .attr("class", "trail-segment")
    .attr("x1", start.x)
    .attr("y1", start.y)
    .attr("x2", end.x)
    .attr("y2", end.y)
    .attr("stroke", color)
    .attr("stroke-width", 2)
    .attr("stroke-dasharray", "4 2");
}
this.drawLabels();
      // Add character image if exists
      const imgPath = `charimages/${nameLower}.png`;
const self = this; // capture correct `this` context
let characterNode;

// Animate function if image is available
const animateImage = () => {
  const clipCircle = this.svg.select("#clip-circle");
  let i = 1;

  const moveNext = () => {
    if (i >= visitedPoints.length) return;

    characterNode.transition()
      .duration(1200)
      .attr("x", visitedPoints[i].x - 25)
      .attr("y", visitedPoints[i].y - 25)
      .on("end", () => {
        i++;
        moveNext();
      });
  };

  moveNext();
};
this.labelGroup.raise();
// Try to load image
const img = this.svg.append("image")
  .attr("id", "character-image")
  .attr("class", "char-imgs")
  .attr("xlink:href", imgPath)
  .attr("x", visitedPoints[0].x - 25)
  .attr("y", visitedPoints[0].y - 25)
  .attr("width", 50)
  .attr("height", 50)
  .on("error", function () {
    console.warn("Image not found, using fallback circle");

    d3.select(this).remove();

    // Add fallback circle instead of image
    characterNode = self.svg.append("circle")
      .attr("id", "character-circle")
      .attr("cx", visitedPoints[0].x)
      .attr("cy", visitedPoints[0].y)
      .attr("r", 10)
      .attr("fill", "blue")
      .attr("opacity", 0.5);

    // Animate fallback circle
    let i = 1;
    const moveNext = () => {
      if (i >= visitedPoints.length) return;
      characterNode.transition()
        .duration(2000)
        .attr("cx", visitedPoints[i].x)
        .attr("cy", visitedPoints[i].y)
        .on("end", () => {
          i++;
          moveNext();
        });
    };
    moveNext();
  })
  .on("load", function () {
    characterNode = d3.select(this);
    animateImage();
  });
    };
    if (this.csvCache) {
      processData(this.csvCache);
    } else {
      d3.csv("data/maptravel.csv").then(data => {
        this.csvCache = data;
        processData(data);
        console.log(data);
      });
    }
  }
}

export default CharMap;