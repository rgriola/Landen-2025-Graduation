export const FONTS = {
    // Base font families
    families: {
        primary: '"Proza Libre", sans-serif',
        title: '"Fraunces", serif',
        subtitle: '"Inconsolata", monospace',
        ui: '"Montserrat", sans-serif',
        mono: '"Roboto Mono", monospace'
    },
    
    // Font sizes (px)
    sizes: {
        xs: '12px',
        sm: '16px',
        md: '20px',
        lg: '24px',
        xl: '32px',
        xxl: '48px'
    },
    
    // Font weights
    weights: {
        regular: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800'
    },
    
    // Colors
    colors: {
        white: '#ffffff',
        offWhite: '#f0f0f0',
        yellow: '#ffff00',
        gold: '#ffd700',
        blue: '#1e90ff',
        darkBlue: '#0000cd',
        red: '#ff4545',
        green: '#00ab66',
        black: '#000000',
        gray: '#888888',
        darkGray: '#444444'
    },
    
    // Predefined text styles
    styles: {
        // Main heading style
        title: {
            fontFamily: '"Fraunces", serif',
            fontSize: '48px',
            fontWeight: '700',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4,
            align: 'center',
        },
        // Main heading style
        birthday: {
            fontFamily: '"Fraunces", serif',
            fontSize: '60px',
            fontWeight: '700',
            color: '#F01643',
            stroke: '#ffffff',
            strokeThickness: 4,
            align: 'left',
        },
        
        // Secondary heading style
        subtitle: {
            fontFamily: '"Inconsolata", monospace',
            fontSize: '30px',
            fontWeight: '400',
            color: '#ffff00',
            stroke: '#000000',
            strokeThickness: 2,
            align: 'center',
        },
        
        // Button text style
        button: {
            fontFamily: '"Montserrat", sans-serif',
            fontSize: '25px',
            fontWeight: '700',
            color: '#ffffff',
            align: 'center',
            strokeThickness: 1,
        },
        
        // Image label style
        imageLabel: {
            fontFamily: '"Proza Libre", sans-serif',
            fontSize: '24px',
            fontWeight: '600',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2,
            align: 'center',
        },

        // Image label style
        // Inside the styles object, modify the imageLabelA style:
        imageLabelA: {
            fontFamily: '"Proza Libre", sans-serif',
            fontSize: '35px',
            fontWeight: '600',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2,
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 },
            align: 'center',
            // Add these properties for the border effect:
            shadow: {
                offsetX: 0,
                offsetY: 0,
                color: '#ffffff',
                blur: 0,
                stroke: true,
                fill: true
            }
        },
        
        // Debug text style
        debug: {
            fontFamily: '"Roboto Mono", monospace',
            fontSize: '12px',
            color: '#00ff00',
            stroke: '#000000',
            strokeThickness: 1,
            align: 'left',
        },
        
        // Standard body text
        body: {
            fontFamily: '"Proza Libre", sans-serif',
            fontSize: '16px',
            color: '#ffffff',
            align: 'left',
            strokeThickness: 1,
        }
    },
    
        // Helper to get a random label style
    getRandomLabelStyle: function() {
        const labelStyles = ['imageLabelA', 'imageLabel', 'button', 'subtitle', 'title'];
        const randomStyle = labelStyles[Math.floor(Math.random() * labelStyles.length)];
        return this.styles[randomStyle];
    },
    
    // Original getStyle method
    getStyle: function(styleName, overrides = {}) {
        if (!this.styles[styleName]) {
            console.warn(`Font style "${styleName}" not found!`);
            return { ...overrides };
        }
        
        return { ...this.styles[styleName], ...overrides };
    }


    /*
    // Function to create custom text styles by extending predefined ones
    getStyle(baseStyle, overrides = {}) {
        // Use a predefined style as the base
        const base = this.styles[baseStyle] || this.styles.body;
        
        // Return a new object with base properties and overrides
        return { ...base, ...overrides };
    }
    */


};