import { db } from "../../firebase";
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Skeet } from '../types/skeets';

export async function GetSkeetsSubCollection(
	locationDocID: string,
	start: string,
	end: string
): Promise<Array<{ id: string; SkeetData: Skeet }>> {
	console.log(`Fetching skeets for ${locationDocID} from ${start} to ${end}`);
	const skeetsRef = collection(db, "locations", locationDocID, "skeetIds");
	const q = query(
		skeetsRef,
		where("skeetData.timestamp", ">=", start),
		where("skeetData.timestamp", "<=", end),
		orderBy("skeetData.timestamp", "desc")
	);
	const snapshot = await getDocs(q);
	return snapshot.docs.map(doc => ({
		id: doc.id,
		SkeetData: doc.data().skeetData as Skeet
	}));
}
