import { useState, useEffect } from "react";
import { X, Plus, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PollOption {
  id: number;
  text: string;
  votes: number;
}

interface Poll {
  id: string;
  question: string;
  image?: {
    optimizedUrl: string;
  };
  options: PollOption[];
  totalVotes: number;
  createdAt: Date;
  createdBy?: {
    username: string;
  } | string;
}

interface CreatePollProps {
  onClose: () => void;
  onSubmit: (poll: Poll) => void;
  initialData?: Poll;
}

const CreatePoll = ({ onClose, onSubmit, initialData }: CreatePollProps) => {
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Prefill form with initialData when editing
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.question || "");
      setImageUrl(initialData.image?.optimizedUrl || "");
      setOptions(initialData.options.map((opt) => opt.text) || ["", ""]);
    }
  }, [initialData]);

  const addOption = () => {
    if (options.length < 5) {
      setOptions([...options, ""]);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate form
    if (!title.trim() || !imageUrl.trim() || options.some((opt) => !opt.trim())) {
      alert("Please fill in all fields");
      setIsSubmitting(false);
      return;
    }

    // Create poll object, preserving existing fields
    const newPoll: Poll = {
      ...(initialData || {}), // Spread existing fields (id, totalVotes, createdAt, createdBy)
      title: title.trim(),
      image: imageUrl.trim(),
      options: options.map((opt, index) => ({
        id: initialData?.options[index]?.id || index + 1, // Preserve option IDs
        text: opt.trim(),
        votes: initialData?.options[index]?.votes || 0, // Preserve votes
      })),
    };

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    onSubmit(newPoll);
    setIsSubmitting(false);
  };

  const suggestedImages = [
    "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&h=300&fit=crop",
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm border-white/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {initialData ? "Edit Poll" : "Create New Poll"}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Poll Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-base font-medium">
                Poll Question *
              </Label>
              <Input
                id="title"
                placeholder="What's your question?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg py-3"
                maxLength={200}
              />
              <p className="text-sm text-gray-500">{title.length}/200 characters</p>
            </div>

            {/* Image URL */}
            <div className="space-y-2">
              <Label htmlFor="image" className="text-base font-medium">
                Poll Image URL *
              </Label>
              <Input
                id="image"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="mb-2"
              />

              {/* Suggested Images */}
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Or choose from suggested images:</p>
                <div className="grid grid-cols-2 gap-2">
                  {suggestedImages.map((url, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setImageUrl(url)}
                      className="relative h-20 rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-500 transition-colors"
                    >
                      <img src={url} alt={`Suggestion ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Image Preview */}
              {imageUrl && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Preview:</p>
                  <div className="relative h-32 rounded-lg overflow-hidden border">
                    <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}
            </div>

            {/* Poll Options */}
            <div className="space-y-2">
              <Label className="text-base font-medium">Poll Options * (2-5 options)</Label>
              <div className="space-y-3">
                {options.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder={`Option ${index + 1}`}
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      className="flex-1"
                      maxLength={100}
                    />
                    {options.length > 2 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeOption(index)}
                        className="px-3"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {options.length < 5 && (
                <Button type="button" variant="outline" onClick={addOption} className="w-full mt-2">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Option
                </Button>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : initialData ? "Update Poll" : "Create Poll"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreatePoll;