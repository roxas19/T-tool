/**
 * Starts a meeting by calling the backend API.
 */
export const handleStartMeeting = async (
  setRoomUrl: React.Dispatch<React.SetStateAction<string | null>>,
  meetingId: string
): Promise<void> => {
  try {
    const response = await fetch(
      `http://localhost:8000/api/dailyco/${meetingId}/start/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const data = await response.json();

    if (response.ok) {
      console.log("Meeting started:", data);
      setRoomUrl((prevRoomUrl) => {
        if (prevRoomUrl !== data.room_url) {
          return data.room_url; // Only update if the room URL is different
        }
        return prevRoomUrl; // Avoid triggering unnecessary re-renders
      });
    } else if (data.error === "Meeting is already active.") {
      console.log("Meeting already active, updating state.");
      setRoomUrl((prevRoomUrl) => data.room_url || prevRoomUrl); // Handle cases where the room URL is returned
    } else {
      console.error("Failed to start meeting:", data.error);
      setRoomUrl(null);
    }
  } catch (error) {
    console.error("Error during meeting start:", error);
    setRoomUrl(null);
  }
};

/**
 * Stops a meeting by calling the backend API.
 */
export const handleStopMeeting = async (
  setRoomUrl: React.Dispatch<React.SetStateAction<string | null>>,
  meetingId: string
): Promise<void> => {
  try {
    const response = await fetch(
      `http://localhost:8000/api/dailyco/${meetingId}/stop/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const data = await response.json();

    if (response.ok) {
      console.log("Meeting stopped:", data);
      setRoomUrl(null); // Clear the room URL when the meeting ends
    } else if (data.error === "Meeting is not currently active.") {
      console.log("Meeting already inactive.");
      setRoomUrl(null); // Ensure roomUrl is cleared regardless
    } else {
      console.error("Failed to stop meeting:", data.error);
    }
  } catch (error) {
    console.error("Error during meeting stop:", error);
    setRoomUrl(null); // Reset on error to avoid lingering UI issues
  }
};

