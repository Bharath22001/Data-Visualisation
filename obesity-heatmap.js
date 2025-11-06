function ObesityHeatMap() {
    // Define the name and ID for the heatmap visualization
    this.name = 'Adult Obesity among US states; 2022';
    this.id = 'obesity-heatmap';
    this.legendContainer = null; // Placeholder for the legend container

    // Layout configuration for margins, plot area, and SVG dimensions
    this.layout = {
        leftMargin: 300,        // Margin from the left side of the window
        rightMargin: 800,       // Margin from the right side of the window
        topMargin: 50,          // Margin from the top of the window
        bottomMargin: 500,      // Margin from the bottom of the window
        svgWidth: 800,          // Width of the SVG element
        svgHeight: 600,         // Height of the SVG element
        plotWidth: 500,         // Calculated width of the plot area
        plotHeight: 450         // Calculated height of the plot area
    };

    // Preload function to load the CSV data before setup
    this.preload = function () {
        // Load the CSV data with obesity information by state
        this.data = loadTable(
            './data/USA Obesity/Obesity by state.csv', 'csv', 'header'
        );
    }; //source: https://www.kaggle.com/datasets/jblaks937gmailcom/national-obesity-by-state?resource=download

    // Setup function to create and configure the SVG container and elements
    this.setup = function () {
        textSize(16); // Set the default text size for labels and other text

        // Create a div to contain the SVG and position it based on layout
        const svgContainer = document.createElement('div');
        svgContainer.style.position = 'absolute';
        svgContainer.style.left = `${this.layout.leftMargin}px`;
        svgContainer.style.top = `${this.layout.topMargin}px`;
        svgContainer.style.width = `${this.layout.plotWidth}px`;
        svgContainer.style.height = `${this.layout.plotHeight}px`;

        // Fetch the blank US map SVG and embed it into the container
        fetch('./data/USA Obesity/Blank_US_Map.svg') //source: https://simplemaps.com/resources/svg-us
            .then(response => response.text())
            .then(svgText => {
                svgContainer.innerHTML = svgText;
                document.body.appendChild(svgContainer); // Add the container to the DOM

                // Adopt the SVG into a manageable format and set its dimensions
                this.svg = SVG.adopt(svgContainer.querySelector('svg'));
                this.svg.size(this.layout.svgWidth, this.layout.svgHeight);

                this.createLegend(); // Call function to create the legend
                this.drawHeatMap();  // Draw the heat map with initial data
            })
            .catch(error => console.error(error)); // Handle any errors in fetching the SVG
    };

    // Function to create a legend for filtering categories of BMI
    this.createLegend = function() {
        // If the legend container already exists, append it to the body
        if (this.legendContainer) {
            document.body.appendChild(this.legendContainer);
            return;
        }

        // Define categories with their respective labels and colors
        const categories = [
            { id: 'underweight', label: 'Underweight (≤ 18.5)', color: '#0000FF' },
            { id: 'healthy', label: 'Healthy weight (18.5 - 24.9)', color: '#00FF00' },
            { id: 'overweight', label: 'Overweight (25 - 29.9)', color: '#FF0000' },
            { id: 'obese', label: 'Obesity (≥ 30)', color: '#993232' }
        ];

        // Create a new div to hold the legend items
        this.legendContainer = document.createElement('div');
        this.legendContainer.style.position = 'absolute';
        this.legendContainer.style.left = `${this.layout.leftMargin + 20}px`;
        this.legendContainer.style.top = `${this.layout.topMargin - 20}px`;

        // Loop through each category and create a checkbox and label
        categories.forEach(category => {
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = true; // All categories are checked by default
            checkbox.dataset.category = category.id;
            checkbox.style.marginRight = '5px';

            const label = document.createElement('label');
            label.style.color = category.color; // Set label color to match category
            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(category.label));

            // Append the checkbox and label to the legend container
            this.legendContainer.appendChild(label);
            this.legendContainer.appendChild(document.createElement('br'));

            // Add event listener to update the map when checkbox state changes
            checkbox.addEventListener('change', () => this.updateMap());
        });

        // Append the completed legend container to the document body
        document.body.appendChild(this.legendContainer);
    };

    // Function to draw the heat map based on the loaded data
    this.drawHeatMap = function () {
        const states = this.data.getColumn('State'); // Get the list of states from the data
        const bmis = this.data.getColumn('Average BMI').map(Number); // Get BMI data and convert to numbers

        // Map of state names to their abbreviations for matching with SVG elements
        const stateAbbreviations = {
            'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR',
            'California': 'CA', 'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE',
            'District of Columbia': 'DC', 'Florida': 'FL', 'Georgia': 'GA', 'Hawaii': 'HI',
            'Idaho': 'ID', 'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA',
            'Kansas': 'KS', 'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME',
            'Maryland': 'MD', 'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN',
            'Mississippi': 'MS', 'Missouri': 'MO', 'Montana': 'MT', 'Nebraska': 'NE',
            'Nevada': 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM',
            'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH',
            'Oklahoma': 'OK', 'Oregon': 'OR', 'Pennsylvania': 'PA', 'Puerto Rico': 'PR',
            'Rhode Island': 'RI', 'South Carolina': 'SC', 'South Dakota': 'SD', 'Tennessee': 'TN',
            'Texas': 'TX', 'Utah': 'UT', 'Vermont': 'VT', 'Virginia': 'VA',
            'Washington': 'WA', 'West Virginia': 'WV', 'Wisconsin': 'WI', 'Wyoming': 'WY'
        };

        // Loop through each state and apply the corresponding BMI color
        states.forEach((stateName, i) => {
            const stateId = stateAbbreviations[stateName]; // Get state abbreviation
            const bmi = bmis[i]; // Get BMI for the current state
            const color = this.getColorByBMI(bmi); // Determine color based on BMI

            const stateElement = this.svg.findOne(`#${stateId}`); // Find the SVG element for the state

            if (stateElement) {
                const category = this.getBMICategory(bmi); // Get the BMI category
                const checkbox = document.querySelector(`input[data-category="${category}"]`);

                if (checkbox.checked) {
                    stateElement.node.removeAttribute('style'); // Clear any inline styles
                    stateElement.attr('fill', color); // Apply the appropriate fill color
                } else {
                    stateElement.attr('fill', '#ffffff'); // Set to white if category is unchecked
                }

                this.addStateLabel(stateElement, stateId); // Add state abbreviation as a label
            } else {
                console.log(`State element not found for ID: ${stateId}`); // Log error if state not found
            }
        });
    };

    // Function to add state abbreviation labels to the map
    this.addStateLabel = function (stateElement, abbreviation) {
        const bbox = stateElement.node.getBBox(); // Get bounding box of the state element
        const textElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
        textElement.setAttribute('x', bbox.x + bbox.width / 2); // Center text horizontally
        textElement.setAttribute('y', bbox.y + bbox.height / 2); // Center text vertically
        textElement.setAttribute('text-anchor', 'middle'); // Center-align text
        textElement.setAttribute('dominant-baseline', 'middle'); // Middle-align text baseline
        textElement.setAttribute('fill', '#000000'); // Set text color to black
        textElement.setAttribute('font-size', '12'); // Set font size
        textElement.textContent = abbreviation; // Set the text content to the state abbreviation

        this.svg.node.appendChild(textElement); // Append the text element to the SVG
    };

    // Function to get color based on BMI value
    this.getColorByBMI = function (bmi) {
        if (bmi < 18.5) return '#0000FF'; // Blue for underweight
        if (bmi < 24.9) return '#00FF00'; // Green for healthy weight
        if (bmi < 29.9) return '#FF0000'; // Red for overweight
        return '#993232';                // Dark red for obesity
    };

    // Function to get the BMI category based on the BMI value
    this.getBMICategory = function(bmi) {
        if (bmi < 18.5) return 'underweight'; // Return 'underweight' for BMI less than 18.5
        if (bmi < 24.9) return 'healthy';     // Return 'healthy' for BMI between 18.5 and 24.9
        if (bmi < 29.9) return 'overweight';  // Return 'overweight' for BMI between 25 and 29.9
        return 'obese';                       // Return 'obese' for BMI 30 or higher
    };

    // Function to update the map when the legend checkboxes are changed
    this.updateMap = function() {
        this.drawHeatMap(); // Redraw the heat map to reflect the current checkbox selections
    };

    // Function to remove the legend from the DOM
    this.removeLegend = function() {
        if (this.legendContainer && this.legendContainer.parentNode) {
            this.legendContainer.parentNode.removeChild(this.legendContainer); // Remove the legend container
        }
    };

    // Function to clean up and remove the SVG and legend when the heatmap is destroyed
    this.destroy = function () {
        if (this.svg) {
            this.svg.remove(); // Remove the SVG element from the DOM
        }
        this.removeLegend();   // Remove the legend from the DOM
    };
}

