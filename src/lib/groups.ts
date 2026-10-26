import { data, subjectById } from "./content";

/** Each subject group owns one stone colour of the pavement, used at full strength wherever the group appears. */
export const GROUP_STONE: Record<string, { stone: string; ink: string; name: string }> = {
  people: { stone: "#B4475C", ink: "#ffffff", name: "Rose granite" },
  home: { stone: "#2F7D57", ink: "#ffffff", name: "Palm" },
  food: { stone: "#E0A021", ink: "#121212", name: "Ochre" },
  around: { stone: "#3F51C4", ink: "#ffffff", name: "Slate blue" },
  world: { stone: "#087099", ink: "#ffffff", name: "Sea" },
  time: { stone: "#1E1E1C", ink: "#ffffff", name: "Basalt" },
  description: { stone: "#B4532A", ink: "#ffffff", name: "Terracotta" },
  grammar: { stone: "#7A5A3A", ink: "#ffffff", name: "Earth" },
};

const FALLBACK = { stone: "#1E1E1C", ink: "#ffffff", name: "Basalt" };

export function groupStone(groupId: string | undefined) {
  return (groupId && GROUP_STONE[groupId]) || FALLBACK;
}

export function subjectStone(subjectId: string) {
  return groupStone(subjectById[subjectId]?.groupId);
}

export function groupById(groupId: string) {
  return data.groups.find((group) => group.id === groupId);
}
