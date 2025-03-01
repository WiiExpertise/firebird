"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import Accordion from "../components/Accordion";
import TweetCard from "../components/TweetCard";

// Create skeleton of tweets
interface Tweet {
  username: string;
  handle: string;
  timestamp: string;
  content: string;
}

export default function Home() {
  const [message, setMessage] = useState("");
  const [tweets, setTweets] = useState<Tweet[]>([]); // Holds all tweets
  const [pointer, setPointer] = useState(0); // Pointer for incremental fetching
  const [displayedTweets, setDisplayedTweets] = useState<Tweet[]>([]); // Tweets to actually show (5)
  const [nextTweetIndex, setNextTweetIndex] = useState(0); // Tracks the next tweet to add

  // Fetch data from the API
  const fetchData = async () => {
    try {
      // Fetch the message from the API
      const messageResponse = await axios.get("/api/hello");
      setMessage(messageResponse.data.message);

      // Fetch the tweets from the API using the pointer
      const tweetResponse = await axios.get("/api/tweetHook", { params: { pointer } });

      if (tweetResponse.status === 204) {
        console.log("No new tweets available");
        return; // Don't update state if no new data
      }

      const newTweets = tweetResponse.data.tweets.map((tweet: any) => ({
        username: tweet.original_tweet_data.user.username,
        handle: tweet.original_tweet_data.user.username,
        timestamp: tweet.original_tweet_data.timestamp,
        content: tweet.original_tweet_data.tweet_text,
      }));

      // Append new tweets to the existing tweets
      setTweets((prevTweets) => [...prevTweets, ...newTweets]);

      // Update the pointer for the next fetch
      setPointer(tweetResponse.data.newPointer);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Function to update displayed tweets
  const updateDisplayedTweets = () => {
    setDisplayedTweets((prevDisplayedTweets) => {
      // If there are new tweets to add
      if (tweets.length > nextTweetIndex) {
        const nextTweet = tweets[nextTweetIndex]; // Get the next tweet
        const updatedTweets = [nextTweet, ...prevDisplayedTweets]; // Add the new tweet to the top

        // Ensure only 5 tweets are displayed at a time
        if (updatedTweets.length > 5) {
          return updatedTweets.slice(0, 5); // Keep only the first 5 tweets
        }
        return updatedTweets;
      }
      return prevDisplayedTweets; // No new tweets, return the current displayed tweets
    });

    // Increment the nextTweetIndex to point to the next tweet
    setNextTweetIndex((prevIndex) => prevIndex + 1);
  };

  useEffect(() => {
    fetchData(); // Fetch immediately on mount
    const fetchInterval = setInterval(fetchData, 5000); // Poll every 5 seconds

    return () => {
      clearInterval(fetchInterval);
    };
  }, [pointer]); // Re-run effect when pointer changes

  // Update displayed tweets every second
  useEffect(() => {
    const displayInterval = setInterval(() => {
      updateDisplayedTweets();
    }, 1000); // Update every second

    return () => {
      clearInterval(displayInterval);
    };
  }, [tweets, nextTweetIndex]); // Re-run effect when tweets or nextTweetIndex changes

  // Reset nextTweetIndex when tweets are updated
  useEffect(() => {
    if (tweets.length > 0 && nextTweetIndex >= tweets.length) {
      setNextTweetIndex(0); // Reset index if we've reached the end of the tweets array
    }
  }, [tweets, nextTweetIndex]);

  // Test Data
  const [numItems, setNumItems] = useState(3); // Initial number of items
  const [data, setData] = useState([
    {
      title: "There's a Fire!",
      keyword: "Fire",
      summary: "A large fire has started in the city center.",
      location: "City Center, Downtown",
      severity: "High",
    },
    {
      title: "There's a flood!",
      keyword: "Flood",
      summary: "There has been a flash flood in the coastal region.",
      location: "Coastal Region",
      severity: "Medium",
    },
    {
      title: "There's an Earthquake!",
      keyword: "Earthquake",
      summary: "A Geodude used magnitude! Magnitude 10!",
      location: "Kanto Region",
      severity: "Severe",
    },
  ]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-row-reverse">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 min-h-screen p-4">
        <div className="text-2xl font-bold mb-6">Firebird</div>
        <h3 className="font-semibold uppercase text-gray-400 text-sm mb-4">
          Tweets of Disaster
        </h3>

        {/* Render TweetCards */}
        <div className="space-y-4">
          {displayedTweets.map((tweet, index) => (
            <TweetCard
              key={index}
              username={tweet.username}
              handle={tweet.handle}
              timestamp={tweet.timestamp}
              content={tweet.content}
            />
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <header className="flex justify-between items-center mb-8 flex-row-reverse">
          <div className="space-x-4">
            <button className="bg-gray-800 p-2 rounded-full">🔔</button>
            <button className="bg-gray-800 p-2 rounded-full">🌙</button>
          </div>
          <h1 className="text-2xl font-bold">All Disasters</h1>
        </header>

        {/* Overview Boxes */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 p-4 rounded-lg shadow-md">Predifined tab of disaster</div>
          <div className="bg-gray-800 p-4 rounded-lg shadow-md">Predifined tab of disaster</div>
          <div className="bg-gray-800 p-4 rounded-lg shadow-md">Predifined tab of disaster</div>
          <div className="bg-gray-800 p-4 rounded-lg shadow-md">Predifined tab of disaster</div>
        </section>

        {/* Display API Response */}
        <section className="mt-8">
          <h2 className="text-xl font-semibold mb-2">API Response:</h2>
          <div className="bg-gray-800 p-4 rounded-lg shadow-md">
            {message || "Loading..."}
          </div>
        </section>

        {/* Accordion Section */}
        <section className="mt-8">
          <h2 className="text-xl font-semibold mb-2">Accordion Section:</h2>
          <div className="bg-gray-800 p-4 rounded-lg shadow-md">
            {/* Render Accordion with dynamic number of items */}
            <Accordion numItems={numItems} data={data} />
          </div>
        </section>

        {/* Controls */}
        <section className="mt-8">
          <button
            onClick={() => setNumItems(numItems + 1)} // Increase the number of accordion items
            className="bg-blue-500 text-white p-2 rounded"
          >
            Add Accordion Item
          </button>
          <button
            onClick={() => setNumItems(numItems - 1)} // Decrease the number of accordion items
            className="bg-red-500 text-white p-2 rounded ml-4"
            disabled={numItems <= 1}
          >
            Remove Accordion Item
          </button>
        </section>
      </main>
    </div>
  );
}