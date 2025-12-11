import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, 
  eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, parseISO 
} from 'date-fns';
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2, Image as ImageIcon } from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  status: 'SCHEDULED' | 'PUBLISHED' | 'FAILED';
  thumbnail: string | null;
  account: string;
}

export default function Calendar() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const start = startOfMonth(currentDate).toISOString();
      const end = endOfMonth(currentDate).toISOString();

      const response = await fetch(`http://localhost:3000/api/calendar/events?start=${start}&end=${end}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.error('Error fetching calendar events:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Start on Monday
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return 'bg-green-100 text-green-800 border-green-200';
      case 'FAILED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="rounded-full p-2 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <ArrowLeft className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            </button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Calendar</h1>
          </div>
          
          <div className="flex items-center gap-4 bg-white rounded-lg shadow-sm p-2 dark:bg-gray-800">
            <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-full dark:hover:bg-gray-700">
              <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
            <span className="text-lg font-semibold text-gray-900 min-w-[140px] text-center dark:text-white">
              {format(currentDate, 'MMMM yyyy')}
            </span>
            <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-full dark:hover:bg-gray-700">
              <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          <button
            onClick={() => navigate('/create-post')}
            className="rounded-md bg-indigo-600 px-4 py-2 text-white shadow-md hover:bg-indigo-700"
          >
            New Post
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white rounded-lg shadow ring-1 ring-gray-200 relative dark:bg-gray-800 dark:ring-gray-700">
          {loading && (
            <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10 dark:bg-gray-800/50">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
          )}
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
            {weekDays.map((day) => (
              <div key={day} className="py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">
                {day}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 auto-rows-fr bg-gray-200 gap-px dark:bg-gray-700">
            {days.map((day) => {
              const dayEvents = events.filter(event => isSameDay(parseISO(event.date), day));
              const isCurrentMonth = isSameMonth(day, monthStart);

              return (
                <div 
                  key={day.toString()} 
                  className={`min-h-[120px] bg-white p-2 ${!isCurrentMonth ? 'bg-gray-50 text-gray-400 dark:bg-gray-900 dark:text-gray-600' : 'dark:bg-gray-800'}`}
                >
                  <div className="flex justify-between items-start">
                    <span className={`text-sm font-medium ${isSameDay(day, new Date()) ? 'bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center' : 'text-gray-900 dark:text-white'}`}>
                      {format(day, 'd')}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-xs text-gray-400 font-medium">
                        {dayEvents.length} posts
                      </span>
                    )}
                  </div>

                  <div className="mt-2 space-y-1">
                    {dayEvents.map((event) => (
                      <div 
                        key={event.id}
                        className={`flex items-center gap-2 p-1.5 rounded border text-xs cursor-pointer hover:opacity-80 transition-opacity ${getStatusColor(event.status)}`}
                        title={`${event.account}: ${event.title}`}
                      >
                        {event.thumbnail ? (
                          <img src={event.thumbnail} alt="" className="w-4 h-4 rounded object-cover flex-shrink-0" />
                        ) : (
                          <ImageIcon className="w-4 h-4 flex-shrink-0 opacity-50" />
                        )}
                        <span className="truncate font-medium">
                          {format(parseISO(event.date), 'HH:mm')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
