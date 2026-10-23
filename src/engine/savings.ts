/** Expected-savings maths for the stage calculator. Pure functions, unit-tested. */
export const MINUTES_RETURNED_PER_MEETING = 10
export const WORKING_HOURS_PER_DAY = 8
export const SETUP_COST_QAR = { nabdh: 4_500, gym: 1_200_000 } as const

export interface SavingsInput {
  employees: number
  meetingsPerEmployee: number // internal meetings per employee per day
  sickDaysAvoided: number // per employee per year
  dailySalaryQar: number
}

export const DEFAULT_INPUT: SavingsInput = { employees: 1000, meetingsPerEmployee: 3, sickDaysAvoided: 1, dailySalaryQar: 1000 }

/** employees x meetings x 10 min / 60 */
export const hoursReturnedPerDay = (i: SavingsInput) => (i.employees * i.meetingsPerEmployee * MINUTES_RETURNED_PER_MEETING) / 60

/** the returned hours expressed as whole working days (500 h = 62 days at 8 h) */
export const workingDaysEquivalent = (hours: number) => Math.floor(hours / WORKING_HOURS_PER_DAY)

export const annualSickDaySavingsQar = (i: SavingsInput) => i.employees * i.sickDaysAvoided * i.dailySalaryQar

/** How many times cheaper Nabdh is than a traditional gym fit-out. */
export const costRatio = () => SETUP_COST_QAR.gym / SETUP_COST_QAR.nabdh
