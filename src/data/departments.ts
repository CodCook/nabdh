export interface Dept {
  id: 'hr' | 'plan' | 'service' | 'fin' | 'it' | 'legal'
  code: string
  seed: number // breaks logged so far today
}

export const DEPTS: Dept[] = [
  { id: 'hr', code: 'HR_04', seed: 38 },
  { id: 'plan', code: 'PLN_02', seed: 27 },
  { id: 'service', code: 'SRV_07', seed: 54 },
  { id: 'fin', code: 'FIN_03', seed: 22 },
  { id: 'it', code: 'IT_05', seed: 31 },
  { id: 'legal', code: 'LEG_01', seed: 14 },
]

export const deptByCode = (code: string) => DEPTS.find((d) => d.code === code)
export const deptById = (id: string) => DEPTS.find((d) => d.id === id) ?? DEPTS[0]
