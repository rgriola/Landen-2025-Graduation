export class helperScripts extends Scene {
    constructor() {
        super('helperScripts');
    }

    create() {
        console.log('Helper scripts loaded');
        // You can add any helper functions or methods here
    }

    // Example helper function
    static log(message) {
        console.log(`[Helper] ${message}`);
    }
    static warn(message) {
        console.warn(`[Helper] ${message}`);
    }
    static error(message) {
        console.error(`[Helper] ${message}`);
    }               




}