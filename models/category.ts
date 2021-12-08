import Review from "./review";
import User from "./user";

export default interface Category {
  id: string;
  name: string;
  createdBy: User;
  createdDate: Date;
  users: User[];
  reviews: Review[];
}
