import { ScheduleJobStatus, ScheduleJobType } from "../enums/ScheduleJob.enum";

/**
 * ScheduleJobCreateDto
 *
 * This interface defines the structure of a schedule job data transfer object, representing a schedule job with additional fields.
 */
export interface ScheduleJobCreateDto {
  /**
   * id
   * 
   * A unique identifier for the schedule job. This is an optional field as it is auto-generated upon creation.
   * 
   * @type {string}
   */
  id?: string;

  /**
   * type
   * 
   * The type of the schedule job, which determines the nature of the task to be scheduled.
   * 
   * @type {ScheduleJobType}
   */
  type: ScheduleJobType;

  /**
   * scheduleTime
   * 
   * The time at which the schedule job is set to execute. This should be in ISO 8601 date format.
   * 
   * @example "2017-04-20T11:32:00.000-04:00"
   * @type {string}
   */
  scheduleTime: string;

  /**
   * input
   * 
   * The input data for the schedule job. This should be an object containing the necessary data for the job execution.
   * 
   * @type {object}
   */
  input: object;

  /**
   * desc
   * 
   * A description of the schedule job, which can include details about the job’s purpose or functionality.
   * 
   * @type {string}
   */
  desc: string;

  /**
   * status
   * 
   * The current status of the schedule job. This indicates whether the job is pending, in progress, or completed.
   * 
   * @type {ScheduleJobStatus}
   */
  status: ScheduleJobStatus;
}

export interface ScheduleJobRefReviewAcceptanceStatusInputDto {
  referralId : string ;
  userEmail : string ;
  userId:string;
}

/**
 * ScheduleJobCorporateBulkJdResumeNotificationsInput
 * 
 * This interface defines the structure of the data that can be used to create a schedule job for sending email and whatsapp notifications to bulk resumes candidates by corporate bulk jd id.
 */
export interface ScheduleJobCorporateBulkJdResumeNotificationsInputDto {
  corporateBulkJdId: string;
}

/**
 * ScheduleJobUpdateDto
 *
 * This interface defines the structure of the data that can be used to update an existing schedule job.
 */
export interface ScheduleJobUpdateDto {
  /**
   * type
   * 
   * The type of the schedule job, which determines the nature of the task to be scheduled. This field is optional.
   * 
   * @type {ScheduleJobType}
   */
  type?: ScheduleJobType;

  /**
   * scheduleTime
   * 
   * The new time at which the schedule job is set to execute. This should be in ISO 8601 date format. This field is optional.
   * 
   * @example "2017-04-20T11:32:00.000-04:00"
   * @type {string}
   */
  scheduleTime?: string;

  /**
   * input
   * 
   * The new input data for the schedule job. This should be an object containing the necessary data for the job execution. This field is optional.
   * 
   * @type {object}
   */
  input?: object;

  /**
   * desc
   * 
   * The new description of the schedule job, which can include details about the job’s purpose or functionality. This field is optional.
   * 
   * @type {string}
   */
  desc?: string;

  /**
   * status
   * 
   * The new status of the schedule job. This indicates whether the job is pending, in progress, or completed. This field is optional.
   * 
   * @type {ScheduleJobStatus}
   */
  status?: ScheduleJobStatus;
}

/**
 * ScheduleJobWhatsAppReminderInputDto
 *
 * This interface defines the structure of the input data required to schedule a WhatsApp reminder job.
 */
export interface ScheduleJobWhatsAppReminderInputDto {
  /**
   * email
   * 
   * The email address of the user to whom the WhatsApp reminder will be sent.
   * 
   * @type {string}
   */
  email: string;

  /**
   * empName
   * 
   * The name of the employee for whom the WhatsApp reminder is being scheduled. This is used to personalize the reminder message.
   * 
   * @type {string}
   */
  empName: string;

  /**
   * experienceId
   * 
   * A unique identifier associated with the experience or event for which the reminder is being scheduled. This helps in associating the reminder with a specific experience.
   * 
   * @type {string}
   */
  experienceId: string;

  /**
   * reminderCount
   * 
   * The number of reminders to be sent. This field helps in scheduling multiple reminders as needed.
   * 
   * @type {number}
   */
  reminderCount: number;
}

/**
 * ScheduleJobReferralReminderInputDto
 *
 * This interface defines the structure of the input data required to schedule a referral reminder job.
 */
export interface ScheduleJobReferralReminderInputDto {
  /**
   * email
   * 
   * The email address of the user to whom the referral reminder will be sent.
   * 
   * @type {string}
   */
  email: string;

  /**
   * empName
   * 
   * The name of the employee related to the referral. This is used to personalize the reminder message.
   * 
   * @type {string}
   */
  empName: string;

  /**
   * referralId
   * 
   * A unique identifier for the referral. This helps in associating the reminder with a specific referral record.
   * 
   * @type {string}
   */
  referralId: string;
}
