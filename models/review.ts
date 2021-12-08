import Category from "./category";
import User from "./user";

export default interface Review {
  id: string;
  name: string;
  comment: string;
  createdBy: User;
  createdDate: Date;
  category: Category;
}
