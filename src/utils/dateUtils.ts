export const isWorkingDay = (date: Date): boolean => {
  const dayOfWeek = date.getDay();
  // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  // Working days are Monday (1) to Friday (5)
  return dayOfWeek >= 1 && dayOfWeek <= 5;
};

export const getNextWorkingDay = (date: Date = new Date()): Date => {
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);
  
  while (!isWorkingDay(nextDay)) {
    nextDay.setDate(nextDay.getDate() + 1);
  }
  
  return nextDay;
};

export const formatDateForInput = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const getWorkingDaysInRange = (startDate: Date, endDate: Date): Date[] => {
  const workingDays: Date[] = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    if (isWorkingDay(currentDate)) {
      workingDays.push(new Date(currentDate));
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return workingDays;
};

export const getWorkingDayMessage = (): string => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  
  if (dayOfWeek === 0) { // Sunday
    return "Service resumes Monday. Book your trip for the week ahead!";
  } else if (dayOfWeek === 6) { // Saturday
    return "Weekend break! Service resumes Monday for working commuters.";
  } else {
    return "Book your commute for working days (Monday - Friday).";
  }
};

// Helper function to create date from date string without timezone issues
export const createDateFromString = (dateString: string): Date => {
  // Split the date string and create date in local timezone
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day); // month is 0-indexed
};