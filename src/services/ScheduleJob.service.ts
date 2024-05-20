import { SchedulerClient, CreateScheduleCommand, FlexibleTimeWindowMode } from "@aws-sdk/client-scheduler"; 
import APP_CONSTANTS from "../configs/constants.config";
import { ulid } from "ulidx";
import UlidService from "./Ulid.service";
import { ScheduleJobModel } from "../db/models/ScheduleJob.model";

class ScheduleJob{
    constructor() {}
    client = new SchedulerClient({});
// create async function to create Schedule command using aws sdk schedule command
    /**
     * @param scheduleDesc - Description of the schedule
     * @param scheduleExpression - Schedule expression in `at(2024-05-13T17:10:00)` or `rate(5 minutes)` format
     * @param input - Input to the Lambda function
     * 
     *  */
    async createSchedule(scheduleDesc: string, scheduleExpression: string, input: any) {
        
        const commandInput = {
            Name: UlidService.getUlidId(), // Schedule name should always be unique
            Description: scheduleDesc,
            GroupName: APP_CONSTANTS.SCHEDULE_JOB.GROUP,    // This should be predefined in AWS 
            ScheduleExpression: scheduleExpression, // required
            ScheduleExpressionTimezone: APP_CONSTANTS.SCHEDULE_JOB.TIME_ZONE, // important to trigger in same time zone
            FlexibleTimeWindow: { // FlexibleTimeWindow
                Mode: FlexibleTimeWindowMode.FLEXIBLE,
                MaximumWindowInMinutes: Number("30"),
              }, 
            Target: {
                Arn: APP_CONSTANTS.SCHEDULE_JOB.LAMBDA_TRIGGER_ARN,
                RoleArn: APP_CONSTANTS.SCHEDULE_JOB.ROLE_ARN,
                // DeadLetterConfig: {
                //   Arn: "STRING_VALUE",
                // },
            },
            Input: JSON.stringify(input),
        };
        const command = new CreateScheduleCommand(commandInput);
        const response = await this.client.send(command);
        console.log(response);

        return response
    }

    updateDb(id: string, status: string){
        const newUserSignUpDTO = {
            // PK: this.partitianKey.strtr({
            //   "{primaryEmail}": email,
            // }),
            // SK: this.sortKeys.SK_ID.strtr({
            //   "{userId}": userId,
            // }),
            // id: userId,
            // GSI1PK: this.GSI1PK,
            // GSI1SK: this.GSI1SK.strtr({
            //   "{userId}": userId
            // }),
            // ...copyUserSignUpDTO,
            // emailList: emailList,
            // isSubscribed: isSub,
            // userType: [userType],
            // lastAccessedDash: userType,
            // referralCount: refCount,
            // expiryDate: today,
            // isEmailVerified: false,
            // isNumberVerified: false,
          };
          return ScheduleJobModel.create(newUserSignUpDTO);
    }

   // lambda handler to accept trigger from Schedule Job 
   async handler(event: any) {
    console.log(event);
    return "success"
  }
}

// Export an instance of the ScheduleJob class
export default new ScheduleJob();