
# Production Checklist
1. Create `WORKO_ADMIN_CORPORATE_REQUEST` email template on `production`

```json
{
    "templateName": "WORKO_ADMIN_CORPORATE_REQUEST",
    "subject": "New Corporate Demo Request - Worko.ai",
    "title": "New Corporate Demo Request - Worko.ai",
  "bodyHtml": "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <title>New Corporate Demo Request - Worko.ai</title>\n</head>\n<body style=\"font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;\">\n    \n    <h2 style=\"color: #4f46e5;\">New Corporate Demo Request - Worko.ai</h2>\n    \n    <p>Hello,</p>\n    \n    <p>You have received a new demo request from your corporate page. Here are the details:</p>\n    \n    <table style=\"width: 100%; border-collapse: collapse; margin: 20px 0;\">\n        <tr>\n            <td style=\"padding: 8px; font-weight: bold; border-bottom: 1px solid #ddd;\">Name:</td>\n            <td style=\"padding: 8px; border-bottom: 1px solid #ddd;\">{{corporateFullName}}</td>\n        </tr>\n        <tr>\n            <td style=\"padding: 8px; font-weight: bold; border-bottom: 1px solid #ddd;\">Company:</td>\n            <td style=\"padding: 8px; border-bottom: 1px solid #ddd;\">{{corporateCompanyName}}</td>\n        </tr>\n        <tr>\n            <td style=\"padding: 8px; font-weight: bold; border-bottom: 1px solid #ddd;\">Designation:</td>\n            <td style=\"padding: 8px; border-bottom: 1px solid #ddd;\">{{corporateDesignation}}</td>\n        </tr>\n        <tr>\n            <td style=\"padding: 8px; font-weight: bold; border-bottom: 1px solid #ddd;\">Email:</td>\n            <td style=\"padding: 8px; border-bottom: 1px solid #ddd;\"><a href=\"mailto:{{corporateEmail}}\">{{corporateEmail}}</a></td>\n        </tr>\n        <tr>\n            <td style=\"padding: 8px; font-weight: bold; border-bottom: 1px solid #ddd;\">Contact:</td>\n            <td style=\"padding: 8px; border-bottom: 1px solid #ddd;\">{{corporatePhoneNumber}}</td>\n        </tr>\n        <tr>\n            <td style=\"padding: 8px; font-weight: bold; border-bottom: 1px solid #ddd;\">Subscription Type:</td>\n            <td style=\"padding: 8px; border-bottom: 1px solid #ddd;\">{{requestedPricingPlan}}</td>\n        </tr>\n        <tr>\n            <td style=\"padding: 8px; font-weight: bold; border-bottom: 1px solid #ddd;\">Message:</td>\n            <td style=\"padding: 8px; border-bottom: 1px solid #ddd;\">{{corporateMessage}}</td>\n        </tr>\n    </table>\n    \n    <p><strong>Submitted:</strong> {{submittedAt}}</p>\n</body>\n</html>",
  "bodyText": "New Corporate Demo Request - Worko.ai\n\nHello,\n\nYou have received a new demo request from your corporate page. Here are the details:\n\nName: {{corporateFullName}}\nCompany: {{corporateCompanyName}}\nDesignation: {{corporateDesignation}}\nEmail: {{corporateEmail}}\nContact: {{corporatePhoneNumber}}\nSubscription Type: {{requestedPricingPlan}}\nMessage: {{corporateMessage}}\n\nSubmitted: {{submittedAt}}",
    "placeholders": [
        "corporateFullName",
        "corporateCompanyName",
        "corporateDesignation",
        "corporateEmail",
        "corporatePhoneNumber",
        "requestedPricingPlan",
        "corporateMessage",
        "submittedAt"

    ],
    "description": "The template is used to send an email to worko admin, when a corporate user sends a request."
}
```

1. jeetesh@worko.ai
2. hello@worko.ai

```ts
/**
 * @see https://liveweave.com/
 */
```

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Corporate Demo Request - Worko.ai</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    
    <h2 style="color: #4f46e5;">New Corporate Demo Request - Worko.ai</h2>
    
    <p>Hello,</p>
    
    <p>You have received a new demo request from your corporate page. Here are the details:</p>
    
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr>
            <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #ddd;">Name:</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">{{corporateFullName}}</td>
        </tr>
        <tr>
            <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #ddd;">Company:</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">{{corporateCompanyName}}</td>
        </tr>
        <tr>
            <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #ddd;">Designation:</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">{{corporateDesignation}}</td>
        </tr>
        <tr>
            <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #ddd;">Email:</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><a href="mailto:{{EMAIL}}">{{corporateEmail}}</a></td>
        </tr>
        <tr>
            <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #ddd;">Contact:</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">{{corporatePhoneNumber}}</td>
        </tr>
        <tr>
            <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #ddd;">Subscription Type:</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">{{requestedPricingPlan}}</td>
        </tr>
        <tr>
            <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #ddd;">Message:</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">{{corporateMessage}}</td>
        </tr>
    </table>
    
    <p><strong>Submitted:</strong> {{submittedAt}}</p>
    
    
</body>
</html>
```

