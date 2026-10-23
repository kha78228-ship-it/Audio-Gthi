import { FamilyEvent, FamilyTreeMember as FamilyMember, FamilyEventType } from '../types';

export interface UnifiedCalendarItem {
  id: string;
  itemType: 'birthday' | 'event';
  eventType: FamilyEventType;
  title: string;
  solarDate: string; // ISO date or YYYY-MM-DD
  lunarDate?: string;
  nextDate: Date; // The next occurrence Date object
  daysRemaining: number;
  isToday: boolean;
  isTomorrow: boolean;
  isSoon: boolean; // within 14 days
  member?: FamilyMember;
  event?: FamilyEvent;
  location?: string;
  description?: string;
  ageTurning?: number;
  isMilestoneAge?: boolean;
  milestoneTitle?: string;
}

/**
 * Parses a date string (YYYY-MM-DD or DD/MM/YYYY or YYYY) into month (1-12) and day (1-31).
 */
export function parseDateComponents(dateStr?: string): { year?: number; month?: number; day?: number } | null {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const trimmed = dateStr.trim();
  if (!trimmed) return null;

  // Format: YYYY-MM-DD or YYYY/MM/DD
  if (/^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/.test(trimmed)) {
    const parts = trimmed.split(/[-/]/).map(Number);
    return { year: parts[0], month: parts[1], day: parts[2] };
  }

  // Format: DD/MM/YYYY or DD-MM-YYYY
  if (/^\d{1,2}[-/]\d{1,2}[-/]\d{4}$/.test(trimmed)) {
    const parts = trimmed.split(/[-/]/).map(Number);
    return { day: parts[0], month: parts[1], year: parts[2] };
  }

  // Format: MM-DD or MM/DD
  if (/^\d{1,2}[-/]\d{1,2}$/.test(trimmed)) {
    const parts = trimmed.split(/[-/]/).map(Number);
    return { month: parts[0], day: parts[1] };
  }

  // Format: Just YYYY
  if (/^\d{4}$/.test(trimmed)) {
    return { year: Number(trimmed) };
  }

  return null;
}

/**
 * Calculates milestone age title (Mừng Thọ, Thượng Thọ, Đại Thọ)
 */
export function getLongevityMilestone(age: number): { isMilestone: boolean; title?: string } {
  if (age >= 100) return { isMilestone: true, title: 'Mừng Đại Thọ (Bách Niên Giai Lão) 💯' };
  if (age >= 90) return { isMilestone: true, title: 'Mừng Thượng Thượng Thọ (90+ tuổi) 🌟' };
  if (age >= 80) return { isMilestone: true, title: 'Mừng Thượng Thọ (80+ tuổi) 🎊' };
  if (age >= 70) return { isMilestone: true, title: 'Mừng Trung Thọ (70+ tuổi) 🌸' };
  if (age >= 60) return { isMilestone: true, title: 'Mừng Hạ Thọ (Lục Tuần) 🍀' };
  if (age === 50) return { isMilestone: true, title: 'Mừng Ngũ Tuần Đại Khánh 🌺' };
  if (age === 18) return { isMilestone: true, title: 'Trưởng Thành (18 tuổi) 🎓' };
  if (age === 1) return { isMilestone: true, title: 'Lễ Thôi Nôi (1 tuổi) 🎈' };
  return { isMilestone: false };
}

/**
 * Computes next occurrence date and days remaining for a month and day
 */
export function computeNextOccurrence(month: number, day: number, referenceDate: Date = new Date()): { nextDate: Date; daysRemaining: number; isToday: boolean; isTomorrow: boolean } {
  const today = new Date(referenceDate);
  today.setHours(0, 0, 0, 0);

  const currentYear = today.getFullYear();
  let candidate = new Date(currentYear, month - 1, day);
  candidate.setHours(0, 0, 0, 0);

  // If candidate is before today, next occurrence is next year
  if (candidate.getTime() < today.getTime()) {
    candidate = new Date(currentYear + 1, month - 1, day);
    candidate.setHours(0, 0, 0, 0);
  }

  const diffMs = candidate.getTime() - today.getTime();
  const daysRemaining = Math.round(diffMs / (1000 * 60 * 60 * 24));

  return {
    nextDate: candidate,
    daysRemaining,
    isToday: daysRemaining === 0,
    isTomorrow: daysRemaining === 1
  };
}

/**
 * Extracts shared birthdays from members list
 */
export function getSharedBirthdaysFromMembers(members: FamilyMember[], referenceDate: Date = new Date()): UnifiedCalendarItem[] {
  const items: UnifiedCalendarItem[] = [];

  for (const m of members) {
    if (!m.birthDate) continue;
    const parsed = parseDateComponents(m.birthDate);
    if (!parsed || !parsed.month || !parsed.day) continue;

    const { nextDate, daysRemaining, isToday, isTomorrow } = computeNextOccurrence(parsed.month, parsed.day, referenceDate);
    
    // Calculate age turning
    let ageTurning: number | undefined = undefined;
    let isMilestoneAge = false;
    let milestoneTitle: string | undefined = undefined;

    if (parsed.year) {
      ageTurning = nextDate.getFullYear() - parsed.year;
      const milestone = getLongevityMilestone(ageTurning);
      isMilestoneAge = milestone.isMilestone;
      milestoneTitle = milestone.title;
    }

    const title = m.isDeceased 
      ? `Tưởng niệm sinh nhật: ${m.fullName}` 
      : `Sinh nhật: ${m.fullName}`;

    items.push({
      id: `bday_${m.id}`,
      itemType: 'birthday',
      eventType: 'birthday',
      title,
      solarDate: `${String(parsed.day).padStart(2, '0')}/${String(parsed.month).padStart(2, '0')}${parsed.year ? `/${parsed.year}` : ''}`,
      lunarDate: m.lunarBirthDate,
      nextDate,
      daysRemaining,
      isToday,
      isTomorrow,
      isSoon: daysRemaining <= 14,
      member: m,
      location: m.currentResidence || m.originPlace,
      description: m.bio,
      ageTurning,
      isMilestoneAge,
      milestoneTitle
    });
  }

  return items;
}

/**
 * Converts FamilyEvent objects into unified calendar items
 */
export function getUnifiedEventsFromList(events: FamilyEvent[], members: FamilyMember[], referenceDate: Date = new Date()): UnifiedCalendarItem[] {
  const items: UnifiedCalendarItem[] = [];

  for (const e of events) {
    if (!e.solarDate) continue;
    const parsed = parseDateComponents(e.solarDate);
    if (!parsed || !parsed.month || !parsed.day) continue;

    const { nextDate, daysRemaining, isToday, isTomorrow } = computeNextOccurrence(parsed.month, parsed.day, referenceDate);
    const linkedMember = e.memberId ? members.find(m => m.id === e.memberId) : undefined;

    items.push({
      id: e.id,
      itemType: 'event',
      eventType: e.eventType,
      title: e.title,
      solarDate: e.solarDate,
      lunarDate: e.lunarDate,
      nextDate,
      daysRemaining,
      isToday,
      isTomorrow,
      isSoon: daysRemaining <= (e.reminderDaysBefore || 14),
      member: linkedMember,
      event: e,
      location: e.location,
      description: e.description
    });
  }

  return items;
}

/**
 * Combines both family events and shared birthdays, sorted chronologically
 */
export function getCombinedCalendarItems(events: FamilyEvent[], members: FamilyMember[], referenceDate: Date = new Date()): UnifiedCalendarItem[] {
  const birthdays = getSharedBirthdaysFromMembers(members, referenceDate);
  const eventItems = getUnifiedEventsFromList(events, members, referenceDate);

  // Avoid duplicating birthdays if user already added an explicit event for a member's birthday
  const birthdayMemberIdsWithExplicitEvent = new Set(
    eventItems
      .filter(it => it.eventType === 'birthday' && it.member)
      .map(it => it.member!.id)
  );

  const filteredBirthdays = birthdays.filter(b => !b.member || !birthdayMemberIdsWithExplicitEvent.has(b.member.id));

  const all = [...eventItems, ...filteredBirthdays];
  all.sort((a, b) => a.daysRemaining - b.daysRemaining);
  return all;
}

/**
 * Calendar Grid Month representation
 */
export interface CalendarDayCell {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  items: UnifiedCalendarItem[];
}

export function buildMonthCalendarGrid(year: number, monthIndex: number, allItems: UnifiedCalendarItem[]): CalendarDayCell[][] {
  const firstDayOfMonth = new Date(year, monthIndex, 1);
  const lastDayOfMonth = new Date(year, monthIndex + 1, 0);

  // In Vietnam, Monday is day 0 in standard business calendar
  // getDay() returns 0 for Sunday, 1 for Monday, ..., 6 for Saturday
  let startDayOfWeek = firstDayOfMonth.getDay();
  // Adjust so Monday = 0, Sunday = 6
  startDayOfWeek = (startDayOfWeek + 6) % 7;

  const totalDaysInMonth = lastDayOfMonth.getDate();
  const prevMonthLastDay = new Date(year, monthIndex, 0).getDate();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weeks: CalendarDayCell[][] = [];
  let currentWeek: CalendarDayCell[] = [];

  // Previous month trailing days
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const dayNum = prevMonthLastDay - i;
    const date = new Date(year, monthIndex - 1, dayNum);
    date.setHours(0, 0, 0, 0);
    const dayItems = allItems.filter(item => {
      const d = item.nextDate;
      return d.getFullYear() === date.getFullYear() && d.getMonth() === date.getMonth() && d.getDate() === date.getDate();
    });

    currentWeek.push({
      date,
      dayNumber: dayNum,
      isCurrentMonth: false,
      isToday: date.getTime() === today.getTime(),
      items: dayItems
    });
  }

  // Current month days
  for (let day = 1; day <= totalDaysInMonth; day++) {
    const date = new Date(year, monthIndex, day);
    date.setHours(0, 0, 0, 0);
    const dayItems = allItems.filter(item => {
      const d = item.nextDate;
      return d.getFullYear() === date.getFullYear() && d.getMonth() === date.getMonth() && d.getDate() === date.getDate();
    });

    currentWeek.push({
      date,
      dayNumber: day,
      isCurrentMonth: true,
      isToday: date.getTime() === today.getTime(),
      items: dayItems
    });

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  // Next month leading days to complete the 7-column grid
  if (currentWeek.length > 0) {
    let nextMonthDay = 1;
    while (currentWeek.length < 7) {
      const date = new Date(year, monthIndex + 1, nextMonthDay);
      date.setHours(0, 0, 0, 0);
      const dayItems = allItems.filter(item => {
        const d = item.nextDate;
        return d.getFullYear() === date.getFullYear() && d.getMonth() === date.getMonth() && d.getDate() === date.getDate();
      });

      currentWeek.push({
        date,
        dayNumber: nextMonthDay,
        isCurrentMonth: false,
        isToday: date.getTime() === today.getTime(),
        items: dayItems
      });
      nextMonthDay++;
    }
    weeks.push(currentWeek);
  }

  return weeks;
}
