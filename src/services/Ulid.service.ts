import { ulid } from "ulidx";

class UlidService {
  getUlidId() {
    return ulid();
  }
}

export default new UlidService();
