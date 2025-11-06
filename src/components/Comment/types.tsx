export interface Comment {
  _id: string;
  author: {_id: string, fullname: string, avatarUrl: string};
  content: string;
  createdAt: string;
  noOfLikes?: number;
  isOwner: number;
  noOfChildren: number;
  isLike?: boolean;
}