import React from "react";

const SessionInfo = ({ altitudeData, sessionStartTime, climbDetector }) => {
  // Calculate session duration in minutes
  const sessionDuration = sessionStartTime
    ? Math.floor((Date.now() / 1000 - sessionStartTime) / 60)
    : 0;

  const totalReadings = altitudeData.length;
  const avgAltitude =
    altitudeData.length > 0
      ? (
          altitudeData.reduce((sum, d) => sum + d.altitude, 0) /
          altitudeData.length
        ).toFixed(1)
      : 0;

  // Get climbing status
  const climbStatus = climbDetector ? climbDetector.getStatus() : null;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Session Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold text-gray-700 mb-2">Session Details:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Session Duration: {sessionDuration} minutes</li>
            <li>• Total Readings: {totalReadings}</li>
            <li>• Average Altitude: {avgAltitude} m</li>
            <li>• Data Interval: 10 seconds</li>
            {climbStatus && (
              <li>
                • Initial Altitude: {climbStatus.initialAltitude?.toFixed(1)} m
              </li>
            )}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-gray-700 mb-2">
            Tree Climbing Logic:
          </h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Detects 5m altitude changes (up & down)</li>
            <li>• One climb = going up 5m + coming down 5m</li>
            <li>• Session-based counting (resets on ESP32 restart)</li>
            <li>• Real-time updates from BME280 sensor</li>
            {climbStatus?.isClimbing && (
              <li className="text-green-600 font-medium">
                • 🔄 Currently in climbing mode
              </li>
            )}
          </ul>
        </div>
      </div>

      {climbStatus && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-700 mb-2">
            Current Climbing Status:
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            <div>
              <span className="text-gray-600">Status:</span>
              <span
                className={`ml-1 font-medium ${
                  climbStatus.isClimbing ? "text-green-600" : "text-gray-800"
                }`}
              >
                {climbStatus.isClimbing ? "Climbing" : "Ground Level"}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Initial:</span>
              <span className="ml-1 font-medium">
                {climbStatus.initialAltitude?.toFixed(1)}m
              </span>
            </div>
            <div>
              <span className="text-gray-600">Peak:</span>
              <span className="ml-1 font-medium">
                {climbStatus.currentPeak?.toFixed(1)}m
              </span>
            </div>
            <div>
              <span className="text-gray-600">Total Climbs:</span>
              <span className="ml-1 font-medium">
                {climbStatus.totalClimbs}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionInfo;
