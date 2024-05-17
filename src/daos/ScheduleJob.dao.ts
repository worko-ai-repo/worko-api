import { BaseDbDto } from "../db/models/Base.model";
import { ScheduleJobModel } from "../db/models/ScheduleJob.model";

class ScheduleJobDao extends BaseDbDto{

    async createScheduleJob(data: any) {
        return await ScheduleJobModel.create(data)
    }
}