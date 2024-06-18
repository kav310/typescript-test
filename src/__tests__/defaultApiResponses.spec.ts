import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import response from "../utils/default-api-responses";

describe('API Response Success Tests', () => {
    it('Should return a default response', () => {
        const expectedResponse = {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
                "Access-Control-Allow-Headers": "*"
            },
            body: JSON.stringify({
                error: {},
                data: {},
            }),
        };

        const result = response.success();

        expect(result.statusCode).toBe(200);
        expect(result).toEqual(expectedResponse);
    });

    it('Should return custom headers', () => {
        const headerParam = {
            'Custom Header': '1234',
        };

        const result = response.success(204, headerParam);

        expect(result.headers).toHaveProperty('Custom Header', headerParam['Custom Header']);
    });

    it('Should return 204 with no body', () => {
        const expectedBody = JSON.stringify({});

        const result = response.success(204);

        expect(result.statusCode).toBe(204);
        expect(result.body).toEqual(expectedBody);
    });

    it('Should return 200 with body data', () => {
        const body = {
            userId: '1234',
        };

        const expectedBody = JSON.stringify({
            error: {},
            data: body,
        });

        const result = response.success(200, {}, body);

        expect(result.statusCode).toBe(200);
        expect(result.body).toEqual(expectedBody);
    });
});

describe('API Response Error Tests', () => {
    beforeEach(() => {
        vi.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('Should return a default error', () => {
        const expectedBody = JSON.stringify({
            error: {
                message: 'There was an internal server error. Please try again later. If the problem persists, please contact technical support.',
            },
            data: {},
        });

        const expectedResponse = {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
                "Access-Control-Allow-Headers": "*"
            },
            body: expectedBody,
        };

        const result = response.error();

        expect(result.statusCode).toBe(500);
        expect(result).toEqual(expectedResponse);
    });

    it('Should return custom headers', () => {
        const headerParam = {
            'Custom Header': '1234',
        };

        const result = response.error(500, headerParam);

        expect(console.log).toHaveBeenCalledTimes(1);
        expect(result.statusCode).toBe(500);
        expect(result.headers).toHaveProperty('Custom Header', headerParam['Custom Header']);
    });

    it('Should return 500 error with general message', () => {
        const expectedBody = JSON.stringify({
            error: {
                message: 'There was an internal server error. Please try again later. If the problem persists, please contact technical support.',
            },
            data: {},
        });

        const result = response.error(500);

        expect(console.log).toHaveBeenCalledTimes(1);
        expect(result.statusCode).toBe(500);
        expect(result.body).toEqual(expectedBody);
    });

    it('Should return 400 error with specific message', () => {
        const error = new Error('This was a bad request');

        const expectedBody = JSON.stringify({
            error: {
                message: error.message,
            },
            data: {},
        });

        const result = response.error(400, {}, error);

        expect(console.log).toHaveBeenCalledTimes(1);
        expect(result.statusCode).toBe(400);
        expect(result.body).toEqual(expectedBody);
    });
});
