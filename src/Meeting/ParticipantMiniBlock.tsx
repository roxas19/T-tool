import React, { useState, useRef, useEffect } from 'react';
import { useParticipant } from '@daily-co/daily-react';
import { ParticipantPermission } from './participantControls';
import '../css/MeetingApp.css';

interface ParticipantMiniBlockProps {
  participantId: string;
  currentPermissions: ParticipantPermission;
  onPermissionChange: (participantId: string, permission: ParticipantPermission) => void;
}

const ParticipantMiniBlock: React.FC<ParticipantMiniBlockProps> = ({
  participantId,
  currentPermissions,
  onPermissionChange,
}) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const blockRef = useRef<HTMLDivElement>(null);
  const participant = useParticipant(participantId);

  // Handle clicking outside to close popover
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (blockRef.current && !blockRef.current.contains(event.target as Node)) {
        setIsPopoverOpen(false);
      }
    };

    if (isPopoverOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPopoverOpen]);

  const toggleAudio = () => {
    onPermissionChange(participantId, {
      ...currentPermissions,
      audio: !currentPermissions.audio,
    });
  };

  const toggleVideo = () => {
    onPermissionChange(participantId, {
      ...currentPermissions,
      video: !currentPermissions.video,
    });
  };

  return (
    <div className="participant-mini-block" ref={blockRef}>
      <div 
        className="mini-block-display"
        onClick={() => setIsPopoverOpen(!isPopoverOpen)}
      >
        <span className="participant-name">
          {participant?.user_name || 'Guest'} {participant?.local && '(You)'}
        </span>
        <div className="participant-status">
          {participant?.tracks.audio?.state === 'off' && <span className="muted">🔇</span>}
          {participant?.tracks.video?.state === 'off' && <span className="muted">📷</span>}
        </div>
      </div>

      {isPopoverOpen && (
        <div className="permission-popover">
          <div className="permission-buttons">
            <button 
              onClick={toggleAudio}
              className={`control-button ${currentPermissions.audio ? 'active' : ''}`}
            >
              {currentPermissions.audio ? 'Revoke Audio' : 'Grant Audio'}
            </button>
            <button 
              onClick={toggleVideo}
              className={`control-button ${currentPermissions.video ? 'active' : ''}`}
            >
              {currentPermissions.video ? 'Revoke Video' : 'Grant Video'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParticipantMiniBlock;