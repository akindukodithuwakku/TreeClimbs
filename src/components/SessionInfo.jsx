import React from "react";

const SessionInfo = ({
  altitudeData,
  sessionStartTime,
  climbDetector,
  currentSessionId,
}) => {
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

  // Format session start time
  const formatSessionStart = (timestamp) => {
    if (!timestamp) return "Not started";
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  };

  // Check if this is an existing session
  const isExistingSession = sessionStartTime && altitudeData.length > 0;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Session Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold text-gray-700 mb-2">Session Details:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>
              • Session ID:{" "}
              {currentSessionId ? currentSessionId.slice(-8) : "Not set"}
            </li>
            <li>• Session Duration: {sessionDuration} minutes</li>
            <li>• Session Start: {formatSessionStart(sessionStartTime)}</li>
            <li>• Total Readings: {totalReadings}</li>
            <li>• Average Altitude: {avgAltitude} m</li>
            <li>• Data Interval: 10 seconds</li>
            {climbStatus && (
              <li>
                • Initial Altitude: {climbStatus.initialAltitude?.toFixed(1)} m
              </li>
            )}
            {isExistingSession && (
              <li className="text-green-600 font-medium">
                • 📅 Existing session data loaded
              </li>
            )}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-gray-700 mb-2">
            Tree Climbing Logic:
          </h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Detects 3m altitude changes (up & down)</li>
            <li>• One climb = going up 3m + coming down 3m</li>
            <li>• Session-based counting (resets on new session)</li>
            <li>• Real-time updates from BME280 sensor</li>
            <li>• Auto-detects new sessions (30+ min gap)</li>
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
            <div>
              <span className="text-gray-600">Threshold:</span>
              <span className="ml-1 font-medium">
                {climbStatus.minAltitudeChange}m
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-700 mb-2">
          Session Management:
        </h4>
        <p className="text-sm text-blue-600">
          • Existing sessions are loaded automatically without clearing data •
          New sessions automatically start when there's a 30+ minute gap in data
          • Use the "New Session" button to manually start a fresh session •
          Each session maintains its own climb count and timing • Session ID
          helps track different climbing sessions
        </p>
      </div>

      {isExistingSession && (
        <div className="mt-4 p-3 bg-green-50 rounded-lg">
          <h4 className="font-semibold text-green-700 mb-2">
            Existing Session Info:
          </h4>
          <p className="text-sm text-green-600">
            • This session started at {formatSessionStart(sessionStartTime)}•
            Data from previous climbing activity is preserved • Tree count
            includes climbs from the entire session • Duration shows total time
            since session began • Use "New Session" to start fresh if needed
          </p>
        </div>
      )}
    </div>
  );
};

export default SessionInfo;
