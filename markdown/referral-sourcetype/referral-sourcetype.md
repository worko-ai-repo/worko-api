

# Corporate Referral Source Type flow
1. `corporate-admin` Submitted Referral Source Type Email: `pankaj@amazon.com`
2. Frontend will show a pop-up with this format `{companyId}@referral.worko.work` i.e `AMAZONCOMPANYID@referral.worko.work`
3. `corporate-admin` need to add `AMAZONCOMPANYID@referral.worko.work` email under `conditional forwarding email` in `pankaj@amazon.com` email provider(gmail or outlook) 
   1. 
   ```sh
   Gmail Setup Steps:
      1. Open Gmail Settings
         1. Go to Gmail → Settings (gear icon) → "See all settings"

      2. Navigate to Forwarding
         1. Click "Forwarding and POP/IMAP" tab

      3. Add Forwarding Address
         1. Click "Add a forwarding address"
         2. Enter: AMAZONCOMPANYID@referral.worko.work
         3. Click "Next"
         4. Verify `pankaj@amazon.com` email, if it asks
         5. Click "Proceed" 
         6. Popup with below text will open and you can ignore this popup and Click "OK":
         ```sh
            # Note internally we need to grab link from `s3` and send it to `worko-admin` from a lambda function
            # once `worko-admin` confirm and proceed "AMAZONCOMPANYID@referral.worko.work" will be verified
            Add a forwarding address
            A confirmation link has been sent to AMAZONCOMPANYID@referral.worko.work to verify permission.
         ```
         7. That verification email will be sent to "worko-admin" and once he confirm and proceed
         8. Once "Worko-admin" done verification you need to look for below text:
         ```sh
         Tip: You can also forward only some of your mail by "creating a filter"!
         ```
         9. Click "creating a filter"
         10. 
         ```sh
         From: (leave empty)
         To: (leave empty)  
         Subject: (leave empty)
         Has the words: CV OR resume OR application OR candidate OR attached resume
         Doesn't have: (leave empty)
         Size: (leave empty)
         Has attachment: ✓ (checked) 
         Don't include chats: ✓ (checked) #  ignores your Google Chat conversations (Hangouts/Chat)

         Then click "Create filter" and select:
         - Forward it to: AMAZONCOMPANYID@referral.worko.work

         Then "Create filter"
         ```
         11. Verify your `pankaj@amazon.com` email, if it asks
         ```sh
         We need to verify it’s you to continue
         Follow the steps in the secure Google verification popup once you click continue
         ```
   ```
   2. 
   ```sh
   Outlook Setup steps:
      1. Go to "File" -> "Settings (gear icon)" -> "Mail"
      2. "Forwarding" -> "Enable forwarding"
      3. Enter "AMAZONCOMPANYID@referral.worko.work" in "Forward my email to:"
      4. Go to "File" -> "Settings (gear icon)" -> "Mail" -> "Rules"
      5. "Add new rule" button:
         1. Rule name: `Candidate resume`
         2. Add a condition
            1. select `Has attachment`
            2. Click on `Add another condition` button
            and select `Subject or body includes` and paste below text:
            ```sh
            cv OR resume OR candidate resume OR resume attachment
            ```
         3. Add an action
            1. select `Forward to` and enter `AMAZONCOMPANYID@referral.worko.work`

   ```
4. If any `cv` recieved to `pankaj@amazon.com` email then that `cv` will recieved to `AMAZONCOMPANYID@referral.worko.work`
5. AWS SES rule: `referral.worko.work` -> Store in S3 + Trigger Lambda
6. In aws lambda we extract cv and parse it
