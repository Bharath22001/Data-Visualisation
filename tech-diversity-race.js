function TechDiversityRace() {
    // Name for the visualisation to appear in the menu bar.
    this.name = 'Tech Diversity: Race';

    // Each visualisation must have a unique ID with no special
    // characters.
    this.id = 'tech-diversity-race';

    // Property to represent whether data has been loaded.
    this.loaded = false;

    // Preload the data. This function is called automatically by the
    // gallery when a visualisation is added.
    this.preload = function() {
        var self = this;
        this.data = loadTable(
            './data/tech-diversity/race-2018.csv', 'csv', 'header',
            function(table) {
                self.loaded = true;
            });
    };

    this.setup = function() {

        // Create a select DOM element.
        this.select = createSelect();
        this.select.position(350, 40);

        // Fill the options with all company names.
        var companies = this.data.columns;
        // First entry is empty.
        for (let i = 1; i < companies.length; i++) {
            this.select.option(companies[i]);
        }

        // Initialize the combined chart.
        this.combinedChart = new CombinedChart(50, height * 0.8, width - 100, height * 0.3);

        // Calculate averages for line chart.
        this.calculateAverages();
    };

    this.destroy = function() {
        this.select.remove();
    };

    // Create a new pie chart object.
    this.pie = new PieChart(width / 2, height * 0.4, width * 0.3);

    this.draw = function() {

        // Get the value of the company we're interested in from the
        // select item.
        var companyName = this.select.value();

        // Get the column of raw data for companyName.
        var col = this.data.getColumn(companyName);

        // Convert all data strings to numbers.
        col = stringsToNumbers(col);

        // Copy the row labels from the table (the first item of each row).
        var labels = this.data.getColumn(0);

        // Colour to use for each category.
        var colours = ['blue', 'red', 'green', 'pink', 'purple', 'yellow'];

        // Make a title.
        var title = 'Employee diversity at ' + companyName;

        // Draw the pie chart!
        this.pie.draw(col, labels, colours, title);

        // Draw the combined chart.
        this.combinedChart.draw(col, this.averages, labels, colours);
    };

    this.calculateAverages = function() {
        let numCompanies = this.data.getColumnCount() - 1;
        let numEthnicities = this.data.getRowCount();
        this.averages = new Array(numEthnicities).fill(0);

        for (let i = 1; i <= numCompanies; i++) {
            let col = this.data.getColumn(i);
            col = stringsToNumbers(col);
            for (let j = 0; j < numEthnicities; j++) {
                this.averages[j] += col[j];
            }
        }

        for (let j = 0; j < numEthnicities; j++) {
            this.averages[j] /= numCompanies;
        }
    };
}

class CombinedChart {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }

    draw(columnValues, lineValues, labels, colours) {
        let numBars = columnValues.length;
        let barWidth = this.w / numBars;

        // Draw the bars
        for (let i = 0; i < numBars; i++) {
            let barHeight = map(columnValues[i], 0, 100, 0, this.h);
            fill(colours[i]);
            rect(this.x + i * barWidth, this.y - barHeight, barWidth, barHeight);

            // Draw labels
            fill(0);
            textAlign('center', 'top');
            text(labels[i], this.x + i * barWidth + barWidth / 2, this.y + 5);
        }

        // Draw the line
        noFill();
        stroke(0);
        beginShape();
        for (let i = 0; i < lineValues.length; i++) {
            let y = map(lineValues[i], 0, 100, this.y, this.y - this.h);
            vertex(this.x + i * barWidth + barWidth / 2, y);
        }
        endShape();

        // Draw points on the line
        for (let i = 0; i < lineValues.length; i++) {
            let y = map(lineValues[i], 0, 100, this.y, this.y - this.h);
            fill(0);
            ellipse(this.x + i * barWidth + barWidth / 2, y, 5, 5);
        }
        
        // Draw the legend for the line 'Avg'
        this.drawLegend();
    }
    
     drawLegend() {
        let legendX = this.x + this.w - 258; // Positioning the legend on the right side
        let legendY = this.y - this.h + 16; // Positioning the legend above the chart
        let legendWidth = 14;
        let legendHeight = 10;

        fill(0); // Line color
        rect(legendX, legendY, legendWidth, legendHeight);

        fill(0);
        textSize(12); // Set the text size to 12
        textAlign(LEFT, CENTER);
        text('Avg', legendX + legendWidth + 10, legendY + legendHeight / 2);
     }
}
