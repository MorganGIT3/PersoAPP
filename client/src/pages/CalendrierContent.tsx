import * as React from "react"
import {
  add,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  getDay,
  isEqual,
  isSameDay,
  isSameMonth,
  isToday,
  parse,
  startOfToday,
  startOfWeek,
} from "date-fns"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusCircleIcon,
  SearchIcon,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useMediaQuery } from "@/hooks/use-media-query"

interface Event {
  id: string
  name: string
  time: string
  datetime: string
  type: 'personnel' | 'professionnel'
  note?: string
}

interface CalendarData {
  day: Date
  events: Event[]
}

const colStartClasses = [
  "",
  "col-start-2",
  "col-start-3",
  "col-start-4",
  "col-start-5",
  "col-start-6",
  "col-start-7",
]

function getEventColor(type: 'personnel' | 'professionnel'): string {
  return type === 'personnel' ? 'bg-blue-500' : 'bg-green-500'
}

export function FullScreenCalendar() {
  const today = startOfToday()
  const [selectedDay, setSelectedDay] = React.useState(today)
  const [currentMonth, setCurrentMonth] = React.useState(
    format(today, "MMM-yyyy"),
  )
  const [showAddEventModal, setShowAddEventModal] = React.useState(false)
  const [showEventDetailModal, setShowEventDetailModal] = React.useState(false)
  const [selectedEvent, setSelectedEvent] = React.useState<Event | null>(null)
  const [editingEventName, setEditingEventName] = React.useState('')
  const [editingEventNote, setEditingEventNote] = React.useState('')
  const [editingEventDate, setEditingEventDate] = React.useState('')
  const [editingEventType, setEditingEventType] = React.useState<'personnel' | 'professionnel' | null>(null)
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null)
  const [newEventDate, setNewEventDate] = React.useState<string>('')
  const [newEventName, setNewEventName] = React.useState('')
  const [newEventNote, setNewEventNote] = React.useState('')
  const [newEventType, setNewEventType] = React.useState<'personnel' | 'professionnel' | null>(null)
  const [draggedEvent, setDraggedEvent] = React.useState<Event | null>(null)
  
  const [events, setEvents] = React.useState<Event[]>(() => {
    const saved = localStorage.getItem('persom_calendar_events')
    return saved ? JSON.parse(saved) : []
  })

  const firstDayCurrentMonth = parse(currentMonth, "MMM-yyyy", new Date())
  const isDesktop = useMediaQuery("(min-width: 768px)")

  const days = eachDayOfInterval({
    start: startOfWeek(firstDayCurrentMonth),
    end: endOfWeek(endOfMonth(firstDayCurrentMonth)),
  })

  const data: CalendarData[] = days.map(day => {
    const dayEvents = events.filter(event => {
      const eventDate = new Date(event.datetime)
      return isSameDay(eventDate, day)
    })
    return {
      day,
      events: dayEvents
    }
  })

  React.useEffect(() => {
    localStorage.setItem('persom_calendar_events', JSON.stringify(events))
  }, [events])

  function previousMonth() {
    const firstDayNextMonth = add(firstDayCurrentMonth, { months: -1 })
    setCurrentMonth(format(firstDayNextMonth, "MMM-yyyy"))
  }

  function nextMonth() {
    const firstDayNextMonth = add(firstDayCurrentMonth, { months: 1 })
    setCurrentMonth(format(firstDayNextMonth, "MMM-yyyy"))
  }

  function goToToday() {
    setCurrentMonth(format(today, "MMM-yyyy"))
    setSelectedDay(today)
  }

  const handleAddEvent = () => {
    setShowAddEventModal(true)
    setSelectedDate(selectedDay)
    setNewEventDate(format(selectedDay, 'yyyy-MM-dd'))
    setNewEventName('')
    setNewEventNote('')
    setNewEventType(null)
  }

  const handleDragStart = (event: Event, e: React.DragEvent) => {
    setDraggedEvent(event)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', event.id)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (targetDay: Date, e: React.DragEvent) => {
    e.preventDefault()
    if (!draggedEvent) return

    const updatedEvents = events.map(event => {
      if (event.id === draggedEvent.id) {
        const newDatetime = new Date(targetDay)
        newDatetime.setHours(new Date(draggedEvent.datetime).getHours())
        newDatetime.setMinutes(new Date(draggedEvent.datetime).getMinutes())
        return {
          ...event,
          datetime: newDatetime.toISOString()
        }
      }
      return event
    })

    setEvents(updatedEvents)
    setDraggedEvent(null)
  }

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event)
    setEditingEventName(event.name)
    setEditingEventNote(event.note || '')
    setEditingEventDate(format(new Date(event.datetime), 'yyyy-MM-dd'))
    setEditingEventType(event.type)
    setShowEventDetailModal(true)
  }

  const handleUpdateEvent = () => {
    if (!selectedEvent || !editingEventName || !editingEventType || !editingEventDate) return

    const datetime = new Date(editingEventDate)

    const updatedEvents = events.map(event => {
      if (event.id === selectedEvent.id) {
        return {
          ...event,
          name: editingEventName,
          note: editingEventNote || undefined,
          datetime: datetime.toISOString(),
          type: editingEventType
        }
      }
      return event
    })

    setEvents(updatedEvents)
    setSelectedEvent({
      ...selectedEvent,
      name: editingEventName,
      note: editingEventNote || undefined,
      datetime: datetime.toISOString(),
      type: editingEventType
    })
  }

  const handleDeleteEventFromModal = () => {
    if (!selectedEvent) return
    if (confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      setEvents(events.filter(e => e.id !== selectedEvent.id))
      setShowEventDetailModal(false)
      setSelectedEvent(null)
    }
  }

  const handleSaveEvent = () => {
    if (!newEventName || !newEventType || !newEventDate) return

    const datetime = new Date(newEventDate)

    const newEvent: Event = {
      id: Date.now().toString(),
      name: newEventName,
      time: 'Toute la journée',
      datetime: datetime.toISOString(),
      type: newEventType,
      note: newEventNote || undefined
    }

    setEvents([...events, newEvent])
    setShowAddEventModal(false)
    setNewEventName('')
    setNewEventNote('')
    setNewEventDate('')
    setNewEventType(null)
    setSelectedDate(null)
  }

  const handleDeleteEvent = (eventId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      setEvents(events.filter(e => e.id !== eventId))
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      {/* Calendar Header */}
      <div className="flex flex-col space-y-4 p-4 md:flex-row md:items-center md:justify-between md:space-y-0 lg:flex-none">
        <div className="flex flex-auto">
          <div className="flex items-center gap-4">
            <div className="hidden w-20 flex-col items-center justify-center rounded-lg border bg-muted p-0.5 md:flex">
              <h1 className="p-1 text-xs uppercase text-muted-foreground">
                {format(today, "MMM")}
              </h1>
              <div className="flex w-full items-center justify-center rounded-lg border bg-background p-0.5 text-lg font-bold">
                <span>{format(today, "d")}</span>
              </div>
            </div>
            <div className="flex flex-col">
              <h2 className="text-lg font-semibold text-foreground">
                {format(firstDayCurrentMonth, "MMMM, yyyy")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {format(firstDayCurrentMonth, "MMM d, yyyy")} -{" "}
                {format(endOfMonth(firstDayCurrentMonth), "MMM d, yyyy")}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 md:flex-row md:gap-6">
          <Button variant="outline" size="icon" className="hidden lg:flex">
            <SearchIcon size={16} strokeWidth={2} aria-hidden="true" />
          </Button>

          <Separator orientation="vertical" className="hidden h-6 lg:block" />

          <div className="inline-flex w-full -space-x-px rounded-lg shadow-sm shadow-black/5 md:w-auto rtl:space-x-reverse">
            <Button
              onClick={previousMonth}
              className="rounded-none shadow-none first:rounded-s-lg last:rounded-e-lg focus-visible:z-10"
              variant="outline"
              size="icon"
              aria-label="Navigate to previous month"
            >
              <ChevronLeftIcon size={16} strokeWidth={2} aria-hidden="true" />
            </Button>
            <Button
              onClick={goToToday}
              className="w-full rounded-none shadow-none first:rounded-s-lg last:rounded-e-lg focus-visible:z-10 md:w-auto"
              variant="outline"
            >
              Today
            </Button>
            <Button
              onClick={nextMonth}
              className="rounded-none shadow-none first:rounded-s-lg last:rounded-e-lg focus-visible:z-10"
              variant="outline"
              size="icon"
              aria-label="Navigate to next month"
            >
              <ChevronRightIcon size={16} strokeWidth={2} aria-hidden="true" />
            </Button>
          </div>

          <Separator orientation="vertical" className="hidden h-6 md:block" />
          <Separator
            orientation="horizontal"
            className="block w-full md:hidden"
          />

          <Button className="w-full gap-2 md:w-auto" onClick={handleAddEvent}>
            <PlusCircleIcon size={16} strokeWidth={2} aria-hidden="true" />
            <span>New Event</span>
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="lg:flex lg:flex-auto lg:flex-col">
        {/* Week Days Header */}
        <div className="grid grid-cols-7 border text-center text-xs font-semibold leading-6 lg:flex-none">
          <div className="border-r py-2.5">Sun</div>
          <div className="border-r py-2.5">Mon</div>
          <div className="border-r py-2.5">Tue</div>
          <div className="border-r py-2.5">Wed</div>
          <div className="border-r py-2.5">Thu</div>
          <div className="border-r py-2.5">Fri</div>
          <div className="py-2.5">Sat</div>
        </div>

        {/* Calendar Days */}
        <div className="flex text-xs leading-6 lg:flex-auto">
          <div className="hidden w-full border-x lg:grid lg:grid-cols-7 lg:grid-rows-5">
            {days.map((day, dayIdx) => {
              const dayData = data.find((date) => isSameDay(date.day, day))
              const dayEvents = dayData?.events || []
              
              return !isDesktop ? (
                <div
                  key={dayIdx}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(day, e)}
                  className={cn(
                    isEqual(day, selectedDay) && "bg-slate-100",
                    !isEqual(day, selectedDay) &&
                      !isToday(day) &&
                      !isSameMonth(day, firstDayCurrentMonth) &&
                      "bg-slate-50/50",
                    "flex flex-col border-b border-r hover:bg-slate-50/75 transition-colors min-h-[80px]"
                  )}
                >
                  <button
                    onClick={() => setSelectedDay(day)}
                    type="button"
                    className={cn(
                      "flex items-center justify-end p-2 pb-1 w-full",
                      isEqual(day, selectedDay) && "text-slate-800",
                      !isEqual(day, selectedDay) &&
                        !isToday(day) &&
                        isSameMonth(day, firstDayCurrentMonth) &&
                        "text-slate-800",
                      !isEqual(day, selectedDay) &&
                        !isToday(day) &&
                        !isSameMonth(day, firstDayCurrentMonth) &&
                        "text-slate-400",
                      (isEqual(day, selectedDay) || isToday(day)) &&
                        "font-semibold",
                    )}
                  >
                    <time
                      dateTime={format(day, "yyyy-MM-dd")}
                      className={cn(
                        "flex size-6 items-center justify-center rounded-full text-xs",
                        isEqual(day, selectedDay) &&
                          isToday(day) &&
                          "bg-slate-800 text-white",
                        isEqual(day, selectedDay) &&
                          !isToday(day) &&
                          "bg-slate-800 text-white",
                        isToday(day) &&
                          !isEqual(day, selectedDay) &&
                          "bg-blue-500 text-white",
                      )}
                    >
                      {format(day, "d")}
                    </time>
                  </button>
                  <div className="flex-1 px-2 pb-2 space-y-1 overflow-hidden">
                    {dayEvents.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        draggable
                        onDragStart={(e) => handleDragStart(event, e)}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEventClick(event)
                        }}
                        className={cn(
                          "text-[10px] font-bold px-1.5 py-0.5 rounded cursor-move truncate hover:opacity-90 transition-opacity flex items-center gap-1",
                          event.type === 'personnel' 
                            ? 'bg-gradient-to-r from-blue-400 to-blue-600 text-white border border-blue-300 shadow-sm' 
                            : 'bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600 text-white border border-green-300 shadow-sm'
                        )}
                        title={event.name}
                      >
                        {event.type === 'professionnel' && <span className="text-xs">💼</span>}
                        {event.type === 'personnel' && <span className="text-xs">👤</span>}
                        <span className="truncate">{event.name}</span>
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-[10px] text-slate-500 px-1.5">
                        +{dayEvents.length - 3}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div
                  key={dayIdx}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(day, e)}
                  onClick={() => setSelectedDay(day)}
                  className={cn(
                    dayIdx === 0 && colStartClasses[getDay(day)],
                    !isEqual(day, selectedDay) &&
                      !isToday(day) &&
                      !isSameMonth(day, firstDayCurrentMonth) &&
                      "bg-accent/50 text-muted-foreground",
                    "relative flex flex-col border-b border-r hover:bg-muted focus:z-10",
                    !isEqual(day, selectedDay) && "hover:bg-accent/75",
                  )}
                >
                  <header className="flex items-center justify-between p-2.5">
                    <button
                      type="button"
                      className={cn(
                        isEqual(day, selectedDay) && "text-primary-foreground",
                        !isEqual(day, selectedDay) &&
                          !isToday(day) &&
                          isSameMonth(day, firstDayCurrentMonth) &&
                          "text-foreground",
                        !isEqual(day, selectedDay) &&
                          !isToday(day) &&
                          !isSameMonth(day, firstDayCurrentMonth) &&
                          "text-muted-foreground",
                        isEqual(day, selectedDay) &&
                          isToday(day) &&
                          "border-none bg-primary",
                        isEqual(day, selectedDay) &&
                          !isToday(day) &&
                          "bg-foreground",
                        (isEqual(day, selectedDay) || isToday(day)) &&
                          "font-semibold",
                        "flex h-7 w-7 items-center justify-center rounded-full text-xs hover:border",
                      )}
                    >
                      <time dateTime={format(day, "yyyy-MM-dd")}>
                        {format(day, "d")}
                      </time>
                    </button>
                  </header>
                  <div className="flex-1 p-2 space-y-1 overflow-hidden">
                    {data
                      .filter((event) => isSameDay(event.day, day))
                      .map((day) => (
                        <div key={day.day.toString()} className="space-y-1">
                          {day.events.slice(0, 4).map((event) => (
                            <div
                              key={event.id}
                              draggable
                              onDragStart={(e) => handleDragStart(event, e)}
                              onClick={() => handleEventClick(event)}
                              className={cn(
                                "text-xs font-bold px-2 py-1 rounded cursor-move truncate hover:opacity-90 transition-opacity flex items-center gap-1.5",
                                event.type === 'personnel' 
                                  ? 'bg-gradient-to-r from-blue-400 to-blue-600 text-white border border-blue-300 shadow-sm' 
                                  : 'bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600 text-white border border-green-300 shadow-sm'
                              )}
                              title={event.name}
                            >
                              {event.type === 'professionnel' && <span className="text-sm">💼</span>}
                              {event.type === 'personnel' && <span className="text-sm">👤</span>}
                              <span className="truncate flex-1">{event.name}</span>
                            </div>
                          ))}
                          {day.events.length > 4 && (
                            <div className="text-xs text-muted-foreground px-2 py-0.5">
                              + {day.events.length - 4} de plus
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="isolate grid w-full grid-cols-7 grid-rows-5 border-x lg:hidden">
            {days.map((day, dayIdx) => {
              const dayData = data.find((date) => isSameDay(date.day, day))
              const dayEvents = dayData?.events || []
              
              return (
                <div
                  key={dayIdx}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(day, e)}
                  className={cn(
                    isEqual(day, selectedDay) && "bg-slate-100",
                    !isEqual(day, selectedDay) &&
                      !isToday(day) &&
                      !isSameMonth(day, firstDayCurrentMonth) &&
                      "bg-slate-50/50",
                    "flex flex-col border-b border-r hover:bg-slate-50/75 transition-colors min-h-[80px]"
                  )}
                >
                  <button
                    onClick={() => setSelectedDay(day)}
                    type="button"
                    className={cn(
                      "flex items-center justify-end p-2 pb-1",
                      isEqual(day, selectedDay) && "text-slate-800",
                      !isEqual(day, selectedDay) &&
                        !isToday(day) &&
                        isSameMonth(day, firstDayCurrentMonth) &&
                        "text-slate-800",
                      !isEqual(day, selectedDay) &&
                        !isToday(day) &&
                        !isSameMonth(day, firstDayCurrentMonth) &&
                        "text-slate-400",
                      (isEqual(day, selectedDay) || isToday(day)) &&
                        "font-semibold",
                    )}
                  >
                    <time
                      dateTime={format(day, "yyyy-MM-dd")}
                      className={cn(
                        "flex size-6 items-center justify-center rounded-full text-xs",
                        isEqual(day, selectedDay) &&
                          isToday(day) &&
                          "bg-slate-800 text-white",
                        isEqual(day, selectedDay) &&
                          !isToday(day) &&
                          "bg-slate-800 text-white",
                        isToday(day) &&
                          !isEqual(day, selectedDay) &&
                          "bg-blue-500 text-white",
                      )}
                    >
                      {format(day, "d")}
                    </time>
                  </button>
                  <div className="flex-1 px-2 pb-2 space-y-1 overflow-hidden">
                    {dayEvents.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        draggable
                        onDragStart={(e) => handleDragStart(event, e)}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEventClick(event)
                        }}
                        className={cn(
                          "text-[10px] font-bold px-1.5 py-0.5 rounded cursor-move truncate hover:opacity-90 transition-opacity flex items-center gap-1",
                          event.type === 'personnel' 
                            ? 'bg-gradient-to-r from-blue-400 to-blue-600 text-white border border-blue-300 shadow-sm' 
                            : 'bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600 text-white border border-green-300 shadow-sm'
                        )}
                        title={event.name}
                      >
                        {event.type === 'professionnel' && <span className="text-xs">💼</span>}
                        {event.type === 'personnel' && <span className="text-xs">👤</span>}
                        <span className="truncate">{event.name}</span>
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-[10px] text-slate-500 px-1.5">
                        +{dayEvents.length - 3}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      {showAddEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-slate-800">Nouvel événement</h3>
              <button
                onClick={() => {
                  setShowAddEventModal(false)
                  setNewEventType(null)
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!newEventType ? (
              <div className="space-y-4">
                <p className="text-slate-600 mb-4">Type d'événement :</p>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setNewEventType('personnel')}
                    className="p-4 rounded-xl border-2 border-blue-200 bg-blue-50 hover:bg-blue-100 transition-colors"
                  >
                    <div className="text-2xl mb-2">👤</div>
                    <div className="font-medium text-blue-700">Personnel</div>
                  </button>
                  <button
                    onClick={() => setNewEventType('professionnel')}
                    className="p-4 rounded-xl border-2 border-green-200 bg-green-50 hover:bg-green-100 transition-colors"
                  >
                    <div className="text-2xl mb-2">💼</div>
                    <div className="font-medium text-green-700">Professionnel</div>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nom de l'événement
                  </label>
                  <input
                    type="text"
                    value={newEventName}
                    onChange={(e) => setNewEventName(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400"
                    placeholder="Ex: Réunion équipe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Note
                  </label>
                  <textarea
                    value={newEventNote}
                    onChange={(e) => setNewEventNote(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 min-h-[100px] resize-none"
                    placeholder="Ajoutez une note pour cet événement..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400"
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => setNewEventType(null)}
                    variant="outline"
                    className="flex-1"
                  >
                    Retour
                  </Button>
                  <Button
                    onClick={handleSaveEvent}
                    className="flex-1"
                    disabled={!newEventName || !newEventDate}
                  >
                    Ajouter
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Event Detail Modal */}
      {showEventDetailModal && selectedEvent && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleUpdateEvent()
              setShowEventDetailModal(false)
              setSelectedEvent(null)
            }
          }}
        >
          <div 
            className="bg-white rounded-2xl max-w-7xl w-full mx-4 max-h-[95vh] flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center text-xl",
                  editingEventType === 'professionnel'
                    ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
                    : 'bg-gradient-to-br from-blue-500 to-blue-600'
                )}>
                  {editingEventType === 'professionnel' ? '💼' : '👤'}
                </div>
                <input
                  type="text"
                  value={editingEventName}
                  onChange={(e) => setEditingEventName(e.target.value)}
                  className="text-xl font-semibold text-slate-800 bg-transparent border-none outline-none focus:ring-2 focus:ring-slate-300 rounded px-2 -ml-2"
                  placeholder="Nom de l'événement"
                />
              </div>
              <button
                onClick={() => {
                  handleUpdateEvent()
                  setShowEventDetailModal(false)
                  setSelectedEvent(null)
                }}
                className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={editingEventDate}
                    onChange={(e) => setEditingEventDate(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400"
                  />
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Type
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setEditingEventType('personnel')}
                      className={cn(
                        "p-4 rounded-xl border-2 transition-colors",
                        editingEventType === 'personnel'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-blue-200 bg-blue-50/50 hover:bg-blue-100'
                      )}
                    >
                      <div className="text-2xl mb-2">👤</div>
                      <div className="font-medium text-blue-700">Personnel</div>
                    </button>
                    <button
                      onClick={() => setEditingEventType('professionnel')}
                      className={cn(
                        "p-4 rounded-xl border-2 transition-colors",
                        editingEventType === 'professionnel'
                          ? 'border-green-500 bg-green-50'
                          : 'border-green-200 bg-green-50/50 hover:bg-green-100'
                      )}
                    >
                      <div className="text-2xl mb-2">💼</div>
                      <div className="font-medium text-green-700">Professionnel</div>
                    </button>
                  </div>
                </div>

                {/* Note */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Note
                  </label>
                  <textarea
                    value={editingEventNote}
                    onChange={(e) => setEditingEventNote(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 min-h-[300px] resize-none"
                    placeholder="Ajoutez une note pour cet événement..."
                  />
                </div>

                {/* Additional space for scrolling */}
                <div className="h-20" />
              </div>
            </div>

            {/* Footer with actions */}
            <div className="flex gap-3 p-6 border-t border-slate-200 flex-shrink-0">
              <Button
                onClick={handleDeleteEventFromModal}
                variant="outline"
                className="flex-1 border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                Supprimer
              </Button>
              <Button
                onClick={() => {
                  handleUpdateEvent()
                  setShowEventDetailModal(false)
                  setSelectedEvent(null)
                }}
                className="flex-1"
                disabled={!editingEventName || !editingEventType || !editingEventDate}
              >
                Enregistrer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

