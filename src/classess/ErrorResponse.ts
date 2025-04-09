import Response from "./Response";

export default class ErrorResponse extends Response {
    constructor(status: number, message: string, data?: any) {
        super(status, message, data);
    }

    send(res: any) {
        return res.json({
            status: this.status,
            error: true,
            message: this.message,
            data: this.data,
        });
    }
}
