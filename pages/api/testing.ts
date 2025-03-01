import type { NextApiRequest, NextApiResponse } from 'next';

const dataList: any[] = []; // Stores all received webhook data (resets on each deployment)

export default function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method === 'POST') {
		try {
			const data = req.body;
			dataList.push(data); // Store new data
			console.log("Lenght of data stored is:", dataList.length)

			console.log('Webhook received at /testing:', data);

			return res.status(200).json({
				message: 'わぁ〜！すごいね！よくできました！🎉',
				currentDataLenght: dataList.length,
				receivedData: data
			});

		} catch (error) {
			console.error('❌ エラーが発生しました！', error);
			return res.status(500).json({ error: '内部サーバーエラーです！💥' });
		}
	}

	if (req.method === 'GET') {
		console.log("Detected request")
		const pointer = parseInt(req.query.pointer as string) || 0;

		// Ensure pointer is within bounds
		if (pointer >= dataList.length) {
			// 204 No Content
			return res.status(204).json({})
		}

		// Return data from pointer to end
		return res.status(200).json({
			data: dataList.slice(pointer),
			newPointer: dataList.length
		});
	}

	return res.status(405).json({ error: '方法が許可されていません！' });
}
