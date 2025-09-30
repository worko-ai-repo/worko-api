/**
 * ErrorCodeName
 */
enum ErrorCodeName {
  /**
   * "ResourceNotFoundException" is known AWS error code
   */
  RESOURCE_NOT_FOUND_EXCEPTION = "ResourceNotFoundException",

  /**
   * "ValidationException" is known AWS error code
   */
  VALIDATION_EXCEPTION = "ValidationException",

  /**
   * "ProvisionedThroughputExceededException" is known AWS error code
   */
  PROVISIONED_THROUGHPUT_EXCEEDED_EXCEPTION = "ProvisionedThroughputExceededException",
  
  /**
   * "UserNotFoundException" is known AWS error code
   */
  USER_NOT_FOUND_EXCEPTION="UserNotFoundException",

  /**
   * "NotAuthorizedException" is known AWS error code
   */
  NOT_AUTHORIZED_EXCEPTION="NotAuthorizedException"
}

export default ErrorCodeName;