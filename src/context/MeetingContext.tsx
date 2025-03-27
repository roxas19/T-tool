import React, { createContext, useContext, useReducer } from "react";

export type MeetingState = {
  isActive: boolean;
  state: "setup" | "inProgress" | "closed";
  meetingName: string;
  roomUrl: string | null;
};

const initialMeetingState: MeetingState = {
  isActive: false,
  state: "setup",
  meetingName: "default-meeting",
  roomUrl: null,
};

type MeetingAction =
  | { type: "OPEN_MEETING" }
  | { type: "CLOSE_MEETING" }
  | { type: "RESET_MEETING" } // resets meetingName and roomUrl
  | { type: "SET_MEETING_STATE"; payload: "setup" | "inProgress" | "closed" }
  | { type: "SET_MEETING_NAME"; payload: string }
  | { type: "SET_ROOM_URL"; payload: string | null }
  | { type: "SET_MEETING_DETAILS"; payload: { meetingName: string; roomUrl: string } };

function meetingReducer(state: MeetingState, action: MeetingAction): MeetingState {
  switch (action.type) {
    case "OPEN_MEETING":
      return {
        ...state,
        isActive: true,
        state: "setup",
      };
    case "CLOSE_MEETING":
      return {
        ...state,
        isActive: false,
        state: "closed",
        meetingName: "default-meeting",
        roomUrl: null,
      };
    case "RESET_MEETING":
      return {
        ...state,
        meetingName: "default-meeting",
        roomUrl: null,
      };
    case "SET_MEETING_STATE":
      return {
        ...state,
        state: action.payload,
        isActive: action.payload !== "closed",
      };
    case "SET_MEETING_NAME":
      return {
        ...state,
        meetingName: action.payload,
      };
    case "SET_ROOM_URL":
      return {
        ...state,
        roomUrl: action.payload,
      };
    case "SET_MEETING_DETAILS":
      return {
        ...state,
        meetingName: action.payload.meetingName,
        roomUrl: action.payload.roomUrl,
      };
    default:
      return state;
  }
}

type MeetingContextType = {
  meetingState: MeetingState;
  meetingDispatch: React.Dispatch<MeetingAction>;
};

const MeetingContext = createContext<MeetingContextType | undefined>(undefined);

export const MeetingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [meetingState, meetingDispatch] = useReducer(meetingReducer, initialMeetingState);

  return (
    <MeetingContext.Provider value={{ meetingState, meetingDispatch }}>
      {children}
    </MeetingContext.Provider>
  );
};

export const useMeetingContext = () => {
  const context = useContext(MeetingContext);
  if (!context) {
    throw new Error("useMeetingContext must be used within a MeetingProvider");
  }
  return context;
};