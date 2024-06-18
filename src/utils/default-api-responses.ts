import { APIGatewayProxyResult } from "../types";

const withDefaultHeaders = (headers: Record<string, string>) => ({
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "*",
    ...headers
});

const respondWith = (
    statusCode: number,
    headers: Record<string, string> = {},
    data: Record<string, any> = {}
): APIGatewayProxyResult => {
    const response: APIGatewayProxyResult = {
        statusCode,
        headers: withDefaultHeaders(headers),
        body: JSON.stringify({})
    };

    if (statusCode !== 204) {
        response.body = JSON.stringify({ error: {}, data });
    }

    return response;
}

const response = {
    respondWith,
    success: (
        statusCode: number = 200,
        headers: Record<string, string> = {},
        data: Record<string, any> = {}
    ): APIGatewayProxyResult => respondWith(statusCode, headers, data),
    error: (
        statusCode: number = 500,
        headers: Record<string, string> = {},
        err?: Error
    ): APIGatewayProxyResult => {
        console.log(err);

        const response: APIGatewayProxyResult = {
            statusCode,
            headers: withDefaultHeaders(headers),
            body: JSON.stringify({
                error: {},
                data: {},
            })
        };

        if (statusCode === 500) {
            response.body = JSON.stringify({
                error: {
                    message: 'There was an internal server error. Please try again later. If the problem persists, please contact technical support.',
                },
                data: {},
            });
        }

        if (statusCode !== 500 && err && err.message) {
            response.body = JSON.stringify({
                error: {
                    message: err.message,
                },
                data: {},
            });
        }

        return response;
    },
};

export default response;
