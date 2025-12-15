
# NOTE:- These error handling tips are just examples, Please don't follow this tips blindly.

1. When you face below kind of error
```ts
/**
 * -> Tip-1: check `serverless.ts` > find `iamRoleStatements` option in the code > check permissions
 * -> Tip-2: @see https://forum.serverless.com/t/user-is-not-authorized-to-access-this-resource/6357
 * -> Tip-3: Clear cookies in postman and login again and try
 */
```
```sh
403 Forbidden
Access to the resource is prohibited.
```
```json
{
   "Message":"User is not authorized to access this resource"
}
```


2. When you get below kind of error
```ts
/**
 * -> Tip-1: check whether environment variables are accessed properly or not, like it will accessed as `undefined`.
 * -> Tip-2: check whether environment variables `name` you are accessing and the `name` you are accessing is same or not.
 */
```
```json
2025-02-11T13:43:47.371Z	undefined	ERROR	Uncaught Exception 	{
    "errorType": "ConfigurationError",
    "errorMessage": "Missing node(s) option",
    "name": "ConfigurationError",
    "stack": [
        "ConfigurationError: Missing node(s) option",
        "    at new I (/var/task/dist/src/app-event-trigger.js:2:437273)",
        "    at <instance_members_initializer> (/var/task/dist/src/app-event-trigger.js:2:1413036)",
        "    at new t.AwsOpensearchLibrary (/var/task/dist/src/app-event-trigger.js:2:1413013)",
        "    at 37480 (/var/task/dist/src/app-event-trigger.js:2:1344781)",
        "    at s (/var/task/dist/src/app-event-trigger.js:2:11866451)",
        "    at 93427 (/var/task/dist/src/app-event-trigger.js:2:1420146)",
        "    at s (/var/task/dist/src/app-event-trigger.js:2:11866451)",
        "    at 8062 (/var/task/dist/src/app-event-trigger.js:2:1444344)",
        "    at s (/var/task/dist/src/app-event-trigger.js:2:11866451)",
        "    at 52961 (/var/task/dist/src/app-event-trigger.js:2:1340517)"
    ]
}
```


3. I have faced below error when I'm trying to create `index` in `aws opensearch managed clusters`,
then I have solved the error using below reference link provided in `Tip-1`
```ts
/**
 * -> Tip-1: @see https://docs.aws.amazon.com/opensearch-service/latest/developerguide/fgac.html#fgac-more-masters
 */
```
```json
{
  "errorCode": 500,
  "errorMsg": "security_exception: [security_exception] Reason: no permissions for [indices:admin/create] and User [name=arn:aws:iam::211125353899:role/worko-job-app-dev-ap-south-1-lambdaRole, backend_roles=[arn:aws:iam::211125353899:role/worko-job-app-dev-ap-south-1-lambdaRole], requestedTenant=null]",
  "timeStamp": "2025-02-12T12:22:39.740Z"
}
```
```json
{
  "statusCode": 500,
  "body": "{\"error\": \"AuthorizationException(403, 'security_exception', 'no permissions for [indices:data/read/get] and User [name=arn:aws:iam::211125353899:role/service-role/worko-user-matching-score-job-role-34tbkmew, backend_roles=[arn:aws:iam::211125353899:role/service-role/worko-user-matching-score-job-role-34tbkmew], requestedTenant=null]')\"}"
}
```


4. When you get below kind of error
```ts
/**
 * -> Tip-1: Check whether the api endpoint is correct or not, compare the endpoint you are hitting in postman and the api you 
 *    written in the code
 */
```
```json
{
  "message": "Invalid key=value pair (missing equal-sign) in Authorization header (hashed with SHA-256 and encoded with Base64): '4oTPuwIr76FeGjkt/eGqTfhc+YcdBSjFfw5dRwc+hXo='."
}
```


5. 
```ts
/**
 * -> Tip-1: Check whether you have registered the dynamoose model or not in `DB.config.ts`
 */
```
```json
{
    "errorType": "Runtime.UnhandledPromiseRejection",
    "errorMessage": "AccessDeniedException: User: arn:aws:sts::211125353899:assumed-role/worko-job-app-dev-ap-south-1-lambdaRole/worko-job-app-dev-workoJobApp is not authorized to perform: dynamodb:CreateTable on resource: arn:aws:dynamodb:ap-south-1:211125353899:table/CompanyJob because no identity-based policy allows the dynamodb:CreateTable action",
    "reason": {
        "errorType": "AccessDeniedException",
        "errorMessage": "User: arn:aws:sts::211125353899:assumed-role/worko-job-app-dev-ap-south-1-lambdaRole/worko-job-app-dev-workoJobApp is not authorized to perform: dynamodb:CreateTable on resource: arn:aws:dynamodb:ap-south-1:211125353899:table/CompanyJob because no identity-based policy allows the dynamodb:CreateTable action",
        "name": "AccessDeniedException",
        "$fault": "client",
        "$metadata": {
            "httpStatusCode": 400,
            "requestId": "5I7LLTNQHDPE0M08NIDJA7TRCFVV4KQNSO5AEMVJF66Q9ASUAAJG",
            "attempts": 1,
            "totalRetryDelay": 0
        },
        "__type": "com.amazon.coral.service#AccessDeniedException",
        "message": "User: arn:aws:sts::211125353899:assumed-role/worko-job-app-dev-ap-south-1-lambdaRole/worko-job-app-dev-workoJobApp is not authorized to perform: dynamodb:CreateTable on resource: arn:aws:dynamodb:ap-south-1:211125353899:table/CompanyJob because no identity-based policy allows the dynamodb:CreateTable action",
        "stack": [
            "AccessDeniedException: User: arn:aws:sts::211125353899:assumed-role/worko-job-app-dev-ap-south-1-lambdaRole/worko-job-app-dev-workoJobApp is not authorized to perform: dynamodb:CreateTable on resource: arn:aws:dynamodb:ap-south-1:211125353899:table/CompanyJob because no identity-based policy allows the dynamodb:CreateTable action",
            "    at /var/task/dist/src/app.js:2:702325",
            "    at /var/task/dist/src/app.js:2:702420",
            "    at ns (/var/task/dist/src/app.js:2:180080)",
            "    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)",
            "    at async /var/task/dist/src/app.js:2:666072",
            "    at async /var/task/dist/src/app.js:2:654761",
            "    at async /var/task/dist/src/app.js:2:665043",
            "    at async /var/task/dist/src/app.js:2:376824",
            "    at async t.default (/var/task/dist/src/app.js:2:1236160)",
            "    at async t.createTable (/var/task/dist/src/app.js:2:1229785)"
        ]
    },
    "promise": {},
    "stack": [
        "Runtime.UnhandledPromiseRejection: AccessDeniedException: User: arn:aws:sts::211125353899:assumed-role/worko-job-app-dev-ap-south-1-lambdaRole/worko-job-app-dev-workoJobApp is not authorized to perform: dynamodb:CreateTable on resource: arn:aws:dynamodb:ap-south-1:211125353899:table/CompanyJob because no identity-based policy allows the dynamodb:CreateTable action",
        "    at process.<anonymous> (file:///var/runtime/index.mjs:1276:17)",
        "    at process.emit (node:events:529:35)",
        "    at process.emit (node:domain:489:12)",
        "    at emit (node:internal/process/promises:149:20)",
        "    at processPromiseRejections (node:internal/process/promises:283:27)",
        "    at process.processTicksAndRejections (node:internal/process/task_queues:96:32)"
    ]
}
```


6. 
```ts
/**
 * -> Tip-1: Check the `timeout` in `serverless.ts` file and increase it or make your code optimize way to reduce for loops
 */
```
```json
// In postman

// 504
// Gateway Timeout
{"message": "Endpoint request timed out"}
```
```sh
# In Cloudwatch
2025-02-25T11:16:05.926Z f922af8b-1eda-470d-99a2-4927ed88f929 Task timed out after 29.04 seconds
```


7. 
```ts
/**
 * -> Tip-1: check serverless file(serverless.ts or serverless.yml) and set the `timeout` for 
 * the `lambda function` which you are using.
 */
```
```sh
2025-02-18T11:51:13.504Z d167b473-a881-4be5-a067-90ea8991ec79 Task timed out after 29.04 seconds
```

8. 
```ts
/**
 * -> Tip-1: check serverless file(serverless.ts or serverless.yml) and set the `VPC` configuartion to the particular `lambda function` for which the error is occuring.
 */
```
```sh
connect ETIMEDOUT 10.0.0.36:443
```


9. 
```ts
/**
 * -> Tip-1: DynamoDB > Tables > {tableName} >Create index
 */
```
```json
{
  "errorCode": 500,
  "errorMsg": "The table does not have the specified index: GSI1",
  "timeStamp": "2025-02-19T10:56:15.022Z"
}
```

10. 
```ts
/**
 * -> Tip-1: 
 */
```
```json
{
  "statusCode": 429,
  "body": {
    "message": "Response Error",
    "error": "Response Error"
  }
}
```

11. 
```ts
/**
 * -> Tip-1: Check whether the data present in the aws opensearch index or not.
 */
```
```sh
Unknown application error occurred
```
```json
2025-02-24T10:43:14.217Z	7e7b363e-555c-46e6-8b84-060948d9986c	ERROR	Unhandled Promise Rejection 	{
    "errorType": "Runtime.UnhandledPromiseRejection",
    "errorMessage": "{\"error\":{\"root_cause\":[{\"type\":\"parsing_exception\",\"reason\":\"[term] malformed query, expected [END_OBJECT] but found [FIELD_NAME]\",\"line\":1,\"col\":85}],\"type\":\"x_content_parse_exception\",\"reason\":\"[1:85] [bool] failed to parse field [must]\",\"caused_by\":{\"type\":\"parsing_exception\",\"reason\":\"[term] malformed query, expected [END_OBJECT] but found [FIELD_NAME]\",\"line\":1,\"col\":85}},\"status\":400}",
    "reason": {
        "errorType": "ResponseError",
        "errorMessage": "x_content_parse_exception: [parsing_exception] Reason: [term] malformed query, expected [END_OBJECT] but found [FIELD_NAME]",
        "name": "ResponseError",
        "meta": {
            "body": {
                "error": {
                    "root_cause": [
                        {
                            "type": "parsing_exception",
                            "reason": "[term] malformed query, expected [END_OBJECT] but found [FIELD_NAME]",
                            "line": 1,
                            "col": 85
                        }
                    ],
                    "type": "x_content_parse_exception",
                    "reason": "[1:85] [bool] failed to parse field [must]",
                    "caused_by": {
                        "type": "parsing_exception",
                        "reason": "[term] malformed query, expected [END_OBJECT] but found [FIELD_NAME]",
                        "line": 1,
                        "col": 85
                    }
                },
                "status": 400
            },
            "statusCode": 400,
            "headers": {
                "date": "Mon, 24 Feb 2025 10:43:14 GMT",
                "content-type": "application/json; charset=UTF-8",
                "content-length": "394",
                "connection": "keep-alive",
                "access-control-allow-origin": "*"
            },
            "meta": {
                "context": null,
                "request": {
                    "params": {
                        "method": "POST",
                        "path": "/worko-user-matching-score-job/_search",
                        "querystring": "",
                        "body": "{\"query\":{\"bool\":{\"must\":[{\"term\":{\"userId\":\"REDACTED\"},\"terms\":{\"jobId\":[\"01JMV66XA3CZGWA80X6W80ZGXY\"]}}]}}}",
                        "headers": {
                            "user-agent": "opensearch-js/3.2.0 (linux 5.10.233-244.887.amzn2.x86_64-x64; Node.js v18.20.4)",
                            "content-type": "application/json",
                            "content-length": "137"
                        },
                        "timeout": 30000
                    },
                    "options": {},
                    "id": 1
                },
                "name": "opensearch-js",
                "connection": {
                    "url": "https://vpc-worko-xj7suso2dgzou25l2lgpoymbk4.aos.ap-south-1.on.aws/",
                    "id": "https://vpc-worko-xj7suso2dgzou25l2lgpoymbk4.aos.ap-south-1.on.aws/",
                    "headers": {},
                    "deadCount": 0,
                    "resurrectTimeout": 0,
                    "_openRequests": 0,
                    "status": "alive",
                    "roles": {
                        "data": true,
                        "ingest": true
                    }
                },
                "attempts": 0,
                "aborted": false
            }
        },
        "stack": [
            "ResponseError: x_content_parse_exception: [parsing_exception] Reason: [term] malformed query, expected [END_OBJECT] but found [FIELD_NAME]",
            "    at P (/var/task/dist/src/app.js:2:601511)",
            "    at IncomingMessage.m (/var/task/dist/src/app.js:2:600242)",
            "    at IncomingMessage.emit (node:events:529:35)",
            "    at IncomingMessage.emit (node:domain:489:12)",
            "    at endReadableNT (node:internal/streams/readable:1400:12)",
            "    at process.processTicksAndRejections (node:internal/process/task_queues:82:21)"
        ]
    },
    "promise": {},
    "stack": [
        "Runtime.UnhandledPromiseRejection: {\"error\":{\"root_cause\":[{\"type\":\"parsing_exception\",\"reason\":\"[term] malformed query, expected [END_OBJECT] but found [FIELD_NAME]\",\"line\":1,\"col\":85}],\"type\":\"x_content_parse_exception\",\"reason\":\"[1:85] [bool] failed to parse field [must]\",\"caused_by\":{\"type\":\"parsing_exception\",\"reason\":\"[term] malformed query, expected [END_OBJECT] but found [FIELD_NAME]\",\"line\":1,\"col\":85}},\"status\":400}",
        "    at process.<anonymous> (file:///var/runtime/index.mjs:1276:17)",
        "    at process.emit (node:events:529:35)",
        "    at process.emit (node:domain:489:12)",
        "    at emit (node:internal/process/promises:149:20)",
        "    at processPromiseRejections (node:internal/process/promises:283:27)",
        "    at process.processTicksAndRejections (node:internal/process/task_queues:96:32)"
    ]
}
```


12. 
```json
// In Postman

// 500 Internal Server Error
{"errorCode":500,"errorMsg":"connect ECONNREFUSED 10.0.0.36:443","timeStamp":"2025-02-25T11:37:18.961Z"}
```
```sh
# In Cloudwatch

2025-02-25T11:37:18.978Z	6a104282-a297-492b-b096-fd3945f94cfc	ERROR	ConnectionError: connect ECONNREFUSED 10.0.0.36:443
    at ClientRequest.n (/var/task/dist/src/app.js:2:584553)
    at ClientRequest.emit (node:events:517:28)
    at ClientRequest.emit (node:domain:489:12)
    at TLSSocket.socketErrorListener (node:_http_client:501:9)
    at TLSSocket.emit (node:events:517:28)
    at TLSSocket.emit (node:domain:489:12)
    at emitErrorNT (node:internal/streams/destroy:151:8)
    at emitErrorCloseNT (node:internal/streams/destroy:116:3)
    at process.processTicksAndRejections (node:internal/process/task_queues:82:21)
```


13. 
```ts
/**
 * The error message indicates that the query parser expected an END_OBJECT but found a FIELD_NAME, which suggests that the query structure is incorrect.
 * 
 * The issue is that you're mixing term and terms queries inside the same object. This is not allowed because each query type must be in its own object within the must
 * array.
 */
```
```sh
2025-02-27T06:07:14.881Z	52e6d484-0197-423d-b338-a3eb9468ffd7	ERROR	Unhandled Promise Rejection 	{
    "errorType": "Runtime.UnhandledPromiseRejection",
    "errorMessage": "{\"error\":{\"root_cause\":[{\"type\":\"parsing_exception\",\"reason\":\"[term] malformed query, expected [END_OBJECT] but found [FIELD_NAME]\",\"line\":1,\"col\":85}],\"type\":\"x_content_parse_exception\",\"reason\":\"[1:85] [bool] failed to parse field [must]\",\"caused_by\":{\"type\":\"parsing_exception\",\"reason\":\"[term] malformed query, expected [END_OBJECT] but found [FIELD_NAME]\",\"line\":1,\"col\":85}},\"status\":400}",
    "reason": {
        "errorType": "ResponseError",
        "errorMessage": "x_content_parse_exception: [parsing_exception] Reason: [term] malformed query, expected [END_OBJECT] but found [FIELD_NAME]",
        "name": "ResponseError",
        "meta": {
            "body": {
                "error": {
                    "root_cause": [
                        {
                            "type": "parsing_exception",
                            "reason": "[term] malformed query, expected [END_OBJECT] but found [FIELD_NAME]",
                            "line": 1,
                            "col": 85
                        }
                    ],
                    "type": "x_content_parse_exception",
                    "reason": "[1:85] [bool] failed to parse field [must]",
                    "caused_by": {
                        "type": "parsing_exception",
                        "reason": "[term] malformed query, expected [END_OBJECT] but found [FIELD_NAME]",
                        "line": 1,
                        "col": 85
                    }
                },
                "status": 400
            },
            "statusCode": 400,
            "headers": {
                "date": "Thu, 27 Feb 2025 06:07:14 GMT",
                "content-type": "application/json; charset=UTF-8",
                "content-length": "394",
                "connection": "keep-alive",
                "access-control-allow-origin": "*"
            },
            "meta": {
                "context": null,
                "request": {
                    "params": {
                        "method": "POST",
                        "path": "/worko-user-matching-score-job/_search",
                        "querystring": "",
                        "body": "{\"query\":{\"bool\":{\"must\":[{\"term\":{\"userId\":\"REDACTED\"},\"terms\":{\"jobId\":[\"01JMV66XA3CZGWA80X6W80ZGXY\"]}}]}}}",
                        "headers": {
                            "user-agent": "opensearch-js/3.2.0 (linux 5.10.233-244.887.amzn2.x86_64-x64; Node.js v18.20.4)",
                            "content-type": "application/json",
                            "content-length": "137"
                        },
                        "timeout": 30000
                    },
                    "options": {},
                    "id": 3
                },
                "name": "opensearch-js",
                "connection": {
                    "url": "https://vpc-worko-xj7suso2dgzou25l2lgpoymbk4.aos.ap-south-1.on.aws/",
                    "id": "https://vpc-worko-xj7suso2dgzou25l2lgpoymbk4.aos.ap-south-1.on.aws/",
                    "headers": {},
                    "deadCount": 0,
                    "resurrectTimeout": 0,
                    "_openRequests": 0,
                    "status": "alive",
                    "roles": {
                        "data": true,
                        "ingest": true
                    }
                },
                "attempts": 0,
                "aborted": false
            }
        },
        "stack": [
            "ResponseError: x_content_parse_exception: [parsing_exception] Reason: [term] malformed query, expected [END_OBJECT] but found [FIELD_NAME]",
            "    at P (/var/task/dist/src/app.js:2:601511)",
            "    at IncomingMessage.m (/var/task/dist/src/app.js:2:600242)",
            "    at IncomingMessage.emit (node:events:529:35)",
            "    at IncomingMessage.emit (node:domain:489:12)",
            "    at endReadableNT (node:internal/streams/readable:1400:12)",
            "    at process.processTicksAndRejections (node:internal/process/task_queues:82:21)"
        ]
    },
    "promise": {},
    "stack": [
        "Runtime.UnhandledPromiseRejection: {\"error\":{\"root_cause\":[{\"type\":\"parsing_exception\",\"reason\":\"[term] malformed query, expected [END_OBJECT] but found [FIELD_NAME]\",\"line\":1,\"col\":85}],\"type\":\"x_content_parse_exception\",\"reason\":\"[1:85] [bool] failed to parse field [must]\",\"caused_by\":{\"type\":\"parsing_exception\",\"reason\":\"[term] malformed query, expected [END_OBJECT] but found [FIELD_NAME]\",\"line\":1,\"col\":85}},\"status\":400}",
        "    at process.<anonymous> (file:///var/runtime/index.mjs:1276:17)",
        "    at process.emit (node:events:529:35)",
        "    at process.emit (node:domain:489:12)",
        "    at emit (node:internal/process/promises:149:20)",
        "    at processPromiseRejections (node:internal/process/promises:283:27)",
        "    at process.processTicksAndRejections (node:internal/process/task_queues:96:32)"
    ]
}
```

14. when I tried to interact with `aws opensearch` i got below error:
```json
{
  "error": {
    "meta": {
      "body": { "message": "No server available to handle the request" }
    }
  }
}
```

15. 
```json
// 413 Payload Too Large
// Request is too large for the server to process.
{
  "errorCode": 413,
  "errorMsg": "request entity too large",
  "timeStamp": "2025-03-06T10:57:42.655Z"
}
```

16. 
```json
{"errorCode":500,"errorMsg":"Response Error","timeStamp":"2025-03-08T10:40:12.688Z"}
```

17. 
```ts
/**
 * Tip:-1: Connect with `CTO` and increate `WCU` to `50 to 60` 
 */
```
```json
{"errorCode":500,"errorMsg":"The level of configured provisioned throughput for the table was exceeded. Consider increasing your provisioning level with the UpdateTable API.","timeStamp":"2025-03-09T04:57:38.413Z"}
```


18. 
```ts
2025-03-10T03:36:59.772Z	702af9ed-da02-486a-bbb6-e4b5891bb984	ERROR	Uncaught Exception 	{
    "errorType": "TypeError",
    "errorMessage": "t is not a function",
    "code": "TypeError",
    "message": "t is not a function",
    "time": "2025-03-10T03:36:59.771Z",
    "stack": [
        "TypeError: t is not a function",
        "    at /var/task/dist/src/app.js:2:1136861",
        "    at constructor.<anonymous> (/var/task/dist/src/app.js:2:1136492)",
        "    at constructor.<anonymous> (/var/task/dist/src/app.js:2:991044)",
        "    at constructor.callListeners (/var/task/dist/src/app.js:2:1008368)",
        "    at constructor.emit (/var/task/dist/src/app.js:2:1008078)",
        "    at constructor.emitEvent (/var/task/dist/src/app.js:2:993919)",
        "    at constructor.e (/var/task/dist/src/app.js:2:989424)",
        "    at t.runTo (/var/task/dist/src/app.js:2:1074116)",
        "    at /var/task/dist/src/app.js:2:1074322",
        "    at constructor.<anonymous> (/var/task/dist/src/app.js:2:989694)"
    ]
}
```


19. 
```ts
/**
 * Tip:1:- check express middleware in app.ts file
 */
```
```ts
{"errorCode":500,"errorMsg":"e.flatMap is not a function","timeStamp":"2025-03-10T12:04:59.319Z"}
```


20. 
```ts
{
  "errorCode": 500,
  "errorMsg": "search_phase_execution_exception: [illegal_argument_exception] Reason: Text fields are not optimised for operations that require per-document field data like aggregations and sorting, so these operations are disabled by default. Please use a keyword field instead. Alternatively, set fielddata=true on [companyId] in order to load field data by uninverting the inverted index. Note that this can use significant memory.",
  "timeStamp": "2025-03-17T14:33:12.794Z"
}
```


21. 
```ts
/**
 * Tip-1 -> Chcek whether you are retriving the data properly from a variable or not.
 * Tip-2 -> Chcek whether you are using correct typing or not.
 */
```
```json
{
  "errorCode": 500,
  "errorMsg": "Maximum call stack size exceeded",
  "timeStamp": "2025-03-04T10:28:20.363Z"
}
```

22. Encountered below error while sending an email
```ts
/**
 * Tip-1 -> If email have extra dot like `<guidance@worko.ai.>` but the correct email is `<guidance@worko.ai>`
 */
```
```json
{
  "errorCode": 500,
  "errorMsg": "Domain ends with dot",
  "timeStamp": "2025-03-19T06:42:33.045Z"
}
```

23. 
```json
// ERROR	Invoke Error 	
{
    "errorType": "Error",
    "errorMessage": "getaddrinfo ENOTFOUND sqs.\"ap-south-1\".amazonaws.com",
    "code": "ENOTFOUND",
    "errno": -3008,
    "syscall": "getaddrinfo",
    "hostname": "sqs.\"ap-south-1\".amazonaws.com",
    "$metadata": {
        "attempts": 1,
        "totalRetryDelay": 0
    },
    "stack": [
        "Error: getaddrinfo ENOTFOUND sqs.\"ap-south-1\".amazonaws.com",
        "    at GetAddrInfoReqWrap.onlookupall [as oncomplete] (node:dns:120:26)"
    ]
}
```

24. 
```sh
PostConfirmation failed with error User: arn:aws:sts::211125353899:assumed-role/worko-api-cognito-post-confirmation-trigger-role-wcv1wa97/worko-api-cognito-post-confirmation-trigger is not authorized to perform: sqs:sendmessage on resource: arn:aws:sqs:ap-south-1:211125353899:worko-app-event-queue because no identity-based policy allows the sqs:sendmessage action.
```

25. 
```sh
[Container] 2025/07/31 08:04:22.581249 Command failed with exit status 232
```

26. 
```json
{
  "$fault": "client",
  "$metadata": {
    "attempts": 1,
    "httpStatusCode": 403,
    "requestId": "c5668d78-eb74-5d00-a106-ec5854deb164",
    "totalRetryDelay": 0
  },
  "Error": {
    "Code": "AuthorizationError",
    "Message": "User: arn:aws:sts::211125353899:assumed-role/worko-api-dev-ap-south-1-lambdaRole/worko-api-dev-app is not authorized to perform: SNS:Publish on resource: +919666308100 because no identity-based policy allows the SNS:Publish action",
    "Type": "Sender",
    "message": "User: arn:aws:sts::211125353899:assumed-role/worko-api-dev-ap-south-1-lambdaRole/worko-api-dev-app is not authorized to perform: SNS:Publish on resource: +919666308100 because no identity-based policy allows the SNS:Publish action"
  },
  "RequestId": "c5668d78-eb74-5d00-a106-ec5854deb164",
  "name": "AuthorizationErrorException",
  "xmlns": "http://sns.amazonaws.com/doc/2010-03-31/"
}

```

27. 
```json
// when i try to confirm the user which is already confirmed in cognito
{
    "error": {
        "$fault": "client",
        "$metadata": {
            "attempts": 1,
            "httpStatusCode": 400,
            "requestId": "2cdb790a-7165-40f5-bf09-5b184fb95411",
            "totalRetryDelay": 0
        },
        "__type": "NotAuthorizedException",
        "name": "NotAuthorizedException"
    },
    "filePath": "/var/task/dist/src/app.js",
    "level": "warn",
    "message": "Error caught in cognito-idp-action. [Library]",
    "methodName": "confirmCognitoUserSignup"
}
```

28. 
```json
{
    "errorType": "Runtime.ImportModuleError",
    "errorMessage": "Error: Cannot find module 'aws-sdk'\nRequire stack:\n- /var/task/dist/src/app.js\n- /var/runtime/index.mjs",
    "stack": [
        "Runtime.ImportModuleError: Error: Cannot find module 'aws-sdk'",
        "Require stack:",
        "- /var/task/dist/src/app.js",
        "- /var/runtime/index.mjs",
        "    at _loadUserApp (file:///var/runtime/index.mjs:1192:17)",
        "    at async UserFunction.js.module.exports.load (file:///var/runtime/index.mjs:1235:21)",
        "    at async start (file:///var/runtime/index.mjs:1454:23)",
        "    at async file:///var/runtime/index.mjs:1464:1"
    ]
}
```

29. 
```sh
[Container] 2025/12/15 04:33:39.608316 Running command npm i
npm WARN deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.
npm WARN deprecated lodash.get@4.4.2: This package is deprecated. Use the optional chaining (?.) operator instead.
npm WARN deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
npm WARN deprecated querystring@0.2.1: The querystring API is considered Legacy. new code should use the URLSearchParams API instead.
npm WARN deprecated querystring@0.2.0: The querystring API is considered Legacy. new code should use the URLSearchParams API instead.
npm WARN deprecated supertest@6.3.4: Please upgrade to supertest v7.1.3+, see release notes at https://github.com/forwardemail/supertest/releases/tag/v7.1.3 - maintenance is supported by Forward Email @ https://forwardemail.net
npm WARN deprecated superagent@7.1.6: Please upgrade to superagent v10.2.2+, see release notes at https://github.com/forwardemail/superagent/releases/tag/v10.2.2 - maintenance is supported by Forward Email @ https://forwardemail.net
npm WARN deprecated node-domexception@1.0.0: Use your platform's native DOMException instead
npm WARN deprecated rimraf@3.0.2: Rimraf versions prior to v4 are no longer supported
npm WARN deprecated superagent@8.1.2: Please upgrade to superagent v10.2.2+, see release notes at https://github.com/forwardemail/superagent/releases/tag/v10.2.2 - maintenance is supported by Forward Email @ https://forwardemail.net
npm ERR! code EMFILE
npm ERR! syscall open
npm ERR! path /tmp/.npm/_cacache/index-v5/79/51/119f67269d825f31edcc5339b2bbd15e984164719e3ea04a21bda619f3cd
npm ERR! errno -24
npm ERR! EMFILE: too many open files, open '/tmp/.npm/_cacache/index-v5/79/51/119f67269d825f31edcc5339b2bbd15e984164719e3ea04a21bda619f3cd'

npm ERR! A complete log of this run can be found in: /tmp/.npm/_logs/2025-12-15T04_33_39_846Z-debug-0.log

[Container] 2025/12/15 04:34:07.542283 Command failed with exit status 232
```