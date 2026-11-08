import { ProfileSection } from "@/api/constants";

export const defaultProfileOrder: ProfileSection[] = [
  ProfileSection.DESK,
  ProfileSection.QUIZZES,
  ProfileSection.ACTIVITY,
];

export function validProfileOrder(
  value: unknown,
): value is ProfileSection[] {
  return (
    Array.isArray(value) &&
    value.length === defaultProfileOrder.length &&
    new Set(value).size === value.length &&
    value.every((id) => defaultProfileOrder.includes(id))
  );
}

export function moveProfileSection(
  order: ProfileSection[],
  from: ProfileSection,
  to: ProfileSection,
): ProfileSection[] {
  const result = order.filter((id) => id !== from);
  result.splice(order.indexOf(to), 0, from);
  return result;
}
