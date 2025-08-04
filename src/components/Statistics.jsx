import React from "react";

const Statistics = ({
  altitudeData,
  treeCount,
  sessionStartTime,
  climbDetector,
}) => {
  const latestAltitude =
    altitudeData.length > 0 ? altitudeData[altitudeData.length - 1] : null;
  const maxAltitude =
    altitudeData.length > 0
      ? Math.max(...altitudeData.map((d) => d.altitude))
      : 0;
  const avgAltitude =
    altitudeData.length > 0
      ? (
          altitudeData.reduce((sum, d) => sum + d.altitude, 0) /
          altitudeData.length
        ).toFixed(1)
      : 0;

  // Calculate session duration in minutes (only for current session)
  const sessionDuration = sessionStartTime
    ? Math.floor((Date.now() / 1000 - sessionStartTime) / 60)
    : 0;

  // Calculate climb rate (trees per hour) - only for current session
  const climbRate =
    sessionDuration > 0 ? ((treeCount / sessionDuration) * 60).toFixed(1) : 0;

  // Get current climbing status
  const climbStatus = climbDetector ? climbDetector.getStatus() : null;

  // Format session duration
  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500">
        <h3 className="text-lg font-semibold text-gray-700">Trees Climbed</h3>
        <p className="text-3xl text-green-600 font-bold">{treeCount}</p>
        <p className="text-sm text-gray-500">This session</p>
        <p className="text-xs text-gray-500 mt-1">Threshold: 3m</p>
        {climbStatus?.isClimbing && (
          <p className="text-xs text-green-600 mt-1">🔄 Currently climbing</p>
        )}
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500">
        <h3 className="text-lg font-semibold text-gray-700">
          Current Altitude
        </h3>
        <p className="text-3xl text-blue-600 font-bold">
          {latestAltitude
            ? `${latestAltitude.altitude.toFixed(1)} m`
            : "No data"}
        </p>
        <p className="text-sm text-gray-500">Latest reading</p>
        {climbStatus && (
          <p className="text-xs text-blue-600 mt-1">
            Peak: {climbStatus.currentPeak?.toFixed(1)}m
          </p>
        )}
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-purple-500">
        <h3 className="text-lg font-semibold text-gray-700">
          Session Duration
        </h3>
        <p className="text-3xl text-purple-600 font-bold">
          {formatDuration(sessionDuration)}
        </p>
        <p className="text-sm text-gray-500">Current session</p>
        {sessionStartTime && (
          <p className="text-xs text-purple-600 mt-1">
            Started: {new Date(sessionStartTime * 1000).toLocaleTimeString()}
          </p>
        )}
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-orange-500">
        <h3 className="text-lg font-semibold text-gray-700">Climb Rate</h3>
        <p className="text-3xl text-orange-600 font-bold">{climbRate}</p>
        <p className="text-sm text-gray-500">Trees/hour</p>
        <p className="text-xs text-orange-600 mt-1">
          Session: {formatDuration(sessionDuration)}
        </p>
      </div>
    </div>
  );
};

export default Statistics;
