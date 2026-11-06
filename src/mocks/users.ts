import type { Hashtag, User } from "../api/contracts";
export const users: readonly User[] = [
  { userId: "learner", publicId: "bugri-learner", displayName: "학습자" },
  { userId: "author", publicId: "bugri-author", displayName: "타입 개발자" },
  { userId: "friend", publicId: "bugri-friend", displayName: "웹 개발자" },
];
export const hashtags: readonly Hashtag[] = [
  { id: "typescript", name: "TypeScript" },
  { id: "javascript", name: "JavaScript" },
  { id: "web", name: "Web" },
  { id: "java", name: "Java" },
];
