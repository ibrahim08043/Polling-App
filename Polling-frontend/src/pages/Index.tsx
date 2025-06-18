import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { io } from "socket.io-client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import PollCard from "@/components/PollCard";
import CreatePoll from "@/components/CreatePoll";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const [polls, setPolls] = useState<any[]>([]);
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const [editingPoll, setEditingPoll] = useState<any | null>(null);
  const { isLoggedIn, user, loading, logout } = useAuth();
  const socket = io("http://localhost:3002"); // adjust if using env
  // Get all polls on mount
  const fetchPolls = async () => {
    try {
      const res = await fetch("http://localhost:3002/api/polls");
      const data = await res.json();
      const mappedPolls = data.map((poll: any) => ({
        ...poll,
        id: poll._id, // Map _id to id
        options: poll.options.map((opt: any, index: number) => ({
          ...opt,
          id: opt.id || index + 1, // Ensure option IDs
        })),
      }));
      setPolls(mappedPolls);
    } catch (err) {
      console.error("Failed to load polls", err);
    }
  };
  useEffect(() => {
    fetchPolls();
  }, []);

  useEffect(() => {
    const socket = io("http://localhost:3002");

    socket.on("pollCreated", (newPoll) => {
      const mappedPoll = {
        ...newPoll,
        id: newPoll._id,
        options: newPoll.options.map((opt, index) => ({
          ...opt,
          id: opt.id || index + 1,
        })),
      };
      setPolls(prev => [mappedPoll, ...prev]);
    });

    socket.on("pollUpdated", (updatedPoll) => {
      const mappedPoll = {
        ...updatedPoll,
        id: updatedPoll._id,
        options: updatedPoll.options.map((opt, index) => ({
          ...opt,
          id: opt.id || index + 1,
        })),
      };
      setPolls(prev => prev.map(p => (p.id === mappedPoll.id ? mappedPoll : p)));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Create poll
  const handleCreatePoll = async (newPoll: any) => {
    const formData = new FormData();
    formData.append("question", newPoll.title);
    formData.append("options", JSON.stringify(newPoll.options));

    if (newPoll.image instanceof File) {
      formData.append("image", newPoll.image);
    } else if (typeof newPoll.image === "string") {
      const res = await fetch(newPoll.image);
      const blob = await res.blob();
      const file = new File([blob], "image.jpg", { type: blob.type });
      formData.append("image", file);
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3002/api/polls/create", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const createdPoll = await res.json();
      // setPolls([{ ...createdPoll, id: createdPoll._id }, ...polls]);
      fetchPolls()
      setShowCreatePoll(false);
    } catch (err) {
      console.error("Poll creation failed:", err);
    }
  };

  // Edit poll
  const handleEditPoll = async (updatedPoll: any) => {
    console.log(updatedPoll, "updatedPoll")
    const formData = new FormData();
    formData.append("question", updatedPoll.title);
    formData.append("options", JSON.stringify(updatedPoll.options));

    if (updatedPoll.image instanceof File) {
      formData.append("image", updatedPoll.image);
    } else if (typeof updatedPoll.image === "string") {
      formData.append("imageUrl", updatedPoll.image);
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:3002/api/polls/${updatedPoll.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const editedPoll = await res.json();
      // setPolls((prev) =>
      //   prev.map((poll) => (poll.id === editedPoll._id ? { ...editedPoll, id: editedPoll._id } : poll))
      // );
      fetchPolls()
      setEditingPoll(null);
      setShowCreatePoll(false);
    } catch (err) {
      console.error("Poll edit failed:", err);
    }
  };

  // Vote handler
  const handleVote = async (pollId: string, optionIndex: number) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3002/api/polls/vote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ pollId, optionIndex }),
      });
      const data = await res.json();
      // setPolls((prev) =>
      //   prev.map((poll) => (poll.id === pollId ? { ...data.poll, id: data.poll._id } : poll))
      // );
      fetchPolls()
    } catch (err) {
      console.error("Voting failed", err);
    }
  };

  // Delete poll
  const deletePoll = async (pollId: string) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`http://localhost:3002/api/polls/${pollId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPolls(polls.filter((poll) => poll.id !== pollId));
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  // Handle edit button click
  const handleEditClick = (poll: any) => {
    setEditingPoll(poll);
    setShowCreatePoll(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Polling App
            </h1>
            <p className="text-gray-600 text-sm">Create and vote on polls</p>
          </div>

          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <>
                <Button
                  onClick={() => {
                    setEditingPoll(null);
                    setShowCreatePoll(true);
                  }}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" /> Create Poll
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                          <User className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <div className="p-2">
                      {user?.name && <p className="font-medium">{user.name}</p>}
                      <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" /> Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Button asChild variant="ghost">
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {polls.map((poll) => (
            <PollCard
              key={poll.id}
              poll={poll}
              onVote={handleVote}
              onDelete={deletePoll}
              onEdit={handleEditClick}
            />
          ))}
        </div>

        {polls.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 max-w-md mx-auto border border-white/20">
              <h3 className="text-2xl font-semibold text-gray-700 mb-4">No polls yet</h3>
              <p className="text-gray-600 mb-6">Be the first to create a poll and start the conversation!</p>
              {isLoggedIn ? (
                <Button
                  onClick={() => {
                    setEditingPoll(null);
                    setShowCreatePoll(true);
                  }}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Plus className="w-4 h-4 mr-2" /> Create Your First Poll
                </Button>
              ) : (
                <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Link to="/login">
                    <Plus className="w-4 h-4 mr-2" /> Login to Create Poll
                  </Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </main>

      {showCreatePoll && isLoggedIn && (
        <CreatePoll
          onClose={() => {
            setShowCreatePoll(false);
            setEditingPoll(null);
          }}
          onSubmit={editingPoll ? handleEditPoll : handleCreatePoll}
          initialData={editingPoll}
        />
      )}
    </div>
  );
};

export default Index;