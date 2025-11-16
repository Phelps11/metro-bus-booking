import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Card, CardContent } from './card';
import { Button } from './button';

interface DatePickerProps {
  selectedDates: string[];
  onDatesChange: (dates: string[]) => void;
  maxDates?: number;
  minDate?: Date;
  maxDate?: Date;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  selectedDates,
  onDatesChange,
  maxDates = 10,
  minDate = new Date(),
  maxDate
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const isWorkingDay = (date: Date): boolean => {
    const dayOfWeek = date.getDay();
    // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    // Working days are Monday (1) to Friday (5)
    return dayOfWeek >= 1 && dayOfWeek <= 5;
  };

  const formatDateString = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const isDateSelected = (date: Date): boolean => {
    const dateString = formatDateString(date);
    return selectedDates.includes(dateString);
  };

  const isDateDisabled = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Disable if before minDate
    if (date < minDate) return true;
    
    // Disable if after maxDate
    if (maxDate && date > maxDate) return true;
    
    // Disable if not a working day
    if (!isWorkingDay(date)) return true;
    
    // Disable if max dates reached and not already selected
    if (selectedDates.length >= maxDates && !isDateSelected(date)) return true;
    
    return false;
  };

  const handleDateClick = (date: Date) => {
    if (isDateDisabled(date)) return;
    
    const dateString = formatDateString(date);
    
    if (isDateSelected(date)) {
      // Remove date if already selected
      onDatesChange(selectedDates.filter(d => d !== dateString));
    } else {
      // Add date if not selected and under limit
      if (selectedDates.length < maxDates) {
        onDatesChange([...selectedDates, dateString].sort());
      }
    }
  };

  const getDaysInMonth = (date: Date): Date[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: Date[] = [];

    // Add days from previous month to fill the first week
    const firstDayOfWeek = firstDay.getDay();
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDayOfWeek);

    // Generate 42 days (6 weeks) to fill the calendar grid
    for (let i = 0; i < 42; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }

    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const days = getDaysInMonth(currentMonth);
  const monthYear = currentMonth.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Card className="bg-white shadow-md">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-oxford-blue flex items-center space-x-2">
            <Calendar size={20} />
            <span>Select Dates</span>
          </h3>
          <div className="text-sm text-gray-600">
            {selectedDates.length}/{maxDates} selected
          </div>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('prev')}
            className="p-2"
          >
            <ChevronLeft size={16} />
          </Button>
          
          <h4 className="font-medium text-oxford-blue">{monthYear}</h4>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('next')}
            className="p-2"
          >
            <ChevronRight size={16} />
          </Button>
        </div>

        {/* Week Days Header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-medium text-gray-500 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((date, index) => {
            const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
            const isSelected = isDateSelected(date);
            const isDisabled = isDateDisabled(date);
            const isToday = date.toDateString() === new Date().toDateString();
            const isWorkingDayDate = isWorkingDay(date);

            return (
              <button
                key={index}
                onClick={() => handleDateClick(date)}
                disabled={isDisabled}
                className={`
                  relative w-8 h-8 text-sm rounded-md transition-all duration-200
                  ${!isCurrentMonth ? 'text-gray-300' : ''}
                  ${isSelected 
                    ? 'bg-green-600 text-white font-semibold shadow-md' 
                    : isWorkingDayDate && !isDisabled
                      ? 'bg-green-50 text-green-800 hover:bg-green-100 border border-green-200'
                      : 'text-gray-400 bg-gray-50'
                  }
                  ${isToday && !isSelected ? 'ring-2 ring-oxford-blue ring-opacity-50' : ''}
                  ${isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                  ${!isDisabled && !isSelected ? 'hover:scale-105' : ''}
                `}
              >
                {date.getDate()}
                {isToday && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-oxford-blue rounded-full"></div>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-600 rounded"></div>
              <span className="text-gray-600">Selected</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-50 border border-green-200 rounded"></div>
              <span className="text-gray-600">Available (Mon-Fri)</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-gray-50 rounded"></div>
              <span className="text-gray-600">Weekend/Unavailable</span>
            </div>
          </div>
        </div>

        {/* Selected Dates Summary */}
        {selectedDates.length > 0 && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <h5 className="font-medium text-green-800 mb-2">Selected Dates:</h5>
            <div className="flex flex-wrap gap-1">
              {selectedDates.slice(0, 5).map(dateString => (
                <span
                  key={dateString}
                  className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded"
                >
                  {new Date(dateString).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </span>
              ))}
              {selectedDates.length > 5 && (
                <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                  +{selectedDates.length - 5} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Clear Selection Button */}
        {selectedDates.length > 0 && (
          <div className="mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDatesChange([])}
              className="w-full text-red-600 border-red-300 hover:bg-red-50"
            >
              Clear All Selections
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};