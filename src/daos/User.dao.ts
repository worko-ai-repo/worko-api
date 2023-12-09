//Load the base dao
import BaseDao from "./Base.dao";

// Strongly typed model for Subscription
class UserDao implements BaseDao {
  modelName = "user";
  partitianKey = "";
  sortKeys = {};
}

const userDao = new UserDao();

export default userDao;
