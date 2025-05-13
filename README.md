# Firebird 

**Firebird** is the frontend application for the Firebird project. Built with Next.js and React, 
it provides an interactive interface for users to visualize potential disaster events 
(wildfires, earthquakes, hurricanes) and related sentiment trends detected from the 
Bluesky social platform.

This client application fetches processed data from Firestore 
(populated by the go-server backend) and presents it through maps, charts, tables, and skeet feeds.

Live demo is [here](https://firebird-ivory.vercel.app/) (adjust date range to the month of April)

![Alt Text](./landingPage.gif)

## Key Features

*   **Interactive Map Display:** Visualizes disaster locations and potentially hospital data using Leaflet.
*   **Disaster Overview:** Presents a list or table of detected disasters with key details.
*   **Skeet Feed:** Shows relevant skeets associated with selected disasters or locations.
*   **Sentiment Visualization:** Displays sentiment trends over time using charts.
*   **Data Filtering:** Allows users to filter disasters/locations by category, sentiment range, and date.
*   **Responsive Design:** Aims for a good user experience across different screen sizes using Tailwind CSS.
*   **Client-Side Caching:** Implements strategies to cache data like locations and skeets to improve performance.

## Tech Stack

*   **Framework:** Next.js (React)
*   **Styling:** Tailwind CSS
*   **Mapping:** Leaflet
*   **Charting:** Recharts 
*   **State Management:** React Hooks (Context API, `useState`, `useEffect`, `useMemo`, `useCallback`)
*   **Data Fetching:** Firebase SDK (for Firestore), `fetch` API
*   **Date/Time:** Moment.js
*   **Deployment:** Vercel
