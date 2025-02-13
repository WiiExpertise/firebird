import type { NextApiRequest, NextApiResponse } from 'next'
import type { TweetsSchema } from '../../types/schema'

type ResponseData = TweetsSchema;

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>
) {
    const tweets: TweetsSchema = {
        tweets: [
            {
                original_tweet_data: {
                    tweet_text: 'This is a test tweet',
                    timestamp: '2021-10-20T12:00:00Z',
                    user: {
                        username: 'test_user',
                        verified: false,
                        followers_count: 1000
                    },
                    hashtags: ['test', 'tweet']
                },
                analysis: [
                    {
                        disaster_name: 'Wildfire',
                        relevant_to_disaster: 1,
                        sentiment: {
                            emotion: 'joy',
                            tone: 'calm',
                            polarity: 0.8,
                            details: {
                                urgency: 0.2,
                                emotional_impact: 0.7
                            }
                        },
                        sarcasm_confidence: 0.1
                    }
                ]
            }
        ]
    };

    res.status(200).json(tweets);
}