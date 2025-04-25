class PieChart {
    constructor(container, data) {
        this.container = container;
        this.data = data;
        this.processedData = this.processData();
        this.init();
    }

    processData() {
        const counts = {
            Thought: 0,
            Spoken: 0
        };

        this.data.forEach(row => {
            const preface = row.preface?.trim().toLowerCase();
            if (preface === 'thoughts') {
                counts.Thought += 1;
            } else {
                counts.Spoken += 1;
            }
        });

        const total = counts.Thought + counts.Spoken;

        return [
            { label: "Thought", value: counts.Thought, percent: (counts.Thought / total) * 100 },
            { label: "Spoken", value: counts.Spoken, percent: (counts.Spoken / total) * 100 }
        ];
    }

    init() {
        const width = 300;
        const height = 300;
        const radius = Math.min(width, height) / 2;

        // Title
        const title = document.createElement('h3');
        title.textContent = 'Time Spent in Thought vs Spoken';
        title.style.color = '#d6b479';
        title.style.marginBottom = '10px';
        this.container.appendChild(title);

        // Wrapper
        const wrapper = document.createElement('div');
        wrapper.style.display = 'flex';
        wrapper.style.alignItems = 'center';
        this.container.appendChild(wrapper);

        // Tooltip
        const tooltip = document.createElement('div');
        tooltip.style.position = 'absolute';
        tooltip.style.background = 'rgba(0,0,0,0.7)';
        tooltip.style.color = '#fff';
        tooltip.style.padding = '5px 8px';
        tooltip.style.borderRadius = '4px';
        tooltip.style.pointerEvents = 'none';
        tooltip.style.fontSize = '13px';
        tooltip.style.display = 'none';
        document.body.appendChild(tooltip);

        // SVG
        const svg = d3.select(wrapper)
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", `translate(${width / 2}, ${height / 2})`);

        const color = d3.scaleOrdinal()
            .domain(this.processedData.map(d => d.label))
            .range(["#f39c12", "#3498db"]);

        const pie = d3.pie().value(d => d.value);
        const arc = d3.arc().innerRadius(0).outerRadius(radius);

        const arcs = svg.selectAll("arc")
            .data(pie(this.processedData))
            .enter()
            .append("g");

        arcs.append("path")
            .attr("d", arc)
            .attr("fill", d => color(d.data.label))
            .on("mouseover", function (event, d) {
                tooltip.style.display = 'block';
                tooltip.innerHTML = `Lines: ${d.data.value}<br>Percent: ${d.data.percent.toFixed(1)}%`;
                d3.select(this)
                    .attr("stroke", "black")
                    .attr("stroke-width", 2);
            })
            .on("mousemove", (event) => {
                tooltip.style.left = event.pageX + 10 + "px";
                tooltip.style.top = event.pageY + 10 + "px";
            })
            .on("mouseout", function () {
                tooltip.style.display = 'none';
                d3.select(this)
                    .attr("stroke", null)
                    .attr("stroke-width", null);
            });

        arcs.append("text")
            .attr("transform", d => `translate(${arc.centroid(d)})`)
            .attr("text-anchor", "middle")
            .attr("font-size", "14px")
            .attr("fill", "#fff")
            .text(d => `${d.data.percent.toFixed(1)}%`)
            .style("z-index", 2000);

        // Legend
        const legendContainer = document.createElement('div');
        legendContainer.style.marginLeft = '20px';
        wrapper.appendChild(legendContainer);

        this.processedData.forEach(d => {
            const item = document.createElement('div');
            item.style.display = 'flex';
            item.style.alignItems = 'center';
            item.style.marginBottom = '6px';

            const colorBox = document.createElement('div');
            colorBox.style.width = '16px';
            colorBox.style.height = '16px';
            colorBox.style.backgroundColor = color(d.label);
            colorBox.style.marginRight = '8px';

            const label = document.createElement('span');
            label.textContent = d.label;

            item.appendChild(colorBox);
            item.appendChild(label);
            legendContainer.appendChild(item);
        });
    }
}

export default PieChart;
