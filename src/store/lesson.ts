import { atom } from 'nanostores';

export const currentPageIndex = atom<number>(0);
export const activeSectionId = atom<string | null>(null);
export const sectionNavigationTarget = atom<string | null>(null);

export function setPage(index: number) {
  currentPageIndex.set(index);
  activeSectionId.set(null); // Reset section when changing page
  sectionNavigationTarget.set(null);
}

export function setSectionFromScroll(sectionId: string) {
  activeSectionId.set(sectionId);
}

export function navigateToSection(sectionId: string) {
  activeSectionId.set(sectionId);
  sectionNavigationTarget.set(sectionId);
}

export function clearSectionNavigationTarget() {
  sectionNavigationTarget.set(null);
}
