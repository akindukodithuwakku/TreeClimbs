import React, { useState } from "react";
import AltitudeChart from "./AltitudeChart";
import Statistics from "./Statistics";
import SessionInfo from "./SessionInfo";
import { TreeClimbDetector } from "../utils/treeClimbLogic";

const SessionHistory = ({
  pastSessions,
  selectedSession,
  onSelectSession,
  onBackToCurrent,
  onDeleteSession,
  onDeleteAllSessions,
}) => {
  const [climbDetector] = useState(new TreeClimbDetector());

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const calculateSessionStats = (session) => {
    if (!session.altitudeData || session.altitudeData.length === 0) {
      return {
        treeCount: 0,
        maxAltitude: 0,
        avgAltitude: 0,
        duration: 0,
      };
    }

    // Process altitude data to get tree count
    const detector = new TreeClimbDetector();
    const { climbCount } = detector.processAltitudeData(session.altitudeData);

    const maxAltitude =
      session.altitudeData.length > 0
        ? Math.max(...session.altitudeData.map((d) => d.altitude))
        : 0;
    const avgAltitude =
      session.altitudeData.length > 0
        ? session.altitudeData.reduce((sum, d) => sum + d.altitude, 0) /
          session.altitudeData.length
        : 0;
    const duration = session.endTime - session.startTime;

    return {
      treeCount: climbCount,
      maxAltitude,
      avgAltitude,
      duration,
    };
  };

  if (selectedSession) {
    const stats = calculateSessionStats(selectedSession);

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => onSelectSession(null)}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          >
            ← Back to History
          </button>
          <h2 className="text-2xl font-bold text-gray-800">
            Session Details: {selectedSession.id?.slice(-8) || "Unknown"}
          </h2>
          <button
            onClick={() => onDeleteSession(selectedSession.id)}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            🗑️ Delete Session
          </button>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <strong>Past Session Data</strong> - This session was completed
                on {formatDate(selectedSession.endTime)}. The data shows{" "}
                {selectedSession.altitudeData?.length || 0} altitude readings
                over {formatDuration(stats.duration)}.
              </p>
            </div>
          </div>
        </div>

        <Statistics
          altitudeData={selectedSession.altitudeData || []}
          treeCount={stats.treeCount}
          sessionStartTime={selectedSession.startTime}
          climbDetector={climbDetector}
        />

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Altitude Over Time
          </h2>
          <AltitudeChart
            altitudeData={selectedSession.altitudeData || []}
            sessionStartTime={selectedSession.startTime}
            isLive={false}
          />
        </div>

        <SessionInfo
          altitudeData={selectedSession.altitudeData || []}
          sessionStartTime={selectedSession.startTime}
          climbDetector={climbDetector}
          currentSessionId={selectedSession.id}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Session History</h2>
        <div className="flex gap-2">
          {pastSessions.length > 0 && (
            <button
              onClick={onDeleteAllSessions}
              className="bg-red-600 hover:bg-red-800 text-white font-bold py-2 px-4 rounded text-sm"
            >
              🗑️ Delete All Sessions
            </button>
          )}
          <button
            onClick={onBackToCurrent}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            ← Back to Current Session
          </button>
        </div>
      </div>

      {pastSessions.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            No Past Sessions
          </h3>
          <div className="max-w-md mx-auto">
            <p className="text-gray-500 mb-4">
              No previous sessions found. To start tracking your climbing
              sessions:
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-2">📋 Getting Started:</p>
                <ol className="list-decimal list-inside space-y-1 text-left">
                  <li>Connect your ESP32 device</li>
                  <li>Start a new climbing session</li>
                  <li>Climb some trees to collect data</li>
                  <li>Save your session to see it here</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pastSessions.map((session) => {
            const stats = calculateSessionStats(session);

            return (
              <div
                key={session.key}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-green-500"
                onClick={() => onSelectSession(session)}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Session {session.id?.slice(-8) || "Unknown"}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {formatDate(session.createdAt)}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trees Climbed:</span>
                    <span className="font-semibold text-green-600">
                      {stats.treeCount}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-semibold">
                      {formatDuration(stats.duration)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Max Altitude:</span>
                    <span className="font-semibold">
                      {stats.maxAltitude.toFixed(1)}m
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Readings:</span>
                    <span className="font-semibold">
                      {session.altitudeData?.length || 0}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-200 space-y-2">
                  <button
                    className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectSession(session);
                    }}
                  >
                    View Details
                  </button>
                  <button
                    className="w-full bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(session.id);
                    }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SessionHistory;
