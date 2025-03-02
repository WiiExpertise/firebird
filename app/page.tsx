"use client";
import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";
import Accordion from "../components/Accordion";
import TweetCard from "../components/TweetCard";


//Create skeleton of tweets
interface Tweet {
  username: string;
  handle: string;
  timestamp: string;
  content: string;
}

export default function Home() {
  const [message, setMessage] = useState("");
  const [tweets, setTweets] = useState<Tweet[]>([]);

  useEffect(() => {
    // Fetch the message from the API
    axios
      .get("/api/hello")
      .then((response) => {
        setMessage(response.data.message);
      })
      .catch((error) => {
        console.error("Error fetching API:", error);
      });

    // Fetch the tweets from the API
    axios
      .get("/api/tweetHook")
      .then((response) => {
        const fetchedTweets = response.data.tweets.map((tweet: any) => ({
          username: tweet.original_tweet_data.user.username,
          handle: tweet.original_tweet_data.user.username,
          timestamp: tweet.original_tweet_data.timestamp,
          content: tweet.original_tweet_data.tweet_text,
        }));
        setTweets(fetchedTweets);
      })
      .catch((error) => {
        console.error("Error fetching tweets:", error);
      });
  }, []);


  {/* Test Data */}

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
      <Link href="/dashboard">
            <h1 className="text-2xl font-bold text-white">🔥 Firebird</h1>
          </Link>
        
        <h3 className="font-semibold uppercase text-gray-400 text-sm mb-4">
          Tweets of Disaster
        </h3>

        {/* Render TweetCards */}
        <div className="space-y-4">
          {tweets.map((tweet, index) => (
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
