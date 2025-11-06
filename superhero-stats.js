function SuperheroRadarChart() {
    this.name = 'Superhero Radar Chart';
    this.id = 'superhero-radar-chart';

    this.loaded = false; // To track if data is loaded
    this.superheroNames = []; // Array to store superhero names
    this.selectedSuperhero1 = ''; // Store selected superhero from the first dropdown
    this.selectedSuperhero2 = ''; // Store selected superhero from the second dropdown

    // Stats categories to plot on the radar chart
    this.categories = ['Intelligence', 'Strength', 'Speed', 'Durability', 'Power', 'Combat'];

    // Preload the superhero data
    this.preload = function() {
        console.log("in superhero preload");
        var self = this;
        this.data = loadTable(
            './data/Superhero-stats/Superhero-stats.csv', 'csv', 'header',
            function(table) {
                self.loaded = true;
                self.superheroNames = table.getColumn('Name'); // Load superhero names into the array
            });
    }; // Source of data: https://www.kaggle.com/datasets/thec03u5/complete-superhero-dataset?resource=download&select=SuperheroDataset.csv

    this.setup = function() {
        console.log("in superhero setup");

        // Create dropdown for the first superhero selection
        this.dropdown1 = createSelect();
        this.dropdown1.position(366, 27); // Position within the first box
        this.dropdown1.option('Select first superhero');
        for (let i = 0; i < this.superheroNames.length; i++) {
            this.dropdown1.option(this.superheroNames[i]); // Populate dropdown with superhero names
        }

        // Create dropdown for the second superhero selection
        this.dropdown2 = createSelect();
        this.dropdown2.position(366, 268); // Position within the second box
        this.dropdown2.option('Select second superhero');
        for (let i = 0; i < this.superheroNames.length; i++) {
            this.dropdown2.option(this.superheroNames[i]); // Populate dropdown with superhero names
        }

        // Event listener for dropdown selections
        var self = this;
        this.dropdown1.changed(function() {
            self.selectedSuperhero1 = self.dropdown1.value(); // Update selected superhero
            self.drawRadarChart(); // Redraw the radar chart
        });
        this.dropdown2.changed(function() {
            self.selectedSuperhero2 = self.dropdown2.value(); // Update selected superhero
            self.drawRadarChart(); // Redraw the radar chart
        });

        textSize(16); // Set text size for drawing text
    };

    // Draw function to handle the overall drawing on the canvas
    this.draw = function() {
        background(255); // Clear background to white

        // Draw superhero details boxes with selected dropdown values
        this.drawSuperheroDetailsBox(this.selectedSuperhero1, null, color(245, 209, 152), 50, 10);
        this.drawSuperheroDetailsBox(this.selectedSuperhero2, null, color(152, 209, 245), 50, 250);

        // Check if any superhero is selected, then draw the radar chart
        if ((this.selectedSuperhero1 !== '' && this.selectedSuperhero1 !== 'Select first superhero') ||
            (this.selectedSuperhero2 !== '' && this.selectedSuperhero2 !== 'Select second superhero')) {
            this.drawRadarChart();
        }
    };

    // Function to draw the radar chart based on selected superheroes
    this.drawRadarChart = function() {
        let superhero1Stats = null; // Stats for first superhero
        let superhero2Stats = null; // Stats for second superhero

        // Details about the first superhero
        let superhero1Details = {
            'Full name': '-',
            'Alignment': '-',
            'Gender': '-',
            'Height': '-',
            'Weight': '-',
            'Eye color': '-',
            'Hair color': '-'
        };

        // Details about the second superhero
        let superhero2Details = {
            'Full name': '-',
            'Alignment': '-',
            'Gender': '-',
            'Height': '-',
            'Weight': '-',
            'Eye color': '-',
            'Hair color': '-'
        };

        // Retrieve stats and details if the first superhero is selected
        if (this.selectedSuperhero1 !== '' && this.selectedSuperhero1 !== 'Select first superhero') {
            let row1 = this.data.findRow(this.selectedSuperhero1, 'Name');
            superhero1Stats = this.categories.map(cat => row1.getNum(cat)); // Get stats for radar chart
            superhero1Details = {
                'Full name': row1.getString('Full name'),
                'Alignment': row1.getString('Alignment'),
                'Gender': row1.getString('Gender'),
                'Height': row1.getString('Height'),
                'Weight': row1.getString('Weight'),
                'Eye color': row1.getString('Eye color'),
                'Hair color': row1.getString('Hair color')
            };
        }

        // Retrieve stats and details if the second superhero is selected
        if (this.selectedSuperhero2 !== '' && this.selectedSuperhero2 !== 'Select second superhero') {
            let row2 = this.data.findRow(this.selectedSuperhero2, 'Name');
            superhero2Stats = this.categories.map(cat => row2.getNum(cat)); // Get stats for radar chart
            superhero2Details = {
                'Full name': row2.getString('Full name'),
                'Alignment': row2.getString('Alignment'),
                'Gender': row2.getString('Gender'),
                'Height': row2.getString('Height'),
                'Weight': row2.getString('Weight'),
                'Eye color': row2.getString('Eye color'),
                'Hair color': row2.getString('Hair color')
            };
        }

        // Draw superhero details boxes with updated details
        this.drawSuperheroDetailsBox(this.selectedSuperhero1, superhero1Details, color(245, 209, 152), 50, 10);
        this.drawSuperheroDetailsBox(this.selectedSuperhero2, superhero2Details, color(152, 209, 245), 50, 250);

        // Radar chart configuration
        let maxStat = 100; // Maximum value for each stat is 100
        let radius = min(width, height) / 3; // Radius of the radar chart
        let angleStep = TWO_PI / this.categories.length; // Angle between each axis

        translate(width / 2 + 200, height / 2); // Adjust chart position

        // Draw radar chart axes and labels
        stroke(0);
        for (let i = 0; i < this.categories.length; i++) {
            let angle = i * angleStep;
            let x = cos(angle) * radius;
            let y = sin(angle) * radius;
            noStroke();
            fill(0);
            textAlign(CENTER, CENTER);
            text(this.categories[i], x * 1.3, y * 1.3); // Place labels slightly outside the chart
        }

        // Function to draw radar polygon and ellipses representing percentage increments
        const drawRadarPolygon = (stats, fillColor) => {
            if (!stats) return;

            fill(fillColor);
            beginShape();
            for (let i = 0; i < stats.length; i++) {
                let angle = i * angleStep;
                let statRadius = map(stats[i], 0, maxStat, 0, radius); // Map stat value to radius
                let x = cos(angle) * statRadius;
                let y = sin(angle) * statRadius;
                vertex(x, y);
            }
            endShape(CLOSE);

            // Draw ellipses representing percentage increments on the radar chart
            stroke(179, 177, 177);
            strokeWeight(1);
            noFill();
            for (let i = 0; i < 5; i++) {
                let ellipseRadius = (radius / 5) * (i + 1);
                ellipse(0, 0, ellipseRadius * 2, ellipseRadius * 2);
            }
        };

        // Draw first superhero's radar chart
        drawRadarPolygon(superhero1Stats, color(245, 209, 152, 160));

        // Draw second superhero's radar chart
        drawRadarPolygon(superhero2Stats, color(152, 209, 245, 160));
    };

    // Function to draw the details box for each superhero
    this.drawSuperheroDetailsBox = function(dropdownValue, details, fillColor, x, y) {
        fill(fillColor);
        rect(x, y, 360, 180, 10); // Draw box with rounded corners

        fill(0);
        textAlign(LEFT, TOP);
        textSize(12);
        let offset = 40;

        // Default details if no superhero is selected
        if (!details) {
            details = {
                'Full name': '-',
                'Alignment': '-',
                'Gender': '-',
                'Height': '-',
                'Weight': '-',
                'Eye color': '-',
                'Hair color': '-'
            };
        }

        // Display each detail in the box
        for (let key in details) {
            text(`${key}: ${details[key]}`, x + 10, y + offset);
            offset += 20;
        }
    };

    // Destroy function to remove dropdowns when not needed
    this.destroy = function() {
    if (this.dropdown1) {
        this.dropdown1.remove(); // Remove first dropdown
    }
    if (this.dropdown2) {
        this.dropdown2.remove(); // Remove second dropdown
    }

    // Clear selected superheroes
    this.selectedSuperhero1 = '';
    this.selectedSuperhero2 = '';

    // Clear any existing radar chart or details
    clear();
    };

}
