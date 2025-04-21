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
        { id: "p1", name: "Mount Kumotori", x: 30, y: 100 },
        { id: "p2", name: "Mount Sagiri", x: 240, y: 125 },
        { id: "p3", name: "Mount Fujikasane", x: 270, y: 240 },
        { id: "p4", name: "Asakusa", x: 415, y: 305 },
        { id: "p5", name: "Tsuzumi Mansion", x: 150, y: 160 },
        { id: "p6", name: "Mount Natagumo", x: 330, y: 220 },
        { id: "U", name: "Ubuyashiki Mansion", x: 410, y: 250 },
        { id: "B", name: "Butterfly Mansion", x: 480, y: 180 },
        { id: "p7", name: "Mugen Train (Wreckage)", x: 390, y: 195 },
        { id: "p8", name: "Yoshiwara District", x: 560, y: 230 },
        { id: "p9", name: "Swordsmith Village", x: 610, y: 300 },
        { id: "p10", name: "Hashira Training", x: 460, y: 232 },
        { id: "I", name: "Infinity Castle", x: 600, y: 470 }
      ];
  
      this.initMap();
      this.drawPoints();
      this.drawLabels();
    }
  
    initMap() {
      this.svg.append("image")
        .attr("xlink:href", 'image/DemonSlayerFanArt3.jpg')
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
        .attr("r", 6)
        .attr("fill","#DC143C")
        .attr("stroke","black")
        .attr("stroke-width",1.5)
        .on("mouseover", (event, d) => {
          this.tooltip1.style("display", "block")
            .html(`<strong>${d.name}</strong>`)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 20) + "px");
        })
        .on("mouseout", () => {
          this.tooltip1.style("display", "none");
        });
    }
  
    drawLabels() {
      this.svg.selectAll("text")
        .data(this.points)
        .enter()
        .append("text")
        .attr("class", "point-label")
        .attr("x", d => d.x + 8)
        .attr("y", d => d.y - 8)
        .text(d => d.id);
    }
  }
  
  export default CharMap;
