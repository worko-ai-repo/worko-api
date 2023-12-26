
// A simple token-based authorizer example to demonstrate how to use an authorization token 
// to allow or deny a request. In this example, the caller named 'user' is allowed to invoke 
// a request if the client-supplied token value is 'allow'. The caller is not allowed to invoke 
// the request if the token value is 'deny'. If the token value is 'unauthorized' or an empty
// string, the authorizer function returns an HTTP 401 status code. For any other token value, 
// the authorizer returns an HTTP 500 status code. 
// Note that token values are case-sensitive.
import { CognitoJwtVerifier } from "aws-jwt-verify";
   
    // Verifier that expects valid access tokens:
    const verifier = CognitoJwtVerifier.create({
      userPoolId: "ap-south-1_tAj7HAKZh",
      tokenUse: "access",
      clientId: "5evf019rrkaijtnjf2j1vvdf33",
    });

export const handler =  async function(event, context, callback) {
    console.log(event);
    const bearerToken = event.headers.authorization == undefined? event.headers.Authorization: event.headers.authorization;
    console.log(bearerToken);
    const token = bearerToken.split(" ")[1];
    console.log(token);
    let access = 'unauthorized';
    // console.log(event)
    try {
      const payload = await verifier.verify(token);
      console.log("Token is valid. Payload:", payload);
      access = 'allow';
    } catch {
      console.log("Token not valid!");
    }
    
    switch (access) {
        case 'allow':
            callback(null, generatePolicy('user', 'Allow', event.methodArn));
            break;
        case 'deny':    // if candidate access employee or admin api
            callback(null, generatePolicy('user', 'Deny', event.methodArn));
            break;
        case 'unauthorized':
            callback("Unauthorized");   // Return a 401 Unauthorized response
            break;
        default:
            callback("Error: Invalid token"); // Return a 500 Invalid token response
    }
};

// Help function to generate an IAM policy
var generatePolicy = function(principalId, effect, resource) {
    var authResponse = {};
    
    authResponse.principalId = principalId;
    if (effect && resource) {
        var policyDocument = {};
        policyDocument.Version = '2012-10-17'; 
        policyDocument.Statement = [];
        var statementOne = {};
        statementOne.Action = 'execute-api:Invoke'; 
        statementOne.Effect = effect;
        statementOne.Resource = resource;
        policyDocument.Statement[0] = statementOne;
        authResponse.policyDocument = policyDocument;
    }
    
    // Optional output with custom properties of the String, Number or Boolean type.
    authResponse.context = {
        "userId": "stringval",
        "email": 123,
        "booleanKey": true
    };
    return authResponse;
}