export class Timeline {
    constructor(containerId, totalEpisodes = 61, episodesPerSeason = 16) {
      this.containerId = containerId;
      this.totalEpisodes = totalEpisodes;
      this.episodesPerSeason = episodesPerSeason;
      this.episodeData = this.generateEpisodes();
      this.selectedRange = [];
      this.dragging = false;
      this.startIndex = null;
      this.endIndex = null;
  
      this.renderTimeline();
    }
  
    generateEpisodes() {
      const episodes = [];
      for (let i = 0; i < this.totalEpisodes; i++) {
        const season = Math.floor(i / this.episodesPerSeason) + 1;
        const episode = (i % this.episodesPerSeason) + 1;
        episodes.push({ id: i, season, episode, label: `S${season}E${episode}` });
      }
      return episodes;
    }
  
    renderTimeline() {
      const container = document.getElementById(this.containerId);
      container.innerHTML = '';
  
      const svg = d3.select(container)
        .append('svg')
        .attr('width', '100%')
        .attr('height', 60);
  
      const width = container.offsetWidth;
      const boxWidth = width / this.totalEpisodes;
  
      const g = svg.append('g')
        .attr('transform', 'translate(0, 10)');
  
      const episodeBoxes = g.selectAll('rect')
        .data(this.episodeData)
        .enter()
        .append('rect')
        .attr('x', (d, i) => i * boxWidth)
        .attr('y', 0)
        .attr('width', boxWidth - 2)
        .attr('height', 30)
        .attr('fill', '#ccc')
        .attr('stroke', '#666')
        .on('mousedown', (event, d) => this.startSelection(d.id))
        .on('mouseenter', (event, d) => this.dragSelection(d.id))
        .on('mouseup', () => this.endSelection());
  
      g.selectAll('text')
        .data(this.episodeData)
        .enter()
        .append('text')
        .attr('x', (d, i) => i * boxWidth + boxWidth / 2)
        .attr('y', 50)
        .attr('text-anchor', 'middle')
        .attr('font-size', '10px')
        .text(d => d.label);
    }
  
    startSelection(index) {
      this.dragging = true;
      this.startIndex = index;
      this.endIndex = index;
      this.updateSelection();
    }
  
    dragSelection(index) {
      if (this.dragging) {
        this.endIndex = index;
        this.updateSelection();
      }
    }
  
    endSelection() {
      if (!this.dragging) return;
      this.dragging = false;
      const [start, end] = [this.startIndex, this.endIndex].sort((a, b) => a - b);
      this.selectedRange = this.episodeData.slice(start, end + 1);
      this.logSelectedRange();
    }
  
    updateSelection() {
      const [start, end] = [this.startIndex, this.endIndex].sort((a, b) => a - b);
      const container = document.getElementById(this.containerId);
      const boxes = d3.select(container).selectAll('rect');
      boxes.attr('fill', (d, i) => (i >= start && i <= end) ? '#88f' : '#ccc');
    }
  
    logSelectedRange() {
      console.clear();
      console.log(`Selected Episodes (${this.selectedRange.length}):`);
      this.selectedRange.forEach(ep => {
        console.log(`${ep.label}`);
      });
    }
  } 
