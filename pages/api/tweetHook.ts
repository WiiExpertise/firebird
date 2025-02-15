import type { NextApiRequest, NextApiResponse } from 'next'
import type { TweetsSchema } from '../../types/schema'

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<string>
) {
    if (req.method === 'POST') {
        const tweets: TweetsSchema = req.body;

        // Verify that the data matches the schema
        const isValidSchema = verifySchema(tweets);

        // If the data does not match the schema, return a 400 Bad Request
        if (!isValidSchema) {
            res.status(400).send("Invalid data format!");
            return;
        }

        // Check if the front end is ready to receive the data
        const isFrontEndReady = false; // Replace with actual condition

        if (isFrontEndReady) {
            // Not implemented yet
        } else {
            // Log the data to the console
            console.log('Front end not ready. Logging data:', tweets);
        }

        res.status(200).send("Data received!");
    } else {
        // Method Not Allowed if not a POST request
        res.status(405).send("Method Not Allowed");
    }
}

function verifySchema(data: TweetsSchema): boolean {
    // Check if the tweets array exists
    if(!Array.isArray(data.tweets)) {
        return false;
    }

    // Check if all tweets have the required fields and types
    for (const tweet of data.tweets) {
        if (typeof tweet !== 'object') {
            return false;
        }

        if (!tweet.hasOwnProperty('original_tweet_data') || typeof tweet.original_tweet_data !== 'object') {
            return false;
        }

        const originalTweetData = tweet.original_tweet_data;

        if (!originalTweetData.hasOwnProperty('tweet_text') || typeof originalTweetData.tweet_text !== 'string') {
            return false;
        }

        if (!originalTweetData.hasOwnProperty('timestamp') || typeof originalTweetData.timestamp !== 'string') {
            return false;
        }

        if (!originalTweetData.hasOwnProperty('user') || typeof originalTweetData.user !== 'object') {
            return false;
        }

        const user = originalTweetData.user;

        if (!user.hasOwnProperty('username') || typeof user.username !== 'string') {
            return false;
        }

        if (!user.hasOwnProperty('verified') || typeof user.verified !== 'boolean') {
            return false;
        }

        if (!user.hasOwnProperty('followers_count') || typeof user.followers_count !== 'number') {
            return false;
        }

        if (!originalTweetData.hasOwnProperty('hashtags') || !Array.isArray(originalTweetData.hashtags)) {
            return false;
        }

        for (const hashtag of originalTweetData.hashtags) {
            if (typeof hashtag !== 'string') {
                return false;
            }
        }

        if (!tweet.hasOwnProperty('analysis') || !Array.isArray(tweet.analysis)) {
            return false;
        }

        for (const analysis of tweet.analysis) {
            if (typeof analysis !== 'object') {
                return false;
            }

            if (!analysis.hasOwnProperty('disaster_name') || typeof analysis.disaster_name !== 'string') {
                return false;
            }

            if (!analysis.hasOwnProperty('relevant_to_disaster') || typeof analysis.relevant_to_disaster !== 'number') {
                return false;
            }

            if (!analysis.hasOwnProperty('sentiment') || typeof analysis.sentiment !== 'object') {
                return false;
            }

            if (!analysis.sentiment.hasOwnProperty('emotion') || !['fear', 'sadness', 'anger', 'neutral', 'joy'].includes(analysis.sentiment.emotion)) {
                return false;
            }

            if (!analysis.sentiment.hasOwnProperty('tone') || !['urgent', 'calm', 'sarcastic', 'worried'].includes(analysis.sentiment.tone)) {
                return false;
            }

            if (!analysis.sentiment.hasOwnProperty('polarity') || typeof analysis.sentiment.polarity !== 'number') {
                return false;
            }

            if (!analysis.sentiment.hasOwnProperty('details') || typeof analysis.sentiment.details !== 'object') {
                return false;
            }

            if (!analysis.sentiment.details.hasOwnProperty('urgency') || typeof analysis.sentiment.details.urgency !== 'number') {
                return false;
            }

            if (!analysis.sentiment.details.hasOwnProperty('emotional_impact') || typeof analysis.sentiment.details.emotional_impact !== 'number') {
                return false;
            }

            if (!analysis.hasOwnProperty('sarcasm_confidence') || typeof analysis.sarcasm_confidence !== 'number') {
                return false;
            }
        }
    }

    return true;
}