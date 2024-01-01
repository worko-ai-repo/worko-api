import { InvokeCommand, LambdaClient, LogType } from "@aws-sdk/client-lambda";
import APP_CONSTANTS from "../configs/constants.config";

class InvokeLambdaService{

    async getMatchingScore(resume: string, jd: string){
        const client = new LambdaClient({});

        const payload = {
            "resume":resume,
            "jd":jd,
            "question":APP_CONSTANTS.MATCHING_SCORE_PROMPT
        }

        const command = new InvokeCommand({
            FunctionName: APP_CONSTANTS.MATCHING_SCORE_LAMBDA_NAME,
            Payload: JSON.stringify(payload),
            LogType: LogType.Tail,
        });

        const { Payload, LogResult } = await client.send(command);
        const result = Buffer.from(Payload as ArrayBuffer).toString();
        const logs = Buffer.from(LogResult as string, "base64").toString();
        return { logs, result };
    }

}

// Export an instance of the InvokeLambda class
export default new InvokeLambdaService();