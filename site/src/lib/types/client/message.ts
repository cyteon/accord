export type Message = {
  id: string;
  authorId: string;
  channelId: string;
  content: string;
  createdAt: Date;

  // joined on query
  author: {
    id: string;
    username: string;
    displayName: string;
  };
};
