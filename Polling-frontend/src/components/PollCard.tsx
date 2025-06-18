import { useEffect, useState } from "react";
import { Clock, User, TrendingUp, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

interface PollOption {
  id: number;
  text: string;
  votes: number;
  votedBy?: string[];
}

interface Poll {
  id: string;
  question: string;
  image?: {
    optimizedUrl: string;
  };
  optimizedUrl: string;
  options: PollOption[];
  totalVotes: number;
  createdAt: Date;
  createdBy?: {
    username: string;
  } | string;
  votedUsers?: string[]; // array of user IDs who voted in this poll
}

interface PollCardProps {
  poll: Poll;
  onVote: (pollId: string, optionId: number) => void;
  onDelete: (pollId: string) => void;
  onEdit: (poll: Poll) => void;
}

const PollCard = ({ poll, onVote, onDelete, onEdit }: PollCardProps) => {
  const { user } = useAuth();
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  useEffect(() => {
    if (user && Array.isArray(poll.votedUsers)) {
      const voted = poll.votedUsers.includes(user._id);
      console.log(user._id, "voted")
      setHasVoted(voted);

      if (voted) {
        // Find which option user voted for (optional enhancement)
        const votedOption = poll.options.find(opt =>
          opt.votedBy?.includes(user._id)
        );
        if (votedOption) {
          setSelectedOption(votedOption.id);
        }
      }
    }
  }, [poll.votedUsers, user, poll.options]);

  const handleVote = (optionId: number) => {
    console.log(optionId)
    if (!hasVoted) {
      onVote(poll.id, optionId);
      setHasVoted(true);
      setSelectedOption(optionId);
    }
  };

  const getPercentage = (votes: number) => {
    return poll.totalVotes > 0 ? (votes / poll.totalVotes) * 100 : 0;
  };

  const formatTimeAgo = (dateInput: string | Date) => {
    const date = new Date(dateInput);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

    if (seconds < 60) return `${seconds} seconds ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    return `${days} days ago`;
  };

  // Handle createdBy to display username
  const displayUsername = typeof poll.createdBy === "string"
    ? poll.createdBy
    : poll.createdBy?.username ?? "Anonymous";

  // Check if the current user is the poll creator
  const isCreator = user && (typeof poll.createdBy === "string"
    ? poll.createdBy === user.name // Use user.username or user.id based on backend
    : poll.createdBy?.username === user.name);

  return (
    <Card className="overflow-hidden bg-white/80 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      {/* Image Header */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={poll?.image?.optimizedUrl ?? "https://via.placeholder.com/400x200"}
          alt={poll.question}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-white font-semibold text-lg leading-tight">
            {poll.question}
          </h3>
        </div>
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>{displayUsername}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{formatTimeAgo(poll.createdAt)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-blue-600">
              <TrendingUp className="w-4 h-4" />
              <span className="font-medium">{poll.totalVotes} votes</span>
            </div>
            {isCreator && (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(poll)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(poll.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {poll.options.map((option) => (
            <div key={option.id} className="relative">
              {hasVoted ? (
                <div className="relative">
                  <div className="flex justify-between items-center mb-1">
                    <span
                      className={`font-medium ${selectedOption === option.id
                        ? "text-blue-600"
                        : "text-gray-700"
                        }`}
                    >
                      {option.text}
                    </span>
                    <span className="text-sm text-gray-600">
                      {option.votes} ({getPercentage(option.votes).toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${selectedOption === option.id
                        ? "bg-gradient-to-r from-blue-500 to-purple-500"
                        : "bg-gray-400"
                        }`}
                      style={{ width: `${getPercentage(option.votes)}%` }}
                    />
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full text-left justify-start hover:bg-blue-50 hover:border-blue-300 transition-colors duration-200"
                  onClick={() => handleVote(option.id)}
                >
                  {option.text}
                </Button>
              )}
            </div>
          ))}
        </div>

        {hasVoted && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 text-sm font-medium text-center">
              ✓ Thanks for voting!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PollCard;