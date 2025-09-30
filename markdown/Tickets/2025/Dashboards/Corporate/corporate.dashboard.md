
# Pending Pages
# Signup
1. If `evaluator` email is try to signup as `corporate` then update the corporate reset password flow -`DONED`

## Home
1. counts header:
   1. Total users
   2. Total applications
   3. Total job posted
   4. Live jobs
   5. New applicants
   6. Pending applicants
   7. Evaluation pending
   8. Total cv evaluated
   9. Hired
   10. Rejected
   11. Interviews to be scheduled
2. Testing apis from frontend

## Jobs
1. new columns in listing:
   1. level -> `DONE`
   2. total applications
   3. pending
   4. Created by: call get by user id api when dropdown is opened -> `DONE`
2. Once a job is closed then auto reject all the candidates who are still in the applied stage or any other stage then rejected or hired : with a message, Position has been went on hold or closed by the Recruiter.
3. in the new design there is pop-up asking reason for job closure, just use that reason to send mail to all candidate who has been accepted but neither marked as hire nor rejected. 
4. Create job new columns:
   1. Grade level -> `DONE`
   2. Creator name
5. Update job new columns:
   1. Grade level -> `DONE`
   2. Creator name
6. Testing apis from frontend
7. Retest scenarios from frontend:
   1. you are passing `noticePeriod: "15days"`
   pass as `noticePeriod: 15` number
8. vairable and fixed component while cretaing a job -> `DONE`

## Applicants
1. search: -> `DONE`
   1. by email is failing
   2. when search by job name do not attach company details because its not using in this page
2. Listing tab wise:
   1. All -> `DONE`
   2. Hired -> `DONE`
   3. Joined: -> `DONE`
      1. New columns:
         1. Not responding
3. Job application update validations  -> `DONE`
4. send emails in job application updates -> `DONE`
5. New columns in listing:
   1. Response
   2. Rejected By: call get by id api if dropdown opened -> `DONE`
6. Testing apis from frontend
7. all documents should submit then only corp or admin need to mark as verified -> `DONE`
8. joining date while sending offer letter -> `DONE`
9. retest:
      1. while sending offer letter, dont send offerLetterRemarks as empty string if it is not provided, dont send it
      Request URL
      `https://jobs.dev.worko.work/job-application/01K44YSPGPHHSPXK2MW94C716P/corp-action`
      Request Method
      `PATCH`
      ```json
      // request body
      {
         "userId": "rohith patel appala test",
         "status": "OFFER_SENT",
         "offerLetterCloudFileName": "01K452V2Y0DHAHKPRBZG7VCKJM.pdf",
         "offerLetterRemarks": "",
         "emailId": "rohithappala777+candidate3@gmail.com",
         "userType": "corporate-admin",
         "applicantName": "rohith patel appala test"
      }
      ```

## Bulk cv check
1. Testing apis from frontend
2. when paste jd and parse jd the new fields are their, check `parse jd` api response with `ai` team -> `DONE`
   1. `Industry preference` new column

## Invite
1. If `evaluator` email is try to invite as `corporate` then update the flow accordingly -> `DONE`
2. While creating corporate user need to add `phone number` also -> `DONE`
3. New columns: -> `DONE`
   1. Phone no
   2. Resend
   3. Revoke
