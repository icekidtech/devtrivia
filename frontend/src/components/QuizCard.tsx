import { useState } from 'react';
import QRCode from 'react-qr-code';

type QuizCardProps = {
  quiz: {
    id: string;
    title: string;
    description?: string;
    published?: boolean;
    joinCode?: string;
    questions?: any[];
  };
  onEdit: (id: string) => void;
  onDelete?: (id: string) => void;
  onPublish?: (id: string) => void;
  onUnpublish?: (id: string) => void;
  onViewLeaderboard?: (id: string) => void;
  showActions?: boolean;
};

export default function QuizCard({
  quiz,
  onEdit,
  onDelete,
  onPublish,
  onUnpublish,
  onViewLeaderboard,
  showActions = true
}: QuizCardProps) {
  const [showQR, setShowQR] = useState(false);

  return (
    <div className="cyberpunk-card group">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold group-hover:text-primary transition-colors duration-300">{quiz.title}</h3>
          {quiz.description && <p className="text-text/70">{quiz.description}</p>}
          <p className="text-sm text-text/60 mt-1">
            Questions: {quiz.questions?.length || 0}
            {quiz.published && (
              <span className="ml-4 text-success">
                Published
              </span>
            )}
          </p>
        </div>
        
        {quiz.published && (
          <div className="text-center">
            <div className="bg-primary/10 border border-primary/40 text-primary px-3 py-1 rounded-md mb-2">
              <span className="font-mono font-bold">Join Code: {quiz.joinCode}</span>
            </div>
            
            {showQR ? (
              <div className="my-3 bg-background p-3 inline-block rounded border border-primary/30">
                <QRCode 
                  value={`${typeof window !== 'undefined' ? window.location.origin : ''}/join?code=${quiz.joinCode}`} 
                  size={100}
                  bgColor={"rgba(26, 26, 46, 0.8)"}
                  fgColor={"#00D4FF"}
                />
              </div>
            ) : (
              <button 
                onClick={() => setShowQR(true)}
                className="text-sm text-primary hover:underline"
              >
                Show QR Code
              </button>
            )}
            
            {onUnpublish && (
              <button
                onClick={() => onUnpublish(quiz.id)}
                className="text-error hover:text-error hover:underline text-sm block mt-2"
              >
                Unpublish Quiz
              </button>
            )}
          </div>
        )}
        
        {!quiz.published && onPublish && (
          <button
            onClick={() => onPublish(quiz.id)}
            className="cyberpunk-btn"
            disabled={!quiz.questions?.length}
          >
            Publish Quiz
          </button>
        )}
      </div>
      
      {showActions && (
        <div className="flex space-x-2 mt-4">
          <button
            onClick={() => onEdit(quiz.id)}
            className="bg-primary/20 hover:bg-primary/30 text-primary px-4 py-1 rounded border border-primary/30 transition-colors duration-300"
          >
            {quiz.published ? "View Questions" : "Edit Questions"}
          </button>
          
          {onViewLeaderboard && (
            <button
              onClick={() => onViewLeaderboard(quiz.id)}
              className="bg-secondary/20 hover:bg-secondary/30 text-secondary px-4 py-1 rounded border border-secondary/30 transition-colors duration-300"
            >
              View Leaderboard
            </button>
          )}
          
          {!quiz.published && onDelete && (
            <button
              onClick={() => onDelete(quiz.id)}
              className="bg-error/20 hover:bg-error/30 text-error px-4 py-1 rounded border border-error/30 transition-colors duration-300"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}