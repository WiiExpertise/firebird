interface User {
    username: string;
    verified: boolean;
    followers_count: number;
}

interface OriginalTweetData {
    tweet_text: string;
    timestamp: string;
    user: User;
    hashtags: string[];
}

interface SentimentDetails {
    urgency: number;
    emotional_impact: number;
}

interface Sentiment {
    emotion: 'fear' | 'sadness' | 'anger' | 'neutral' | 'joy';
    tone: 'urgent' | 'calm' | 'sarcastic' | 'worried';
    polarity: number;
    details: SentimentDetails;
}

interface Analysis {
    disaster_name: 'Wildfire' | 'Flood' | 'Earthquake' | 'Hurricane' | 'Tornado' | 'Tsunami' | 'Volcanic Eruption' | 'Landslide' | 'Blizzard' | 'Drought';
    relevant_to_disaster: number;
    sentiment: Sentiment;
    sarcasm_confidence: number;
}

interface Tweet {
    original_tweet_data: OriginalTweetData;
    analysis: Analysis[];
}

interface TweetsSchema {
    tweets: Tweet[];
}

export type { TweetsSchema };