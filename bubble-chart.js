function BabyNamesBubbleChart() {
    // Set chart title and unique identifier
    this.name = 'Most Popular Baby Names By Gender (2000-2022)';
    this.id = 'baby-names-bubble-chart';

    this.loaded = false; // Flag to indicate data loading status
    this.year = 2022; // Default year to display

    // Array to store the bubble data for the chart
    this.bubbles = [];

    // Variable to store the year slider element
    this.yearSlider;

    // Function to preload the data from a CSV file
    this.preload = function() {
        var self = this; // Reference to the current object
        this.data = loadTable(
            './data/Baby-names/Popular baby names(2000-2022).csv', 'csv', 'header',
            function(table) {
                self.loaded = true; // Set loaded flag to true when data is loaded
            });
    }; //source: https://data.chhs.ca.gov/dataset/most-popular-baby-names-2005-current/resource/f3fe42ed-4441-4fd8-bf53-92fb80a246da

    // Function to set up the chart and UI elements
    this.setup = function() {
        // Create and position the year slider at bottom left of canvas
        this.yearSlider = createSlider(2000, 2022, 2022);
        this.yearSlider.position(50, height + 30); // Position bottom left of canvas
        this.yearSlider.style('width', '200px'); // Set slider width

        // Set text properties for the chart
        textSize(16);
        textAlign(CENTER, CENTER);
        noLoop(); // Prevent draw() from looping automatically
    };

    // Function to draw the chart based on the current year selected
    this.draw = function() {
        // Regenerate bubbles if none exist or if the year has changed
        if (this.bubbles.length === 0 || this.year !== this.yearSlider.value()) {
            this.year = this.yearSlider.value();
            this.generateBubbles();
        }

        // Create a text element to display the slider value
        if (!this.sliderValueText) {
            this.sliderValueText = createDiv('');
            this.sliderValueText.position(this.yearSlider.x + this.yearSlider.width + 10, this.yearSlider.y);
            this.sliderValueText.style('font-size', '20px');
        }

        // Update the slider value text with the current year
        this.sliderValueText.html(this.yearSlider.value());

        // Draw the bubble chart
        this.drawBubbleChart();
    };

    // Function to generate bubbles for the chart based on the selected year
    this.generateBubbles = function() {
        // Filter rows of data for the selected year
        let namesData = this.data.findRows(String(this.year), 'Year');

        // Filtered dataset already contains top 10 names for each gender
        let topNames = namesData.filter(row => row.get('Rank') <= 10);

        // Determine the max and min counts of names for scaling bubble sizes
        let maxCount = max(topNames.map(row => int(row.get('Count'))));
        let minCount = min(topNames.map(row => int(row.get('Count'))));

        // Generate bubble objects for each name
        this.bubbles = [];
        for (let i = 0; i < topNames.length; i++) {
            let row = topNames[i];
            let sex = row.get('Sex');
            let name = row.get('Name');
            let count = int(row.get('Count'));

            // Calculate bubble size based on the count of names
            let maxSize = min(width, height);
            let size = map(count, minCount, maxCount, 60, maxSize / 3.5);

            // Determine color based on gender
            let fillColor = (sex === 'Male') ? color(99, 156, 247) : color(255, 0, 127, 127);

            // Attempt to place bubble in an empty space without overlap
            let attempts = 0;
            let placed = false;
            while (!placed && attempts < 100) {
                let x = random(size / 2, width - size / 2);
                let y = random(size / 2, height - size / 2);
                let valid = true;

                // Check for collision with existing bubbles
                for (let j = 0; j < this.bubbles.length; j++) {
                    let other = this.bubbles[j];
                    let d = dist(x, y, other.x, other.y);
                    if (d < size / 2 + other.size / 2) {
                        valid = false; // If collision is detected, set valid to false
                        break;
                    }
                }

                // If a valid position is found, add the bubble to the array
                if (valid) {
                    this.bubbles.push({ x: x, y: y, size: size, fillColor: fillColor, name: name, count: count });
                    placed = true; // Mark bubble as placed
                }

                attempts++; // Increment the number of attempts to place the bubble
            }
        }
    };

    // Function to draw the bubble chart on the canvas
    this.drawBubbleChart = function() {
        background(255); // Clear the background to white

        // Draw each bubble
        for (let i = 0; i < this.bubbles.length; i++) {
            let bubble = this.bubbles[i];
            fill(bubble.fillColor); // Set bubble color
            ellipse(bubble.x, bubble.y, bubble.size, bubble.size); // Draw bubble as a circle
            fill(0); // Set text color to black
            textSize(12); // Set text size for names
            text(bubble.name, bubble.x, bubble.y); // Draw name in the center of the bubble
        }

        // Display count on hover over a bubble
        for (let i = 0; i < this.bubbles.length; i++) {
            let bubble = this.bubbles[i];
            let d = dist(mouseX, mouseY, bubble.x, bubble.y);

            if (d < bubble.size / 2) { // Check if the mouse is over the bubble
                fill(255); // Set fill color for tooltip
                stroke(0); // Set stroke color for tooltip
                rect(mouseX, mouseY - 30, 60, 20); // Draw rectangle for tooltip
                noStroke(); // Remove stroke
                fill(0); // Set text color for tooltip
                textAlign(CENTER, CENTER);
                text(bubble.count, mouseX + 30, mouseY - 20); // Display the count in the tooltip
                break; // Only display one count at a time
            }
        }
    };

    // Function to clean up and remove UI elements when the chart is destroyed
    this.destroy = function() {
        if (this.yearSlider) {
            this.yearSlider.remove(); // Remove the year slider from the DOM
            if (this.sliderValueText) {
                this.sliderValueText.remove(); // Remove the slider value text from the DOM
                this.sliderValueText = null; // Clear the reference to the slider value text
            }
        }
    };
}
