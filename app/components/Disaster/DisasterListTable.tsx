import React, { useState, useMemo } from 'react';
import moment from 'moment';
import { DisasterData, DisasterCategory, DisasterSeverity } from '../../types/disasters';
import {
  FireIcon,
  BoltIcon,
  WifiIcon,
  CheckCircleIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  FunnelIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  FaceFrownIcon,
  MinusCircleIcon,
  EllipsisHorizontalCircleIcon,
  PlusCircleIcon,
  FaceSmileIcon,
} from '@heroicons/react/24/solid';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

// Refer to tailwind config 
const MIKO_PINK = '#E8C5CB';
const MIKO_PINK_DARK = '#D8AAB4';

// Slider styles to match FilterBar
const sliderStyles = {
  track: { backgroundColor: MIKO_PINK },
  rail: { backgroundColor: '#F8E4E8' },
  handle: { backgroundColor: MIKO_PINK, borderColor: MIKO_PINK_DARK, opacity: 1 },
};

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

// Type for sort configuration
type SortConfig = {
  key: keyof DisasterData | 'severity' | 'type' | 'reported' | 'lastUpdate';
  direction: 'ascending' | 'descending';
};

// Type for filter configuration
type FilterConfig = {
  types: Record<DisasterCategory, boolean>;
  severities: Record<DisasterSeverity | 'unknown', boolean>;
  sentimentRange: [number, number];
};

// Severity order for proper sorting
const severityOrder: Record<DisasterSeverity | 'unknown', number> = {
  'critical': 4,
  'high': 3,
  'medium': 2,
  'low': 1,
  'unknown': 0,
};

const DisasterListTable: React.FC<DisasterListTableProps> = ({
  disasters,
  selectedDisasterId,
  onDisasterSelect,
}) => {
  // State for sorting
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'LastUpdate',
    direction: 'descending',
  });

  // State for filtering
  const [filterConfig, setFilterConfig] = useState<FilterConfig>({
    types: {
      'wildfire': true,
      'hurricane': true,
      'earthquake': true,
      'non-disaster': true,
    },
    severities: {
      'low': true,
      'medium': true,
      'high': true,
      'critical': true,
      'unknown': true,
    },
    sentimentRange: [-1, 1],
  });

  // State for filter visibility
  const [showFilters, setShowFilters] = useState(false);
  
  // State for search
  const [searchTerm, setSearchTerm] = useState('');

  // Get available disaster types and severities from the data
  const availableFilters = useMemo(() => {
    const types = new Set<DisasterCategory>();
    const severities = new Set<DisasterSeverity | 'unknown'>();
    
    disasters.forEach(disaster => {
      types.add(disaster.DisasterType);
      severities.add(disaster.Severity || 'unknown');
    });
    
    // Order severities from low to critical, with unknown at the end
    const orderedSeverities = (['low', 'medium', 'high', 'critical', 'unknown'] as (DisasterSeverity | 'unknown')[])
      .filter(severity => severities.has(severity));
    
    return {
      types: Array.from(types),
      severities: orderedSeverities,
    };
  }, [disasters]);

  // Handle sort request
  const requestSort = (key: SortConfig['key']) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Handle filter toggle
  const toggleTypeFilter = (type: DisasterCategory) => {
    setFilterConfig(prev => ({
      ...prev,
      types: {
        ...prev.types,
        [type]: !prev.types[type],
      },
    }));
  };

  const toggleSeverityFilter = (severity: DisasterSeverity | 'unknown') => {
    setFilterConfig(prev => ({
      ...prev,
      severities: {
        ...prev.severities,
        [severity]: !prev.severities[severity],
      },
    }));
  };

  // Reset all filters
  const resetFilters = () => {
    setFilterConfig({
      types: {
        'wildfire': true,
        'hurricane': true,
        'earthquake': true,
        'non-disaster': true,
      },
      severities: {
        'low': true,
        'medium': true,
        'high': true,
        'critical': true,
        'unknown': true,
      },
      sentimentRange: [-1, 1],
    });
    setSearchTerm('');
  };

  // Sort and filter disasters
  const sortedAndFilteredDisasters = useMemo(() => {
    // First filter
    let filteredDisasters = disasters.filter(disaster => {
      // Get active filters for each category
      const activeTypeFilters = Object.entries(filterConfig.types)
        .filter(([_, isActive]) => isActive)
        .map(([type]) => type);
      
      const activeSeverityFilters = Object.entries(filterConfig.severities)
        .filter(([_, isActive]) => isActive)
        .map(([severity]) => severity);

      // Check if type matches (if any type filters are active)
      const typeMatches = activeTypeFilters.length === 0 || activeTypeFilters.includes(disaster.DisasterType);
      
      // Check if severity matches (if any severity filters are active)
      const severityMatches = activeSeverityFilters.length === 0 || activeSeverityFilters.includes(disaster.Severity || 'unknown');

      // Check if sentiment is within range
      const sentiment = disaster.ClusterSentiment ?? 0;
      const sentimentMatches = sentiment >= filterConfig.sentimentRange[0] && sentiment <= filterConfig.sentimentRange[1];

      // Return true if all conditions match
      return typeMatches && severityMatches && sentimentMatches;
    }).filter(disaster => {
      // Additional search term filtering
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const typeMatch = disaster.DisasterType.toLowerCase().includes(searchLower);
        const severityMatch = (disaster.Severity || '').toLowerCase().includes(searchLower);
        const dateMatch = moment(disaster.ReportedDate).format('MMM D, YYYY').toLowerCase().includes(searchLower);
        
        return typeMatch || severityMatch || dateMatch;
      }
      
      return true;
    });

    // Then sort
    return [...filteredDisasters].sort((a, b) => {
      let aValue: any, bValue: any;
      
      // Handle special cases for sorting
      switch (sortConfig.key) {
        case 'type':
          aValue = a.DisasterType;
          bValue = b.DisasterType;
          break;
        case 'severity':
          // Use the severity order for proper sorting
          aValue = severityOrder[a.Severity || 'unknown'];
          bValue = severityOrder[b.Severity || 'unknown'];
          break;
        case 'reported':
          aValue = new Date(a.ReportedDate).getTime();
          bValue = new Date(b.ReportedDate).getTime();
          break;
        case 'lastUpdate':
          aValue = new Date(a.LastUpdate).getTime();
          bValue = new Date(b.LastUpdate).getTime();
          break;
        default:
          aValue = a[sortConfig.key as keyof DisasterData];
          bValue = b[sortConfig.key as keyof DisasterData];
      }
      
      if (aValue < bValue) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  }, [disasters, sortConfig, filterConfig, searchTerm]);

  // Get sort direction icon
  const getSortIcon = (key: SortConfig['key']) => {
    if (sortConfig.key !== key) {
      return <ChevronUpIcon className="h-4 w-4 text-gray-400" />;
    }
    return sortConfig.direction === 'ascending' 
      ? <ChevronUpIcon className="h-4 w-4 text-miko-pink-dark" /> 
      : <ChevronDownIcon className="h-4 w-4 text-miko-pink-dark" />;
  };

  if (!disasters || disasters.length === 0) {
    return <div className="p-4 text-center text-gray-500">No disasters detected.</div>;
  }

  return (
    <div>
      {/* Title and Controls Row */}
      <div className="flex justify-between items-center p-3 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">Detected Disasters</h3>
        <div className="flex items-center space-x-2">
          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-48 pl-7 pr-2 py-1 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-miko-pink-light focus:border-miko-pink-light text-sm"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-1.5 rounded-md transition-colors ${
              showFilters
                ? 'bg-miko-pink text-white hover:bg-miko-pink-dark'
                : 'bg-white text-gray-500 hover:bg-gray-200 border border-gray-300'
            }`}
            title="Toggle Filters"
          >
            <FunnelIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {/* Filter Options - Only shown when filters are visible */}
      {showFilters && (
        <div className="p-3 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-wrap gap-4 items-start justify-between">
            <div className="flex flex-wrap gap-4">
              {/* Type Filters */}
              {availableFilters.types.length > 0 && (
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-700 mb-2">Type:</span>
                  <div className="flex space-x-1">
                    {availableFilters.types.map(type => {
                      let Icon;
                      switch (type) {
                        case 'wildfire': Icon = FireIcon; break;
                        case 'hurricane': Icon = BoltIcon; break;
                        case 'earthquake': Icon = WifiIcon; break;
                        case 'non-disaster': Icon = CheckCircleIcon; break;
                        default: Icon = CheckCircleIcon;
                      }
                      
                      return (
                        <button
                          key={type}
                          onClick={() => toggleTypeFilter(type)}
                          className={`p-1.5 rounded-md transition-colors ${
                            filterConfig.types[type]
                              ? 'bg-miko-pink text-white hover:bg-miko-pink-dark'
                              : 'bg-white text-gray-500 hover:bg-gray-200 border border-gray-300'
                          }`}
                          title={type.charAt(0).toUpperCase() + type.slice(1)}
                        >
                          <Icon className={`h-5 w-5 ${type === 'earthquake' ? 'transform rotate-45' : ''}`} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* Severity Filters */}
              {availableFilters.severities.length > 0 && (
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-700 mb-2">Severity:</span>
                  <div className="flex space-x-1">
                    {availableFilters.severities.map(severity => {
                      let buttonStyle = '';
                      switch (severity) {
                        case 'critical':
                          buttonStyle = filterConfig.severities.critical ? 'bg-red-600 text-white hover:bg-red-700' : '';
                          break;
                        case 'high':
                          buttonStyle = filterConfig.severities.high ? 'bg-red-400 text-black hover:bg-red-500' : '';
                          break;
                        case 'medium':
                          buttonStyle = filterConfig.severities.medium ? 'bg-orange-400 text-black hover:bg-orange-500' : '';
                          break;
                        case 'low':
                          buttonStyle = filterConfig.severities.low ? 'bg-yellow-300 text-black hover:bg-yellow-400' : '';
                          break;
                        case 'unknown':
                          buttonStyle = filterConfig.severities.unknown ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : '';
                          break;
                      }
                      
                      return (
                        <button
                          key={severity}
                          onClick={() => toggleSeverityFilter(severity)}
                          className={`px-3 py-1.5 rounded-md transition-colors ${buttonStyle || 'bg-white text-gray-500 hover:bg-gray-200'} border border-gray-300`}
                          title={severity.charAt(0).toUpperCase() + severity.slice(1)}
                        >
                          <span className="text-xs font-medium">
                            {severity === 'unknown' ? 'Unknown' : severity.charAt(0).toUpperCase() + severity.slice(1)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sentiment Filter */}
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-700 mb-2">Sentiment:</span>
                <div className="w-48">
                  <Slider
                    range
                    min={-1}
                    max={1}
                    step={0.1}
                    value={filterConfig.sentimentRange}
                    onChange={(value) => {
                      if (Array.isArray(value)) {
                        setFilterConfig(prev => ({
                          ...prev,
                          sentimentRange: value as [number, number]
                        }));
                      }
                    }}
                    marks={{
                      '-1': { label: <FaceFrownIcon className="h-4 w-4 text-red-500" /> },
                      '-0.5': { label: <MinusCircleIcon className="h-4 w-4 text-orange-500" /> },
                      '0': { label: <EllipsisHorizontalCircleIcon className="h-4 w-4 text-gray-500" /> },
                      '0.5': { label: <PlusCircleIcon className="h-4 w-4 text-green-500" /> },
                      '1': { label: <FaceSmileIcon className="h-4 w-4 text-green-600" /> }
                    }}
                    className="px-2"
                    styles={sliderStyles}
                  />
                </div>
              </div>
            </div>

            {/* Reset Button - Right Aligned */}
            <button
              onClick={resetFilters}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-white hover:bg-miko-pink-dark rounded-md border border-gray-300 hover:border-transparent transition-colors flex items-center gap-1"
            >
              <XMarkIcon className="h-4 w-4" />
              Reset Filters
            </button>
          </div>
        </div>
      )}

      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50 sticky top-0 z-10">
          <tr>
            {/* Type Column */}
            <th 
              scope="col" 
              className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => requestSort('type')}
            >
              <div className="flex items-center">
                Type
                {getSortIcon('type')}
              </div>
            </th>
            
            {/* Severity Column */}
            <th 
              scope="col" 
              className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => requestSort('severity')}
            >
              <div className="flex items-center">
                Severity
                {getSortIcon('severity')}
              </div>
            </th>
            
            {/* Location Count Column */}
            <th 
              scope="col" 
              className="px-3 py-2 text-center font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" 
              title="Number of Affected Locations"
              onClick={() => requestSort('LocationCount')}
            >
              <div className="flex items-center justify-center">
                Locs
                {getSortIcon('LocationCount')}
              </div>
            </th>
            
            {/* Total Skeets Column */}
            <th 
              scope="col" 
              className="px-3 py-2 text-center font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" 
              title="Total Skeets in Cluster"
              onClick={() => requestSort('TotalSkeetsAmount')}
            >
              <div className="flex items-center justify-center">
                Skeets
                {getSortIcon('TotalSkeetsAmount')}
              </div>
            </th>
            
            {/* Sentiment Column */}
            <th 
              scope="col" 
              className="px-3 py-2 text-center font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" 
              title="Average Sentiment"
              onClick={() => requestSort('ClusterSentiment')}
            >
              <div className="flex items-center justify-center">
                Sent.
                {getSortIcon('ClusterSentiment')}
              </div>
            </th>
            
            {/* Reported Date Column */}
            <th 
              scope="col" 
              className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => requestSort('reported')}
            >
              <div className="flex items-center">
                Reported
                {getSortIcon('reported')}
              </div>
            </th>
            
            {/* Last Update Column */}
            <th 
              scope="col" 
              className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => requestSort('lastUpdate')}
            >
              <div className="flex items-center">
                Last Update
                {getSortIcon('lastUpdate')}
              </div>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedAndFilteredDisasters.map((disaster) => {
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
                {/* Sentiment */}
                <td className={`px-3 py-2 whitespace-nowrap text-center ${getSentimentColor(disaster.ClusterSentiment)}`}>
                  {disaster.ClusterSentiment?.toFixed(2) || 'N/A'}
                </td>
                {/* Reported Date */}
                <td className="px-3 py-2 whitespace-nowrap text-gray-600">
                  {moment(disaster.ReportedDate).format('MMM D, YYYY')}
                </td>
                {/* Last Update */}
                <td className="px-3 py-2 whitespace-nowrap text-gray-600">
                  {moment(disaster.LastUpdate).fromNow()}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      
      {sortedAndFilteredDisasters.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          No disasters match the current filters.
        </div>
      ) : (
        <div className="p-2 text-center text-sm text-gray-500">
          Showing {sortedAndFilteredDisasters.length} of {disasters.length} disasters
        </div>
      )}
    </div>
  );
};

export default DisasterListTable;
