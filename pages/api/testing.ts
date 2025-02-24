import type { NextApiRequest, NextApiResponse } from 'next'


export default function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== 'POST') {
		return res.status(405).json({ error: '方法が許可されていません！' });
	}

	try {
		// Read the request body
		const data = req.body;

		// Log the status of the request
		console.log('Webhook received at /testing');

		// Send a response
		res.status(200).json({
			message: 'わぁ〜！すごいね！よくできました！🎉',
			receivedData: data
		});

	} catch (error) {
		console.error('❌ エラーが発生しました！', error);
		res.status(500).json({ error: '内部サーバーエラーです！💥' }); // "Internal server error! 💥"
	}
}

