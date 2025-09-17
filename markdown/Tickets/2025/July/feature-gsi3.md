
```json
{
    "errorCode": 500,
    "errorMsg": "One or more parameter values were invalid: Condition parameter type does not match schema type",
    "timeStamp": "2025-06-21T09:06:11.442Z"
}
```


```json
{
    "err": {
        "$fault": "client",
        "$metadata": {
            "attempts": 3,
            "httpStatusCode": 400,
            "requestId": "9IE1BSP6OI7O3PPVO49O006KL3VV4KQNSO5AEMVJF66Q9ASUAAJG",
            "totalRetryDelay": 1316
        },
        "__type": "com.amazonaws.dynamodb.v20120810#ProvisionedThroughputExceededException",
        "name": "ProvisionedThroughputExceededException"
    },
    "level": "error",
    "message": "Failed to update user with PK: USR#EML#rohithappala777+everytest2@gmail.com"
}
```

```ts
/**
 * Error retries and exponential backoff
 * 
 * @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Programming.Errors.html#Programming.Errors.RetryAndBackoff
 */
```