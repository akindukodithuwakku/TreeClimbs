import React, { useState, useEffect, useRef } from "react";
import { ref, onValue, off, set, push, get } from "firebase/database";
import { signInWithEmailAndPassword } from "firebase/auth";
import { database, auth } from "./firebase";
import { TreeClimbDetector } from "./utils/treeClimbLogic";
import AltitudeChart from "./components/AltitudeChart";
import Statistics from "./components/Statistics";
import SessionInfo from "./components/SessionInfo";
import SessionHistory from "./components/SessionHistory";
import ConfirmationDialog from "./components/ConfirmationDialog";

function App() {
  const [altitudeData, setAltitudeData] = useState([]);
  const [treeCount, setTreeCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authStatus, setAuthStatus] = useState("connecting");
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [isNewSession, setIsNewSession] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [pastSessions, setPastSessions] = useState([]);
  const [viewMode, setViewMode] = useState("current"); // 'current' or 'history'
  const [selectedSession, setSelectedSession] = useState(null);
  const [showNewSessionDialog, setShowNewSessionDialog] = useState(false);
  const [showSaveSessionDialog, setShowSaveSessionDialog] = useState(false);
  const [showDeleteSessionDialog, setShowDeleteSessionDialog] = useState(false);
  const [showDeleteAllSessionsDialog, setShowDeleteAllSessionsDialog] =
    useState(false);
  const [sessionToDelete, setSessionToDelete] = useState(null);

  // Create tree climb detector instance
  const climbDetectorRef = useRef(new TreeClimbDetector());

  // Session management functions
  const handleNewSessionClick = () => {
    setShowNewSessionDialog(true);
  };

  const startNewSession = async () => {
    setShowNewSessionDialog(false);

    try {
      // Save current session to history if it exists
      if (altitudeData.length > 0 && sessionStartTime && currentSessionId) {
        const sessionData = {
          id: currentSessionId,
          startTime: sessionStartTime,
          treeCount: treeCount,
          altitudeData: altitudeData,
          duration: Date.now() / 1000 - sessionStartTime,
          maxAltitude:
            altitudeData.length > 0
              ? Math.max(...altitudeData.map((d) => d.altitude))
              : 0,
          avgAltitude:
            altitudeData.length > 0
              ? altitudeData.reduce((sum, d) => sum + d.altitude, 0) /
                altitudeData.length
              : 0,
        };
        await saveSessionToHistory(sessionData);
      }

      // Generate new session ID and set start time to current browser time
      const newSessionId = `session_${Date.now()}`;
      const currentBrowserTime = Date.now() / 1000;
      setCurrentSessionId(newSessionId);
      setSessionStartTime(currentBrowserTime);

      // Clear all previous data from Firebase
      await set(ref(database, "/AltitudeReadings"), {});

      // Reset local state
      setAltitudeData([]);
      setTreeCount(0);
      setIsNewSession(true);
      climbDetectorRef.current.reset();
      setViewMode("current");
      setSelectedSession(null);

      console.log(
        "🔄 New session started:",
        newSessionId,
        "at",
        new Date(currentBrowserTime * 1000).toLocaleString()
      );
    } catch (error) {
      console.error("❌ Error starting new session:", error);
      setError("Failed to start new session: " + error.message);
    }
  };

  const handleSaveSessionClick = () => {
    console.log("💾 Save Session Click - Debug:", {
      altitudeDataLength: altitudeData.length,
      sessionStartTime: sessionStartTime
        ? new Date(sessionStartTime * 1000).toLocaleString()
        : "null",
      currentSessionId: currentSessionId || "null",
    });

    if (altitudeData.length === 0) {
      alert("No altitude data available to save");
      return;
    }
    if (!sessionStartTime) {
      alert("Session has not started yet");
      return;
    }
    if (!currentSessionId) {
      alert("No session ID available");
      return;
    }
    setShowSaveSessionDialog(true);
  };

  const saveCurrentSession = async () => {
    setShowSaveSessionDialog(false);

    try {
      const sessionData = {
        id: currentSessionId,
        startTime: sessionStartTime,
        treeCount: treeCount,
        altitudeData: altitudeData,
        duration: Date.now() / 1000 - sessionStartTime,
        maxAltitude:
          altitudeData.length > 0
            ? Math.max(...altitudeData.map((d) => d.altitude))
            : 0,
        avgAltitude:
          altitudeData.length > 0
            ? altitudeData.reduce((sum, d) => sum + d.altitude, 0) /
              altitudeData.length
            : 0,
      };

      await saveSessionToHistory(sessionData);
      alert("Session saved successfully!");
    } catch (error) {
      console.error("❌ Error saving session:", error);
      alert("Failed to save session: " + error.message);
    }
  };

  const detectNewSession = (newData) => {
    if (newData.length === 0) return false;

    const latestTimestamp = newData[newData.length - 1].timestamp;
    const currentTime = Date.now() / 1000;
    const timeDiff = currentTime - latestTimestamp;

    // If latest data is more than 30 minutes old, treat as new session
    if (timeDiff > 1800) {
      console.log("⏰ Detected new session (data gap > 30 minutes)");

      // Save the current session to history before starting new one
      if (altitudeData.length > 0 && sessionStartTime && currentSessionId) {
        const sessionData = {
          id: currentSessionId,
          startTime: sessionStartTime,
          treeCount: treeCount,
          altitudeData: altitudeData,
          duration: latestTimestamp - sessionStartTime,
          maxAltitude:
            altitudeData.length > 0
              ? Math.max(...altitudeData.map((d) => d.altitude))
              : 0,
          avgAltitude:
            altitudeData.length > 0
              ? altitudeData.reduce((sum, d) => sum + d.altitude, 0) /
                altitudeData.length
              : 0,
        };
        saveSessionToHistory(sessionData);
      }

      return true;
    }

    return false;
  };

  const processExistingData = (formattedData) => {
    if (formattedData.length === 0) return;

    // Set session start time and ID to current browser time for existing data
    if (!sessionStartTime) {
      const currentBrowserTime = Date.now() / 1000;
      const newSessionId = `session_${Date.now()}`;
      setSessionStartTime(currentBrowserTime);
      setCurrentSessionId(newSessionId);
      console.log(
        "📅 Using existing session data, start time set to current browser time:",
        new Date(currentBrowserTime * 1000).toLocaleString(),
        "Session ID:",
        newSessionId
      );
    }

    // Process existing data with tree climbing logic
    const { climbCount } =
      climbDetectorRef.current.processAltitudeData(formattedData);
    setTreeCount(climbCount);

    console.log(`🌳 Existing session: ${climbCount} trees climbed`);
  };

  const saveSessionToHistory = async (sessionData) => {
    try {
      // Get existing sessions
      const sessionsRef = ref(database, "/Sessions");
      const snapshot = await get(sessionsRef);

      let sessions = [];
      if (snapshot.exists()) {
        sessions = snapshot.val();
      }

      // Create new session object
      const newSession = {
        id: sessionData.id,
        startTime: sessionData.startTime,
        endTime: Date.now() / 1000,
        treeCount: sessionData.treeCount,
        altitudeData: sessionData.altitudeData,
        duration: sessionData.duration,
        maxAltitude: sessionData.maxAltitude,
        avgAltitude: sessionData.avgAltitude,
        createdAt: Date.now() / 1000,
      };

      // Add new session to the array
      sessions.push(newSession);

      // Save updated sessions array
      await set(sessionsRef, sessions);
      console.log("💾 Session saved to history:", sessionData.id);
    } catch (error) {
      console.error("❌ Error saving session:", error);
    }
  };

  const loadPastSessions = async () => {
    try {
      const sessionsRef = ref(database, "/Sessions");
      const snapshot = await get(sessionsRef);

      if (snapshot.exists()) {
        const sessions = snapshot.val();

        // Add index as key for React rendering
        const sessionsWithKeys = sessions.map((session, index) => ({
          key: index,
          ...session,
        }));

        // Sort by creation time (newest first)
        sessionsWithKeys.sort((a, b) => b.createdAt - a.createdAt);
        setPastSessions(sessionsWithKeys);
        console.log("📚 Loaded past sessions:", sessionsWithKeys.length);
      } else {
        setPastSessions([]);
      }
    } catch (error) {
      console.error("❌ Error loading past sessions:", error);
      setPastSessions([]);
    }
  };

  const viewSessionHistory = () => {
    setViewMode("history");
    loadPastSessions();
  };

  const viewCurrentSession = () => {
    setViewMode("current");
    setSelectedSession(null);
  };

  const selectPastSession = (session) => {
    setSelectedSession(session);
    setViewMode("history");
  };

  const handleDeleteSessionClick = (session) => {
    setSessionToDelete(session);
    setShowDeleteSessionDialog(true);
  };

  const confirmDeleteSession = async () => {
    if (!sessionToDelete) return;

    try {
      // Get existing sessions
      const sessionsRef = ref(database, "/Sessions");
      const snapshot = await get(sessionsRef);

      if (snapshot.exists()) {
        const sessions = snapshot.val();

        // Filter out the session to delete
        const updatedSessions = sessions.filter(
          (session) => session.id !== sessionToDelete.id
        );

        // Save updated sessions array
        await set(sessionsRef, updatedSessions);

        // Update local state
        const updatedPastSessions = pastSessions.filter(
          (session) => session.id !== sessionToDelete.id
        );
        setPastSessions(updatedPastSessions);

        // If the deleted session was selected, clear selection
        if (selectedSession && selectedSession.id === sessionToDelete.id) {
          setSelectedSession(null);
        }

        console.log("🗑️ Session deleted:", sessionToDelete.id);
        alert("Session deleted successfully!");
      }
    } catch (error) {
      console.error("❌ Error deleting session:", error);
      alert("Failed to delete session: " + error.message);
    } finally {
      setShowDeleteSessionDialog(false);
      setSessionToDelete(null);
    }
  };

  const deleteSession = async (sessionId) => {
    const session = pastSessions.find((s) => s.id === sessionId);
    if (session) {
      handleDeleteSessionClick(session);
    }
  };

  const handleDeleteAllSessionsClick = () => {
    setShowDeleteAllSessionsDialog(true);
  };

  const confirmDeleteAllSessions = async () => {
    try {
      // Clear all sessions from Firebase
      const sessionsRef = ref(database, "/Sessions");
      await set(sessionsRef, []);

      // Clear local state
      setPastSessions([]);
      setSelectedSession(null);

      console.log("🗑️ All sessions deleted");
      alert("All sessions deleted successfully!");
    } catch (error) {
      console.error("❌ Error deleting all sessions:", error);
      alert("Failed to delete all sessions: " + error.message);
    } finally {
      setShowDeleteAllSessionsDialog(false);
    }
  };

  const deleteAllSessions = () => {
    handleDeleteAllSessionsClick();
  };

  // Debug useEffect to track session state changes
  useEffect(() => {
    console.log("🔍 Session State Debug:", {
      sessionStartTime: sessionStartTime
        ? new Date(sessionStartTime * 1000).toLocaleString()
        : "null",
      currentSessionId: currentSessionId || "null",
      altitudeDataLength: altitudeData.length,
      isNewSession,
      hasInitialized,
    });
  }, [
    sessionStartTime,
    currentSessionId,
    altitudeData.length,
    isNewSession,
    hasInitialized,
  ]);

  useEffect(() => {
    const handleFirebaseData = async () => {
      try {
        // Sign in to Firebase
        await signInWithEmailAndPassword(
          auth,
          import.meta.env.VITE_FIREBASE_USER_EMAIL,
          import.meta.env.VITE_FIREBASE_USER_PASSWORD
        );

        setAuthStatus("authenticated");
        console.log("✅ Signed in successfully");

        // Load past sessions immediately after authentication
        await loadPastSessions();

        // Fetch altitude data
        const altitudeRef = ref(database, "/AltitudeReadings");
        onValue(
          altitudeRef,
          (snapshot) => {
            try {
              const data = snapshot.val();
              console.log("📊 Altitude data received:", data);

              if (data) {
                const formattedData = Object.keys(data)
                  .map((key) => {
                    const item = data[key];
                    // Handle ESP32 data format: {altitude: "value", timestamp: "value"}
                    return {
                      timestamp: parseInt(item.timestamp || key),
                      altitude: parseFloat(item.altitude || item),
                    };
                  })
                  .filter(
                    (item) => !isNaN(item.altitude) && !isNaN(item.timestamp)
                  )
                  .sort((a, b) => a.timestamp - b.timestamp);

                // Only check for new session if we haven't initialized yet
                if (!hasInitialized) {
                  // Check if this is a new session (only on first load)
                  if (detectNewSession(formattedData)) {
                    console.log(
                      "🔄 Auto-detected new session, clearing old data"
                    );
                    setAltitudeData([]);
                    setTreeCount(0);
                    setSessionStartTime(null);
                    setIsNewSession(true);
                    climbDetectorRef.current.reset();
                    setHasInitialized(true);
                    setLoading(false);
                    return;
                  } else {
                    // Process existing data normally
                    setAltitudeData(formattedData);
                    processExistingData(formattedData);
                    setIsNewSession(false);
                    setHasInitialized(true);
                    setLoading(false);
                    return;
                  }
                }

                // If no data and we haven't initialized yet, just set loading to false
                if (!hasInitialized && formattedData.length === 0) {
                  setHasInitialized(true);
                  setLoading(false);
                  return;
                }

                // For subsequent updates, just update the data
                setAltitudeData(formattedData);

                // Set session start time and ID to current browser time if not already set
                if (formattedData.length > 0 && !sessionStartTime) {
                  const currentBrowserTime = Date.now() / 1000;
                  const newSessionId = `session_${Date.now()}`;
                  setSessionStartTime(currentBrowserTime);
                  setCurrentSessionId(newSessionId);
                  setIsNewSession(false);
                  console.log(
                    "📅 Session start time set to current browser time:",
                    new Date(currentBrowserTime * 1000).toLocaleString(),
                    "Session ID:",
                    newSessionId
                  );
                }

                // Process data with improved tree climbing logic
                const { climbCount } =
                  climbDetectorRef.current.processAltitudeData(formattedData);
                setTreeCount(climbCount);

                setLoading(false);
                console.log(`🌳 Trees climbed this session: ${climbCount}`);
              } else {
                // No current altitude data, but don't show error - allow access to session history
                setLoading(false);
                console.log(
                  "📊 No current altitude data available - ESP32 may be disconnected"
                );
              }
            } catch (err) {
              console.error("❌ Error processing altitude data:", err);
              // Only show error for processing issues, not for missing data
              if (err.message.includes("No altitude data")) {
                setLoading(false);
              } else {
                setError("Failed to process altitude data: " + err.message);
                setLoading(false);
              }
            }
          },
          (error) => {
            console.error("❌ Altitude data error:", error);
            setError("Failed to fetch altitude data: " + error.message);
            setLoading(false);
          }
        );

        // Cleanup function
        return () => {
          off(altitudeRef);
        };
      } catch (error) {
        console.error("❌ Authentication error:", error.message);
        setError(`Authentication failed: ${error.message}`);
        setLoading(false);
        setAuthStatus("failed");
      }
    };

    handleFirebaseData();
  }, [hasInitialized]);

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    setAuthStatus("connecting");
    setSessionStartTime(null);
    setCurrentSessionId(null);
    setIsNewSession(false);
    setHasInitialized(false);
    climbDetectorRef.current.reset();
    window.location.reload();
  };

  if (authStatus === "connecting") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Connecting to Firebase...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="text-red-500 text-center p-4 bg-red-50 rounded-lg">
          <h2 className="text-xl font-bold mb-2">Error: {error}</h2>
          <p className="mb-4">
            Please check the console for details and verify Firebase
            configuration.
          </p>
          <button
            onClick={handleRetry}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <p className="mt-2 text-gray-600">Loading altitude data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          🌴 Coconut Tree Climber Dashboard
        </h1>
        <div className="flex gap-2">
          <button
            onClick={viewCurrentSession}
            className={`font-bold py-2 px-4 rounded ${
              viewMode === "current"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            📊 Current Session
          </button>
          <button
            onClick={viewSessionHistory}
            className={`font-bold py-2 px-4 rounded ${
              viewMode === "history"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            📚 Session History
          </button>
          <button
            onClick={handleSaveSessionClick}
            className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
            disabled={
              !altitudeData.length || !sessionStartTime || !currentSessionId
            }
          >
            💾 Save Session
          </button>
          <button
            onClick={handleNewSessionClick}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            🆕 New Session
          </button>
          {currentSessionId && viewMode === "current" && (
            <span className="bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm">
              Session: {currentSessionId.slice(-8)} | Started:{" "}
              {sessionStartTime
                ? new Date(sessionStartTime * 1000).toLocaleTimeString()
                : "Not set"}
            </span>
          )}
          {viewMode === "current" && altitudeData.length === 0 && (
            <span className="bg-yellow-100 text-yellow-800 px-3 py-2 rounded text-sm flex items-center gap-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              ESP32 Disconnected
            </span>
          )}
          {viewMode === "current" && altitudeData.length > 0 && (
            <span className="bg-green-100 text-green-800 px-3 py-2 rounded text-sm flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              ESP32 Connected
            </span>
          )}
        </div>
      </div>

      {isNewSession && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
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
                <strong>New session started!</strong> Previous data has been
                cleared. Waiting for new altitude readings from your ESP32
                device.
              </p>
            </div>
          </div>
        </div>
      )}

      {viewMode === "current" && (
        <>
          {!isNewSession && altitudeData.length > 0 && (
            <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-green-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">
                    <strong>Existing session loaded!</strong> Showing data from
                    previous session. Use "New Session" button to start fresh.
                  </p>
                </div>
              </div>
            </div>
          )}

          {altitudeData.length > 0 ? (
            <div className="space-y-6">
              <Statistics
                altitudeData={altitudeData}
                treeCount={treeCount}
                sessionStartTime={sessionStartTime}
                climbDetector={climbDetectorRef.current}
              />

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">
                  Altitude Over Time
                </h2>
                <AltitudeChart
                  altitudeData={altitudeData}
                  sessionStartTime={sessionStartTime}
                  isLive={true}
                />
              </div>

              <SessionInfo
                altitudeData={altitudeData}
                sessionStartTime={sessionStartTime}
                climbDetector={climbDetectorRef.current}
                currentSessionId={currentSessionId}
              />
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg max-w-2xl mx-auto">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-6 w-6 text-yellow-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-yellow-800">
                      ESP32 Not Connected
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                        No altitude data is currently available. This usually
                        means your ESP32 device is not connected or not sending
                        data.
                      </p>
                      <div className="mt-4 space-y-2">
                        <p className="font-medium">You can still:</p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                          <li>View your past climbing sessions</li>
                          <li>Analyze historical data</li>
                          <li>Manage session history</li>
                        </ul>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-col sm:flex-row gap-2 justify-center">
                      <button
                        onClick={viewSessionHistory}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                      >
                        📚 View Session History
                      </button>
                      {!isNewSession && (
                        <button
                          onClick={handleNewSessionClick}
                          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                        >
                          🆕 Start New Session
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {viewMode === "history" && (
        <SessionHistory
          pastSessions={pastSessions}
          selectedSession={selectedSession}
          onSelectSession={selectPastSession}
          onBackToCurrent={viewCurrentSession}
          onDeleteSession={deleteSession}
          onDeleteAllSessions={deleteAllSessions}
        />
      )}

      {/* Confirmation Dialogs */}
      <ConfirmationDialog
        isOpen={showNewSessionDialog}
        onConfirm={startNewSession}
        onCancel={() => setShowNewSessionDialog(false)}
        title="Start New Session"
        message="Are you sure you want to start a new session? This will save the current session and clear all data."
        confirmText="Start New Session"
        cancelText="Cancel"
      />

      <ConfirmationDialog
        isOpen={showSaveSessionDialog}
        onConfirm={saveCurrentSession}
        onCancel={() => setShowSaveSessionDialog(false)}
        title="Save Current Session"
        message="Are you sure you want to save the current session? This will store it in your session history."
        confirmText="Save Session"
        cancelText="Cancel"
      />

      <ConfirmationDialog
        isOpen={showDeleteSessionDialog}
        onConfirm={confirmDeleteSession}
        onCancel={() => {
          setShowDeleteSessionDialog(false);
          setSessionToDelete(null);
        }}
        title="Delete Session"
        message={`Are you sure you want to delete session ${sessionToDelete?.id?.slice(
          -8
        )}? This action cannot be undone.`}
        confirmText="Delete Session"
        cancelText="Cancel"
        confirmButtonColor="red"
      />

      <ConfirmationDialog
        isOpen={showDeleteAllSessionsDialog}
        onConfirm={confirmDeleteAllSessions}
        onCancel={() => setShowDeleteAllSessionsDialog(false)}
        title="Delete All Sessions"
        message={`Are you sure you want to delete ALL ${pastSessions.length} sessions? This action cannot be undone.`}
        confirmText="Delete All Sessions"
        cancelText="Cancel"
        confirmButtonColor="red"
      />
    </div>
  );
}

export default App;
