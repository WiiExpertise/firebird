import type { NextApiRequest, NextApiResponse } from 'next'
import type { TweetsSchema } from '../../types/schema'

const ALLOWED_EMOTIONS = [
    'fear', 'sadness', 'anger', 'neutral', 'joy',
    'caution', 'concern', 'warning', 'hopeful',
    'anxious', 'relieved', 'frustrated', 'confused'
];

const ALLOWED_TONES = [
    'urgent', 'calm', 'sarcastic', 'worried', 'serious',
    'concerned', 'cautious', 'optimistic', 'pessimistic',
    'skeptical', 'reassuring', 'authoritative'
];

//Store tweets here?
let storedTweets : TweetsSchema = { tweets: [] };

export default function handler(
    req: NextApiRequest,
    //Added | TweetsSchema
    res: NextApiResponse<string | TweetsSchema>
) {
    if (req.method === 'POST') {
        const tweets: TweetsSchema = req.body;
        //Experimental: Append old tweets to new tweets, needs meeting to discuss details.
        //const newTweets: TweetsSchema = req.body;


        // Verify that the data matches the schema
        const isValidSchema = verifySchema(tweets);
        //Experimental feature verify step
        //const isValidSchema = verifySchema(newTweets);


        // If the data does not match the schema, return a 400 Bad Request
        if (!isValidSchema.valid) {
            console.error("Schema validation failed:", isValidSchema.errors);
            res.status(400).send("Invalid data format!");
            return;
        }

        //Store tweets in storedTweets
        storedTweets = tweets;

        //Experimental feature push step
        //storedTweets.tweets.push(...newTweets.tweets);

        console.log('Tweets stored in storedTweets: ', storedTweets);

        // Check if the front end is ready to receive the data
        const isFrontEndReady = true; // Replace with actual condition

        if (isFrontEndReady) {
            // Confirm data received
            res.status(200).send("Data received to frontend!");

        } else {
            // Log the data to the console
            console.log('Frontend not ready. Logging data:', tweets);
        }

        res.status(200).send("Data received!");
    } 
    else if (req.method === 'GET'){
        res.status(200).json(storedTweets);
    }
    else {
        // Method Not Allowed if not a POST or GET request
        res.status(405).send("Method Not Allowed");
    }
}

function verifySchema(data: TweetsSchema): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!Array.isArray(data.tweets)) {
        errors.push("tweets must be an array.");
        return { valid: false, errors };
    }

    for (const tweet of data.tweets) {
        if (typeof tweet !== 'object') {
            errors.push("Each tweet must be an object.");
            continue;
        }

        if (!tweet.hasOwnProperty('original_tweet_data') || typeof tweet.original_tweet_data !== 'object') {
            errors.push("Missing or invalid original_tweet_data.");
            continue;
        }

        const originalTweetData = tweet.original_tweet_data;

        if (!originalTweetData.hasOwnProperty('tweet_text') || typeof originalTweetData.tweet_text !== 'string') {
            errors.push("Invalid or missing tweet_text.");
        }

        if (!originalTweetData.hasOwnProperty('timestamp') || typeof originalTweetData.timestamp !== 'string') {
            errors.push("Invalid or missing timestamp.");
        }

        if (!originalTweetData.hasOwnProperty('user') || typeof originalTweetData.user !== 'object') {
            errors.push("Invalid or missing user field.");
        }

        const user = originalTweetData.user;

        if (!user.hasOwnProperty('username') || typeof user.username !== 'string') {
            errors.push("Invalid or missing username.");
        }

        if (!user.hasOwnProperty('verified') || typeof user.verified !== 'boolean') {
            errors.push("Invalid or missing verified status.");
        }

        if (!user.hasOwnProperty('followers_count') || typeof user.followers_count !== 'number') {
            errors.push("Invalid or missing followers_count.");
        }

        if (!originalTweetData.hasOwnProperty('hashtags') || !Array.isArray(originalTweetData.hashtags)) {
            errors.push("Invalid or missing hashtags array.");
        }

        for (const hashtag of originalTweetData.hashtags) {
            if (typeof hashtag !== 'string') {
                errors.push("Hashtags must be an array of strings.");
            }
        }

        if (!tweet.hasOwnProperty('analysis') || !Array.isArray(tweet.analysis)) {
            errors.push("Missing or invalid analysis field.");
            continue;
        }

        for (const analysis of tweet.analysis) {
            if (typeof analysis !== 'object') {
                errors.push("Each analysis entry must be an object.");
                continue;
            }

            if (!analysis.hasOwnProperty('disaster_name') || typeof analysis.disaster_name !== 'string') {
                errors.push("Invalid or missing disaster_name.");
            }

            if (!analysis.hasOwnProperty('relevant_to_disaster') || typeof analysis.relevant_to_disaster !== 'number') {
                errors.push("Invalid or missing relevant_to_disaster.");
            }

            if (!analysis.hasOwnProperty('sentiment') || typeof analysis.sentiment !== 'object') {
                errors.push("Invalid or missing sentiment field.");
                continue;
            }

            if (!analysis.sentiment.hasOwnProperty('emotion') || !ALLOWED_EMOTIONS.includes(analysis.sentiment.emotion)) {
                errors.push(`Invalid sentiment emotion: ${analysis.sentiment.emotion}`);
            }

            if (!analysis.sentiment.hasOwnProperty('tone') || !ALLOWED_TONES.includes(analysis.sentiment.tone)) {
                errors.push(`Invalid sentiment tone: ${analysis.sentiment.tone}`);
            }

            if (!analysis.sentiment.hasOwnProperty('polarity') || typeof analysis.sentiment.polarity !== 'number') {
                errors.push("Invalid or missing sentiment polarity.");
            }

            if (!analysis.sentiment.hasOwnProperty('details') || typeof analysis.sentiment.details !== 'object') {
                errors.push("Invalid or missing sentiment details.");
                continue;
            }

            if (!analysis.sentiment.details.hasOwnProperty('urgency') || typeof analysis.sentiment.details.urgency !== 'number') {
                errors.push("Invalid or missing urgency.");
            }

            if (!analysis.sentiment.details.hasOwnProperty('emotional_impact') || typeof analysis.sentiment.details.emotional_impact !== 'number') {
                errors.push("Invalid or missing emotional_impact.");
            }

            if (!analysis.hasOwnProperty('sarcasm_confidence') || typeof analysis.sarcasm_confidence !== 'number') {
                errors.push("Invalid or missing sarcasm_confidence.");
            }
        }
    }

    return { valid: errors.length === 0, errors };
}
