/**
 * Improved tree climbing detection logic
 * Detects climbs based on altitude changes (going up and down by 3m)
 * rather than just being above a certain altitude
 */

export class TreeClimbDetector {
  constructor() {
    this.initialAltitude = null;
    this.currentPeak = null;
    this.currentValley = null;
    this.isClimbing = false;
    this.climbs = [];
    this.minAltitudeChange = 3; // Changed from 5 to 3 meters change required
    this.lastProcessedIndex = -1;
    this.climbStartTime = null;
    this.climbStartAltitude = null;
    this.climbStartIndex = null;
  }

  /**
   * Process altitude data and detect tree climbs
   * @param {Array} altitudeData - Array of {timestamp, altitude} objects
   * @returns {Object} - {climbs: Array, climbCount: number}
   */
  processAltitudeData(altitudeData) {
    if (altitudeData.length === 0) {
      return { climbs: [], climbCount: 0 };
    }

    // Start from where we left off
    const startIndex = Math.max(0, this.lastProcessedIndex);
    const newData = altitudeData.slice(startIndex);

    if (newData.length === 0) {
      return { climbs: this.climbs, climbCount: this.climbs.length };
    }

    // Set initial altitude if not set
    if (this.initialAltitude === null) {
      this.initialAltitude = newData[0].altitude;
      this.currentPeak = this.initialAltitude;
      this.currentValley = this.initialAltitude;
    }

    // Process each new altitude reading
    for (let i = 0; i < newData.length; i++) {
      const dataIndex = startIndex + i;
      const { timestamp, altitude } = newData[i];

      this.processAltitudeReading(timestamp, altitude, dataIndex, altitudeData);
    }

    this.lastProcessedIndex = altitudeData.length - 1;

    return {
      climbs: this.climbs,
      climbCount: this.climbs.length,
    };
  }

  /**
   * Process a single altitude reading
   * @param {number} timestamp - Unix timestamp
   * @param {number} altitude - Altitude in meters
   * @param {number} dataIndex - Index in the data array
   * @param {Array} fullData - Complete altitude data array
   */
  processAltitudeReading(timestamp, altitude, dataIndex, fullData) {
    // Update peak and valley
    if (altitude > this.currentPeak) {
      this.currentPeak = altitude;
    }
    if (altitude < this.currentValley) {
      this.currentValley = altitude;
    }

    // Calculate altitude change from initial position
    const altitudeChange = altitude - this.initialAltitude;

    // Detect climbing start (going up more than 3m from initial)
    if (
      !this.isClimbing &&
      altitude > this.initialAltitude + this.minAltitudeChange
    ) {
      this.isClimbing = true;
      this.climbStartTime = timestamp;
      this.climbStartAltitude = this.initialAltitude;
      this.climbStartIndex = dataIndex;

      console.log(
        `🌳 Climbing started at ${altitude.toFixed(
          1
        )}m (change: +${altitudeChange.toFixed(
          1
        )}m from base ${this.initialAltitude.toFixed(1)}m)`
      );
    }

    // Detect climb completion (going down more than 3m from peak)
    if (this.isClimbing) {
      const peakAltitude = this.currentPeak;
      const currentChange = peakAltitude - altitude;

      if (currentChange >= this.minAltitudeChange) {
        // Complete the climb
        this.isClimbing = false;

        const climb = {
          id: this.climbs.length + 1,
          startTime: this.climbStartTime,
          endTime: timestamp,
          startAltitude: this.climbStartAltitude,
          peakAltitude: peakAltitude,
          endAltitude: altitude,
          totalAscent: peakAltitude - this.climbStartAltitude,
          totalDescent: peakAltitude - altitude,
          duration: timestamp - this.climbStartTime,
        };

        this.climbs.push(climb);

        console.log(
          `✅ Tree climb completed! Peak: ${peakAltitude.toFixed(
            1
          )}m, Ascent: ${climb.totalAscent.toFixed(
            1
          )}m, Descent: ${climb.totalDescent.toFixed(1)}m`
        );

        // Reset for next climb
        this.initialAltitude = altitude; // New baseline
        this.currentPeak = altitude;
        this.currentValley = altitude;
        this.climbStartTime = null;
        this.climbStartAltitude = null;
        this.climbStartIndex = null;
      }
    }
  }

  /**
   * Reset the detector for a new session
   */
  reset() {
    this.initialAltitude = null;
    this.currentPeak = null;
    this.currentValley = null;
    this.isClimbing = false;
    this.climbs = [];
    this.lastProcessedIndex = -1;
    this.climbStartTime = null;
    this.climbStartAltitude = null;
    this.climbStartIndex = null;
  }

  /**
   * Get current climbing status
   * @returns {Object} - Current status
   */
  getStatus() {
    return {
      isClimbing: this.isClimbing,
      initialAltitude: this.initialAltitude,
      currentPeak: this.currentPeak,
      currentValley: this.currentValley,
      totalClimbs: this.climbs.length,
      minAltitudeChange: this.minAltitudeChange,
    };
  }
}

/**
 * Alternative simpler approach for detecting climbs
 * @param {Array} altitudeData - Array of altitude readings
 * @returns {number} - Number of climbs detected
 */
export function detectClimbsSimple(altitudeData) {
  if (altitudeData.length < 3) return 0;

  let climbs = 0;
  let baselineAltitude = altitudeData[0].altitude;
  let peakAltitude = baselineAltitude;
  let isInClimb = false;
  const minChange = 3; // Changed from 5 to 3 meters

  for (let i = 1; i < altitudeData.length; i++) {
    const currentAltitude = altitudeData[i].altitude;

    // Update peak if we're going higher
    if (currentAltitude > peakAltitude) {
      peakAltitude = currentAltitude;
    }

    // Check if we've started climbing (gone up more than 3m from baseline)
    if (!isInClimb && currentAltitude > baselineAltitude + minChange) {
      isInClimb = true;
    }

    // Check if we've completed a climb (come down more than 3m from peak)
    if (isInClimb && peakAltitude - currentAltitude >= minChange) {
      climbs++;
      isInClimb = false;
      baselineAltitude = currentAltitude; // New baseline
      peakAltitude = currentAltitude;
    }
  }

  return climbs;
}
