import { Response as Resp } from "express";

export default class Response {
    status: number;
    message: string;
    data: any;

    constructor(status: number, message: string, data?: any) {
        this.status = status;
        this.message = message;
        this.data = data;
    }

    send(res: Resp) {
        return res.status(this.status).json({
            status: this.status,
            message: this.message,
            data: this.data,
        });
    }
}
