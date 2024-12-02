import { useState } from "react";
import { useChat } from "ai/react";
import { Message } from "ai/react";
import { Luggage } from "lucide-react";
import Image from "next/image";

const Chat = () => {
  const [submitType, setSubmitType] = useState<"text" | "image">("text");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: "/api/openai",
  });

  const getImageData = async () => {
    try {
      const response = await fetch("/api/dall-e", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: input }),
      });
      const { imageUrl } = await response.json();
      setImageUrl(imageUrl);
      setError("");
    } catch (e) {
      setError(`An error occurred calling the API: ${e}`);
    }
    setLoading(false);
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (submitType === "text") {
      handleSubmit(event);
    } else {
      setLoading(true);
      setImageUrl("");
      await getImageData();
    }
  };

  const userColors = {
    user: "#4e663c",
    assistant: "#a04d31",
    function: "#fff",
    system: "#fff",
    tool: "#fff",
    data: "#fff",
  };

  const handleDownload = (messages: Message[]) => {
    const content = messages
      .filter(
        (message) =>
          message.role === "assistant" && message.content.includes("Day 1")
      )
      .map((assistantMessage) => assistantMessage.content)
      .join("\n\n");

    // Check if there is any content to download
    if (!content.trim()) {
      alert("No itinerary found to download.");
      return;
    }

    // create a text file for the itinerary
    // content is put in an array because Blob accepts data in an array format
    const blob = new Blob([content], { type: "text/plain" });

    // create a temp URL for the blob
    const temporaryURL = URL.createObjectURL(blob);
    // an anchor tag
    const link = document.createElement("a");
    link.href = temporaryURL;
    link.download = "itinerary.txt";

    // a click is simulated
    link.click();

    // cleans up the temporary link.
    URL.revokeObjectURL(link.href);
  };

  const renderResponse = () => {
    if (submitType === "text") {
      return (
        <div className="response">
          {messages.length === 0 && !imageUrl && (
            <div className="initial-screen-container">
              <section className="initial-screen">
                <Luggage className="luggage-icon" />
                <p>Lets chat to make you a dream travel plan...</p>
              </section>
            </div>
          )}
          {/* if messages exist in the array then iterate over them and display them in the response div, line by line */}
          {messages.length > 0
            ? messages.map((message) => (
                <div key={message.id} className="chat-line">
                  {/* chat author */}
                  <span
                    className="chat-author"
                    style={{ color: userColors[message.role] }}
                  >
                    {message.role === "user" ? "User: " : "WanderPal: "}
                  </span>
                  {/* chat content */}
                  <span className="chat-content">{message.content}</span>
                </div>
              ))
            : error}
        </div>
      );
    } else {
      return (
        // if the submitType is 'image' then display the loading spinner whilst image is being fetched
        <div className="response">
          {loading && <div className="loading-spinner"></div>}
          {/* Show the generated image if available */}
          {imageUrl && (
            <Image
              src={imageUrl}
              className="image-box"
              alt="Generated image"
              width="400"
              height="400"
            />
          )}
        </div>
      );
    }
  };

  return (
    <>
      {renderResponse()}
      {messages.some((m) => m.role === "assistant") && (
        <div className="download-button-container">
          <button
            className="download-button"
            onClick={() => handleDownload(messages)}
          >
            Download Itinerary
          </button>
        </div>
      )}
      <form onSubmit={onSubmit} className="mainForm">
        <input
          name="input-field"
          placeholder="Share your plans..."
          onChange={handleInputChange}
          value={input}
          className="formInput"
        />
        <div className="btn-container">
          <button
            type="submit"
            className="mainButton"
            disabled={loading}
            onClick={() => setSubmitType("text")}
          >
            Chat
          </button>
          <button
            type="submit"
            className="secondaryButton"
            disabled={loading}
            onClick={() => setSubmitType("image")}
          >
            Generate Image
          </button>
        </div>
      </form>
    </>
  );
};

export default Chat;
