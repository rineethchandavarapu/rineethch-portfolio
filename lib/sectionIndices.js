import profile from '@/data/profile.json'

/** Snap: 0=video 1=hero 2=about 3..N=projects N+1=work-exp N+2..N+4=publications/footer */
export const PROJECT_COUNT = profile.projects.length
export const TOTAL = 7 + PROJECT_COUNT

export const SECTION = {
  video: 0,
  hero: 1,
  about: 2,
  projects: 3,
  workExperience: 3 + PROJECT_COUNT,
  publications: 4 + PROJECT_COUNT,
  contact: TOTAL - 1,
}

export const NAV_ITEMS = [
  { label: 'Home',       idx: SECTION.hero },
  { label: 'About',      idx: SECTION.about },
  { label: 'Work',       idx: SECTION.projects },
  { label: 'Experience', idx: SECTION.workExperience },
  { label: 'Impact',     idx: SECTION.publications },
  { label: 'Contact',    idx: SECTION.contact },
]
