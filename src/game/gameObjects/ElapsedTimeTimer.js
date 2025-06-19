export class ElapsedTimeTimer {
    constructor(options = {}) {
        this.startDate = options.startDate || new Date();
        this.element = options.element || null;
        this.updateInterval = options.updateInterval || 60000; // Update every minute by default
        this.intervalId = null;
        this.onUpdate = options.onUpdate || null;
    }

    /**
     * Set the start date for the timer
     * @param {number} year - Full year (e.g., 2023)
     * @param {number} month - Month (0-11, where 0 is January)
     * @param {number} day - Day of month
     * @param {number} hour - Hour (0-23)
     * @param {number} minute - Minute (0-59)
     */
    setStartDate(year, month, day, hour = 0, minute = 0) {
        this.startDate = new Date(year, month - 1, day, hour, minute);
        return this;
    }

    /**
     * Calculate elapsed time from start date until now
     * @returns {Object} Elapsed time in years, months, days, hours, minutes
     */
    calculateElapsedTime() {
        const now = new Date();
        const diff = now - this.startDate;
        
        // Convert milliseconds to various time units
        const msInMinute = 60 * 1000;
        const msInHour = 60 * msInMinute;
        const msInDay = 24 * msInHour;

        // Calculate elapsed time
        let years = now.getFullYear() - this.startDate.getFullYear();
        let months = now.getMonth() - this.startDate.getMonth();
        
        // Adjust years and months
        if (months < 0) {
            years--;
            months += 12;
        }
        
        // Calculate remaining time after accounting for years and months
        const tempDate = new Date(this.startDate);
        tempDate.setFullYear(tempDate.getFullYear() + years);
        tempDate.setMonth(tempDate.getMonth() + months);
        
        let days = Math.floor((now - tempDate) / msInDay);
        let remainingMs = (now - tempDate) % msInDay;
        
        let hours = Math.floor(remainingMs / msInHour);
        remainingMs %= msInHour;
        
        let minutes = Math.floor(remainingMs / msInMinute);
        
        return {
            years,
            months,
            days,
            hours,
            minutes
        };
    }

    /**
     * Format the elapsed time into a readable string
     * @returns {string} Formatted elapsed time
     */
    formatElapsedTime() {
        const elapsed = this.calculateElapsedTime();
        
        const parts = [];
        if (elapsed.years > 0) {
            parts.push(`${elapsed.years} ${elapsed.years === 1 ? 'year' : 'Yrs'}`);
        }
        if (elapsed.months > 0) {
            parts.push(`${elapsed.months} ${elapsed.months === 1 ? 'month' : 'Mos'}`);
        }
        if (elapsed.days > 0) {
            parts.push(`${elapsed.days} ${elapsed.days === 1 ? 'day' : 'Ds'}`);
        }
        if (elapsed.hours > 0) {
            parts.push(`${elapsed.hours} ${elapsed.hours === 1 ? 'hour' : 'hrs'}`);
        }
        if (elapsed.minutes > 0) {
            parts.push(`${elapsed.minutes} ${elapsed.minutes === 1 ? 'minute' : 'min'}`);
        }
        
        return parts.join(', ');
    }

    /**
     * Start the timer with automatic updates
     */
    start() {
        this.update();
        this.intervalId = setInterval(() => this.update(), this.updateInterval);
        return this;
    }

    /**
     * Stop the timer updates
     */
    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        return this;
    }

    /**
     * Update the timer display
     */
    update() {
        const elapsed = this.calculateElapsedTime();
        const formattedTime = this.formatElapsedTime();
        
        if (this.element) {
            this.element.textContent = formattedTime;
        }
        
        if (typeof this.onUpdate === 'function') {
            this.onUpdate(elapsed, formattedTime);
        }
        
        return elapsed;
    }
}