import React from 'react';
import moment from 'moment';
import { DisasterData, DisasterCategory, DisasterSeverity } from '../../types/disasters';

interface DisasterListTableProps {
  disasters: DisasterData[];
  selectedDisasterId: string | null;
  onDisasterSelect: (disasterId: string) => void;
}

// Helper for styling based on severity
const getSeverityClass = (severity?: DisasterSeverity): string => {
  switch (severity) {
    case 'critical': return 'bg-red-600 text-white';
    case 'high': return 'bg-red-400 text-black';
    case 'medium': return 'bg-orange-400 text-black';
    case 'low': return 'bg-yellow-300 text-black';
    default: return 'bg-gray-200 text-gray-700';
  }
};

// Helper for styling based on type
const getTypeClass = (type: DisasterCategory): string => {
  switch (type) {
    case 'wildfire': return 'border-l-4 border-red-500';
    case 'hurricane': return 'border-l-4 border-blue-500';
    case 'earthquake': return 'border-l-4 border-yellow-700';
    default: return 'border-l-4 border-gray-400';
  }
}

const getSentimentColor = (sentiment: number | undefined): string => {
  if (sentiment === undefined || sentiment === null) return 'text-gray-500';
  if (sentiment > 0.1) return 'text-green-600';
  if (sentiment < -0.1) return 'text-red-600';
  return 'text-gray-600'; // Neutral
}

const DisasterListTable: React.FC<DisasterListTableProps> = ({
  disasters,
  selectedDisasterId,
  onDisasterSelect,
}) => {
  if (!disasters || disasters.length === 0) {
    return <div className="p-4 text-center text-gray-500">No disasters detected.</div>;
  }

  return (
    <div>
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50 sticky top-0 z-10">
          <tr>
            {/* Existing Columns */}
            <th scope="col" className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th scope="col" className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">
              Severity
            </th>
            {/* New Columns */}
            <th scope="col" className="px-3 py-2 text-center font-medium text-gray-500 uppercase tracking-wider" title="Number of Affected Locations">
              Locs
            </th>
            <th scope="col" className="px-3 py-2 text-center font-medium text-gray-500 uppercase tracking-wider" title="Total Skeets in Cluster">
              Skeets
            </th>
            <th scope="col" className="px-3 py-2 text-center font-medium text-gray-500 uppercase tracking-wider" title="Average Sentiment">
              Sent.
            </th>
            <th scope="col" className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">
              Reported
            </th>
            <th scope="col" className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">
              Last Update
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {disasters.map((disaster) => {
            const isSelected = disaster.ID === selectedDisasterId;
            return (
              <tr
                key={disaster.ID}
                onClick={() => onDisasterSelect(disaster.ID)}
                className={`cursor-pointer hover:bg-gray-100 ${isSelected ? 'bg-miko-pink-light' : ''} ${getTypeClass(disaster.DisasterType)}`}
              >
                {/* Type */}
                <td className="px-3 py-2 whitespace-nowrap capitalize font-medium">
                  {disaster.DisasterType}
                </td>
                {/* Severity */}
                <td className="px-3 py-2 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getSeverityClass(disaster.Severity)}`}>
                    {disaster.Severity || 'N/A'}
                  </span>
                </td>
                {/* Location Count */}
                <td className="px-3 py-2 whitespace-nowrap text-center text-gray-700">
                  {disaster.LocationCount}
                </td>
                {/* Total Skeets */}
                <td className="px-3 py-2 whitespace-nowrap text-center text-gray-700">
                  {disaster.TotalSkeetsAmount}
                </td>
                {/* Cluster Sentiment */}
                <td className={`px-3 py-2 whitespace-nowrap text-center font-medium ${getSentimentColor(disaster.ClusterSentiment)}`}>
                  {disaster.ClusterSentiment?.toFixed(2) ?? 'N/A'}
                </td>
                {/* Reported Date */}
                <td className="px-3 py-2 whitespace-nowrap text-gray-600">
                  {disaster.ReportedDate ? moment(disaster.ReportedDate).format('MMM D, YYYY') : 'N/A'}
                </td>
                {/* Last Update */}
                <td className="px-3 py-2 whitespace-nowrap text-gray-600">
                  {disaster.LastUpdate ? moment(disaster.LastUpdate).fromNow() : 'N/A'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

};

export default DisasterListTable;
