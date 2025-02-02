// meetingFunctions.ts
export const startMeeting = async (meetingName: string): Promise<string | null> => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/dailyco/${meetingName}/start/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );
      const data = await response.json();
      return response.ok ? data.room_url : null;
    } catch {
      return null;
    }
  };
  
  export const stopMeeting = async (meetingName: string) => {
    try {
      await fetch(`http://localhost:8000/api/dailyco/${meetingName}/stop/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
    } catch {
      // Handle error as needed
    }
  };
  