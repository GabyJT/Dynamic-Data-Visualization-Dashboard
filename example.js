// U54107257
document.addEventListener('DOMContentLoaded', () => {
    d3.csv('data/mock_stock_data.csv').then(data => {
        // Convert date strings to Date objects and values to numbers
        data.forEach(d => {
            d.date = new Date(d.date);
            d.value = +d.value;
        });

        // Function to filter data based on selected criteria
        function filterData(stockName, startDate, endDate) {
            return data.filter(d => {
                return d.stock === stockName && d.date >= startDate && d.date <= endDate;
            });
        }

        // Initialize visualization with default filter
        const initialData = filterData('AAPL', new Date('2023-01-01'), new Date('2024-12-31'));
        createVisualization(initialData);

        // Add event listener to filter button
        document.getElementById('filter-button').addEventListener('click', () => {
            const stockName = document.getElementById('stock-select').value;
            const startDate = new Date(document.getElementById('start-date').value);
            const endDate = new Date(document.getElementById('end-date').value);

            const filteredData = filterData(stockName, startDate, endDate);
            d3.select('#chart').selectAll('*').remove();
            createVisualization(filteredData);
        });
    }).catch(error => {
        console.error('Error loading the CSV file:', error);
    });
});

function createVisualization(data) {
    const margin = {top: 20, right: 30, bottom: 30, left: 40};
    const width = 600 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    // Set up the SVG element
    const svg = d3.select('#chart')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Set up scales and axes
    const x = d3.scaleTime()
        .domain(d3.extent(data, d => d.date))
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.value)])
        .nice()
        .range([height, 0]);

    const xAxis = d3.axisBottom(x);
    const yAxis = d3.axisLeft(y);

    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(xAxis);

    svg.append('g')
        .call(yAxis);

    // Add line
    const line = d3.line()
        .x(d => x(d.date))
        .y(d => y(d.value));

    svg.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', 'steelblue')
        .attr('stroke-width', 1.5)
        .attr('d', line);

    // Add tooltip
    const tooltip = d3.select('body').append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0);

    svg.selectAll('dot')
        .data(data)
        .enter().append('circle')
        .attr('r', 5)
        .attr('cx', d => x(d.date))
        .attr('cy', d => y(d.value))
        .on('mouseover', (event, d) => {
            tooltip.transition()
                .duration(200)
                .style('opacity', .9);
            tooltip.html(`Stock: ${d.stock}<br>Date: ${d.date.toLocaleDateString()}<br>Value: ${d.value}`)
                .style('left', (event.pageX + 5) + 'px')
                .style('top', (event.pageY - 28) + 'px');
        })
        .on('mouseout', (event, d) => {
            tooltip.transition()
                .duration(500)
                .style('opacity', 0);
        });
}
