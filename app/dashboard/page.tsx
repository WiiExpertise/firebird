"use client";
import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";
import TweetCard from "../../components/TweetCard";

export function TweetsSidebar() {
  interface Tweet {
    username: string;
    handle: string;
    timestamp: string;
    content: string;
  }

  const [tweets, setTweets] = useState<Tweet[]>([]);

  useEffect(() => {
    axios
      .get("/api/tweetHook")
      .then((response) => {
        const fetchedTweets: Tweet[] = response.data.tweets.map((tweet: any) => ({
          username: tweet.original_tweet_data.user.username,
          handle: tweet.original_tweet_data.user.username,
          timestamp: tweet.original_tweet_data.timestamp,
          content: tweet.original_tweet_data.tweet_text,
        }));
        setTweets(fetchedTweets);
      })
      .catch((error) => console.error("Error fetching tweets:", error));
  }, []);

  return (
    <aside className="w-96 bg-red-600/90 text-black p-4 rounded-lg shadow-md fixed right-6 top-24 h-[calc(100vh-6rem)] overflow-y-auto z-40">
      <h3 className="text-xl font-semibold mb-4 text-white">Latest Tweets</h3>
      <div className="space-y-4 flex flex-col">
        {tweets.map((tweet, index) => (
          <TweetCard
            key={index}
            author={tweet.username}
            handle={tweet.handle}
            timestamp={tweet.timestamp}
            content={tweet.content}
          />
        ))}
      </div>
    </aside>
  );
}

export default function FirebirdDashboard() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios.get("/api/hello").then(response => setMessage(response.data.message)).catch(error => console.error("Error fetching API:", error));
  }, []);

  return (
    <div className="bg-stone-300 min-h-screen p-6 relative">
      <header className="bg-red-600/90 text-white p-4 w-full fixed top-2 left-0 z-50 rounded-2xl mt-2">
        <div className="flex justify-between items-center">
          <Link href="/dashboard">
            <h1 className="text-2xl font-bold text-white">🔥 Firebird</h1>
          </Link>
          <nav className="space-x-4">
            <Link href="/alldisasters">
              <button className="hover:underline text-white">All Disasters</button>
            </Link>
            <Link href="/map">
              <button className="hover:underline text-white">Map</button>
            </Link>
          </nav>
        </div>
      </header>
      <div className="flex gap-6 items-start pt-24 max-w-full">
        <main className="flex-1 max-w-[70%] mr-8">
          <div className="flex justify-end mb-4">
            <img src="/images/sort.png" alt="Sort" className="w-6 h-6 cursor-pointer" />
          </div>
          <section className="grid grid-cols-2 gap-6 mb-8 mr-8">
            {["Fire", "Flood", "Earthquake", "Cyclone"].map((disaster, index) => (
              <div key={index} className="bg-red-100 p-6 rounded-lg shadow-md text-red-600 flex flex-col items-center justify-center text-center">
                <img src={`/images/${disaster.toLowerCase()}.jpg`} alt={disaster} className="w-full h-40 object-cover rounded mb-2" />
                <h3 className="text-2xl font-bold mb-2 text-red-700">{disaster}</h3>
                <div className="mt-2 space-y-2">
                  <p className="text-base text-red-500 font-medium">Key Info</p>
                  <p className="text-base text-red-500 font-medium">Nearest Relief Center</p>
                </div>
              </div>
            ))}
          </section>
        </main>
        <TweetsSidebar />
      </div>
    </div>
  );
}
