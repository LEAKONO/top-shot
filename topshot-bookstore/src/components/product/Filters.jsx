import { useState } from 'react'
import { Disclosure } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'

const Filters = ({ 
  filters, 
  onFilterChange, 
  sortOptions, 
  onSortChange 
}) => {
  const [selectedSort, setSelectedSort] = useState(sortOptions[0].value)

  const handleSortChange = (e) => {
    const value = e.target.value
    setSelectedSort(value)
    onSortChange(value)
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Filters</h3>
          <div className="flex flex-wrap gap-4">
            {filters.map((filter) => (
              <div key={filter.id} className="flex flex-col">
                <label htmlFor={filter.id} className="text-sm font-medium text-gray-700 mb-1">
                  {filter.label}
                </label>
                <select
                  id={filter.id}
                  value={filter.value}
                  onChange={(e) => onFilterChange(filter.id, e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-kenyan-green focus:border-kenyan-green"
                >
                  {filter.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex flex-col">
          <label htmlFor="sort" className="text-sm font-medium text-gray-700 mb-1">
            Sort by
          </label>
          <select
            id="sort"
            value={selectedSort}
            onChange={handleSortChange}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-kenyan-green focus:border-kenyan-green"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}

export default Filters