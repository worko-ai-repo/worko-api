
# Pending pages
## Candidate 
1. Testing apis from frontend
2. verify mobile number -> `DONE`
3. verify email -> `DONE`
4. verify company email -> `DONE`
5. designation, companyname, CTC, phone number search, department
6. delete a user

## Employee
1. Testing apis from frontend

## Jobs
1. counts header:
2. Once a job is closed then auto reject all the candidates who are still in the applied stage or any other stage then rejected or hired : with a message, Position has been went on hold or closed by the Recruiter.
   1. below `HIRING_IN_PROCESS`
4. Create job new columns:
   1. Grade level -> `DONE`
   2. Creator name
5. Update job new columns:
   1. Grade level -> `DONE`
   2. Creator name
6. Testing apis from frontend

## Applicants
1. search:
   1. by email is failing -> `DONE`
   2. when search by job name do not attach company details because its not using in this page -> `DONE`
2. Listing tab wise:
   1. All -> `DONE`
   2. Hired -> `DONE`
   3. Joined: -> `DONE`
      1. New columns:
         1. Not responding:
            1. If `3` times not responding happened on same job application then we need to block `candidate` to apply job for `7` days
3. Job application update validations  -> `DONE`
4. send emails in job application updates  -> `DONE`
6. New columns in listing:
   1. Rejected By: call get by id api if dropdown opened -> `DONE`
7. Testing apis from frontend
8. all documents should submit then only corp or admin need to mark as verified -> `DONE`
9. joining date while sending offer letter -> `DONE`

## Referral
1. Testing apis from frontend
2. new columns
   1. Employee name
   2. Employee feedback
   3. Candidate name -> `DONE`

## Bulk cv check
1. Testing apis from frontend
2. when paste jd and parse jd the new fields are their, check `parse jd` api response with `ai` team -> `DONE`
   1. `Industry preference` new column

## Corporate users
1. Testing apis from frontend
2. New columns: -> `DONE`
   1. Contact numbers
3. Invite form: -> `DONE`
   1. subscription type
   2. phone number
   3. cv duplicacy
4. only one `corporate-admin` should be there in one company
5. pause

## Refer & earn
1. Payment header:
   1. Total referral amount
   2. withdrawal amount
   3. pending amount
   4. withdrawal requested amount
2. Testing apis from frontend

## Companies
1. Company request page:
   1. Filters
2. Company Listing page: 

# Guidance
1. send emails -> `DONE`
2. guidance feature -> `DONE`

## Payment

## Package

