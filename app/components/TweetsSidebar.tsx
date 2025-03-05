import axios from "axios";
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
    <aside className="w-96 bg-[#DB3737] text-black p-4 rounded-lg shadow-md fixed right-6 top-24 bottom-4 overflow-y-auto z-40">
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


